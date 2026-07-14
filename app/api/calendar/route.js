import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Esta rota consulta o Google Agenda (apenas leitura, via Service Account) e
// devolve, para a semana atual, quais blocos de 30 minutos estão ocupados.
// Não expõe título/descrição dos eventos — apenas o intervalo de tempo ocupado.
export const dynamic = 'force-dynamic';

const FUSO_HORARIO = 'America/Sao_Paulo';
const HORA_INICIO_EXPEDIENTE = 9;
const HORA_FIM_EXPEDIENTE = 18;
const INTERVALO_MINUTOS = 30;

const DIA_LABEL_POR_ABREVIACAO = {
  Mon: 'Segunda-feira',
  Tue: 'Terça-feira',
  Wed: 'Quarta-feira',
  Thu: 'Quinta-feira',
  Fri: 'Sexta-feira',
};

const ORDEM_DIA_SEMANA = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function pad(numero) {
  return String(numero).padStart(2, '0');
}

function obterPartesDataEmSaoPaulo(data) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_HORARIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(data);
  const mapa = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return { ano: Number(mapa.year), mes: Number(mapa.month), dia: Number(mapa.day), diaSemana: mapa.weekday };
}

function obterHoraEMinutoEmSaoPaulo(data) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_HORARIO,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(data);
  const mapa = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  // à meia-noite o Intl pode retornar "24"; normalizamos para "00".
  return { hora: Number(mapa.hour) % 24, minuto: Number(mapa.minute) };
}

// Calcula segunda 00:00 e sexta 23:59 da semana atual, sempre no horário de
// Brasília (UTC-3 fixo, sem horário de verão), independente do fuso do servidor.
function obterLimitesDaSemanaAtual() {
  const agora = new Date();
  const { ano, mes, dia, diaSemana } = obterPartesDataEmSaoPaulo(agora);
  const diasDesdeSegunda = ORDEM_DIA_SEMANA[diaSemana];

  const segundaFeira = new Date(Date.UTC(ano, mes - 1, dia));
  segundaFeira.setUTCDate(segundaFeira.getUTCDate() - diasDesdeSegunda);

  const sextaFeira = new Date(segundaFeira);
  sextaFeira.setUTCDate(sextaFeira.getUTCDate() + 4);

  const formatarLimite = (dataUTC, hora, minuto) =>
    `${dataUTC.getUTCFullYear()}-${pad(dataUTC.getUTCMonth() + 1)}-${pad(dataUTC.getUTCDate())}T${pad(hora)}:${pad(minuto)}:00-03:00`;

  return {
    timeMin: formatarLimite(segundaFeira, 0, 0),
    timeMax: formatarLimite(sextaFeira, 23, 59),
  };
}

// Converte os intervalos "busy" (start/end) da Google Calendar FreeBusy API
// em chaves "Dia-HH:MM" batendo com os slots de 30 min exibidos no front-end.
function gerarSlotsBloqueados(intervalosOcupados) {
  const slots = {};

  intervalosOcupados.forEach(({ start, end }) => {
    let cursor = new Date(start);
    const fim = new Date(end);

    const { minuto: minutoInicial } = obterHoraEMinutoEmSaoPaulo(cursor);
    const minutosParaVoltar = minutoInicial % INTERVALO_MINUTOS;
    if (minutosParaVoltar > 0) {
      cursor = new Date(cursor.getTime() - minutosParaVoltar * 60 * 1000);
    }

    while (cursor < fim) {
      const { diaSemana } = obterPartesDataEmSaoPaulo(cursor);
      const { hora, minuto } = obterHoraEMinutoEmSaoPaulo(cursor);
      const diaLabel = DIA_LABEL_POR_ABREVIACAO[diaSemana];

      if (diaLabel && hora >= HORA_INICIO_EXPEDIENTE && hora < HORA_FIM_EXPEDIENTE) {
        slots[`${diaLabel}-${pad(hora)}:${pad(minuto)}`] = { status: 'interna', valor: 'Ocupado' };
      }

      cursor = new Date(cursor.getTime() + INTERVALO_MINUTOS * 60 * 1000);
    }
  });

  return slots;
}

export async function GET() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    return NextResponse.json(
      {
        erro:
          'Variáveis de ambiente do Google não configuradas. Verifique GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY e GOOGLE_CALENDAR_ID no .env.local.',
      },
      { status: 500 }
    );
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const { timeMin, timeMax } = obterLimitesDaSemanaAtual();

    const resposta = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: FUSO_HORARIO,
        items: [{ id: calendarId }],
      },
    });

    const dadosDaAgenda = resposta.data.calendars?.[calendarId];
    if (dadosDaAgenda?.errors?.length) {
      throw new Error(
        `Google não retornou dados para a agenda "${calendarId}". Confirme se ela foi compartilhada com a Service Account.`
      );
    }

    const horariosOcupados = gerarSlotsBloqueados(dadosDaAgenda?.busy ?? []);

    return NextResponse.json({ horariosOcupados });
  } catch (erro) {
    console.error('Erro ao consultar o Google Agenda:', erro);
    return NextResponse.json({ erro: 'Não foi possível consultar o Google Agenda.' }, { status: 502 });
  }
}

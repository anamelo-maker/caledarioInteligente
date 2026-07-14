'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Lock, Palette, TriangleAlert } from 'lucide-react';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const MAXIMO_SELECIONADOS = 4;
const HORA_INICIO = 9;
const HORA_FIM = 18;

// Paletas de tema: cada valor é uma string literal completa de classes Tailwind
// (necessário para o Tailwind conseguir detectá-las durante o build).
const TEMAS = {
  esmeralda: {
    nome: 'Esmeralda',
    swatch: 'bg-emerald-600',
    icone: 'text-emerald-600',
    cabecalho: 'bg-emerald-800',
    horaBorda: 'border-l-4 border-emerald-500',
    botao: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
    disponivel: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 cursor-pointer',
    confirmado: 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-sm',
  },
  azul: {
    nome: 'Azul',
    swatch: 'bg-sky-600',
    icone: 'text-sky-600',
    cabecalho: 'bg-sky-800',
    horaBorda: 'border-l-4 border-sky-500',
    botao: 'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-500',
    disponivel: 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 cursor-pointer',
    confirmado: 'bg-sky-700 hover:bg-sky-800 text-white font-semibold cursor-pointer shadow-sm',
  },
  roxo: {
    nome: 'Roxo',
    swatch: 'bg-violet-600',
    icone: 'text-violet-600',
    cabecalho: 'bg-violet-800',
    horaBorda: 'border-l-4 border-violet-500',
    botao: 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500',
    disponivel: 'bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-100 cursor-pointer',
    confirmado: 'bg-violet-700 hover:bg-violet-800 text-white font-semibold cursor-pointer shadow-sm',
  },
  rosa: {
    nome: 'Rosa',
    swatch: 'bg-rose-600',
    icone: 'text-rose-600',
    cabecalho: 'bg-rose-800',
    horaBorda: 'border-l-4 border-rose-500',
    botao: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
    disponivel: 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-100 cursor-pointer',
    confirmado: 'bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer shadow-sm',
  },
};

// Estilos que não dependem do tema escolhido (são estados semânticos fixos).
const ESTILOS_FIXOS = {
  selecionado: 'bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold ring-2 ring-blue-400 shadow-sm cursor-pointer',
  sugestao: 'bg-amber-300 hover:bg-amber-400 text-amber-900 font-semibold shadow-sm cursor-pointer',
  bloqueado: 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed',
};

function ehBloqueado(status) {
  return status === 'interna' || status === 'ocupado';
}

function gerarHorarios(inicioHora, fimHora, intervaloMinutos = 30) {
  const horarios = [];
  for (let minutos = inicioHora * 60; minutos < fimHora * 60; minutos += intervaloMinutos) {
    const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
    const mm = String(minutos % 60).padStart(2, '0');
    horarios.push(`${hh}:${mm}`);
  }
  return horarios;
}

function getDiasDoMesDaSemanaAtual() {
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay(); // 0 = domingo ... 6 = sábado
  const offsetAteSegunda = diaSemanaHoje === 0 ? -6 : 1 - diaSemanaHoje;

  const segundaFeira = new Date(hoje);
  segundaFeira.setDate(hoje.getDate() + offsetAteSegunda);

  return DIAS_SEMANA.map((_, index) => {
    const data = new Date(segundaFeira);
    data.setDate(segundaFeira.getDate() + index);
    return data.getDate();
  });
}

const HORARIOS = gerarHorarios(HORA_INICIO, HORA_FIM);

// Mock data: reuniões já agendadas com clientes (viriam do banco de dados numa fase futura).
// Os horários bloqueados por eventos "Interna" agora vêm do Google Agenda via /api/calendar
// (ver useEffect abaixo) em vez de dados fictícios fixos.
const AGENDA_INICIAL = {
  'Quinta-feira-10:00': { status: 'ocupado', valor: '6717' },
  'Quinta-feira-10:30': { status: 'ocupado', valor: '6717' },
  'Quinta-feira-11:00': { status: 'ocupado', valor: '6688' },
  'Quinta-feira-11:30': { status: 'ocupado', valor: '6688' },
  'Sexta-feira-10:00': { status: 'ocupado', valor: '6688' },
  'Sexta-feira-10:30': { status: 'ocupado', valor: '6688' },
  'Terça-feira-14:00': { status: 'ocupado', valor: '6717' },
  'Terça-feira-14:30': { status: 'ocupado', valor: '6717' },
  'Terça-feira-15:00': { status: 'ocupado', valor: '6717' },
  'Terça-feira-15:30': { status: 'ocupado', valor: '6717' },
  'Quarta-feira-14:00': { status: 'ocupado', valor: '6609' },
  'Quinta-feira-14:00': { status: 'ocupado', valor: '6688' },
  'Quinta-feira-14:30': { status: 'ocupado', valor: '6717' },
  'Quinta-feira-15:00': { status: 'ocupado', valor: '6717' },
  'Sexta-feira-15:30': { status: 'ocupado', valor: '6750' },
};

export default function Calendar() {
  const [agenda, setAgenda] = useState(AGENDA_INICIAL);
  const [selecionados, setSelecionados] = useState([]);
  const [temaId, setTemaId] = useState('esmeralda');
  const [sincronizando, setSincronizando] = useState(true);
  const [erroSincronizacao, setErroSincronizacao] = useState(null);
  const diasDoMes = getDiasDoMesDaSemanaAtual();
  const tema = TEMAS[temaId];

  useEffect(() => {
    let cancelado = false;

    async function carregarAgendaDoGoogle() {
      setSincronizando(true);
      setErroSincronizacao(null);
      try {
        const resposta = await fetch('/api/calendar');
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados?.erro || 'Falha ao carregar o Google Agenda.');

        if (!cancelado) {
          // Os horários que vêm do Google têm prioridade sobre qualquer dado local
          // com a mesma chave (são a fonte real de verdade para "ocupado/interna").
          setAgenda((atual) => ({ ...atual, ...dados.horariosOcupados }));
        }
      } catch (erro) {
        if (!cancelado) setErroSincronizacao(erro.message);
      } finally {
        if (!cancelado) setSincronizando(false);
      }
    }

    carregarAgendaDoGoogle();
    return () => {
      cancelado = true;
    };
  }, []);

  function getStatus(chave) {
    if (agenda[chave]) return agenda[chave].status;
    return selecionados.includes(chave) ? 'selecionado' : 'disponivel';
  }

  function alternarSelecao(chave) {
    setSelecionados((atual) => {
      if (atual.includes(chave)) {
        return atual.filter((c) => c !== chave);
      }
      if (atual.length >= MAXIMO_SELECIONADOS) {
        window.alert(`Você já selecionou o máximo de ${MAXIMO_SELECIONADOS} horários. Desmarque um antes de escolher outro.`);
        return atual;
      }
      return [...atual, chave];
    });
  }

  function aplicarIdNasSugestoes() {
    if (selecionados.length === 0) return;

    const idCliente = window.prompt('Qual o ID do cliente?');
    if (!idCliente || !idCliente.trim()) return;
    const idFinal = idCliente.trim();

    setAgenda((atual) => {
      const proximaAgenda = { ...atual };
      selecionados.forEach((chave) => {
        proximaAgenda[chave] = { status: 'sugestao', valor: idFinal };
      });
      return proximaAgenda;
    });
    setSelecionados([]);
  }

  function confirmarHorario(chave, celula) {
    const confirmar = window.confirm(`Confirmar este horário para o cliente ${celula.valor}?`);
    if (!confirmar) return;

    setAgenda((atual) => {
      const proximaAgenda = { ...atual };

      // Slot escolhido vira confirmado (cor forte do tema).
      proximaAgenda[chave] = { status: 'confirmado', valor: celula.valor };

      // Regra de ouro: as demais sugestões do mesmo cliente voltam a ficar disponíveis.
      Object.entries(atual).forEach(([chaveExistente, celulaExistente]) => {
        if (
          chaveExistente !== chave &&
          celulaExistente.status === 'sugestao' &&
          celulaExistente.valor === celula.valor
        ) {
          delete proximaAgenda[chaveExistente];
        }
      });

      return proximaAgenda;
    });
  }

  function desmarcarHorario(chave) {
    const desmarcar = window.confirm('Deseja desmarcar este horário e liberá-lo novamente?');
    if (!desmarcar) return;

    setAgenda((atual) => {
      const proximaAgenda = { ...atual };
      delete proximaAgenda[chave];
      return proximaAgenda;
    });
  }

  function handleClickCelula(chave) {
    const status = getStatus(chave);

    if (ehBloqueado(status)) return;

    if (status === 'disponivel' || status === 'selecionado') {
      alternarSelecao(chave);
      return;
    }

    if (status === 'sugestao') {
      confirmarHorario(chave, agenda[chave]);
      return;
    }

    if (status === 'confirmado') {
      desmarcarHorario(chave);
    }
  }

  function estiloDaCelula(status) {
    if (status === 'disponivel') return tema.disponivel;
    if (status === 'confirmado') return tema.confirmado;
    if (ehBloqueado(status)) return ESTILOS_FIXOS.bloqueado;
    return ESTILOS_FIXOS[status];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              <CalendarDays className={`w-7 h-7 ${tema.icone}`} />
              Reuniões da semana
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Selecione até {MAXIMO_SELECIONADOS} horários disponíveis e envie a sugestão para o cliente.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <SeletorDeTema temaId={temaId} onSelecionar={setTemaId} />

            <button
              type="button"
              onClick={aplicarIdNasSugestoes}
              disabled={selecionados.length === 0}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed ${tema.botao}`}
            >
              Aplicar ID nas Sugestões
              {selecionados.length > 0 ? ` (${selecionados.length}/${MAXIMO_SELECIONADOS})` : ''}
            </button>
          </div>
        </div>

        {sincronizando && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sincronizando com o Google Agenda...
          </div>
        )}

        {erroSincronizacao && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Não foi possível sincronizar com o Google Agenda ({erroSincronizacao}). Exibindo apenas os dados locais.
          </div>
        )}

        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
          <div className="rounded-lg bg-white border border-gray-200 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
            Hora
          </div>
          {DIAS_SEMANA.map((dia, index) => (
            <div
              key={dia}
              className={`rounded-lg text-white font-semibold py-2.5 text-center text-xs sm:text-sm uppercase tracking-wide shadow-sm ${tema.cabecalho}`}
            >
              {dia} {diasDoMes[index]}
            </div>
          ))}

          {HORARIOS.map((hora) => (
            <div key={hora} className="contents">
              <div
                className={`rounded-lg bg-white text-gray-700 font-semibold py-2.5 text-center text-sm shadow-sm ${tema.horaBorda}`}
              >
                {hora}
              </div>
              {DIAS_SEMANA.map((dia) => {
                const chave = `${dia}-${hora}`;
                const celula = agenda[chave];
                const status = getStatus(chave);
                const bloqueado = ehBloqueado(status);
                return (
                  <button
                    key={chave}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => handleClickCelula(chave)}
                    className={`rounded-lg py-2.5 text-center text-sm transition-colors ${estiloDaCelula(status)}`}
                  >
                    {bloqueado ? (
                      <span className="flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        {celula.valor}
                      </span>
                    ) : (
                      celula?.valor ?? ''
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-6 text-xs sm:text-sm text-gray-500">
          <LegendaItem cor={tema.disponivel} texto="Disponível" />
          <LegendaItem cor={ESTILOS_FIXOS.selecionado} texto="Selecionado" />
          <LegendaItem cor={ESTILOS_FIXOS.sugestao} texto="Sugestão enviada" />
          <LegendaItem cor={tema.confirmado} texto="Confirmado" />
          <LegendaItem cor={ESTILOS_FIXOS.bloqueado} texto="Bloqueado (Google Agenda)" />
        </div>
      </div>
    </div>
  );
}

function SeletorDeTema({ temaId, onSelecionar }) {
  return (
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-gray-400" />
      <div className="flex items-center gap-1.5">
        {Object.entries(TEMAS).map(([id, config]) => (
          <button
            key={id}
            type="button"
            title={config.nome}
            aria-label={`Tema ${config.nome}`}
            onClick={() => onSelecionar(id)}
            className={`w-6 h-6 rounded-full transition-transform ${config.swatch} ${
              temaId === id ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function LegendaItem({ cor, texto }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded-full inline-block ${cor}`} />
      {texto}
    </div>
  );
}

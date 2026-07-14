'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Palette } from 'lucide-react';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const MAXIMO_SELECIONADOS = 4;
const HORA_INICIO = 9;
const HORA_FIM = 18;
// v2: versão anterior podia ter dados fictícios ("ocupado") salvos no navegador;
// mudar a chave garante que quem já testou a versão antiga comece com a semana limpa.
const CHAVE_STORAGE = 'calendario-inteligente:agenda:v2';

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
  interna: 'bg-gray-700 hover:bg-gray-800 text-white font-semibold cursor-pointer shadow-inner',
};

function pad(numero) {
  return String(numero).padStart(2, '0');
}

function gerarHorarios(inicioHora, fimHora, intervaloMinutos = 30) {
  const horarios = [];
  for (let minutos = inicioHora * 60; minutos < fimHora * 60; minutos += intervaloMinutos) {
    const hh = pad(Math.floor(minutos / 60));
    const mm = pad(minutos % 60);
    horarios.push(`${hh}:${mm}`);
  }
  return horarios;
}

// Segunda-feira (00:00) da semana atual, deslocada em "deltaSemanas" semanas inteiras.
function obterSegundaFeira(deltaSemanas) {
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay(); // 0 = domingo ... 6 = sábado
  const offsetAteSegunda = diaSemanaHoje === 0 ? -6 : 1 - diaSemanaHoje;

  const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  segunda.setDate(segunda.getDate() + offsetAteSegunda + deltaSemanas * 7);
  return segunda;
}

// Datas reais (Segunda a Sexta) da semana selecionada.
function obterDiasDaSemana(deltaSemanas) {
  const segunda = obterSegundaFeira(deltaSemanas);
  return DIAS_SEMANA.map((_, index) => {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + index);
    return data;
  });
}

// Chave de armazenamento do slot: "YYYY-MM-DD-HH:MM", presa à data real (não ao dia genérico).
function formatarChaveData(data) {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

function formatarDataCurta(data) {
  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}`;
}

function formatarIntervaloDaSemana(diasDaSemana) {
  const primeiro = diasDaSemana[0];
  const ultimo = diasDaSemana[diasDaSemana.length - 1];
  return `${formatarDataCurta(primeiro)} – ${formatarDataCurta(ultimo)}`;
}

const HORARIOS = gerarHorarios(HORA_INICIO, HORA_FIM);

export default function Calendar() {
  const [agenda, setAgenda] = useState({});
  const [selecionados, setSelecionados] = useState([]);
  const [temaId, setTemaId] = useState('esmeralda');
  const [deltaSemanas, setDeltaSemanas] = useState(0);
  const [pronto, setPronto] = useState(false);

  const tema = TEMAS[temaId];
  const diasDaSemana = obterDiasDaSemana(deltaSemanas);

  // Hidrata do localStorage uma única vez, no primeiro carregamento no navegador.
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_STORAGE);
      if (salvo) setAgenda(JSON.parse(salvo));
    } catch (erro) {
      console.error('Não foi possível carregar a agenda salva do localStorage:', erro);
    }
    setPronto(true);
  }, []);

  // Persiste toda alteração no localStorage — só depois de hidratar, pra não sobrescrever
  // um estado já salvo com o objeto vazio inicial antes de lê-lo.
  useEffect(() => {
    if (!pronto) return;
    window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(agenda));
  }, [agenda, pronto]);

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

  function aplicarBloqueioInterno() {
    if (selecionados.length === 0) return;

    setAgenda((atual) => {
      const proximaAgenda = { ...atual };
      selecionados.forEach((chave) => {
        proximaAgenda[chave] = { status: 'interna', valor: 'Interna' };
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

  function desmarcarBloqueioInterno(chave) {
    const desmarcar = window.confirm('Deseja remover este bloqueio interno e liberar o horário novamente?');
    if (!desmarcar) return;

    setAgenda((atual) => {
      const proximaAgenda = { ...atual };
      delete proximaAgenda[chave];
      return proximaAgenda;
    });
  }

  function handleClickCelula(chave) {
    const status = getStatus(chave);

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
      return;
    }

    if (status === 'interna') {
      desmarcarBloqueioInterno(chave);
    }
  }

  function estiloDaCelula(status) {
    if (status === 'disponivel') return tema.disponivel;
    if (status === 'confirmado') return tema.confirmado;
    return ESTILOS_FIXOS[status];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              <CalendarDays className={`w-7 h-7 ${tema.icone}`} />
              Reuniões da semana
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Selecione até {MAXIMO_SELECIONADOS} horários e escolha uma ação abaixo.
            </p>
          </div>

          <SeletorDeTema temaId={temaId} onSelecionar={setTemaId} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={aplicarIdNasSugestoes}
            disabled={selecionados.length === 0}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed ${tema.botao}`}
          >
            Sugerir para Cliente
          </button>
          <button
            type="button"
            onClick={aplicarBloqueioInterno}
            disabled={selecionados.length === 0}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-800 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Bloqueio Interno
          </button>
          {selecionados.length > 0 && (
            <span className="text-sm text-gray-500">
              {selecionados.length}/{MAXIMO_SELECIONADOS} horários selecionados
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 mb-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDeltaSemanas((atual) => atual - 1)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Semana Anterior
            </button>
            <button
              type="button"
              onClick={() => setDeltaSemanas(0)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                deltaSemanas === 0 ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-white hover:shadow-sm'
              }`}
            >
              Semana Atual
            </button>
            <button
              type="button"
              onClick={() => setDeltaSemanas((atual) => atual + 1)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition"
            >
              Próxima Semana
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm font-medium text-gray-500">{formatarIntervaloDaSemana(diasDaSemana)}</div>
        </div>

        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
          <div className="rounded-lg bg-white border border-gray-200 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
            Hora
          </div>
          {DIAS_SEMANA.map((dia, index) => (
            <div
              key={dia}
              className={`rounded-lg text-white py-2.5 px-1 text-center shadow-sm ${tema.cabecalho}`}
            >
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide">{dia}</div>
              <div className="text-[11px] sm:text-xs opacity-80">{formatarDataCurta(diasDaSemana[index])}</div>
            </div>
          ))}

          {HORARIOS.map((hora) => (
            <div key={hora} className="contents">
              <div
                className={`rounded-lg bg-white text-gray-700 font-semibold py-2.5 text-center text-sm shadow-sm ${tema.horaBorda}`}
              >
                {hora}
              </div>
              {DIAS_SEMANA.map((dia, index) => {
                const chave = `${formatarChaveData(diasDaSemana[index])}-${hora}`;
                const celula = agenda[chave];
                const status = getStatus(chave);
                return (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => handleClickCelula(chave)}
                    className={`rounded-lg py-2.5 text-center text-sm transition-colors ${estiloDaCelula(status)}`}
                  >
                    {celula?.valor ?? ''}
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
          <LegendaItem cor={ESTILOS_FIXOS.interna} texto="Bloqueio interno" />
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

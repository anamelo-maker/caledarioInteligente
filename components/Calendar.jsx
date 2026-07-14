'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const MAXIMO_SELECIONADOS = 4;

function gerarHorarios(inicioHora = 10, fimHora = 18, intervaloMinutos = 30) {
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

const HORARIOS = gerarHorarios();

// Mock data: horários que já nascem ocupados (reunião interna ou já agendada com um cliente).
// Tudo que não está aqui começa "disponivel" (verde claro).
const AGENDA_INICIAL = {
  'Quarta-feira-10:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-10:30': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-11:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-11:30': { status: 'interna', valor: 'Interna' },
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
  'Quarta-feira-15:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-15:30': { status: 'interna', valor: 'Interna' },
  'Quinta-feira-14:00': { status: 'ocupado', valor: '6688' },
  'Quinta-feira-14:30': { status: 'ocupado', valor: '6717' },
  'Quinta-feira-15:00': { status: 'ocupado', valor: '6717' },
  'Sexta-feira-15:30': { status: 'ocupado', valor: '6750' },
};

const ESTILOS_POR_STATUS = {
  disponivel: 'bg-green-200 hover:bg-green-300 cursor-pointer text-green-900',
  selecionado: 'bg-blue-200 hover:bg-blue-300 cursor-pointer text-blue-900 font-semibold ring-2 ring-blue-400',
  interna: 'bg-green-200 text-gray-700 italic cursor-default',
  ocupado: 'bg-green-200 text-blue-900 font-bold cursor-default',
  sugestao: 'bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold cursor-pointer',
  confirmado: 'bg-green-700 hover:bg-green-800 text-white font-bold cursor-pointer',
};

export default function Calendar() {
  const [agenda, setAgenda] = useState(AGENDA_INICIAL);
  const [selecionados, setSelecionados] = useState([]);
  const diasDoMes = getDiasDoMesDaSemanaAtual();

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

      // Slot escolhido vira confirmado (verde escuro).
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

    // 'interna' e 'ocupado' são somente leitura.
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-green-800">
          <CalendarDays className="w-7 h-7" />
          Reuniões da semana
        </h1>

        <button
          type="button"
          onClick={aplicarIdNasSugestoes}
          disabled={selecionados.length === 0}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Aplicar ID nas Sugestões {selecionados.length > 0 ? `(${selecionados.length}/${MAXIMO_SELECIONADOS})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-1.5">
        <div className="bg-orange-400 text-white font-bold rounded-md py-2 text-center text-sm">
          HORA
        </div>
        {DIAS_SEMANA.map((dia, index) => (
          <div
            key={dia}
            className="bg-green-800 text-white font-semibold rounded-md py-2 text-center text-xs sm:text-sm uppercase"
          >
            {dia} {diasDoMes[index]}
          </div>
        ))}

        {HORARIOS.map((hora) => (
          <div key={hora} className="contents">
            <div className="bg-orange-400 text-white font-bold rounded-md py-2 text-center text-sm">
              {hora}
            </div>
            {DIAS_SEMANA.map((dia) => {
              const chave = `${dia}-${hora}`;
              const celula = agenda[chave];
              const status = getStatus(chave);
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => handleClickCelula(chave)}
                  className={`rounded-md py-2 text-center text-sm transition-colors ${ESTILOS_POR_STATUS[status]}`}
                >
                  {celula?.valor ?? ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
        <LegendaItem cor="bg-green-200" texto="Disponível / Interna / Ocupado" />
        <LegendaItem cor="bg-blue-200" texto="Selecionado" />
        <LegendaItem cor="bg-yellow-300" texto="Sugestão enviada ao cliente" />
        <LegendaItem cor="bg-green-700" texto="Confirmado" />
      </div>
    </div>
  );
}

function LegendaItem({ cor, texto }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded ${cor} inline-block border border-black/10`} />
      {texto}
    </div>
  );
}

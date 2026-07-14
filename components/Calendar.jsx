'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

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

// Mock data apenas para a Fase 1 (visual + estado local), sem persistência real.
const AGENDA_INICIAL = {
  'Quarta-feira-10:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-10:30': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-11:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-11:30': { status: 'interna', valor: 'Interna' },
  'Quinta-feira-10:00': { status: 'confirmado', valor: '6717' },
  'Quinta-feira-10:30': { status: 'confirmado', valor: '6717' },
  'Quinta-feira-11:00': { status: 'confirmado', valor: '6688' },
  'Quinta-feira-11:30': { status: 'confirmado', valor: '6688' },
  'Sexta-feira-10:00': { status: 'confirmado', valor: '6688' },
  'Sexta-feira-10:30': { status: 'confirmado', valor: '6688' },
  'Terça-feira-14:00': { status: 'confirmado', valor: '6717' },
  'Terça-feira-14:30': { status: 'confirmado', valor: '6717' },
  'Terça-feira-15:00': { status: 'confirmado', valor: '6717' },
  'Terça-feira-15:30': { status: 'confirmado', valor: '6717' },
  'Quarta-feira-14:00': { status: 'confirmado', valor: '6609' },
  'Quarta-feira-15:00': { status: 'interna', valor: 'Interna' },
  'Quarta-feira-15:30': { status: 'interna', valor: 'Interna' },
  'Quinta-feira-14:00': { status: 'confirmado', valor: '6688' },
  'Quinta-feira-14:30': { status: 'confirmado', valor: '6717' },
  'Quinta-feira-15:00': { status: 'confirmado', valor: '6717' },
  'Sexta-feira-15:30': { status: 'confirmado', valor: '6750' },
};

const ESTILOS_POR_STATUS = {
  disponivel: 'bg-green-200 hover:bg-green-300 cursor-pointer text-green-900',
  interna: 'bg-green-200 text-gray-700 italic cursor-default',
  confirmado: 'bg-green-200 text-blue-900 font-bold cursor-default',
  sugestao: 'bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold cursor-pointer',
};

export default function Calendar() {
  const [agenda, setAgenda] = useState(AGENDA_INICIAL);
  const diasDoMes = getDiasDoMesDaSemanaAtual();

  function handleClickCelula(chave, celula) {
    if (!celula) {
      const idCliente = window.prompt('Qual o ID do cliente?');
      if (idCliente && idCliente.trim()) {
        setAgenda((atual) => ({
          ...atual,
          [chave]: { status: 'sugestao', valor: idCliente.trim() },
        }));
      }
      return;
    }

    if (celula.status === 'sugestao') {
      const confirmarRemocao = window.confirm(`Remover a sugestão para o cliente ${celula.valor}?`);
      if (confirmarRemocao) {
        setAgenda((atual) => {
          const proximaAgenda = { ...atual };
          delete proximaAgenda[chave];
          return proximaAgenda;
        });
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-green-800 mb-6">
        <CalendarDays className="w-7 h-7" />
        Reuniões da semana
      </h1>

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
              const status = celula?.status ?? 'disponivel';
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => handleClickCelula(chave, celula)}
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
        <LegendaItem cor="bg-green-200" texto="Disponível / Interna / Confirmado" />
        <LegendaItem cor="bg-yellow-300" texto="Sugestão enviada ao cliente" />
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

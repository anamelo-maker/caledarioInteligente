'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  ChevronDown,
} from 'lucide-react';

const clientesData = [
  {
    id: '53994302817',
    nome: 'VINICIUS DA SILVA MARQUES',
    empresa: '6682',
    mrr: 1962.27,
    plano: 'Avançado',
    periodicidade: '1',
    dataTermino: '2026-08-13',
    dataLimiteAlteracao: '2026-08-06',
    statusSaaS: 'CLIENTE-ATIVO (sem renovação)',
    statusFinanceiro: 'Inadimplente (Boleto)',
    assinatura: 'Sim',
    diasAtivo: 4,
    diasSemTouch: '20:33:49',
  },
  {
    id: '53361709452',
    nome: 'Leandro Ribeiro de Morais',
    empresa: '5428',
    mrr: 432.13,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-15',
    dataLimiteAlteracao: '2026-08-08',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Atrasado (Boleto)',
    assinatura: 'Sim',
    diasAtivo: 0,
    diasSemTouch: '44:52:40',
  },
  {
    id: '53347005312',
    nome: 'Dirceu Kryszczun Dalla Rosa',
    empresa: '2898',
    mrr: 617.55,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-31',
    dataLimiteAlteracao: '2026-08-24',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 0,
    diasSemTouch: '44:53:22',
  },
  {
    id: '53352453888',
    nome: 'Raul Fernando Tozzi Rodrigues',
    empresa: '2892',
    mrr: 472.99,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-13',
    dataLimiteAlteracao: '2026-08-06',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Atrasado (Boleto)',
    assinatura: 'Sim',
    diasAtivo: 15,
    diasSemTouch: '65:23:52',
  },
  {
    id: '53358763958',
    nome: 'EDUARDO KOHL',
    empresa: '1237',
    mrr: 950.0,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-31',
    dataLimiteAlteracao: '2026-08-24',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 18,
    diasSemTouch: '263:12:32',
  },
  {
    id: '53356782422',
    nome: 'Ederson Antônio Durigon',
    empresa: '2490',
    mrr: 1402.69,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-11',
    dataLimiteAlteracao: '2026-08-04',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 20,
    diasSemTouch: '263:41:09',
  },
  {
    id: '53351209134',
    nome: 'Luigi Fernandes Pilatti',
    empresa: '2345',
    mrr: 885.83,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-21',
    dataLimiteAlteracao: '2026-08-14',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 23,
    diasSemTouch: '334:45:07',
  },
  {
    id: '53357401903',
    nome: 'VINICIUS ROBERTO FIGUEIREDO DALMOLIN',
    empresa: '938',
    mrr: 722.92,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-09-10',
    dataLimiteAlteracao: '2026-08-03',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 19,
    diasSemTouch: '386:43:33',
  },
  {
    id: '53359841394',
    nome: 'FERNANDO REGHIN',
    empresa: '754',
    mrr: 950.82,
    plano: 'Premium',
    periodicidade: '1',
    dataTermino: '2026-09-01',
    dataLimiteAlteracao: '2026-08-25',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 27,
    diasSemTouch: '430:00:46',
  },
  {
    id: '53365065484',
    nome: 'TORRES AGROPECUÁRIA LTDA',
    empresa: '4418',
    mrr: 477.41,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-27',
    dataLimiteAlteracao: '2026-08-20',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 23,
    diasSemTouch: '581:49:59',
  },
  {
    id: '53345142634',
    nome: 'Otávio Idevan Tavares',
    empresa: '2050',
    mrr: 484.57,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-14',
    dataLimiteAlteracao: '2026-08-07',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 3,
    diasSemTouch: '',
  },
  {
    id: '53348113692',
    nome: 'Adão Luiz de Andrade',
    empresa: '4312',
    mrr: 630.32,
    plano: 'Lucratividade',
    periodicidade: '1',
    dataTermino: '2026-08-12',
    dataLimiteAlteracao: '2026-08-05',
    statusSaaS: 'CLIENTE-ATIVO',
    statusFinanceiro: 'Adimplente',
    assinatura: 'Sim',
    diasAtivo: 22,
    diasSemTouch: '',
  },
];

function calcularStatusOportunidade(dataLimiteAlteracao, dataTermino) {
  const hoje = new Date('2026-08-07');
  const limite = new Date(dataLimiteAlteracao);
  const termino = new Date(dataTermino);

  const diasParaLimite = Math.ceil(
    (limite - hoje) / (1000 * 60 * 60 * 24)
  );

  if (diasParaLimite < 0) {
    // Prazo passou
    const diasAposLimite = Math.abs(diasParaLimite);
    if (diasAposLimite <= 30) {
      return {
        status: 'perdido_este_mes',
        label: '🔴 Prazo Encerrado',
        cor: 'red',
        diasRestantes: diasAposLimite,
      };
    } else {
      return {
        status: 'proximo_ciclo',
        label: '⚪ Próximo Ciclo',
        cor: 'gray',
        diasRestantes: null,
      };
    }
  } else if (diasParaLimite === 0) {
    return {
      status: 'vencendo_hoje',
      label: '🟡 Vencendo Hoje',
      cor: 'amber',
      diasRestantes: 0,
    };
  } else if (diasParaLimite <= 3) {
    return {
      status: 'prazo_terminando',
      label: '🟡 Prazo Terminando',
      cor: 'amber',
      diasRestantes: diasParaLimite,
    };
  } else {
    return {
      status: 'ativo',
      label: '🟢 Alteração Possível',
      cor: 'green',
      diasRestantes: diasParaLimite,
    };
  }
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export default function PainelConversao() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('urgencia');
  const [expandedCard, setExpandedCard] = useState(null);

  const clientesComStatus = useMemo(
    () =>
      clientesData.map((cliente) => ({
        ...cliente,
        oportunidade: calcularStatusOportunidade(
          cliente.dataLimiteAlteracao,
          cliente.dataTermino
        ),
      })),
    []
  );

  const clientesFiltrados = useMemo(() => {
    let resultado = clientesComStatus;

    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(
        (c) => c.oportunidade.status === filtroStatus
      );
    }

    // Filtro por busca
    if (searchTerm) {
      resultado = resultado.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.empresa.includes(searchTerm)
      );
    }

    // Ordenação
    if (ordenacao === 'urgencia') {
      resultado.sort((a, b) => {
        const ordemStatus = {
          vencendo_hoje: 0,
          prazo_terminando: 1,
          perdido_este_mes: 2,
          ativo: 3,
          proximo_ciclo: 4,
        };
        const diff =
          ordemStatus[a.oportunidade.status] -
          ordemStatus[b.oportunidade.status];
        if (diff !== 0) return diff;
        return b.mrr - a.mrr;
      });
    } else if (ordenacao === 'mrr') {
      resultado.sort((a, b) => b.mrr - a.mrr);
    } else if (ordenacao === 'proximaRenovacao') {
      resultado.sort(
        (a, b) =>
          new Date(a.dataTermino) - new Date(b.dataTermino)
      );
    }

    return resultado;
  }, [clientesComStatus, filtroStatus, searchTerm, ordenacao]);

  // Cálculos de KPIs
  const kpis = useMemo(() => {
    const total = clientesComStatus.length;
    const mrrTotal = clientesComStatus.reduce((acc, c) => acc + c.mrr, 0);
    const dentroPrazo = clientesComStatus.filter(
      (c) => c.oportunidade.status === 'ativo'
    ).length;
    const proximoVencimento = clientesComStatus.filter(
      (c) => c.oportunidade.status === 'prazo_terminando' ||
             c.oportunidade.status === 'vencendo_hoje'
    ).length;
    const prazoEncerrado = clientesComStatus.filter(
      (c) => c.oportunidade.status === 'perdido_este_mes'
    ).length;

    const proximaRenovacao = clientesComStatus.reduce((min, c) => {
      const data = new Date(c.dataTermino);
      return data < min ? data : min;
    }, new Date('2099-12-31'));

    return {
      total,
      mrrTotal,
      dentroPrazo,
      proximoVencimento,
      prazoEncerrado,
      proximaRenovacao,
    };
  }, [clientesComStatus]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Painel de Conversão
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Gestão da campanha de conversão para contratos de maior fidelidade
              </p>
            </div>
            <div className="text-right text-sm text-slate-600 dark:text-slate-400">
              <div>Atualizado em tempo real</div>
              <div className="text-xs mt-1">Hoje: 07/08/2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total de Clientes */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Total de Clientes
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {kpis.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            </div>
          </div>

          {/* MRR Total */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  MRR Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatarMoeda(kpis.mrrTotal)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
            </div>
          </div>

          {/* Dentro do Prazo */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Dentro do Prazo
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {kpis.dentroPrazo}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
            </div>
          </div>

          {/* Próximas Vencidas */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Próximas do Vencimento
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {kpis.proximoVencimento}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-300 dark:text-amber-700" />
            </div>
          </div>

          {/* Prazo Encerrado */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Prazo Encerrado
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {kpis.prazoEncerrado}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-300 dark:text-red-700" />
            </div>
          </div>

          {/* Próxima Renovação */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Próx. Renovação
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {formatarData(kpis.proximaRenovacao)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-300 dark:text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente por nome ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="vencendo_hoje">Vencendo Hoje</option>
                <option value="prazo_terminando">Prazo Terminando</option>
                <option value="ativo">Dentro do Prazo</option>
                <option value="perdido_este_mes">Prazo Encerrado</option>
                <option value="proximo_ciclo">Próximo Ciclo</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="urgencia">Por Urgência</option>
                <option value="mrr">Por MRR (maior)</option>
                <option value="proximaRenovacao">Por Próxima Renovação</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Clientes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum cliente encontrado com esses critérios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesFiltrados.map((cliente) => {
              const isExpanded = expandedCard === cliente.id;
              const diasParaAlteracao = Math.ceil(
                (new Date(cliente.dataLimiteAlteracao) - new Date('2026-08-07')) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={cliente.id}
                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                    cliente.oportunidade.cor === 'red'
                      ? 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900 hover:shadow-lg hover:border-red-300'
                      : cliente.oportunidade.cor === 'amber'
                      ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900 hover:shadow-lg hover:border-amber-300'
                      : cliente.oportunidade.cor === 'green'
                      ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900 hover:shadow-lg hover:border-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300'
                  }`}
                  onClick={() =>
                    setExpandedCard(isExpanded ? null : cliente.id)
                  }
                >
                  {/* Status Bar */}
                  <div
                    className={`h-1 ${
                      cliente.oportunidade.cor === 'red'
                        ? 'bg-red-500'
                        : cliente.oportunidade.cor === 'amber'
                        ? 'bg-amber-500'
                        : cliente.oportunidade.cor === 'green'
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  />

                  {/* Conteúdo do Card */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">
                          {cliente.nome}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Empresa #{cliente.empresa}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          cliente.oportunidade.cor === 'red'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : cliente.oportunidade.cor === 'amber'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : cliente.oportunidade.cor === 'green'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cliente.oportunidade.label}
                      </span>
                    </div>

                    {/* KPIs Principais */}
                    <div className="space-y-3 mb-4">
                      {/* MRR */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          MRR
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatarMoeda(cliente.mrr)}
                        </span>
                      </div>

                      {/* Data Limite Alteração */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Limite Alteração
                        </span>
                        <span
                          className={`font-bold ${
                            diasParaAlteracao < 0
                              ? 'text-red-600 dark:text-red-400'
                              : diasParaAlteracao === 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : diasParaAlteracao <= 3
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatarData(cliente.dataLimiteAlteracao)}
                        </span>
                      </div>

                      {/* Próxima Renovação */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Próx. Renovação
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatarData(cliente.dataTermino)}
                        </span>
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Plano
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {cliente.plano}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Dias Ativo
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {cliente.diasAtivo}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Status Financeiro
                            </p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {cliente.statusFinanceiro}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Dias sem Touch
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {cliente.diasSemTouch || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

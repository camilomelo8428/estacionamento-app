import React, { useState } from 'react';
import './styles.css';

interface Ticket {
  id: string;
  placa: string;
  modelo: string;
  horaEntrada: string;
  horaSaida?: string;
  valorTotal?: number;
  status: 'ABERTO' | 'FECHADO';
  vaga: string;
  categoria: string;
  valorHora: number;
}

const GerenciarTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      placa: 'ABC-1234',
      modelo: 'Fiat Uno',
      horaEntrada: '2024-02-28T10:00:00',
      status: 'ABERTO',
      vaga: 'A01',
      categoria: 'CARRO PEQUENO',
      valorHora: 10
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ABERTO' | 'FECHADO'>('TODOS');
  const [busca, setBusca] = useState('');

  const calcularTempoDecorrido = (entrada: string) => {
    const horaEntrada = new Date(entrada);
    const agora = new Date();
    const diferenca = agora.getTime() - horaEntrada.getTime();
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  };

  const calcularValor = (entrada: string, valorHora: number) => {
    const horaEntrada = new Date(entrada);
    const agora = new Date();
    const diferenca = agora.getTime() - horaEntrada.getTime();
    const horas = Math.ceil(diferenca / (1000 * 60 * 60));
    return horas * valorHora;
  };

  const handleEncerrarTicket = (id: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === id) {
        const valorTotal = calcularValor(ticket.horaEntrada, ticket.valorHora);
        return {
          ...ticket,
          status: 'FECHADO',
          horaSaida: new Date().toISOString(),
          valorTotal
        };
      }
      return ticket;
    }));
  };

  const ticketsFiltrados = tickets.filter(ticket => {
    const matchStatus = filtroStatus === 'TODOS' || ticket.status === filtroStatus;
    const matchBusca = ticket.placa.toLowerCase().includes(busca.toLowerCase()) ||
                      ticket.modelo.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Gerenciar Tickets</h1>
        <div className="filtros">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por placa ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as 'TODOS' | 'ABERTO' | 'FECHADO')}
            className="filtro-status"
          >
            <option value="TODOS">Todos os tickets</option>
            <option value="ABERTO">Tickets abertos</option>
            <option value="FECHADO">Tickets fechados</option>
          </select>
        </div>
      </div>

      <div className="tickets-grid">
        {ticketsFiltrados.map(ticket => (
          <div key={ticket.id} className={`ticket-card ${ticket.status.toLowerCase()}`}>
            <div className="ticket-header">
              <h3>{ticket.placa}</h3>
              <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="ticket-info">
              <p><strong>Modelo:</strong> {ticket.modelo}</p>
              <p><strong>Vaga:</strong> {ticket.vaga}</p>
              <p><strong>Categoria:</strong> {ticket.categoria}</p>
              <p><strong>Entrada:</strong> {new Date(ticket.horaEntrada).toLocaleTimeString('pt-BR')}</p>
              {ticket.horaSaida && (
                <p><strong>Saída:</strong> {new Date(ticket.horaSaida).toLocaleTimeString('pt-BR')}</p>
              )}
              <p><strong>Tempo:</strong> {calcularTempoDecorrido(ticket.horaEntrada)}</p>
              {ticket.status === 'ABERTO' && (
                <p><strong>Valor atual:</strong> R$ {calcularValor(ticket.horaEntrada, ticket.valorHora).toFixed(2)}</p>
              )}
              {ticket.status === 'FECHADO' && ticket.valorTotal && (
                <p><strong>Valor total:</strong> R$ {ticket.valorTotal.toFixed(2)}</p>
              )}
            </div>

            {ticket.status === 'ABERTO' && (
              <button
                className="btn-encerrar"
                onClick={() => handleEncerrarTicket(ticket.id)}
              >
                Encerrar ticket
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GerenciarTickets; 
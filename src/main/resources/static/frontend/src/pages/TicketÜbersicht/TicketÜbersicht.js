import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TicketÜbersicht.css';
import Header from '../../components/Header/HeaderLoggedIn';

function TicketÜbersicht() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({
    betreff: '',
    prioritaet: '',
    status: ''
  });
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const statusMap = {
    offen: 'Offen',
    in_bearbeitung: 'In Bearbeitung',
    geschlossen: 'Geschlossen',
  };
 
  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/service-tickets/all');
      setTickets(response.data);
    } catch (err) {
      console.error('Fehler beim Abrufen der Tickets:', err);
      setError('Fehler beim Laden der Tickets. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({
      ...searchCriteria,
      [name]: value
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('http://localhost:8080/service-tickets/search', {
        params: {
          betreff: searchCriteria.betreff || null,
          prioritaet: searchCriteria.prioritaet || null,
          status: searchCriteria.status || null
        }
      });

      setTickets(response.data);
    } catch (err) {
      console.error('Fehler bei der Ticket-Suche:', err);
      setError('Fehler beim Abrufen der Tickets. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchCriteria({
      betreff: '',
      prioritaet: '',
      status: ''
    });
    fetchAllTickets();
  };

  const formatDateTime = (localdatetime) => {
    const date = new Date(localdatetime);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('de-DE');
  };

  const handleRowClick = (id) => {
    navigate(`/service-tickets/${id}`);
  };

  return (
    <div className="ticket-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="title"> <button className="back-button" onClick={() => window.history.back()}>
          <span>Zurück</span>
        </button>Ticketübersicht</h1>

        <div className="search-grid">
          <div className="input-row">
            <input
              type="text"
              name="betreff"
              value={searchCriteria.betreff}
              onChange={handleInputChange}
              placeholder="Betreff"
              className="form-input"
            />
            <select
              name="prioritaet"
              value={searchCriteria.prioritaet}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Priorität</option>
              <option value="hoch">Hoch</option>
              <option value="mittel">Mittel</option>
              <option value="niedrig">Niedrig</option>
            </select>
            <select
              name="status"
              value={searchCriteria.status}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Status</option>
              <option value="offen">Offen</option>
              <option value="in_bearbeitung">In Bearbeitung</option>
              <option value="geschlossen">Geschlossen</option>
            </select>
          </div>

          <div className="button-container">
            <button onClick={handleSearch} className="action-button">
              Suchen
            </button>
            <button onClick={handleResetFilters} className="action-button">
              Filter zurücksetzen
            </button>
          </div>
        </div>



        
        <div className="results-section">
        <div className="table-container">
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <p>Tickets werden geladen...</p>
          ) : tickets.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ticket-ID</th>
                  <th>Betreff</th>
                  <th>Priorität</th>
                  <th>Status</th>
                  <th>Erstellungsdatum</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="clickable-row">
                    <td>{ticket.id}</td>
                    <td>{ticket.betreff}</td>
                    <td>{ticket.prioritaet}</td>
                    <td>{statusMap[ticket.status]}</td>
                    <td>{formatDateTime(ticket.datumErstellt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Keine Tickets gefunden.</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default TicketÜbersicht;

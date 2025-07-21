import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/HeaderLoggedIn';
import './TicketDetailansicht.css';
import './TicketDetailModal.css' 

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticketData, setTicketData] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(null);

  const statusMap = {
    offen: 'Offen',
    in_bearbeitung: 'In Bearbeitung',
    geschlossen: 'Geschlossen',
  };

  const statusOptions = Object.keys(statusMap);

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/service-tickets/${id}`);
        if (!response.ok) throw new Error('Fehler beim Laden des Tickets');
        const data = await response.json();
        setTicketData(data);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    fetchTicketDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    ticketData.status = newStatus;
    try {
      const response = await fetch(`http://localhost:8080/service-tickets/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        setSuccess('Status erfolgreich geändert!');
        setShowModal(true);
        setTicketData({ ...ticketData, newStatus });
      } else {
        setError('Fehler beim Aktualisieren des Status.');
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.history.back();
  };

  return (
    <div className="ticket-detail-container">
      <Header />
      <div className="content-wrapper">
        <h1 className='title'>
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Details zu Ticket #{ticketData.id}</h1>
        <div className="ticket-info">
          <div className="info-group">
            <label>Betreff:</label>
            <span>{ticketData.betreff}</span>
          </div>
          <div className="info-group">
            <label>Beschreibung:</label>
            <span>{ticketData.beschreibung}</span>
          </div>
          <div className="info-group">
            <label>Grund:</label>
            <span>{ticketData.grund}</span>
          </div>
          <div className="info-group">
            <label>Priorität:</label>
            <span>{ticketData.prioritaet}</span>
          </div>
          <div className="info-group">
            <label>Status:</label>
            <span>{statusMap[ticketData.status]}</span>
          </div>
        </div>
        <div className="status-change">
          <label>Status ändern:</label>
          <select
            value={ticketData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
             {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusMap[status]}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
      {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Erfolgreich!
              </div>
              {success && <div className="error-message">{success}</div>}
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={handleCloseModal}
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        )}
    </div>

  );
}

export default TicketDetail;

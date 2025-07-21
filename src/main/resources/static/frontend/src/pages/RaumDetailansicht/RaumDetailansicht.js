import React, { useEffect, useState } from 'react';
import './RaumDetailansicht.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserByToken } from '../../services/UserService';

function RaumDetailansicht() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [roomDetails, setRoomDetails] = useState(null);
  const [facilityManager, setFacilityManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
 
  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  useEffect(() => {
    const fetchFacilityManager = async (gebaeudeId) => {
      try {
        const response = await axios.get(`http://localhost:8080/gebaeude/${gebaeudeId}/facility-manager`);
        return response.data || null;
      } catch (error) {
        console.warn('Fehler beim Abrufen des Facility Managers:', error);
        return null;
      }
    };

    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/raeume/${id}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Raumdaten');
        const data = await response.json();
        setRoomDetails(data);

        if (data.gebaeudeId) {
          const manager = await fetchFacilityManager(data.gebaeudeId);
          setFacilityManager(manager);
        }
      } catch (err) {
        console.error(err);
        setError('Raumdaten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  useEffect(() => {
      const getUser = async () => {
        const userData = await fetchUserByToken();
        setUser(userData);
      };
  
      getUser();
    }, []);

  if (loading) {
    return (
      <div className="room-detail-container">
        <Header />
        <div className="content-wrapper">
          <div className="title-container">

            <h1 className="title"> <button className="back-button" onClick={() => window.history.back()}>
              Zurück
            </button>Raum-Detailübersicht</h1>
            <div className="spacer"></div>
          </div>
          <p>Lade Daten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-detail-container">
        <Header />
        <div className="content-wrapper">
          <div className="title-container">

            <h1 className="title"><button className="back-button" onClick={() => window.history.back()}>
              Zurück
            </button>Raum-Detailübersicht</h1>
            <div className="spacer"></div>
          </div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="room-detail-container">
        <Header />
        <div className="content-wrapper">
          <div className="title-container">

            <h1 className="title"> <button onClick={() => navigate('/home')} className="button back_button">
              Zurück
            </button>Raum-Detailübersicht</h1>
            <div className="spacer"></div>
          </div>
          <p>Keine Daten vorhanden</p>
        </div>
      </div>
    );
  }

  const handleBelegunsplan = () => {
    navigate('/Belegungsplan', { state: { id } });
  };

  return (
    <div className="room-detail-container">
      <Header />
      <div className="content-wrapper">
        <div className="title-container">

          <h1 className="title"> 
            <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
            </button>
          Raum-Detailübersicht
          </h1>

          <div className="spacer"></div>
        </div>
        <div className="grid-container">
          {/* Grundlegende Raumdetails */}
          <div className="section">
            <h2>Grundlegende Raumdetails</h2>
            <div className="details-list">
              <div className="detail-item">
                <span className="label">RaumID:</span>
                <span>{roomDetails.id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Raumname:</span>
                <span>{roomDetails.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Raumgröße:</span>
                <span>{roomDetails.groesse} m²</span>
              </div>
              <div className="detail-item">
                <span className="label">Raumtyp:</span>
                <span>{roomDetails.typ}</span>
              </div>
              <div className="detail-item">
                <span className="label">Kapazität:</span>
                <span>{roomDetails.kapazitaet} Personen</span>
              </div>
            </div>
            {(user?.rolle?.name === 'Admin' || user?.rolle?.name === 'Verwaltungsmitarbeitende') && (
            <button
              className="action-button secondary"
              onClick={() => navigate(`/raum/${id}/bearbeiten`)}
            >
              Bearbeiten
            </button>
            )}
          </div>

          {/* Facility Manager */}
          <div className="section">
            <h2>Zuständiger Facility Manager:</h2>
            {facilityManager ? (
              <div className="details-list">
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span>{facilityManager.vorname} {facilityManager.nachname}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span>{facilityManager.email}</span>
                </div>
              </div>
            ) : (
              <p>Kein Facility Manager zugewiesen</p>
            )}
          </div>

          {/* Ausstattung */}
          <div className="section">
            <h2>Ausstattung</h2>
            <ul className="equipment-list">
              {roomDetails.ausstattung && roomDetails.ausstattung.length > 0 ? (
                roomDetails.ausstattung.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>Keine Ausstattung vorhanden</li>
              )}
            </ul>
            {(user?.rolle?.name !== 'Lehrende') && (
            <button
              className="action-button secondary"
              onClick={() => navigate(`/raum/${id}/ausstattung/edit`)}
            >
              Bearbeiten
            </button>
            )}
          </div>
        </div>

        <div className="bottom-buttons">
          {/* Navigiert zur TicketErstellen-Seite */}
          <button
            className="action-button"
            onClick={() => navigate(`/raum/${id}/ticket-erstellen`)}
          >
            Ticket erstellen
          </button>

          {/* Ein einziger "Raum buchen"-Button */}
          <button
            className="action-button"
            onClick={() => navigate(`/Buchung`, { state: { id } })}
          >
            Raum buchen
          </button>

          {/* Belegungsplan-Button */}
          <button onClick={handleBelegunsplan} className="action-button">
            Belegungsplan
          </button>
        </div>
      </div>
    </div>
  );
}

export default RaumDetailansicht;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/HeaderLoggedIn';
import { fetchUserByToken } from '../../services/UserService'; // Importieren Sie die fetchUserByToken-Funktion
import axios from 'axios';
import './TicketErstellen.css';
import './TicketModal.css';

function TicketErstellen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    betreff: '',
    beschreibung: '',
    grund: '',
    prioritaet: 'niedrig',
    ausstattungId: '',
  });

  const [raumName, setRaumName] = useState('');
  const [ausstattungList, setAusstattungList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [gebaeudeData, setGebaeudeData] = useState(null);
  const [showModal, setShowModal] = useState(false);
 
  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  const zustaendigerId = gebaeudeData?.zustaendigerId;

  useEffect(() => {
    let isMounted = true; 

    const loadUserData = async () => {
      try {
        setLoading(true);
        const user = await fetchUserByToken(); 

        if (isMounted && user) {
          setUserData({
            id: user.id,
            name: `${user.vorname} ${user.nachname}` || 'Unbekannt',
            email: user.email || 'Keine E-Mail angegeben',
            role: user.rolle?.name || 'Unbekannte Rolle',
            lastLogin: user.lastLogin || 'Nicht verfügbar',
            permissions: user.permissions || ['Keine Berechtigungen verfügbar'],
          });
        } else if (isMounted) {
          setError('Fehler: Nutzerdaten konnten nicht geladen werden.');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fehler beim Laden der Nutzerdaten:', err);
          setError('Fehler: Beim Abrufen der Daten ist etwas schiefgelaufen.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchRaumName = async () => {
      try {
        const response = await fetch(`http://localhost:8080/raeume/${id}`);
        if (!response.ok) throw new Error('Fehler beim Laden des Raum-Namens');
        const data = await response.json();
        setRaumName(data.name);
        fetchGebaeudeData(data.gebaeudeId);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    const fetchAusstattung = async () => {
      try {
        const response = await fetch(`http://localhost:8080/ausstattung/raum/${id}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Ausstattungen');
        const data = await response.json();
        setAusstattungList(data);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    const fetchGebaeudeData = async (gebaeudeId) => {
      try {
        const response = await fetch(`http://localhost:8080/gebaeude/${gebaeudeId}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Gebäude-Daten');
        const data = await response.json();
        setGebaeudeData(data);
      } catch (error) {
        console.error('Fehler:', error);
      }
    };

    fetchRaumName();
    fetchAusstattung();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  console.log(ausstattungList)

  const protokolliereAktion = async (benutzerId, aktion, details) => {
    try {
      await axios.post('http://localhost:8080/api/logeintraege/protokolliere', null, {
        params: {
          benutzerId,
          aktion,
          details
        }
      });
      console.log('Aktion erfolgreich protokolliert');
    } catch (error) {
      console.error('Fehler beim Protokollieren der Aktion:', error);
    }
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.beschreibung.length > 255) {
      setError('Die Beschreibung darf maximal 255 Zeichen lang sein.');
      return;
    }

    if (!userData || !gebaeudeData) {
      setError('Fehler: Nutzerdaten oder Gebäudedaten fehlen.');
      return;
    }

    if (!validateInput(formData.beschreibung) || !validateInput(formData.betreff)) {
      setError("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
    }

    const ticketData = {
      ...formData,
      raumId: id,
      erstelltVonId: userData.id,
      zustaendigerId: gebaeudeData.verwaltetVonId,
    };

    try {
      const response = await fetch('http://localhost:8080/service-tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        await protokolliereAktion(userData.id, 'Service-Ticket erstellt', `Service-Ticket für Raum ${raumName} erstellt.`);
        setShowModal(true);
        setSuccess('Service-Ticket erfolgreich erstellt!');
      } else {
        await protokolliereAktion(userData.id, 'Fehler beim Erstellen des Service-Tickets', `Service-Ticket für Raum ${raumName} konnte nicht erstellt werden.`);
        setError('Fehler beim Erstellen des Tickets.');

      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/raum/${id}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.history.back();
  };

  return (
    <div>
      <div className="create-ticket-container">
      <Header />
        <div className="content-wrapper">
          <h1 className="title">
            <button className="back-button" onClick={() => window.history.back()}>
              <span>Zurück</span>
            </button>
            Service-Ticket für Raum "{raumName}" erstellen</h1>
          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label>Betreff:</label>
              <input
                type="text"
                name="betreff"
                value={formData.betreff}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Beschreibung:</label>
              <textarea
                name="beschreibung"
                value={formData.beschreibung}
                onChange={handleChange}
                required
              />
              <small>{formData.beschreibung.length}/255 Zeichen</small>
            </div>

            <div className="form-group">
              <label>Grund:</label>
              <select name="grund" value={formData.grund} onChange={handleChange} required>
                <option value="">Bitte auswählen</option>
                <option value="beschaedigt">Beschädigt</option>
                <option value="fehlt">Fehlt</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priorität:</label>
              <select name="prioritaet" value={formData.prioritaet} onChange={handleChange}>
                <option value="niedrig">Niedrig</option>
                <option value="mittel">Mittel</option>
                <option value="hoch">Hoch</option>
              </select>
            </div>

            {formData.grund !== 'fehlt' && (
              <div className="form-group">
                <label>Ausstattung:</label>
                <select
                  name="ausstattungId"
                  value={formData.ausstattungId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Bitte auswählen</option>
                  {ausstattungList.map((ausstattung) => (
                    <option key={ausstattung.id} value={ausstattung.id}>
                      {ausstattung.bezeichnung}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <div className="button-group">
              <button type="submit" className="action-button">
                Ticket erstellen
              </button>
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Abbrechen
              </button>
            </div>
          </form>
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
    </div>
  );
}

export default TicketErstellen;
import React, { useState, useEffect } from 'react';
import './NutzerBearbeiten-form.css';
import './model.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchUserById, fetchUserByToken, fetchUserByEmail } from '../../services/UserService';
import axios from 'axios';

const NutzerBearbeiten = () => {
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [id, setID] = useState(null);
  const [originalEmail, setOriginalEmail] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    vorname: '',
    nachname: '',
    email: '',
    rolleId: '',
    status: '',
  });

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailRegex.test(email);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (location.state?.from === 'userOverview') {
        const userId = location.state?.userId;
        if (userId) {
          const userData = await fetchUserById(userId);
          if (userData) {
            setFormData({
              id: userData.id || '',
              vorname: userData.vorname || '',
              nachname: userData.nachname || '',
              email: userData.email || '',
              rolleId: userData.rolleId || '',
              status: userData.status || '',
            });
            setOriginalEmail(userData.email);
            setID(userData.id);
          } else {
            console.error('Benutzer konnte nicht geladen werden.');
          }
        }
      } else if (location.state?.from === 'profile') {
        const userData = await fetchUserByToken();
        if (userData) {
          setFormData({
            id: userData.id || '',
            vorname: userData.vorname || '',
            nachname: userData.nachname || '',
            email: userData.email || '',
            rolleId: userData.rolleId || '',
          });
          setOriginalEmail(userData.email);
          setID(userData.id);
        }
      } else {
        console.error('Unbekannte Herkunft.');
      }
    };

    loadUserData();
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!validateInput(formData.vorname) || !validateInput(formData.nachname)) {
      setErrorMessage("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
    }

    if (formData.nachname.trim() === "" || formData.vorname.trim() === "") {
      setErrorMessage("Vor- bzw. Nachname dürfen nicht leer oder nur ein Leerzeichen sein!");
      return;
    }

    try {

      if (formData.email !== originalEmail) {
        const user = await fetchUserByEmail(formData.email);

        if (user) {
          setErrorMessage('Ein Benutzer mit dieser E-Mail ist bereits registriert.');
          return;
        }
      }

      console.log('Formular-Daten:', formData);

      const response = await axios.put(`http://localhost:8080/benutzer/update`, formData);

      if (response) {
        setShowSuccessModal(true);
        await protokolliereAktion(id, 'Benutzer bearbeitet', `Benutzer ${formData.vorname} ${formData.nachname} wurde bearbeitet.`);
      } else {
        console.error('Fehler beim Speichern der Daten');
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    setShowSuccessModal(true);
  };

  const handleClose = () => {
    setShowDeleteModal(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.history.back();
  };

  return (
    <div className="edit-user">
      <Header />
      <div className="form-wrapper">
        <h1 className="form-title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button> Nutzer bearbeiten
        </h1>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <input
              type="text"
              name="vorname"
              value={formData.vorname}
              onChange={handleInputChange}
              placeholder="Vorname"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="nachname"
              value={formData.nachname}
              onChange={handleInputChange}
              placeholder="Nachname"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="E-Mail"
              required
            />
          </div>

          <div className="form-group">
            {location.state?.from === 'userOverview' && (
              <>
                <label>Wähle eine Nutzerrolle*</label>
                <select
                  name="rolleId"
                  value={formData.rolleId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Rolle auswählen</option>
                  <option value={2}>Verwaltungsmitarbeiter</option>
                  <option value={3}>Lehrender</option>
                  <option value={4}>Facility Manager</option>
                  <option value={1}>Administrator</option>
                </select>
              </>
            )}
          </div>

          <div className="form-group">
            {location.state?.from === 'userOverview' && (
              <>
                <label>Wähle einen Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{formData.status}</option>
                  <option value="aktiv">Aktiv</option>
                  <option value="passiv">Passiv</option>
                  <option value="gesperrt">Gesperrt</option>
                </select>
              </>
            )}
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="save-button">
            Speichern
          </button>
        </form>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Sind Sie sicher, dass Sie die Änderungen speichern möchten?
              </div>
              <div className="modal-buttons">
                <button className="button" onClick={handleClose}>
                  Abbrechen
                </button>
                <button className="button" onClick={handleDelete}>
                  Bestätigen
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">Erfolgreich gespeichert!</div>
              <div className="modal-buttons">
                <button className="button" onClick={handleSuccessClose}>
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutzerBearbeiten;

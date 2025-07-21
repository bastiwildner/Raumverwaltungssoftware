import React, { useState, useEffect } from 'react';
import './NutzerMitRolleAnlegen.css';
import './modal.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NutzerMitRolleAnlegen = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    rolleId: ''
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.vorname || !formData.nachname || !formData.email || !formData.rolleId) {
      setErrorMessage('Bitte alle Felder ausfüllen und eine Nutzerrolle auswählen.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!validateInput(formData.vorname) || !validateInput(formData.nachname)) {
      setErrorMessage("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/benutzer/createMitRolle', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Fehler beim Anlegen des Nutzers:', error);
      setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    window.history.back();
  };

  return (
    <div className="NutzerMitRolleAnlegen_content">
      <Header />
      <div className="form-wrapper">
        <h1 className="form-title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Nutzer anlegen
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="vorname"
              placeholder="Vorname"
              className="input-field"
              value={formData.vorname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="nachname"
              placeholder="Name"
              className="input-field"
              value={formData.nachname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="select-label">Wähle eine Nutzerrolle*</label>
            <div className="select-container">
              <select
                name="rolleId"
                className="select-field"
                value={formData.rolleId}
                onChange={handleChange}
              >
                <option value="">Nutzerrolle wählen</option>
                <option value={2}>Verwaltungsmitarbeiter</option>
                <option value={3}>Lehrender</option>
                <option value={4}>Facility Manager</option>
                <option value={1}>Administrator</option>
              </select>
            </div>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="save-button">
            Speichern
          </button>
        </form>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Sind Sie sicher, dass Sie den Nutzer anlegen möchten?
              </div>
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </button>
                <button
                  className="modal-button"
                  onClick={handleConfirm}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">Erfolgreich!</div>
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={handleCloseSuccessModal}
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
};

export default NutzerMitRolleAnlegen;


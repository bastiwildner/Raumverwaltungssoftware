import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './PasswortÄndern.css';
import { fetchUserByToken } from '../../services/UserService';
import axios from 'axios';
import Header from '../../components/Header/HeaderLoggedIn';

const PasswortÄndern = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [id, setID] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userID } = useParams();

  const fromProfile = location.state?.fromProfile || false;

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  useEffect(() => {
    const loadUserData = async () => {
      if (fromProfile) {
        const userData = await fetchUserByToken();
        if (userData) {
          setID(userData.id);
        } else {
          setErrorMessage('Fehler beim Laden der Benutzerdaten.');
        }
      } else {
        setID(userID);
      }
    };

    loadUserData();
  }, [fromProfile, location.state, userID]);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z])\S{8,}$/;
    return passwordRegex.test(password);
  };

  const protokolliereAktion = async (benutzerId, aktion, details) => {
    try {
      await axios.post('http://localhost:8080/api/logeintraege/protokolliere', null, {
        params: { benutzerId, aktion, details }
      });
    } catch (error) {
      console.error('Fehler beim Protokollieren der Aktion:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setErrorMessage("Das Passwort muss mindestens acht Zeichen lang sein und mindestens eine Zahl, einen Buchstaben, ein Sonderzeichen und darf keine Leerzeichen enthalten.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Die Passwörter stimmen nicht überein!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/benutzer/changePassword/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: password
      });

      if (response.ok) {
        setSuccessMessage('Das Passwort wurde erfolgreich geändert!');
        await protokolliereAktion(id, 'Passwort geändert', 'Das Passwort wurde erfolgreich geändert.');
        navigate(fromProfile ? -1 : '/login');
      } else {
        setErrorMessage('Fehler beim Ändern des Passworts.');
        await protokolliereAktion(id, 'Passwort ändern fehlgeschlagen', 'Fehler beim Ändern des Passworts.');
      }
    } catch (error) {
      setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="passwortaendern-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>Zurück</span>
            </button>
          Passwort ändern
        </h1>

        <form onSubmit={handleSubmit} className="site-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">Neues Passwort:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Neues Passwort wiederholen:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <button type="submit" className="form-button">Passwort ändern</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswortÄndern;

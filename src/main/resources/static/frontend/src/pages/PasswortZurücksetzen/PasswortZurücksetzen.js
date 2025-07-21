import React, { useState } from 'react';
import './PasswortZurücksetzen.css';
import { fetchUserByEmail } from '../../services/UserService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/HeaderLoggedIn';

const PasswortZurücksetzen = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = await fetchUserByEmail(email);
      if (user) {
        await axios.post(`http://localhost:8080/email/resetPW?email=${email}`);
        setSuccessMessage('Sie erhalten in Kürze einen Link zum Ändern Ihres Passwortes.');
      } else {
        setErrorMessage('Diese E-Mail ist nicht im System hinterlegt.');
      }
    } catch (error) {
      setErrorMessage('Fehler beim Abrufen der Benutzerinformationen.');
    }
  };

  return (
    <div className="passwortzuruecksetzen-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>Zurück</span>
          </button>
          Passwort zurücksetzen
        </h1>

        <form onSubmit={handleResetPassword} className="site-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
          Bitte geben Sie Ihre hinterlegte E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
          </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
              placeholder="E-Mail eingeben"
              required
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <button type="submit" className="form-button">Passwort zurücksetzen</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswortZurücksetzen;

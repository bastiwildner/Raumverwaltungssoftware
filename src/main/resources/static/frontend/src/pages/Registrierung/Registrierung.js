import React, { useState } from 'react';
import axios from 'axios';
import './Registrierung.css';
import HeaderV25Default from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { fetchUserByEmail } from '../../services/UserService';

const Registrierung = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    passwort: '',
    passwortWiederholen: '',
    rolleId: '',
  });

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z])\S{8,}$/;
    return passwordRegex.test(password);
  };

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

    if (!validateEmail(formData.email)) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!validatePassword(formData.passwort)) {
      setErrorMessage("Das Passwort muss mindestens acht Zeichen lang sein und mindestens eine Zahl, einen Buchstaben, ein Sonderzeichen und darf keine Leerzeichen enthalten.");
      return;
    }

    if (formData.passwort !== formData.passwortWiederholen) {
      setErrorMessage('Passwörter stimmen nicht überein!');
      return;
    }

    if (!formData.rolleId) {
      setErrorMessage('Bitte wählen Sie eine Nutzerrolle aus.');
      return;
    }

    if (!validateInput(formData.vorname) || !validateInput(formData.nachname)) {
      setErrorMessage("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
    }

    try {

      const user = await fetchUserByEmail(formData.email);

      if (user) {
        setErrorMessage('Ein Benutzer mit dieser E-Mail ist bereits registriert.');
        return;
      }

      await axios.post('http://localhost:8080/benutzer/create', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      navigate('/registersuccess');
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
    }
  };

  return (
    <div className="registrierung-container">
      <HeaderV25Default />
      <div className="registrierung-box">
        <h1>Registrierung</h1>
        <form className="registrierung-form" onSubmit={handleSubmit}>
          <div className="registrierung-form">
            <div className="form-group">
              <label>Vorname*</label>
              <input type="text" name="vorname" placeholder="Vorname" value={formData.vorname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nachname*</label>
              <input type="text" name="nachname" placeholder="Nachname" value={formData.nachname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email-Adresse*</label>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Passwort vergeben*</label>
              <input type="password" name="passwort" placeholder="Passwort" value={formData.passwort} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Passwort wiederholen*</label>
              <input type="password" name="passwortWiederholen" placeholder="Passwort" value={formData.passwortWiederholen} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Wähle eine Nutzerrolle*</label>
              <select name="rolleId" value={formData.rolleId} onChange={handleChange} required>
                <option value="">Nutzerrolle wählen</option>
                <option value={3}>Lehrender</option>
                <option value={2}>Verwaltungsmitarbeiter</option>
              </select>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button className="registrierung-button" type="submit">Fortfahren</button>
          </div>
        </form>
        <div className="registrierung-login-link">
          <Link to="/login">Hier geht es zum Login</Link>
        </div>
        <div className="registrierung-hinweis">
          Hinweis: Um den Registrierungsprozess abzuschließen, müssen Sie von einem Systemadministrator freigeschalten werden.
          Sie erhalten anschließend eine Benachrichtigung an Ihre hinterlegte Email-Adresse
        </div>
      </div>
    </div>
  );
};

export default Registrierung;

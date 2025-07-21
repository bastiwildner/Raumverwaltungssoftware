import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import HeaderV25Default from '../../components/Header/Header';
import { fetchUserByEmail } from '../../services/UserService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    const user = await fetchUserByEmail(formData.email);

      if(!user){
        setError("Ein Benutzer mit der angegebenen Email existiert nicht im System.");
        return;
      }

      if (user.status === 'passiv') {
        setError('Ihr Konto ist derzeit passiv. Bitte warten Sie bis ein Admin Sie freischaltet.');
        return;
      } else if (user.status === 'gesperrt') {
        setError('Ihr Konto ist leider gesperrt.');
        return;
      }

    try {
      // Anfrage an das Backend senden
      const response = await axios.post('http://localhost:8080/auth/login', {
        email: formData.email,
        passwort: formData.password
      });

      console.log('Login erfolgreich:', response.data);

      localStorage.setItem('sessionToken', response.data.sessionToken);

      await protokolliereAktion(response.data.userId, 'Login', `Benutzer ${formData.email} hat sich erfolgreich angemeldet.`);

      navigate('/home');
    } catch (err) {
      console.error('Login fehlgeschlagen:', err);

      // Fehler aus Backend-Response anzeigen, falls vorhanden
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      } else {
        setError('Server nicht erreichbar. Bitte versuchen Sie es später erneut.');
      }
    }
  };

  return (
    <div className="login-container">
      <HeaderV25Default />
        <div className="login-box">
          <h1>Log In</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-Mail*</label>
              <input
                type="email"
                name="email"
                placeholder="z.B. max.mustermann@mail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Passwort*</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              Anmelden
            </button>
          </form>

          <div className="register-link">
            <p>Noch kein Account? <a href="/register">Hier registrieren</a></p>
          </div>

          <div className="reset-password">
            <a href="/PasswortZurücksetzen">Passwort zurücksetzen</a>
          </div>
        </div>
      </div>
  );
};

export default Login;
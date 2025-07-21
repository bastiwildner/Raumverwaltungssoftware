import React from 'react';
import Header from '../../components/Header/Header';
import './RegistrierungErfolgreich.css';
import { useNavigate } from 'react-router-dom'; // jia

const RegistrierungErfolgreich = () => {
  const navigate = useNavigate(); 

  return (
    <div className="registrierung-erfolgreich-container">
      <Header />
      <div className="registrierung-erfolgreich-message-box">
        <div className="registrierung-erfolgreich-message-header">Vielen Dank für Ihre Registrierung!</div>
        <div className="registrierung-erfolgreich-message-text">
          Bitte haben Sie etwas Geduld, bis Ihr Profil vom einem Administrator freigeschaltet wird.
        </div>
        <div
          className="registrierung-erfolgreich-login-link"
          onClick={() => navigate('/login')} >
            Hier gelangen Sie zum Login.
        </div>
      </div>
    </div>
  );
};

export default RegistrierungErfolgreich;
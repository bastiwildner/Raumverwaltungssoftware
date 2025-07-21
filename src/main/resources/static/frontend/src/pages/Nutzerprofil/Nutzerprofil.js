import React, { useEffect, useState } from 'react';
import './Nutzerprofil.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/HeaderLoggedIn';
import { fetchUserByToken } from '../../services/UserService';
import axios from 'axios';

function Nutzerprofil() {
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

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
          });
          loadPerms(user.rolle?.id)
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

    const loadPerms = async (id) => {
      console.log(id);
      const perms = await axios.get(`http://localhost:8080/rolle-berechtigungen/rolle/${id}`)
      if (perms) {
        setPermissions(perms.data)
      }
    };

  const handleNavigateUpdate = () => {
    navigate(`/NutzerBearbeiten`, { state: { from: 'profile' } });
  };

  const handleNavigatePWÄndern = () => {
    navigate('/PasswortÄndern', { state: { fromProfile: true } });
  };

  const handleLogout = async () => {

    const token = localStorage.getItem('sessionToken');

    const response = await axios.post(`http://localhost:8080/auth/logout?token=${token}`, {
      token,
    });

    localStorage.removeItem('sessionToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-grid">
          <p>Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-grid">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-grid">
        {/* Left Section */}
        <div className="sidebar">
          <div className="sidebar-section active">
            <h2>Personenbezogene Daten</h2>
          </div>
          <div className="sidebar-section">
            <h2>Anmeldeinformationen</h2>
          </div>
        </div>

        {/* Middle Section */}
        <div className="main-content">
          <div className="user-data">
            <h2>Nutzerdaten</h2>
            <div className="data-field">
              <label>Name:</label>
              <span>{userData.name}</span>
            </div>
            <div className="data-field">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
            <button className="action-button" onClick={handleNavigateUpdate}>Bearbeiten</button>
          </div>

          <div className="logout-section">
            <h2>Aus System abmelden</h2>
            <button className="action-button" onClick={handleLogout}>Logout</button>
          </div>


          <div className="login-info">
            <h2>Passwort Ändern</h2>
            <button className="action-button" onClick={handleNavigatePWÄndern}>Passwort ändern</button>
          </div>
        </div>

        {/* Right Section */}
        <div className="permissions">
          <div className="role-section">
            <h2>Rolle & Berechtigungen</h2>
            <div className="data-field">
              <label>Rolle:</label>
              <span>{userData.role}</span>
            </div>
            <div className="permissions-list">
              <label>Berechtigungen:</label>
              <ul>
                {permissions && permissions.length > 0 ? (
                  permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))
                ) : (
                  <li>Keine Berechtigungen verfügbar</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nutzerprofil;

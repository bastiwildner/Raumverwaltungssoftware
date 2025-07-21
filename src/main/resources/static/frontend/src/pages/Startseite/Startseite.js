import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/HeaderLoggedIn';
import './Startseite.css';
import { fetchUserByToken } from '../../services/UserService';

function Startseite() {
  const [user, setUser] = useState(null);
  const alleRollen = ['Admin', 'Verwaltungsmitarbeitende', 'Lehrende', 'Facility Manager'];
  const nurVM = ['Admin', 'Verwaltungsmitarbeitende'];
  const AdminVM = ['Admin', 'Verwaltungsmitarbeitende'];
  const nurAdmin = ['Admin'];
  const FMundVM = ['Admin', 'Facility Manager', 'Verwaltungsmitarbeitende'];
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUserByToken();
      setUser(userData);
    };

    getUser();
  }, []);

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })
  
  const menuItems = [
    { title: 'Statistiken und Berichte', path: '/DashboardVM', roles: nurVM }, 
    { title: 'Raumübersicht', path: '/raumuebersicht', roles: alleRollen },
    { title: 'Gebäudeübersicht', path: '/gebäudeübersicht', roles: alleRollen },
    { title: 'Meine Buchungen und Veranstaltungen', path: '/Meinebuchungen', roles: alleRollen },
    { title: 'Alle Buchungen und Veranstaltungen', path: '/buchungsuebersicht', roles: AdminVM },
    { title: 'Service Tickets', path: '/ticketuebersicht', roles: FMundVM }, 
    { title: 'Benutzerverwaltung', path: '/Nutzerübersicht', roles: nurAdmin }, 
    { title: 'Logbuch', path: '/logbuch', roles: nurAdmin },
    { title: 'Backup Verwaltung', path: '/backupVerwalten', roles: nurAdmin },
  ];

  return (
    <div className="startseite_app">
      <Header />
      <main className="main-content">
        <div className="container">
          <h1>Startseite</h1>
          <div className="menu-grid">
            {user &&
              menuItems
                .filter((item) => item.roles.includes(user.rolle?.name))
                .map((item, index) => (
                  item.path ? (
                    <button key={index} className="menu-item">
                      <Link to={item.path}>{item.title}</Link>
                      {item.admin && <div className="admin-note">{item.admin}</div>}
                    </button>
                  ) : (
                    <button key={index} className="menu-item">
                      {item.title}
                      {item.admin && <div className="admin-note">{item.admin}</div>}
                    </button>
                  )
                ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Startseite;

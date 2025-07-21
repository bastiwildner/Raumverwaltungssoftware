import React, { useEffect, useState } from 'react';
import './Nutzerübersicht.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../../services/UserService';

const Nutzerübersicht = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers); 
    };

    loadUsers();
  }, []);

  const handleAdd = () => {
    navigate('/NutzerMitRolleAnlegen');
  };

  const handleEdit = (id) => {
    navigate(`/NutzerBearbeiten`, { state: { from: 'userOverview', userId: id } });
  };

  const filteredUsers = users.filter(user =>
    `${user.vorname} ${user.nachname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="Nutzerübersicht_container">
      <Header />
      <div className="content-wrapper">
        <h1>
          <button className="button back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Nutzerübersicht
        </h1>

        <div className="search-bar">
          <input
            type="search"
            placeholder="🔍"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleAdd} className="button">
            Hinzufügen
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>NutzerID</th>
                <th>Name</th>
                <th>Vorname</th>
                <th>Rolle</th>
                <th>Email</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nachname}</td>
                  <td>{user.vorname}</td>
                  <td>{user.rolle?.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="edit-button"
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Nutzerübersicht;

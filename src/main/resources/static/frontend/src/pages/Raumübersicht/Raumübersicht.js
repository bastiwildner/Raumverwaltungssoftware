import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Raumübersicht.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { fetchUserByToken } from '../../services/UserService';

function Raumübersicht() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    minKapazitaet: '',
    ausstattung: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [user, setUser] = useState(null);
  const [lastTap, setLastTap] = useState(0);

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

  const checkBookings = async (selectedRoomId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/buchungen/raum/${selectedRoomId}`);
      return response.data.length > 0;
    } catch (error) {
      console.error("Fehler beim Überprüfen der Buchungen:", error);
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({
      ...searchCriteria,
      [name]: value
    });
  };

  const handleSearch = async () => {
    if (searchCriteria.minKapazitaet < 0) {
      setSearchError("Die Kapazität darf nicht negativ sein.");
      return;
    }

    if (searchCriteria.name === " " || searchCriteria.ausstattung === " "){
      setSearchError("Raumname bzw. Ausstattung dürfen nicht nur ein Leerzeichen sein!");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const filteredParams = {
        name: searchCriteria.name || null,
        minKapazitaet: searchCriteria.minKapazitaet || null,
        ausstattung: searchCriteria.ausstattung || null,
      };

      const response = await axios.get('http://localhost:8080/raeume/search', {
        params: filteredParams
      });

      setSearchResults(response.data);
    } catch (err) {
      console.error('Fehler bei der Raumsuche:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Abrufen der Räume. Bitte versuchen Sie es erneut.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = useCallback((room) => {
    navigate(`/raum/${room.id}`);
  }, [navigate]);

  const handleTap = useCallback((room, e) => {
    const currentTime = new Date().getTime();
    const tapDiff = currentTime - lastTap;
    
    if (tapDiff < 300 && tapDiff > 0) {
      e.preventDefault();
      handleRowClick(room);
    }
    setLastTap(currentTime);
  }, [lastTap, handleRowClick]);

  const handleSimpleRowClick = useCallback((id, e) => {
    if (window.innerWidth > 768) {
      setSelectedRoomId(id);
    }
    if (window.innerWidth <= 768) {
      e.preventDefault();
    }
  }, []);

  const handleDeleteRoom = async () => {
    setError('');

    if (!selectedRoomId) {
      setError("Bitte wählen Sie zuerst einen Raum aus, den Sie löschen möchten.");
      return;
    }

    const hasBookings = await checkBookings(selectedRoomId);
    if (hasBookings) {
      setError("Der Raum kann nicht gelöscht werden, da er noch Buchungen enthält.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/raeume/delete/${selectedRoomId}`);
      setSearchResults(prev => prev.filter(room => room.id !== selectedRoomId));
      setSelectedRoomId(null);
    } catch (error) {
      console.error("Fehler beim Löschen des Raumes:", error);
      setError("Fehler beim Löschen des Raumes. Bitte versuchen Sie es erneut.");
    }
  };

  

  return (
    <div className="room-container">
      <Header />
      <div className="content-wrapper">
        <h1>
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Raumübersicht
        </h1>
        
        <div className="search-grid">
          <div className="input-row">
            <input
              type="text"
              name="name"
              value={searchCriteria.name}
              onChange={handleInputChange}
              placeholder="Raumname"
              className="form-input"
            />
            <input
              type="number"
              name="minKapazitaet"
              value={searchCriteria.minKapazitaet}
              onChange={handleInputChange}
              placeholder="Min. Kapazität"
              className="form-input"
            />
          </div>

          <div className="input-row">
            <input
              type="text"
              name="ausstattung"
              value={searchCriteria.ausstattung}
              onChange={handleInputChange}
              placeholder="Ausstattung (z.B. Beamer)"
              className="form-input"
            />
            <button onClick={handleSearch} className="action-button">
              Suchen
            </button>
          </div>
        </div>

        {searchError && <div className="error-message">{searchError}</div>}

        <div className="results-section">
          <h2>Ergebnisse:</h2>
          <h3 className="randnotiz">(Doppelklick für Detailübersicht)</h3>
          {searchResults.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>RaumID</th>
                  <th>Raumname</th>
                  <th>Kapazität</th>
                  <th>Ausstattung</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((room) => (
                  <tr
                    key={room.id}
                    onDoubleClick={() => handleRowClick(room)}
                    onClick={(e) => {
                      if (window.innerWidth <= 768) {
                        handleTap(room, e);
                      } else {
                        handleSimpleRowClick(room.id, e);
                      }
                    }}
                    className="clickable-row"
                  >
                    <td>{room.id}</td>
                    <td>{room.name}</td>
                    <td>{room.kapazitaet}</td>
                    <td>{room.ausstattung?.join(', ') || 'Keine Angabe'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Keine Räume gefunden.</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        <div className="button-container" style={{ marginBottom: '20px' }}>
          {user?.rolle?.name === 'Admin' && (
            <button onClick={handleDeleteRoom} className="action-button">
              Raum löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Raumübersicht;



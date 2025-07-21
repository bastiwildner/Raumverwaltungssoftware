import React, { useState, useEffect } from 'react';
import './Gebäudeübersicht.css';
import './modal.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate } from 'react-router-dom';
import { fetchAllBuildings, fetchBuildingById, fetchOpeningHoursByBuildingId, fetchRoomsByBuildingId } from '../../services/GebaeudeService';
import { fetchUserByToken } from '../../services/UserService';
import axios from 'axios';

function Gebäudeübersicht() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [openingHours, setOpeningHours] = useState([]);
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

  // Gebäude abrufen
  useEffect(() => {
    const getBuildings = async () => {
      try {
        const data = await fetchAllBuildings();
        setBuildings(data);
        if (data.length > 0) {
          setSelectedBuildingId(data[0].id);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Gebäude:', error);
      }
    };

    getBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      const getBuildingDetails = async () => {
        try {
          const data = await fetchBuildingById(selectedBuildingId);
          setSelectedBuilding(data);
        } catch (error) {
          console.error('Fehler beim Abrufen der Gebäudedetails:', error);
        }
      };

      getBuildingDetails();
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    if (selectedBuildingId) {
      const getOpeningHours = async () => {
        try {
          const data = await fetchOpeningHoursByBuildingId(selectedBuildingId);
          setOpeningHours(data);
        } catch (error) {
          console.error('Fehler beim Abrufen der Öffnungszeiten:', error);
        }
      };

      getOpeningHours();
    }
  }, [selectedBuildingId]);

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

  const handleDelete = async () => {
    setErrorMessage('');
    
    const rooms = await fetchRoomsByBuildingId(selectedBuildingId);

    if (rooms.length > 0) {
      setErrorMessage('Das Gebäude kann nicht gelöscht werden, da es noch Räume enthält.');
      return;
    }

    axios
      .delete(`http://localhost:8080/gebaeude/${selectedBuildingId}`)
      .then(async () => {
        setShowDeleteConfirm(false);
        setShowSuccess(true);
        setBuildings(buildings.filter((building) => building.id !== selectedBuildingId));
        setSelectedBuildingId('');
        setErrorMessage('');
        const data = await fetchAllBuildings();
        setBuildings(data);

        if (user) {
          protokolliereAktion(user.id, 'Gebäude gelöscht', `Gebäude ${selectedBuilding.name} wurde gelöscht.`);
        }
      })
      .catch((error) => {
        console.error('Fehler beim Löschen des Gebäudes:', error);
      });
  };

  const handleAddRoom = (selectedBuildingId) => {
    console.log(selectedBuildingId)
    navigate('/raumAnlegen', { state: { gebaeudeId: selectedBuildingId } });
  };

  const handleNavigateUpdate = (id) => {
    navigate(`/GebäudeBearbeiten/${selectedBuildingId}`);
  };

  const getGroupedOpeningHours = () => {
    const weekdays = [];
    const weekend = [];

    openingHours.forEach((hour) => {
      if (hour.tag === 'Mo' || hour.tag === 'Di' || hour.tag === 'Mi' || hour.tag === 'Do' || hour.tag === 'Fr') {
        weekdays.push(hour);
      } else if (hour.tag === 'Sa' || hour.tag === 'So') {
        weekend.push(hour);
      }
    });

    return { weekdays, weekend };
  };

  const { weekdays, weekend } = getGroupedOpeningHours();

  return (
    <div className="building-container">
      <Header />
      <div className="content-wrapper">
        <h1>
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Gebäudeübersicht
        </h1>

        <div className="selection-container">
          <div className="dropdown-container">
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="building-select"
            >
              <option disabled value="">
                Gebäude wählen
              </option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="main-info">
          <h2>
            Gebäudeinformationen: 
          </h2>

          <div className="info-grid">
            {selectedBuilding && (
              <>
                <div className="building-details">
                  <h3>{selectedBuilding.name}</h3>
                  <p>{selectedBuilding.strasse + ' ' + selectedBuilding.hausnummer}</p>
                  <p>{selectedBuilding.stadt + ' ' + selectedBuilding.plz}</p>
                </div>

                <div className="opening-hours">
                  <h3>Öffnungszeiten</h3>

                  <div className="time-slot-group">
                    {weekdays.length > 0 ? (
                      <div className="time-slot">
                        <p>
                          <strong>Werktags (Mo-Fr)</strong> {weekdays[0].oeffnungszeit} - {weekdays[0].schliesszeit}
                        </p>
                      </div>
                    ) : (
                      <p>Keine Öffnungszeiten für Werktage verfügbar.</p>
                    )}
                    {weekend.length > 0 ? (
                      <div className="time-slot">
                        <p>
                          <strong>Wochenende (Sa-So)</strong> {weekend[0].oeffnungszeit} - {weekend[0].schliesszeit}
                        </p>
                      </div>
                    ) : (
                      <p>Keine Öffnungszeiten für das Wochenende verfügbar.</p>
                    )}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        <div className="bottom-buttons">
          {(user?.rolle?.name === 'Admin' || user?.rolle?.name === 'Verwaltungsmitarbeitende') && (
            <button className="bottom-button" onClick={handleNavigateUpdate}>Ausgewähltes Gebäude bearbeiten</button>
          )}
          {user?.rolle?.name === 'Admin' && (
            <>
              <button
                className="bottom-button"
                onClick={() => {
                  setErrorMessage('');
                  setShowDeleteConfirm(true);
                }}
              >
                Ausgewähltes Gebäude löschen
              </button>
              <button
                className="bottom-button"
                onClick={() => navigate('/gebäudeanlegen')}
              >
                Neues Gebäude anlegen
              </button>
              <button onClick={() => handleAddRoom(selectedBuildingId)} className="bottom-button">
                Neuen Raum anlegen
              </button>
            </>
          )}
        </div>

      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Sind Sie sicher, dass Sie das Gebäude löschen möchten?</p>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Abbrechen
              </button>
              <button className="modal-button delete" onClick={handleDelete}>
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Erfolgreich!</p>
            <div className="modal-buttons">
              <button
                className="modal-button"
                onClick={() => setShowSuccess(false)}
              >
                Zurück
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gebäudeübersicht;

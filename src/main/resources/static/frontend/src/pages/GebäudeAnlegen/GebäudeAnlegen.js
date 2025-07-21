import React, { useState, useEffect } from 'react';
import './GebäudeAnlegen.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/HeaderLoggedIn';
import { fetchFacilityManagers, fetchUserByToken } from '../../services/UserService'; 
import axios from 'axios';

const GebäudeAnlegen = () => {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [facilityManager, setFacilityManager] = useState('');
  const [facilityManagers, setFacilityManagers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const [openingHours, setOpeningHours] = useState({
    weekdaysFrom: '',
    weekdaysTo: '',
    weekendFrom: '',
    weekendTo: '',
  });

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
            lastLogin: user.lastLogin || 'Nicht verfügbar',
            permissions: user.permissions || ['Keine Berechtigungen verfügbar'],
          });
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

    const loadFacilityManagers = async () => {
      try {
        const data = await fetchFacilityManagers();
        setFacilityManagers(data);
      } catch (error) {
        console.error('Fehler beim Laden der Facility Manager:', error);
      }
    };

    loadUserData();
    loadFacilityManagers();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOpeningHours((prev) => ({ ...prev, [name]: value }));
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{5}$/.test(postalCode)) {
      setError('Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.');
      return;
    }

    if (!validateInput(name) || !validateInput(street) || !validateInput(city) || !validateInput(country)) {
      setError("Nur Buchstaben und Leerzeichen erlaubt!");
      return;
    }

    // Prepare building data for submission
    const buildingData = {
      name,
      strasse: street,
      hausnummer: houseNumber,
      plz: parseInt(postalCode, 10),
      stadt: city,
      land: country,
      verwaltetVonId: parseInt(facilityManager, 10),
    };
    console.log(openingHours)
    try {
      const response = await fetch('http://localhost:8080/gebaeude/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildingData),
      });
      console.log(buildingData);
      if (response.ok) {
      const createdBuilding = await response.json();
      console.log('Building successfully created:', createdBuilding);

      console.log('Erstellte Gebäude-ID:', createdBuilding.id);
      createOpeningHours(createdBuilding.id);
      
        console.log('Building successfully created:', buildingData);
        await protokolliereAktion(userData.id, 'Gebäude erstellt', `Gebäude ${name} wurde erstellt.`);
        navigate('/gebäudeübersicht');
      } else {
        console.error('Error creating building:', await response.text());
        await protokolliereAktion(userData.id, 'Gebäude erstellt', `Gebäude ${name} konnte nicht erstellt werden.`);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const createOpeningHours = (buildingId) => {
    const openingHoursData = [
      {
        gebaeudeId: buildingId,
        tag: 'Mo',
        oeffnungszeit: openingHours.weekdaysFrom ? openingHours.weekdaysFrom : null,
        schliesszeit: openingHours.weekdaysTo ? openingHours.weekdaysTo : null,
        erstelltVonId: userData.id,
      },
      {
        gebaeudeId: buildingId,
        tag: 'Sa',
        oeffnungszeit: openingHours.weekendFrom ? openingHours.weekendFrom : null,
        schliesszeit: openingHours.weekendTo ? openingHours.weekendTo : null,
        erstelltVonId: userData.id,
      },
    ];

    console.log(openingHoursData);

    fetch(`http://localhost:8080/oeffnungszeiten/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(openingHoursData),
    })
      .then((response) => {
        if (response.ok) {
        } else {
          console.error('Fehler beim Speichern der Öffnungszeiten');
        }
      })
      .catch((error) => console.error('Fehler:', error));
  };

  return (
    <div className="gebäudeanlegen-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Neues Gebäude anlegen</h1>
        <form onSubmit={handleSubmit} className="site-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gebäudename</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="z.B. Hauptgebäude"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Land</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
                placeholder="z.B. Deutschland"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Straße</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="form-input"
                placeholder="z.B. Innstraße"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hausnummer</label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="z.B. 12a"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">PLZ</label>
              <input
                type="number"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="form-input"
                placeholder="z.B. 12345"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stadt</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
                placeholder="z.B. Passau"
                required
              />
            </div>

            <div className="time-section">
              <h3>Öffnungszeiten anpassen</h3>
              <h4>Werktags:</h4>
              <div className="time-inputs">
                <div className="time-group">
                  <span className="time-label">Von</span>
                  <input
                    type="time"
                    name="weekdaysFrom"
                    value={openingHours.weekdaysFrom}
                    onChange={handleInputChange}
                    className="time-input"
                    required
/>
                </div>
                <div className="time-group">
                  <span className="time-label">Bis</span>
                  <input
                    type="time"
                    name="weekdaysTo"
                    value={openingHours.weekdaysTo}
                    onChange={handleInputChange}
                    className="time-input"
                    required
                  />
                </div>
              </div>
              <h4>Wochenende:</h4>
              <div className="time-inputs">
                <div className="time-group">
                  <span className="time-label">Von</span>
                  <input
                    type="time"
                    name="weekendFrom"
                    value={openingHours.weekendFrom}
                    onChange={handleInputChange}
                    className="time-input"
                    required
                  />
                </div>
                <div className="time-group">
                  <span className="time-label">Bis</span>
                  <input
                    type="time"
                    name="weekendTo"
                    value={openingHours.weekendTo}
                    onChange={handleInputChange}
                    className="time-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <h3 className="form-label">Facility Manager auswählen</h3>
              <select
                value={facilityManager}
                onChange={(e) => setFacilityManager(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Bitte auswählen</option>
                {facilityManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.vorname} {manager.nachname}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <button type="submit" className="form-button">Bestätigen</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GebäudeAnlegen;

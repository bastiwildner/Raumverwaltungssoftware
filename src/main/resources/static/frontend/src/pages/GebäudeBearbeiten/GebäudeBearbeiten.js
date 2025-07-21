import React, { useState, useEffect } from 'react';
import './GebäudeBearbeiten.css';
import './modal.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBuildingById, fetchOpeningHoursByBuildingId } from '../../services/GebaeudeService';
import { fetchFacilityManagers, fetchUserByToken } from '../../services/UserService'; 
import axios from 'axios'; 

const GebäudeBearbeiten = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [facilityManagers, setFacilityManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    city: '',
    zip: '',
    street: '',
    houseNumber: '',
    verwaltetVonId: '',
    facilityManager: {},
  });
  const [userData, setUserData] = useState(null);

  const [openingHours, setOpeningHours] = useState({
    weekdaysFrom: '',
    weekdaysTo: '',
    weekendFrom: '',
    weekendTo: '',
  });
  
  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  const navigate = useNavigate();
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  // Daten laden und formData initialisieren
  useEffect(() => {
    const loadBuildingDetails = async () => {
      try {
        const data = await fetchBuildingById(id);
        console.log(data);
        setFormData({
          name: data.name || '',
          type: data.type || '',
          city: data.stadt || '',
          zip: data.plz || '',
          street: data.strasse || '',
          houseNumber: data.hausnummer || '',
          facilityManager: data.verwaltetVon || '',
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Gebäudedetails:', error);
      }
    };

    if (id) {
      loadBuildingDetails();
    }
  }, [id]);

  useEffect(() => {
    const loadFacilityManagers = async () => {
      try {
        const data = await fetchFacilityManagers();
        setFacilityManagers(data);
      } catch (error) {
        console.error('Fehler beim Laden der Facility Manager:', error);
      }
    };

    loadFacilityManagers();
  }, []);

  useEffect(() => {
    if (id) {
      const getOpeningHours = async () => {
        try {
          const data = await fetchOpeningHoursByBuildingId(id);

          console.log('Daten aus der API:', data);

          // Filtere Werktage und Wochenende
          const weekdays = data.filter(item => item.tag !== 'Sa' && item.tag !== 'So');
          const weekend = data.filter(item => item.tag === 'Sa' || item.tag === 'So');

          console.log('Werktage:', weekdays);
          console.log('Wochenende:', weekend);

          // Setze die Werte in formData
          const weekdaysFrom = weekdays.length > 0 ? weekdays[0].oeffnungszeit : '';
          const weekdaysTo = weekdays.length > 0 ? weekdays[0].schliesszeit : '';
          const weekendFrom = weekend.length > 0 ? weekend[0].oeffnungszeit : '';
          const weekendTo = weekend.length > 0 ? weekend[0].schliesszeit : '';

          setOpeningHours({
            weekdaysFrom,
            weekdaysTo,
            weekendFrom,
            weekendTo,
          });
        } catch (error) {
          console.error('Fehler beim Abrufen der Öffnungszeiten:', error);
        }
      };

      getOpeningHours();
    }
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await fetchUserByToken();
        setUserData({
          id: user.id,
          name: `${user.vorname} ${user.nachname}` || 'Unbekannt',
          email: user.email || 'Keine E-Mail angegeben',
          role: user.rolle?.name || 'Unbekannte Rolle',
          lastLogin: user.lastLogin || 'Nicht verfügbar',
          permissions: user.permissions || ['Keine Berechtigungen verfügbar'],
        });
      } catch (err) {
        console.error('Fehler beim Laden der Nutzerdaten:', err);
      }
    };
    loadUserData();
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

  // Eingabeänderungen verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "facilityManager") {
      setFormData((prev) => ({ ...prev, facilityManager: { id: value } }));
    } else if (name.startsWith('weekdays') || name.startsWith('weekend')) {
      setOpeningHours((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validateInput(formData.name) || !validateInput(formData.city) || !validateInput(formData.street) || !validateInput(formData.country)) {
      setError("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = () => {
    const updatedData = { ...formData };

    if (updatedData.facilityManager && updatedData.facilityManager.id) {
      updatedData.verwaltetVonId = updatedData.facilityManager.id;
    }

    fetch(`http://localhost:8080/gebaeude/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.ok) {
          updateOpeningHours();
          if (userData) {
            protokolliereAktion(userData.id, 'Gebäude bearbeitet', `Gebäude ${formData.name} wurde bearbeitet.`);
          }
        } else {
          console.error('Fehler beim Speichern der Gebäudedaten');
        }
      })
      .catch((error) => console.error('Fehler:', error));
  };

  const updateOpeningHours = () => {
    const openingHoursData = [
      {
        gebaeudeId: id,
        tag: 'Mo',
        oeffnungszeit: openingHours.weekdaysFrom ? openingHours.weekdaysFrom : null,
        schliesszeit: openingHours.weekdaysTo ? openingHours.weekdaysTo : null,
      },
      {
        gebaeudeId: id,
        tag: 'Sa',
        oeffnungszeit: openingHours.weekendFrom ? openingHours.weekendFrom : null,
        schliesszeit: openingHours.weekendTo ? openingHours.weekendTo : null,
      },
    ];

    console.log(openingHoursData);

    fetch(`http://localhost:8080/oeffnungszeiten/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(openingHoursData),
    })
      .then((response) => {
        if (response.ok) {
          setShowModal(false);
          setShowSuccessModal(true);
        } else {
          console.error('Fehler beim Speichern der Öffnungszeiten');
        }
      })
      .catch((error) => console.error('Fehler:', error));
  };



  const handleCancel = () => {
    window.history.back();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    window.history.back();
  };

  return (
    <div className="GebäudeBearbeitenPage">
      <Header />
      <div className="content-wrapper">
        {userData?.role === 'Admin' && (
          <h1 className="form-title">
            <button className="back-button" onClick={() => window.history.back()}>
              <span>Zurück</span>
            </button>
            Gebäude bearbeiten
          </h1>
        )}
        {userData?.role === 'Verwaltungsmitarbeitende' && (
          <h1 className="form-title">
            <button className="back-button" onClick={() => window.history.back()}>
              <span>Zurück</span>
            </button>
            Gebäude Öffnungszeiten bearbeiten
          </h1>
        )}

        <form onSubmit={handleSave}>
          {userData?.role === 'Admin' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Gebäudename</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="z.B. Hauptgebäude"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Land</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="z.B. Deutschland"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Straße</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="z.B. Innstraße"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hausnummer</label>
                <input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  placeholder="z.B. 12a"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stadt</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="z.B. Passau"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postleitzahl</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  placeholder="z.B. 12345"
                  className="input-field"
                  required
                />
              </div>
            </div>
          )}


          <div className="form-grid">
          {(userData?.role === 'Admin' || userData?.role === 'Verwaltungsmitarbeitende') && (

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
          
          )}

          {userData?.role === 'Admin' && (
            <div className="select-container">
              <h3>Facility Manager zuweisen</h3>
              <select
                name="facilityManager"
                value={formData.facilityManager?.id || ''}
                onChange={handleInputChange}
                className="select-field"
              >
                <option value="">
                  {formData.facilityManager?.vorname} {formData.facilityManager?.nachname}
                </option>
                {facilityManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.vorname} {manager.nachname}
                  </option>
                ))}
              </select>
            </div>
          )}

          </div>

          {error && <div className="error-message">{error}</div>}
          <div className="button-container">
            <button type="button" onClick={handleCancel} className="button">
              Abbrechen
            </button>
            <button type="submit" className="button">
              Speichern
            </button>
          </div>
        </form>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Sind Sie sicher, dass Sie die Änderungen speichern möchten?
              </div>
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </button>
                <button className="modal-button" onClick={handleConfirm}>
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">Erfolgreich!</div>
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={handleCloseSuccessModal}
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GebäudeBearbeiten;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import './modal.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchUserByToken } from '../../services/UserService';

const API_BASE_URL = 'http://localhost:8080/api/buchungen';

const EventTypOptions = [
  { value: 'vorlesung', label: 'Vorlesung' },
  { value: 'uebung', label: 'Übung' },
  { value: 'pruefung', label: 'Prüfung' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const SerienBuchungTypOptions = [
  { value: 'taeglich', label: 'Täglich' },
  { value: 'woechentlich', label: 'Wöchentlich' },
  { value: 'monatlich', label: 'Monatlich' },
];

// Liste der Feiertage (Beispielhafte feste Feiertage)
const feiertage = (year) => [
  new Date(year, 0, 1),
  new Date(year, 11, 25),
  new Date(year, 11, 26),
];

const stundenOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0'),
}));

const minutenOptions = ['00', '15', '30', '45'].map(min => ({
  value: min,
  label: min,
}));

const Buchung = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: { day: '', month: '', year: '' },
    startTime: { hour: '', minute: '' },
    endTime: { hour: '', minute: '' },
    seriesBooking: 'nein',
    seriesType: '',
    seriesEndDate: { day: '', month: '', year: '' },
    eventType: '',
    betreff: '',
    raumId: id,
  });

  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })


  const [errors, setErrors] = useState({
    startDate: '',
    seriesEndDate: '',
    startTime: '',
    endTime: '',
    eventType: '',
    seriesType: '',
    general: '',
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Funktion zur Überprüfung, ob ein Datum ein Feiertag ist
  const isFeiertag = (date) => {
    const holidays = feiertage(date.getFullYear());
    return holidays.some(
      (holiday) =>
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear()
    );
  };

  // Funktion zur Validierung der Zeitlogik
  const validateTimeLogic = (startTime, endTime) => {
    const start = parseInt(startTime.hour, 10) * 60 + parseInt(startTime.minute, 10);
    const end = parseInt(endTime.hour, 10) * 60 + parseInt(endTime.minute, 10);
    return start < end;
  };

  const handleChange = (field, key, value) => {
    if (key) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [key]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const isValidDate = (day, month, year) => {
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === parseInt(day, 10) &&
      date.getMonth() === parseInt(month, 10) - 1 &&
      date.getFullYear() === parseInt(year, 10)
    );
  };

  const getDateObject = (date) => {
    const { day, month, year } = date;
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await fetchUserByToken();
        if (user && user.id) {
          setUserId(user.id);
        } else {
          console.error('Benutzer nicht authentifiziert.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Benutzers:', error);
        navigate('/login');
      }
    };
    getUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(''); // Reset API error
    let valid = true;
    let newErrors = {
      startDate: '',
      seriesEndDate: '',
      startTime: '',
      endTime: '',
      eventType: '',
      seriesType: '',
      general: ''
    };

    // Funktion zum Protokollieren von Aktionen
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

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setzt die Zeit auf Mitternacht für genaue Vergleiche
    const start = getDateObject(formData.startDate);

    // Validierung des Startdatums
    if (!isValidDate(formData.startDate.day, formData.startDate.month, formData.startDate.year)) {
      newErrors.startDate = 'Ungültiger Termin.';
      valid = false;
    } else if (start < today) {
      newErrors.startDate = 'Termin darf nicht vor dem heutigen Datum liegen.';
      valid = false;
    } else if (isFeiertag(start)) {
      newErrors.startDate = 'Buchungen an Feiertagen sind nicht erlaubt.';
      valid = false;
    }

    // Validierung der Serienenddatum
    if (formData.seriesBooking === 'ja') {
      const seriesEnd = getDateObject(formData.seriesEndDate);
      if (!isValidDate(formData.seriesEndDate.day, formData.seriesEndDate.month, formData.seriesEndDate.year)) {
        newErrors.seriesEndDate = 'Ungültiges Serienenddatum.';
        valid = false;
      } else if (seriesEnd <= start) {
        newErrors.seriesEndDate = 'Serienenddatum muss mindestens einen Tag nach dem Startdatum liegen.';
        valid = false;
      } else if (isFeiertag(seriesEnd)) {
        newErrors.seriesEndDate = 'Serienenddatum darf nicht auf einen Feiertag fallen.';
        valid = false;
      } else {
        // Zusätzliche Validierung basierend auf Serienbuchungstyp
        const diffTime = seriesEnd - start;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (formData.seriesType) {
          case 'taeglich':
            if (diffDays < 1) {
              newErrors.seriesEndDate = 'Bei täglicher Buchung muss das Serienenddatum mindestens einen Tag nach dem Startdatum liegen.';
              valid = false;
            }
            break;
          case 'woechentlich':
            if (diffDays < 7) {
              newErrors.seriesEndDate = 'Bei wöchentlicher Buchung muss das Serienenddatum mindestens eine Woche nach dem Startdatum liegen.';
              valid = false;
            }
            break;
          case 'monatlich':
            const oneMonthLater = new Date(start);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            if (seriesEnd < oneMonthLater) {
              newErrors.seriesEndDate = 'Bei monatlicher Buchung muss das Serienenddatum mindestens einen Monat nach dem Startdatum liegen.';
              valid = false;
            }
            break;
          default:
            break;
        }
      }
    }

    // Validierung der Zeitlogik
    if (!validateTimeLogic(formData.startTime, formData.endTime)) {
      newErrors.startTime = 'Startzeit muss vor der Endzeit liegen.';
      newErrors.endTime = 'Endzeit muss nach der Startzeit liegen.';
      valid = false;
    }

    // Überprüfung, ob ein Event Typ ausgewählt ist
    if (!formData.eventType) {
      newErrors.eventType = 'Bitte wählen Sie einen Event Typ aus.';
      valid = false;
    }

    // Überprüfung, ob ein Serienbuchungstyp ausgewählt ist, wenn Serienbuchung aktiv ist
    if (formData.seriesBooking === 'ja' && !formData.seriesType) {
      newErrors.seriesType = 'Bitte wählen Sie einen Serienbuchungstyp aus.';
      valid = false;
    }

    if ((formData.additionalSubject || '').trim() === '') {
      newErrors.general = 'Bitte geben Sie einen Betreff für das Event ein.';
      valid = false;
    }


    setErrors(newErrors);

    if (valid && userId !== null) {
      setLoading(true); // Start loading
      try {
        // Vorbereitung der Buchungsdaten
        const bookingData = {
          raumId: id, // Dynamisch aus den Routenparametern
          datum: `${formData.startDate.year}-${String(formData.startDate.month).padStart(2, '0')
            }-${String(formData.startDate.day).padStart(2, '0')
            }`, // Format: YYYY-MM-DD
          beginn: `${formData.startTime.hour}:${formData.startTime.minute}`,
          ende: `${formData.endTime.hour}:${formData.endTime.minute}`,
          gebuchtVonId: userId, // Dynamisch aus dem UserService
          eventTyp: formData.eventType,
          betreff: formData.additionalSubject,
        };

        if (formData.seriesBooking === 'ja') {
          // Handle Serienbuchung
          const serienBuchungTypMap = {
            'taeglich': 'TAEGLICH',
            'woechentlich': 'WOECHENTLICH',
            'monatlich': 'MONATLICH',
          };

          let serienBuchungTyp = null;
          let serieBis = null;

          console.log('Serienbuchungstyp:', formData.seriesBooking);

          if (formData.seriesBooking === 'ja') {
            serienBuchungTyp = serienBuchungTypMap[formData.seriesType];
            serieBis = `${formData.seriesEndDate.year}-${String(formData.seriesEndDate.month).padStart(2, '0')
              }-${String(formData.seriesEndDate.day).padStart(2, '0')
              }`;
          }
          const response = await axios.post(`${API_BASE_URL}/serien`, bookingData, {
            params: {
              serienBuchungTyp,
              serieBis,
            },
          });
          console.log(response);

          if (response.status === 201) {
            setShowModal(true);
          }
          await protokolliereAktion(userId, 'Serienbuchung erstellt', `Eine Serienbuchung für Raum ${id} wurde erstellt.`);
        } else {
          const response = await axios.post(API_BASE_URL, bookingData);
          console.log(response);

          if (response.status === 201) {
            setShowModal(true);
          }
          await protokolliereAktion(userId, 'Buchung erstellt', `Eine Buchung für Raum ${id} wurde erstellt.`);
        }
      } catch (error) {
        console.error('Fehler bei der Buchung:', error);
        await protokolliereAktion(userId, 'Buchung fehlgeschlagen', `Die Buchung für Raum ${id} ist fehlgeschlagen.`);
        if (error.response && error.response.data) {
          setApiError(`Buchungsfehler: ${error.response?.data?.message}`);
        } else {
          setApiError('Ein unerwarteter Fehler ist aufgetreten.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.history.back();
  };

  return (
    <div className="buchung_content">
      <Header />
      <div className="container">
        <h1 className="title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Buchung</h1>
        <div className="spacer"></div>
        <form className="form_body" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="left-column">
              {/* Termin am */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Termin am</label>
                  <div className="date-group">
                    <input
                      type="text"
                      placeholder="DD"
                      className="date-input form-input uniform-input"
                      value={formData.startDate.day}
                      onChange={(e) => handleChange('startDate', 'day', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="MM"
                      className="date-input form-input uniform-input"
                      value={formData.startDate.month}
                      onChange={(e) => handleChange('startDate', 'month', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="YYYY"
                      className="date-input year-input form-input uniform-input"
                      value={formData.startDate.year}
                      onChange={(e) => handleChange('startDate', 'year', e.target.value)}
                    />
                  </div>
                  {errors.startDate && <span className="error">{errors.startDate}</span>}
                </div>
              </div>

              {/* Von und Bis */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Von</label>
                  <div className="time-group">
                    {/* Stunden Dropdown */}
                    <select
                      className="time-select form-input uniform-input"
                      value={formData.startTime.hour}
                      onChange={(e) => handleChange('startTime', 'hour', e.target.value)}
                    >
                      <option value="">HH</option>
                      {stundenOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {/* Minuten Dropdown */}
                    <select
                      className="time-select form-input uniform-input"
                      value={formData.startTime.minute}
                      onChange={(e) => handleChange('startTime', 'minute', e.target.value)}
                    >
                      <option value="">MM</option>
                      {minutenOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.startTime && <span className="error">{errors.startTime}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Bis</label>
                  <div className="time-group">
                    {/* Stunden Dropdown */}
                    <select
                      className="time-select form-input uniform-input"
                      value={formData.endTime.hour}
                      onChange={(e) => handleChange('endTime', 'hour', e.target.value)}
                    >
                      <option value="">HH</option>
                      {stundenOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {/* Minuten Dropdown */}
                    <select
                      className="time-select form-input uniform-input"
                      value={formData.endTime.minute}
                      onChange={(e) => handleChange('endTime', 'minute', e.target.value)}
                    >
                      <option value="">MM</option>
                      {minutenOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.endTime && <span className="error">{errors.endTime}</span>}
                </div>
              </div>

              {/* Serienbuchung und Serienbuchungstyp */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Serienbuchung</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="seriesBooking"
                        className="radio-input"
                        value="ja"
                        checked={formData.seriesBooking === 'ja'}
                        onChange={(e) => handleChange('seriesBooking', null, e.target.value)}
                      />
                      Ja
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="seriesBooking"
                        className="radio-input uniform-input"
                        value="nein"
                        checked={formData.seriesBooking === 'nein'}
                        onChange={(e) => handleChange('seriesBooking', null, e.target.value)}
                      />
                      Nein
                    </label>
                  </div>
                </div>

                {formData.seriesBooking === 'ja' && (
                  <div className="form-group">
                    <label className="form-label">Serienbuchungstyp</label>
                    <select
                      className="dropdown-input uniform-input"
                      value={formData.seriesType}
                      onChange={(e) => handleChange('seriesType', null, e.target.value)}
                    >
                      <option value="">Bitte auswählen</option>
                      {SerienBuchungTypOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.seriesType && <span className="error">{errors.seriesType}</span>}
                  </div>
                )}
              </div>

              {/* Serie endet am */}
              {formData.seriesBooking === 'ja' && (
                <div className="form-group">
                  <label className="form-label">Serie endet am</label>
                  <div className="date-group">
                    <input
                      type="text"
                      placeholder="DD"
                      className="date-input form-input uniform-input"
                      value={formData.seriesEndDate.day}
                      onChange={(e) => handleChange('seriesEndDate', 'day', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="MM"
                      className="date-input form-input uniform-input"
                      value={formData.seriesEndDate.month}
                      onChange={(e) => handleChange('seriesEndDate', 'month', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="YYYY"
                      className="date-input year-input form-input uniform-input"
                      value={formData.seriesEndDate.year}
                      onChange={(e) => handleChange('seriesEndDate', 'year', e.target.value)}
                    />
                  </div>
                  {errors.seriesEndDate && <span className="error">{errors.seriesEndDate}</span>}
                </div>
              )}
            </div>

            {/* Rechte Spalte */}
            <div className="right-column">
              {/* Event Typ */}
              <div className="form-group">
                <label className="form-label">Event Typ</label>
                <select
                  className="dropdown-input uniform-input"
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', null, e.target.value)}
                >
                  <option value="">Bitte auswählen</option>
                  {EventTypOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.eventType && <span className="error">{errors.eventType}</span>}
              </div>

              {/* Betreff - immer angezeigt */}
              <div className="form-group">
                <label className="form-label">Betreff</label>
                <textarea
                  className="subject-input"
                  placeholder="Bitte geben Sie den Betreff ein"
                  value={formData.additionalSubject}
                  onChange={(e) => handleChange('additionalSubject', null, e.target.value)}
                />
              </div>

              {/* Allgemeine Fehleranzeige */}
              {errors.general && <span className="error">{errors.general}</span>}
              {/* API Fehleranzeige */}
              {apiError && <span className="error">{apiError}</span>}
            </div>
          </div>

          <div className="button-container">
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Buchung wird erstellt...' : 'Raum buchen'}
            </button>
          </div>
        </form>

        {/* Falls du die bedingte Anzeige komplett entfernen möchtest, kannst du die oben stehende Alternative verwenden */}
        {/*
        <form className="form_body" onSubmit={handleSubmit}>
          ... (Formularfelder)
        </form>
        */}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Erfolgreich!
              </div>
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={handleCloseModal}
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

export default Buchung;
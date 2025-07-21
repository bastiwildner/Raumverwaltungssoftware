import React, { useState, useEffect } from "react";
import "./BackupVerwalten.css";
import "./BackupVerwaltenModal.css";
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserByToken } from '../../services/UserService';

function BackupVerwalten() {
  const [weekday, setWeekday] = useState('');
  const [time, setTime] = useState("");
  const [directory, setDirectory] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
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

    const loadSettings = () => {
      const savedWeekday = JSON.parse(localStorage.getItem('backupWeekday')) || [];
      const savedTime = localStorage.getItem('backupTime') || '';
      const savedDirectory = localStorage.getItem('backupDirectory') || '';
      setWeekday(savedWeekday);
      setTime(savedTime);
      setDirectory(savedDirectory);
    };

    loadUserData();
    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWeekdayChange = (day) => {
    setWeekday((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDirectoryChange = (e) => {
    setDirectory(e.target.value);
  };

  const createBackup = async (backupData) => {
    console.log(backupData);
    try {
      const response = await axios.post('http://localhost:8080/backupVerwalten/create', backupData);
      setSuccess('Backup wird zu den gespeicherten Einstellungen erstellt.');
      setShowModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verzeichnis existiert nicht';
      console.error('Fehler beim Erstellen des Backups:', errorMessage);
      setError(`Fehler beim Erstellen des Backups: ${errorMessage}`);
    }
  };

  const handleSave = () => {
    if (!weekday || !time || !directory) {
      setError('Wochentag, Zeitpunkt und Verzeichnispfad sind Pflichtfelder.');
      return;
    }
    const backupData = {
      datumErstellt: new Date().toISOString(),
      speicherort: directory,
      erstelltVonId: userData.id,
      wochentag: weekday[0],
      zeitpunkt: time
    };

    createBackup(backupData);

    localStorage.setItem('backupWeekday', JSON.stringify(weekday));
    localStorage.setItem('backupTime', time);
    localStorage.setItem('backupDirectory', directory);

    console.log("Backup Einstellungen:", {
      weekday,
      time,
      directory
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="backup-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>Zurück</span>
          </button>
          Backup verwalten
        </h1>

        <div className="form-group">
          <label className="label">Wochentag</label>
          <div className="checkbox-container">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  checked={weekday.includes(day)}
                  onChange={() => handleWeekdayChange(day)}
                />
                <label htmlFor={`day-${index}`} className="checkbox-label">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="input-group">
          <div className="form-group">
            <label className="label" htmlFor="time-input">Zeitpunkt</label>
            <input
              id="time-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input"
            />
          </div>

          <div className="form-group">
            <label className="label">Verzeichnispfad</label>
            <input
              type="text"
              value={directory}
              onChange={handleDirectoryChange}
              className="path-input-field"
              placeholder="/pfad/zum/backup"
            />
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleSave} className="save-button">
          Speichern
        </button>
      </div>
      {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Erfolgreich!
              </div>
              {success && <div className="error-message">{success}</div>}
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
  );
}

export default BackupVerwalten;
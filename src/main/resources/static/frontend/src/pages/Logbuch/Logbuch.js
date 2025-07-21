import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import './Logbuch.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { fetchUserById } from '../../services/UserService';

const Logbuch = () => {
  const [logEntries, setLogEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [userNames, setUserNames] = useState({});
  const navigate = useNavigate();

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const formatTime = (date) => date.toTimeString().split(' ')[0].slice(0, 5);

    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(now));
    setStartTime(formatTime(now));
    setEndTime(formatTime(now));
  }, []);

  const fetchLogEntriesWithNames = async (start, end) => {
    try {
      const logResponse = await axios.get('http://localhost:8080/api/logeintraege/zeitraum', {
        params: { start, end }
      });
      console.log(logResponse.data)
      const uniqueUserIds = [...new Set(logResponse.data.map(response => response.benutzerId))];
      const fetchedUserNames = {};
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await fetchUserById(userId);
            const user = userResponse;

            fetchedUserNames[userId] = `${user.vorname} ${user.nachname}`;
          } catch (userError) {
            console.error(`Fehler beim Abrufen von Nutzer ${userId}:`, userError);
            fetchedUserNames[userId] = 'Unbekannter Benutzer';
          }
        })
      );
      console.log(fetchedUserNames)
      const enrichedEntries = await Promise.all(
        logResponse.data.map(async (entry) => {
          console.log(entry)
          try {
            return {
              ...entry,
              benutzerName: fetchedUserNames[entry.benutzerId]
            };
          } catch (error) {
            console.error(`Benutzerdaten für ID ${entry.benutzerId} fehlen:`, error);
            return { ...entry, benutzerName: 'Unbekannt' };
          }
        })
      );
      console.log(enrichedEntries)
      return enrichedEntries.sort((a, b) =>
        new Date(b.zeitstempel) - new Date(a.zeitstempel)
      );
    } catch (error) {
      console.error('Fehler beim Laden der Logeinträge:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const entries = await fetchLogEntriesWithNames(
        `${startDate}T${startTime}`,
        `${endDate}T${endTime}`
      );
      setLogEntries(entries);
    };
    loadData();
  }, [startDate, startTime, endDate, endTime]);

  const handleBack = () => navigate(-1);

  const saveFile = () => {
    const csvContent = [
      'Zeitstempel,Logeintrag-ID,Aktion,Details,Benutzer',
      ...logEntries.map(entry =>
        `${new Date(entry.zeitstempel).toLocaleString()},` +
        `${entry.id},` +
        `${entry.aktion},` +
        `${entry.details.replace(/,/g, ';')},` +
        `${entry.benutzerName}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `logbuch_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleStart = async () => {
    const entries = await fetchLogEntriesWithNames(
      `${startDate}T${startTime}`,
      `${endDate}T${endTime}`
    );
    setLogEntries(entries);
  };

  return (
    <div className="logbuch-container">
      <Header />
      <div className="box">
        <h1 className="title">
          <button className="back-button" onClick={handleBack}>
            <span>Zurück</span>
          </button>
          Logbuch erstellen
        </h1>

        <div className="filter">
          <label>
            Startdatum:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Startzeit:
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label>
            Enddatum:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label>
            Endzeit:
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          <button onClick={handleStart}>Start</button>
        </div>

        <div className="logbuch-content">
          <div className='table-container'>
            <table>
              <thead>
                <tr>
                  <th>Zeitstempel</th>
                  <th>Aktion</th>
                  <th>Details</th>
                  <th>Benutzer</th>
                </tr>
              </thead>
              <tbody>
                {logEntries.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.zeitstempel).toLocaleString()}</td>
                    <td>{entry.aktion}</td>
                    <td>{entry.details}</td>
                    <td>{entry.benutzerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="footer">
          <button className="export-button" onClick={saveFile}>
            Export des Logbuch
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logbuch;
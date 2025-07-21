import React, { useState, useEffect } from 'react';
import './table.css';
import './modal.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserByToken } from '../../services/UserService';

const Meinebuchungen = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userData, setUserData] = useState(null); // Zustand für die Nutzerdaten
 
  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  const eventTypMap = {
    pruefung: 'Prüfung',
    vorlesung: 'Vorlesung',
    uebung: 'Übung',
    sonstiges: 'Sonstiges',
  };

  useEffect(() => {
    const fetchBookingsAndRooms = async () => {
      try {
        setLoading(true);
        setError('');
        const user = await fetchUserByToken();
        setUserData(user);
        if (!user || !user.id) {
          throw new Error('Benutzer ist nicht authentifiziert.');
        }

        const buchungenResponse = await axios.get(`http://localhost:8080/api/buchungen/benutzer/${user.id}`);
        const userBookings = buchungenResponse.data;
        const uniqueRaumIds = [...new Set(userBookings.map(buchung => buchung.raumId))];

        const fetchedRooms = {};
        await Promise.all(
          uniqueRaumIds.map(async (raumId) => {
            try {
              const raumResponse = await axios.get(`http://localhost:8080/raeume/${raumId}`);
              const raum = raumResponse.data;
              const gebaeudeResponse = await axios.get(`http://localhost:8080/gebaeude/${raum.gebaeudeId}`);
              const gebaeude = gebaeudeResponse.data;

              fetchedRooms[raumId] = {
                name: raum.name,
                gebaeude: gebaeude.name,
              };
            } catch (raumError) {
              console.error(`Fehler beim Abrufen von Raum ${raumId}:`, raumError);
              fetchedRooms[raumId] = {
                name: 'Unbekannter Raum',
                gebaeude: 'Unbekanntes Gebäude',
              };
            }
          })
        );

        setRooms(fetchedRooms);
        setBookings(userBookings);
      } catch (err) {
        console.error('Fehler beim Abrufen der Buchungen:', err);
        setError(err.message || 'Fehler beim Abrufen der Buchungen.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndRooms();
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

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      await axios.delete(`http://localhost:8080/api/buchungen/${selectedBooking.id}`);
      setBookings(prevBookings => prevBookings.filter(b => b.id !== selectedBooking.id));
      setShowSuccessModal(true);

      if (userData) {
        await protokolliereAktion(userData.id, 'Buchung storniert', `Buchung für Raum ${rooms[selectedBooking.raumId]?.name} wurde storniert.`);
      }
    } catch (err) {
      console.error('Fehler beim Stornieren der Buchung:', err);
      setError('Fehler beim Stornieren der Buchung. Bitte versuchen Sie es erneut.');
    } finally {
      setShowConfirmModal(false);
      setSelectedBooking(null);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <div className="Meinebuchungen-container">
        <Header />
        <div className="Meinebuchungen_content">
          <div className="title-container">
            <h1 className="title_content">
              <button className="back-button" onClick={() => window.history.back()}>
                <span>Zurück</span>
              </button>
              Meine Buchungen</h1>
            <div className="spacer"></div>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Meinebuchungen-container">
      <Header />
      <div className="Meinebuchungen_content">
        <div className="title-container">

          <h1 className="title_content">
            <button className="back-button" onClick={() => window.history.back()}>
              <span>Zurück</span>
            </button>
            Meine Buchungen
          </h1>
          <div className="spacer"></div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          {bookings.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Raumname</th>
                  <th>Zeitraum (Datum/Uhrzeit)</th>
                  <th>Art</th>
                  <th>Betreff</th>
                  <th>Gebäude</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => {
                  const raum = rooms[booking.raumId] || { name: 'Unbekannter Raum', gebaeude: 'Unbekanntes Gebäude' };
                  return (
                    <tr key={booking.id}>
                      <td>{raum.name}</td>
                      <td>
                        {new Date(booking.datum).toLocaleDateString('de-DE')} / {booking.beginn} - {booking.ende}
                      </td>
                      <td>{eventTypMap[booking.eventTyp]}</td>
                      <td>{booking.betreff}</td>
                      <td>{raum.gebaeude}</td>
                      <td>
                        <button
                          className="cancel-button"
                          onClick={() => handleCancel(booking)}
                        >
                          stornieren
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>Sie haben keine Buchungen.</p>
          )}
        </div>

        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Wollen Sie die Buchung wirklich stornieren?
              </div>
              <div className="modal-buttons">
                <button className="button" onClick={handleCloseModal}>
                  Abbrechen
                </button>
                <button className="button" onClick={handleConfirmCancel}>
                  Buchung stornieren
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
                <button className="button" onClick={handleCloseSuccessModal}>
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

export default Meinebuchungen;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/HeaderLoggedIn";
import axios from 'axios';
import "./AusstattungBearbeiten.css";
import "./AusstattungBearbeitenModel.css";
import { fetchUserByToken } from '../../services/UserService';

function AusstattungBearbeiten() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState({ name: "", id: "" });
  const [equipmentList, setEquipmentList] = useState([]);
  const [zuLoeschenIds, setZuLoeschenIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingTicketError, setExistingTicketError] = useState("");
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [closeTicketsSuccess, setCloseTicketsSuccess] = useState('');
  const [success, setSuccess] = useState(null);
  const [equipmentId, setEquipmentId] = useState('');

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomResponse = await fetch(`http://localhost:8080/raeume/${id}`);
        if (!roomResponse.ok) throw new Error("Fehler beim Laden der Raumdetails");
        const roomData = await roomResponse.json();
        setRoomDetails({ name: roomData.name, id: roomData.id });

        const equipmentResponse = await fetch(`http://localhost:8080/ausstattung/raum/${id}`);
        if (!equipmentResponse.ok) throw new Error("Fehler beim Laden der Ausstattung");
        const equipmentData = await equipmentResponse.json();
        setEquipmentList(equipmentData || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
        setError('Fehler: Beim Abrufen der Daten ist etwas schiefgelaufen.');
      }
    };

    fetchData();
    loadUserData();
  }, [id]);

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

  const handleAddRow = () => {
    setEquipmentList([...equipmentList, { id: null, bezeichnung: "", beschreibung: "" }]);
  };

  const handleDeleteRow = async (index) => {
    const itemToDelete = equipmentList[index];
    console.log(itemToDelete);

    const response = await axios.get(`http://localhost:8080/service-tickets/roomAndEquipment/${itemToDelete.id}`);

    if (response.data.length > 0) {
      setExistingTicketError('Dieses Ausstattungseintrag kann nicht gelöscht werden, da es noch anderen Service-Tickets zugeordnet ist.');
      setShowOtherModal(true);
      setEquipmentId(itemToDelete.id);
      return;
    }

    if (itemToDelete.id) {
      setZuLoeschenIds((prev) => [...prev, itemToDelete.id]);
    }
    const updatedList = [...equipmentList];
    updatedList.splice(index, 1);
    setEquipmentList(updatedList);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.history.back();
  };

  const handleCloseOtherModal = () => {
    setShowOtherModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleChange = (index, field, value) => {
    const updated = [...equipmentList];
    updated[index][field] = value;
    setEquipmentList(updated);
  };

  const validateFields = () => {
    for (const item of equipmentList) {
      if (!item.bezeichnung.trim() || !item.beschreibung.trim()) {
        return false;
      }
    }
    return true;
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };

  const handleSubmitCloseTickets = async () => {

    try {
      const response = await axios.put(`http://localhost:8080/service-tickets/closeTickets/${equipmentId}`);
      if (response) {
        setShowOtherModal(false);
        setCloseTicketsSuccess('Alle Service-Tickets für das Ausstattungseintrag wurden erfolgreich geschlossen.');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleSave = async () => {

    if (!validateFields()) {
      setError("Alle Felder müssen ausgefüllt sein und dürfen nicht nur Leerzeichen enthalten.");
      return;
    }
    for (const item of equipmentList) {
      if (!validateInput(item.bezeichnung) || !validateInput(item.beschreibung)) {
        setError("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
        return;
      }
    }

    try {
      const payload = {
        ausstattung: equipmentList.map((item) => ({
          id: item.id || null,
          bezeichnung: item.bezeichnung,
          beschreibung: item.beschreibung,
        })),
        zuLoeschen: zuLoeschenIds,
      };

      const response = await fetch(`http://localhost:8080/ausstattung/raum/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Fehler beim Speichern");

      await protokolliereAktion(userData.id, 'Ausstattung bearbeitet', `Die Ausstattung des Raums ${roomDetails.name} wurde bearbeitet.`);
      setShowModal(true);
      setSuccess("Änderungen erfolgreich gespeichert!");
    } catch (err) {
      console.error(err);
      await protokolliereAktion(userData.id, 'Ausstattung bearbeitet', `Die Ausstattung des Raums ${roomDetails.name} konnte nicht bearbeitet werden.`);
      setError("Fehler beim Speichern der Änderungen.");
    }
  };

  if (loading) return <div className="loading">Lade Daten...</div>;

  return (
    <div className="editroomequipment-container">
      <Header />
      <div className="equipment-container">

        <h1 className="title"><button className="back-button" onClick={() => navigate(-1)}>
          <span>Zurück</span>
        </button>Ausstattung bearbeiten für{" "}
          <span className="highlight">{roomDetails.name}</span>, mit RaumID:{" "}
          <span className="highlight">{roomDetails.id}</span></h1>

        <div className="equipment-edit-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Bezeichnung</th>
                <th>Beschreibung</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((item, index) => (
                <tr key={index}>
                  <td>{item.id || "Neu"}</td>
                  <td>
                    <input
                      type="text"
                      value={item.bezeichnung}
                      onChange={(e) => handleChange(index, "bezeichnung", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.beschreibung}
                      onChange={(e) => handleChange(index, "beschreibung", e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDeleteRow(index)}>-</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4">
                  <button onClick={handleAddRow}>+</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="equipment-edit-actions">
          <button onClick={handleSave}>Speichern</button>
          <button onClick={() => navigate(`/raum/${id}`)}>Abbrechen</button>
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

        {showOtherModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Erfolgreich!
              </div>
              {existingTicketError && <div className="error-message">{existingTicketError}</div>}
              <div className="modal-buttons">
                <button
                  className="modal-button"
                  onClick={handleCloseOtherModal}
                >
                  Abbrechen
                </button>
                <button
                  className="modal-button"
                  onClick={handleSubmitCloseTickets}
                >
                  Tickets schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                Erfolgreich!
              </div>
              {closeTicketsSuccess && <div className="error-message">{closeTicketsSuccess}</div>}
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
}

export default AusstattungBearbeiten;
import React, { useState, useEffect } from "react";
import "./DashboardVM.css";
import Header from '../../components/Header/HeaderLoggedIn';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

function DashboardVM() {
  const [activeModal, setActiveModal] = useState("");
  const [data, setData] = useState({
    raumbuchungen: 0,
    offeneTickets: 0,
    raumauslastung: "0%",
    raumbuchungenWoche: 0,
    raumbuchungenMonat: 0,
    raumauslastungHeute: "0%",
  });

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })


  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const raumbuchungenResponse = await fetch(`http://localhost:8080/anzahlRaumbuchungen?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
        const offeneTicketsResponse = await fetch('http://localhost:8080/offeneServiceTickets');
        const raumauslastungResponse = await fetch(`http://localhost:8080/raumauslastung?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
        const raumbuchungenWocheResponse = await axios.get('http://localhost:8080/anzahlRaumbuchungenWoche');
        const raumbuchungenMonatResponse = await fetch('http://localhost:8080/anzahlRaumbuchungenMonat');
        const raumauslastungheuteResponse = await fetch('http://localhost:8080/raumauslastungHeute');
        const raumbuchungen = await raumbuchungenResponse.json();
        const raumbuchungenWoche = await raumbuchungenWocheResponse.data;
        const raumbuchungenMonat = await raumbuchungenMonatResponse.json();
        const offeneTickets = await offeneTicketsResponse.json();
        let raumauslastung = await raumauslastungResponse.json();
        raumauslastung = Math.round(raumauslastung * 100) / 100;
        let raumauslastungHeute = await raumauslastungheuteResponse.json();
        raumauslastungHeute = Math.round(raumauslastungHeute * 100) / 100;

        setData({
          raumbuchungen: raumbuchungen,
          offeneTickets: offeneTickets,
          raumauslastung: `${raumauslastung}%`,
          raumbuchungenWoche: raumbuchungenWoche,
          raumbuchungenMonat: raumbuchungenMonat,
          raumauslastungHeute: `${raumauslastungHeute}%`
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    };

    fetchData();
  }, []);
console.log(data)
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal("");
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <h1 className="title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>Dashboard</h1>

        <div className="info-cards">
          <div
            className="info-card"
            onClick={() => openModal("offeneTickets")}
          >
            <p>Offene Service Tickets</p>
            <h2>{data.offeneTickets}</h2>
          </div>
          <div
            className="info-card"
            onClick={() => openModal("raumauslastung")}
          >
            <p>Raumauslastung aktuell</p>
            <h2>{data.raumauslastung}</h2>
          </div>
          <div
            className="info-card"
            onClick={() => openModal("raumauslastungHeute")}
          >
            <p>Durchschnittliche Raumauslastung heute</p>
            <h2>{data.raumauslastungHeute}</h2>
          </div>
        </div>
        <div className="info-cards">
          <div
            className="info-card"
            onClick={() => openModal("raumbuchungen")}
          >
            <p>Gesamtanzahl an Raumbuchungen heute</p>
            <h2>{data.raumbuchungen}</h2>
          </div>
          <div
            className="info-card"
            onClick={() => openModal("raumbuchungen")}
          >
            <p>Verbleibende Raumbuchungen diese Woche</p>
            <h2>{data.raumbuchungenWoche}</h2>
          </div>
          <div
            className="info-card"
            onClick={() => openModal("raumbuchungen")}
          >
            <p>Verbleibende Raumbuchungen diesen Monat</p>
            <h2>{data.raumbuchungenMonat}</h2>
          </div>
        </div>


        {/* Modals */}
        {activeModal === "raumbuchungen" && (
          <div className="modal">
            <div className="modal-content">
              <h2>Raumbuchungen</h2>
              <p>Hier können Sie die Raumbuchungen verwalten:</p>
              <div className="modal-buttons">
                <button onClick={navigate('/Buchungsuebersicht')} className="modal-button">
                  Buchungsübersicht
                </button>
              </div>
              <button onClick={closeModal} className="close-button">
                Schließen
              </button>
            </div>
          </div>
        )}

        {activeModal === "offeneTickets" && (
          <div className="modal">
            onClick={navigate('/ticketuebersicht')}
          </div>
        )}

        {activeModal === "raumauslastung" && (
          <div className="modal">
            <div className="modal-content">
              <h2>Raumauslastung</h2>
              <p>
                Aktuelle Raumauslastung: {data.raumauslastung}
              </p>
              <p>Aktuell belegte Räume: {data.raumbuchungen}</p> {/*Hier wird aktuell die anzahl an belegten Räumen des ganzen Tages angezeigt*/}
              <button onClick={closeModal} className="close-button">
                Schließen
              </button>
            </div>
          </div>
        )}

        {activeModal === "raumauslastungHeute" && (
          <div className="modal">
            <div className="modal-content">
              <h2>Raumauslastung</h2>
              <p>
                Raumauslastung heute: {data.raumauslastungHeute}
              </p>
              <p>Heute belegte Räume: {data.raumbuchungen}</p>
              <button onClick={closeModal} className="close-button">
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default DashboardVM;

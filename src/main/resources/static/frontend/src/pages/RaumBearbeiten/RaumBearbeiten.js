import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from '../../components/Header/HeaderLoggedIn';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './RaumBearbeiten.css';
import './modal.css';
import './form.css';
import { fetchUserByToken } from '../../services/UserService';

const RaumBearbeiten = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    groesse: "",
    typ: "",
    kapazitaet: "",
  });

  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    if(localStorage.getItem('sessionToken') == null){
      navigate('/login')
    }
  })

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/raeume/${id}`);
        const data = response.data;
        setFormData({
          name: data.name,
          groesse: data.groesse,
          typ: data.typ,
          kapazitaet: data.kapazitaet,
        });
      } catch (error) {
        setMessage("Fehler beim Laden der Raumdaten: " + error.message);
      }
    };

    fetchRoomData();
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await fetchUserByToken();
        setUserData(user);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInput = (text) => {
    const regex = /^[A-Za-zÄÖÜäöüß]+([ -][A-Za-zÄÖÜäöüß]+)*$/;
    return regex.test(text);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.groesse <= 0 || formData.kapazitaet <= 0) {
      setMessage("Raumgröße bzw. Kapazität müssen größer gleich Null sein!");
      return;
    }

    if (!validateInput(formData.name)) {
      setMessage("Nur Buchstaben, Bindestriche und Leerzeichen erlaubt!");
      return;
  }

    try {
      await axios.put(`http://localhost:8080/raeume/${id}`, formData);
      setMessage("Raum erfolgreich aktualisiert!");

      if (userData) {
        await protokolliereAktion(userData.id, 'Raum bearbeitet', `Raum ${formData.name} wurde bearbeitet.`);
      }

      navigate(`/raum/${id}`); 
    } catch (error) {
      setMessage("Fehler beim Bearbeiten des Raumes: " + error.message);
    }
  };

  return (
    <div className="raumBearbeiten-container">
      <Header />
      <div className="raumBearbeiten-box">
        <h1 className="title">
          <button className="back-button" onClick={() => window.history.back()}>
            <span>Zurück</span>
          </button>
          Raum bearbeiten
        </h1>

        <form className="raumBearbeiten-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Raumname"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="groesse"
              placeholder="Raumgröße"
              value={formData.groesse}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <select
              name="typ"
              value={formData.typ}
              onChange={handleChange}
              required
            >
              <option value="">Bitte Raumtyp auswählen</option>
              <option value="BESPRECHUNGSRAUM">Besprechungsraum</option>
              <option value="HÖRSAAL">Hörsaal</option>
              <option value="BÜRO">Büro</option>
              <option value="LABOR">Labor</option>
              <option value="SEMINARRAUM">Seminarraum</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              name="kapazitaet"
              placeholder="Kapazität"
              value={formData.kapazitaet}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
          {message && <p>{message}</p>}
            <button
              className="cancel-button"
              type="button"
              onClick={() => navigate(`/raum/${id}`)}
            >
              Abbrechen
            </button>

            <button className="raumBearbeiten-button" type="submit">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaumBearbeiten;
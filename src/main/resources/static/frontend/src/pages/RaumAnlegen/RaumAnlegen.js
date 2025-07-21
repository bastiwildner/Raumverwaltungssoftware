import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from '../../components/Header/HeaderLoggedIn';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './RaumAnlegen.css';

const RaumForm = () => {
    const location = useLocation();
    const gebaeudeId = location.state?.gebaeudeId || null;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        groesse: '',
        typ: "",
        kapazitaet: '',
        gebaeudeId: gebaeudeId,
    });

    const [message, setMessage] = useState("");
    const [userData, setUserData] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
    useEffect(() => {
        if (localStorage.getItem('sessionToken') == null) {
            navigate('/login')
        }
    })

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
            const response = await axios.post("http://localhost:8080/raeume/create", formData);
            setMessage("Raum erfolgreich erstellt!");

            if (userData) {
                await protokolliereAktion(userData.id, 'Raum erstellt', `Raum ${formData.name} wurde erstellt.`);
            }
        } catch (error) {
            setMessage("Fehler beim Erstellen des Raumes: " + error.message);
        }
    };

    return (
        <div className="raumAnlegen-container">
            <Header />
            <div className="raumAnlegen-box">

                <h1 className="title">
                    <button className="back-button">
                        <Link to="/raumuebersicht">
                        <span>Zurück</span>
                        </Link>
                    </button>Raum anlegen
                </h1>

                <form className="raumAnlegen-form" onSubmit={handleSubmit}>
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
                    <button className="raumAnlegen-button" type="submit">Bestätigen</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default RaumForm;

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jsPDF from 'jspdf';
import deLocale from '@fullcalendar/core/locales/de.js';
import './Belegungsplan.css';
import Header from '../../components/Header/HeaderLoggedIn';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { fetchUserByToken } from '../../services/UserService';

// Funktion zur Berechnung der KW aus einem Datum
const getWeekFromDate = (date) => {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);

  // Finde den Montag der aktuellen Woche
  const day = tempDate.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
  const diffToMonday = day === 0 ? -6 : 1 - day; // Sonntag (0) gehört zur vorherigen Woche
  const monday = new Date(tempDate);
  monday.setDate(tempDate.getDate() + diffToMonday);

  // Berechne die Kalenderwoche (Montag als erster Tag der Woche)
  const firstMonday = new Date(monday.getFullYear(), 0, 4); // 4. Januar ist immer in der ersten KW
  firstMonday.setDate(firstMonday.getDate() - (firstMonday.getDay() - 1)); // Gehe zum ersten Montag des Jahres

  const weekNumber = Math.ceil(((monday - firstMonday) / 86400000 + 1) / 7);

  return weekNumber;
};


const Belegungsplan = () => {
  const [events, setEvents] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(getWeekFromDate(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;
  const [roomDetails, setRoomDetails] = useState(null);
  const [facilityManager, setFacilityManager] = useState(null);
  const [user, setUser] = useState(null);

  // Benutzer auf die Login-Seite umleiten, wenn er nicht eingeloggt ist
  useEffect(() => {
    if (localStorage.getItem('sessionToken') == null) {
      navigate('/login')
    }
  })

  useEffect(() => {
    axios.get(`http://localhost:8080/api/buchungen/raum/${(id)}`)
      .then((response) => {
        const mappedEvents = response.data.map((booking) => ({
          title: booking.betreff,
          start: `${booking.datum}T${booking.beginn}`,
          end: `${booking.datum}T${booking.ende}`,
        }));
        setEvents(mappedEvents);
      })
      .catch((error) => console.error('Fehler beim Laden der Events:', error));
  }, [id]);

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUserByToken();
      setUser(userData);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchFacilityManager = async (gebaeudeId) => {
      try {
        const response = await axios.get(`http://localhost:8080/gebaeude/${gebaeudeId}/facility-manager`);
        return response.data || null;
      } catch (error) {
        console.warn('Fehler beim Abrufen des Facility Managers:', error);
        return null;
      }
    };

    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/raeume/${id}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Raumdaten');
        const data = await response.json();
        setRoomDetails(data);

        if (data.gebaeudeId) {
          const manager = await fetchFacilityManager(data.gebaeudeId);
          setFacilityManager(manager);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoomDetails();
  }, [id]);

  // Funktion zur Berechnung des Start- und Enddatums der Arbeitswoche (angepasst mit Jahr)
  const getStartAndEndOfWorkWeek = (weekNumber, year) => {
    const januaryFirst = new Date(year, 0, 1);
    const days = (weekNumber - 1) * 7;
    const startOfWeek = new Date(januaryFirst.setDate(januaryFirst.getDate() + days - (januaryFirst.getDay() - 1)));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: startOfWeek.toLocaleDateString('de-DE'),
      end: endOfWeek.toLocaleDateString('de-DE'),
    };
  };

  // PDF-Druckfunktion (Verwendung der zuletzt ausgewählten KW und Jahr)
  const handlePrint = () => {
    const pdf = new jsPDF('landscape');
    const pageWidth = pdf.internal.pageSize.width;

    const weekRange = getStartAndEndOfWorkWeek(currentWeek, currentYear);

    pdf.setFontSize(18);
    pdf.text(`Belegungsplan - KW ${currentWeek}`, pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`${weekRange.start} bis ${weekRange.end}`, pageWidth / 2, 22, { align: 'center' });

    const timeColWidth = 25;
    const dayColWidth = (pageWidth - (timeColWidth + 2 * 30)) / 7;
    const startX = 30; 
    const startY = 30;
    const rowHeight = 10;

    // Kopfzeile (Wochentage)
    const headers = [' ', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    headers.forEach((header, i) => {
      const colWidth = i === 0 ? timeColWidth : dayColWidth;
      const xPosition = startX + (i === 0 ? 0 : timeColWidth + (i - 1) * dayColWidth);
      pdf.text(header, xPosition + 5, startY);
      pdf.rect(xPosition, startY - rowHeight / 2, colWidth, rowHeight);
    });

    // Stunden-Spalte und Raster zeichnen
    for (let i = 0; i < 12; i++) {
      const hour = `${8 + i}:00`;
      const yPosition = startY + (i + 1) * rowHeight;
      const textOffset = rowHeight / 1.5;

      // Uhrzeitenspalte
      pdf.text(hour, startX + 5, yPosition + textOffset);
      pdf.rect(startX, startY + i * rowHeight + rowHeight, timeColWidth, rowHeight);

      // Raster für die Tage
      for (let j = 1; j <= 7; j++) { // Gehe bis Sonntag (7 Spalten)
        const xPosition = startX + timeColWidth + (j - 1) * dayColWidth;
        pdf.rect(xPosition, startY + i * rowHeight + rowHeight, dayColWidth, rowHeight);
      }
    }

    // Events der aktuellen Woche filtern und einfügen
    const currentWeekEvents = events.filter((event) => {
      const eventDate = new Date(event.start);
      const eventWeek = getWeekFromDate(eventDate);
      return eventWeek === currentWeek;
    });

    currentWeekEvents.forEach((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const day = eventStart.getDay(); // 1 = Mo, ..., 7 = So
      if (day < 1 || day > 7) return;

      const startHour = eventStart.getHours();
      const endHour = eventEnd.getHours();
      const startMinutes = eventStart.getMinutes();
      const endMinutes = eventEnd.getMinutes();

      const xPosition = startX + timeColWidth + (day - 1) * dayColWidth;
      const startYPosition = startY + ((startHour - 8) * rowHeight) + 1 * rowHeight + (startMinutes / 60) * rowHeight;
      const durationInHours = (endHour + endMinutes / 60) - (startHour + startMinutes / 60);
      const eventHeight = durationInHours * rowHeight;


     
      pdf.setFillColor(200, 230, 255);
      pdf.rect(xPosition, startYPosition, dayColWidth, eventHeight, 'DF');

      // Dynamische Anpassung des Textes an das Feld
      const textX = xPosition + 2;
      const textY = startYPosition + 5; 
      const maxWidth = dayColWidth - 4; 
      const fontSize = 10;

      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0);

      const splitTitle = pdf.splitTextToSize(event.title, maxWidth);
      splitTitle.forEach((line, index) => {
        const lineHeight = 4; 
        const currentY = textY + index * lineHeight;
        if (currentY < startYPosition + eventHeight - 2) { 
          pdf.text(line, textX, currentY);
        }
      });
    });

    const footerY = startY + (12 + 1) * rowHeight + 20;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    const now = new Date();
    const printTime = now.toLocaleString();
    const room = roomDetails?.name || "Unbekannter Raum";
    const printedBy = facilityManager
      ? `${facilityManager.vorname} ${facilityManager.nachname}`
      : "Unbekannter Facility Manager";

    pdf.text(`Raum: ${room}`, 14, footerY);
    pdf.text(`Ausgedruckt am: ${printTime}`, 14, footerY + 10);
    pdf.text(`Zuständiger Facility Manager: ${printedBy}`, 14, footerY + 20);

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');

    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
  };




  // KW und Jahr aktualisieren, wenn sich der Kalender bewegt (z. B. durch "prev" oder "next")
  const handleDatesSet = (info) => {
    const startDate = new Date(info.start);
    const week = getWeekFromDate(startDate);
    const year = startDate.getFullYear(); 
    setCurrentWeek(week);
    setCurrentYear(year); 
  };

  return (
    <div className="schedule-management-container">
      <Header />
      <div className="content-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
        <span>Zurück</span>
        </button>
        <div className="content-header">
          <h2></h2>
          {user?.rolle?.name === 'Facility Manager' && (
            <button onClick={handlePrint} className="print-button">
              Belegungsplan für aktuelle Woche drucken
            </button>
          )}
        </div>
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            editable={true}
            selectable={true}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            locale={deLocale}
            weekends={true}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            datesSet={handleDatesSet}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Belegungsplan;

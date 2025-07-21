import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Startseite from './pages/Startseite/Startseite';
import Raumübersicht from './pages/Raumübersicht/Raumübersicht';
import RaumDetailansicht from './pages/RaumDetailansicht/RaumDetailansicht';
import Nutzerprofil from './pages/Nutzerprofil/Nutzerprofil';
import Gebäudeübersicht from './pages/Gebäudeübersicht/Gebäudeübersicht';
import RaumAnlegen from './pages/RaumAnlegen/RaumAnlegen'
import Registrierung from './pages/Registrierung/Registrierung'
import NutzerBearbeiten from './pages/NutzerBearbeiten/NutzerBearbeiten'
import Meinebuchungen from './pages/Meinebuchungen/Meinebuchungen'
import Buchungsuebersicht from './pages/Buchungsuebersicht/Buchungsuebersicht';
import GebäudeBearbeiten from './pages/GebäudeBearbeiten/GebäudeBearbeiten'
import NutzerMitRolleAnlegen from './pages/NutzerMitRolleAnlegen/NutzerMitRolleAnlegen'
import Nutzerübersicht from './pages/Nutzerübersicht/Nutzerübersicht'
import Buchung from './pages/Buchung/Buchung'
import RaumBearbeiten from './pages/RaumBearbeiten/RaumBearbeiten'
import Belegungsplan from './pages/Belegungsplan/Belegungsplan'
import BackupVerwalten from './pages/BackupVerwalten/BackupVerwalten'
import Login from './pages/Login/Login';
import RegistrierungErfolgreich from './pages/RegistrierungErfolgreich/RegistrierungErfolgreich';
import AusstattungBearbeiten from './pages/AusstattungBearbeiten/AusstattungBearbeiten';
import TicketErstellen from './pages/TicketErstellen/TicketErstellen';
import TicketÜbersicht from './pages/TicketÜbersicht/TicketÜbersicht';
import TicketDetailansicht from './pages/TicketDetailansicht/TicketDetailansicht';
import PasswortZurücksetzen from './pages/PasswortZurücksetzen/PasswortZurücksetzen';
import PasswortÄndern from './pages/PasswortÄndern/PasswortÄndern';
import GebäudeAnlegen from './pages/GebäudeAnlegen/GebäudeAnlegen';
import Logbuch from './pages/Logbuch/Logbuch';
import DashboardVM from './pages/DashboardVM/DashboardVM';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registrierung />} />
          <Route path="/registersuccess" element={<RegistrierungErfolgreich />} />
          <Route path="/home" element={<Startseite />} />
          <Route path="/PasswortZurücksetzen" element={<PasswortZurücksetzen />} />
          <Route path="/PasswortÄndern" element={<PasswortÄndern />} />
          <Route path="/PasswortAendern/:userID" element={<PasswortÄndern />} />


          <Route path="/NutzerBearbeiten" element={<NutzerBearbeiten />} /> {/*schon angepasst */}
          <Route path="/nutzer/:id" element={<Nutzerprofil />} /> {/*schon angepasst */}
          <Route path="/NutzerMitRolleAnlegen" element={<NutzerMitRolleAnlegen />} /> {/*schon angepasst */}
          <Route path="/Nutzerübersicht" element={<Nutzerübersicht />} /> {/*schon angepasst */}


          <Route path="/raumuebersicht" element={<Raumübersicht />} /> {/*schon angepasst AA*/}
          <Route path="/raum/:id" element={<RaumDetailansicht />} /> {/*schon angepasst AA*/   }        
          <Route path="/raum/:id/ausstattung/edit" element={<AusstattungBearbeiten />} />           {/* nicht verkapselt */       }   
          <Route path="/raum/:id/ticket-erstellen" element={<TicketErstellen />} /> {/*schon angepasst AA*/}
          <Route path="/raum/:id/bearbeiten" element={<RaumBearbeiten />} />    {/* AA */ }                        
          <Route path="/raumanlegen" element={<RaumAnlegen />} /> {/* AA */}
          

          <Route path='/service-tickets/:id' element={<TicketDetailansicht />} /> {/*schon angepasst AA*/}
          <Route path="/ticketuebersicht" element={<TicketÜbersicht />} /> {/*schon angepasst AA*/}
         

          <Route path="/gebäudeübersicht" element={<Gebäudeübersicht />} /> {/*hier auf ue ändern*  /*schon angepasst*/}
          <Route path="/GebäudeBearbeiten/:id" element={<GebäudeBearbeiten />} />
          <Route path="/GebäudeAnlegen" element={<GebäudeAnlegen />} />  {/*schon angepasst AA*/}
          
          
          <Route path="/Meinebuchungen" element={<Meinebuchungen />} /> {/*schon angepasst AA*/}
          <Route path="/Buchung" element={<Buchung />} /> {/*schon angepasst */}
          <Route path="/Buchungsuebersicht" element={<Buchungsuebersicht />} /> {/*schon angepasst AA*/}

          <Route path="/Belegungsplan" element={<Belegungsplan />} /> {/*schon angepasst AA*/}
          <Route path="/BackupVerwalten" element={<BackupVerwalten />} /> {/*schon angepasst AA*/}
          <Route path="/logbuch" element={<Logbuch />} />          {/*schon angepasst AA*/}
          <Route path="/DashboardVM" element={<DashboardVM />} /> {/*schon angepasst AA*/}




          <Route path="/RaumBearbeiten" element={<RaumBearbeiten />} /> {/*schon angepasst ----- Seite ist über den jeweiligen Raum erreichbar, das hier ist die Vorlage, Route redundant*/ /* nicht verkapselt */}
      
        </Routes>
      </div>
    </Router>
  );
}

export default App;
package org.Raumverwaltung.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.LoginSession;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.LoginSessionRepository;
import org.Raumverwaltung.Transferobjects.LoginDto;
import org.Raumverwaltung.Transferobjects.LoginSessionDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

/**
 * Service-Klasse zur Verwaltung von Login-Sitzungen und JWT-Token-Generierung.
 */
@RequiredArgsConstructor
@Service
public class LoginSessionService {

    @Autowired
    private final BenutzerRepository benutzerRepository;
    private final LoginSessionRepository loginSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    /**
     * Führt die Login-Logik aus und erstellt einen neuen Sitzungseintrag.
     *
     * @param loginDto  Enthält das Passwort und die email Adresse des Benutzers
     * @return Ein {@link LoginDto}, das die Details der aktuellen Sitzung enthält.
     * @throws EntityNotFoundException Wenn kein Benutzer mit der angegebenen E-Mail-Adresse gefunden wird.
     * @throws IllegalArgumentException Wenn die Anmeldedaten ungültig sind.
     */


    public LoginSessionDto login(LoginDto loginDto) {
        Benutzer benutzer = benutzerRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit der E-Mail " + loginDto.getEmail() + " nicht gefunden."));

        if (!passwordEncoder.matches(loginDto.getPasswort(), benutzer.getPasswort())) {
            throw new IllegalArgumentException("Ungültige Anmeldedaten.");
        }

        LoginSessionDto session = new LoginSessionDto();
        session.setBenutzer(benutzer);
        session.setSessionToken(UUID.randomUUID().toString());

        LoginSession loginSession = convertToEntity(session);

        loginSession.setLoginZeit(LocalDateTime.now());

        return convertToDto(loginSessionRepository.save(loginSession));
    }



    /**
     * Führt die Logout-Logik aus, indem die Sitzung mit dem angegebenen Token beendet wird.
     *
     * @param token Der Sitzungstoken des Benutzers.
     * @throws EntityNotFoundException Wenn keine aktive Sitzung mit dem angegebenen Token gefunden wird.
     */
    public void logout(String token) {
        LoginSession session = loginSessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new EntityNotFoundException("Session mit dem Token nicht gefunden."));

        session.setLogoutZeit(LocalDateTime.now());

        loginSessionRepository.delete(session);
    }

    /**
     * Konvertiert LoginSessionDto in LoginSession.
     *
     * @param loginSessionDto Die DTO-Objektdaten.
     * @return Die entsprechende LoginSession-Entität.
     */
    private LoginSession convertToEntity(LoginSessionDto loginSessionDto) {
        return modelMapper.map(loginSessionDto, LoginSession.class);
    }

    /**
     * Konvertiert LoginSession in LoginSessionDto.
     *
     * @param loginSession Die LoginSession-Entität.
     * @return Das entsprechende LoginSessionDto-Objekt.
     */
    private LoginSessionDto convertToDto(LoginSession loginSession) {
        return modelMapper.map(loginSession, LoginSessionDto.class);
    }

}


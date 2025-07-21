package org.Raumverwaltung.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.LoginSession;
import org.Raumverwaltung.Model.Rolle;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.LoginSessionRepository;
import org.Raumverwaltung.Repository.RolleRepository;
import org.Raumverwaltung.Transferobjects.BenutzerDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service-Klasse für die Verwaltung von Benutzern.
 * Diese Klasse bietet Funktionen zur Erstellung, Aktualisierung, Löschung und
 * Authentifizierung von Benutzern.
 */
@RequiredArgsConstructor
@Service
public class BenutzerService {

    @Autowired // TODO: is das notwendig wegen @RequiredArgsConstructor?
    private final BenutzerRepository benutzerRepository;
    private final ModelMapper modelMapper;
    private final RolleRepository rolleRepository;
    private final LoginSessionRepository loginSessionRepository;
    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;

    /**
     * Erstellt einen neuen Benutzer im System.
     *
     * @param benutzerDto das DTO-Objekt mit den Daten des neuen Benutzers.
     * @return das erstellte Benutzer-DTO.
     */
    public BenutzerDto create(BenutzerDto benutzerDto) {

        Rolle rolle = rolleRepository.findById(benutzerDto.getRolleId())
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + benutzerDto.getRolleId() + " nicht gefunden"));

        Benutzer entity = convertToEntity(benutzerDto);

        entity.setRolle(rolle);
        entity.setStatus(Benutzer.Status.passiv);

        if (entity.getPasswort() != null) {
            entity.setPasswort(passwordEncoder.encode(entity.getPasswort()));
        }

        String subject = "Erfolgreiche Registrierung";
        String body = "Gutan Tag " + benutzerDto.getVorname() + " " + benutzerDto.getNachname() + ", \n" +
                "" +
                "Sie haben sich erfolgreich in unserem System registriert. Ihr Konto ist derzeit noch passiv und Sie müssen warten, bis Sie " +
                "ein Admin freischaltet. \nWenn das geschen ist, werden Sie per Email darüber informiert.";

        emailService.sendSimpleEmail(benutzerDto.getEmail(), subject, body);

        return convertToDto(benutzerRepository.save(entity));
    }

    public BenutzerDto createMitRolle(BenutzerDto benutzerDto) {

        Rolle rolle = rolleRepository.findById(benutzerDto.getRolleId())
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + benutzerDto.getRolleId() + " nicht gefunden"));

        Benutzer entity = convertToEntity(benutzerDto);

        entity.setRolle(rolle);
        entity.setStatus(Benutzer.Status.aktiv);

        entity.setPasswort(passwordEncoder.encode("rolleTest1234!"));

        String subject = "Konto angelegt";
        String body = "Gutan Tag " + benutzerDto.getVorname() + " " + benutzerDto.getNachname() + ", \n" +
                "" +
                "Für Sie wurde durch einen Admin ein Account in unserem System angelegt. Damit Sie sich anmelden können, benutzen Sie bitte folgendes Passowrt: \n" +
                "rolleTest1234!\n" +
                "Wir bitten Sie, dieses nach erstmaliger Anmeldung zu ändern.";

        emailService.sendSimpleEmail(benutzerDto.getEmail(), subject, body);

        return convertToDto(benutzerRepository.save(entity));
    }

    /**
     * Löscht einen Benutzer anhand seiner ID.
     *
     * @param benutzerId die ID des Benutzers, der gelöscht werden soll.
     */
    public void delete(Long benutzerId) {
        benutzerRepository.deleteById(benutzerId);
    }

    /**
     * Ruft alle Benutzer aus der Datenbank ab.
     *
     * @return eine Liste von Benutzer-DTOs.
     */
    public List<BenutzerDto> getAllBenutzer() {
        return benutzerRepository.findAll().stream()
                .map(benutzer -> modelMapper.map(benutzer, BenutzerDto.class))
                .toList();
    }

    /**
     * Aktualisiert die Daten eines bestehenden Benutzers.
     *
     * @param benutzerDto die neuen Daten für den Benutzer.
     * @return das aktualisierte Benutzer-DTO.
     */
    public BenutzerDto update(BenutzerDto benutzerDto) {
        // Bestehenden Benutzer aus der Datenbank abrufen
        Benutzer existingBenutzer = benutzerRepository.findById(benutzerDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + benutzerDto.getId() + " nicht gefunden."));

        Rolle rolle = rolleRepository.findById(benutzerDto.getRolleId())
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + benutzerDto.getRolleId() + " nicht gefunden"));

        if (benutzerDto.getVorname() != null) {
            existingBenutzer.setVorname(benutzerDto.getVorname());
        }

        if (benutzerDto.getNachname() != null) {
            existingBenutzer.setNachname(benutzerDto.getNachname());
        }

        if (benutzerDto.getEmail() != null) {
            existingBenutzer.setEmail(benutzerDto.getEmail());
        }

        if (benutzerDto.getPasswort() != null) {
            String hashedPassword = passwordEncoder.encode(benutzerDto.getPasswort());
            existingBenutzer.setPasswort(hashedPassword);
        }
        
        if (benutzerDto.getRolleId() != null) {
            existingBenutzer.setRolle(rolle);
        }

        if (benutzerDto.getStatus() != null) {
            if((benutzerDto.getStatus() == Benutzer.Status.aktiv) && (existingBenutzer.getStatus() != Benutzer.Status.aktiv)){
                String subject = "Systemfreischaltung";
                String body = "Guten Tag " + existingBenutzer.getVorname() + " " + existingBenutzer.getNachname() + ", \n" +
                        "Ihr Konto wurde durch einen Admin freigeschalten. Sie können sich nun anmelden";
                emailService.sendSimpleEmail(existingBenutzer.getEmail(), subject, body);
            }
            existingBenutzer.setStatus(benutzerDto.getStatus());
        }

        return convertToDto(benutzerRepository.save(existingBenutzer));
    }

    public BenutzerDto getBySessionToken(String token) {

        LoginSession loginSession = loginSessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer mit Token nicht gefunden."));

        Benutzer benutzer = benutzerRepository.findById(loginSession.getBenutzer().getId())
                .orElseThrow(() -> new IllegalArgumentException("Venutzer mit ID " + loginSession.getBenutzer().getId() + " nicht gefunden."));

        return convertToDto(benutzer);
    }

    public BenutzerDto getByID(Long benutzerId) {
        Benutzer benutzer = benutzerRepository.findById(benutzerId)
                .orElseThrow(() -> new IllegalArgumentException("Venutzer mit ID " + benutzerId + " nicht gefunden."));
        return convertToDto(benutzer);
    }

    public List<BenutzerDto> getFacilityManagers() {
        Long facilityManagerRoleId = 4L;
        List<Benutzer> facilityManagers = benutzerRepository.findByRolleId(facilityManagerRoleId);
        return facilityManagers.stream()
                .map(this::convertToDto)
                .toList();
    }

    public void changePassword(Long id, String password){
        Benutzer existingBenutzer = benutzerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + id + " nicht gefunden."));

        if (password != null) {
            String hashedPassword = passwordEncoder.encode(password);
            existingBenutzer.setPasswort(hashedPassword);
        }

        benutzerRepository.save(existingBenutzer);
    }

    public BenutzerDto getByEmail(String email) {
        Benutzer benutzer = benutzerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer mit Email " + email + " nicht gefunden."));
        return convertToDto(benutzer);
    }

    /**
     * Konvertiert eine Benutzer-Entität in ein DTO.
     *
     * @param entity die Benutzer-Entität.
     * @return das entsprechende Benutzer-DTO.
     */
    private BenutzerDto convertToDto(Benutzer entity) {
        return modelMapper.map(entity, BenutzerDto.class);
    }

    /**
     * Konvertiert ein Benutzer-DTO in eine Entität.
     *
     * @param dto das Benutzer-DTO.
     * @return die entsprechende Benutzer-Entität.
     */
    private Benutzer convertToEntity(BenutzerDto dto) {
        return modelMapper.map(dto, Benutzer.class);
    }
}

package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Repository.LoginSessionRepository;
import org.Raumverwaltung.Service.BenutzerService;
import org.Raumverwaltung.Transferobjects.BenutzerDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/benutzer")
@RequiredArgsConstructor
public class BenutzerController {

    private final BenutzerService benutzerService;

    // POST: Erstellen eines neuen Benutzers
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public BenutzerDto create(@RequestBody BenutzerDto benutzerDto) {
        return benutzerService.create(benutzerDto);
    }

    // POST: FFA010
    @PostMapping("/createMitRolle")
    @ResponseStatus(HttpStatus.CREATED)
    public BenutzerDto createMitRolle(@RequestBody BenutzerDto benutzerDto) {
        return benutzerService.createMitRolle(benutzerDto);
    }

    // DELETE: Löschen eines Benutzers anhand der ID
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") Long id) {
        benutzerService.delete(id);
    }

    // PUT: Aktualisieren eines bestehenden Benutzers
    @PutMapping("/update")
    @ResponseStatus(HttpStatus.OK)
    public BenutzerDto update(@RequestBody BenutzerDto benutzerDto) {
        return benutzerService.update(benutzerDto);
    }

    // GET: Abrufen aller Benutzer
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<BenutzerDto> getAllBenutzer() {
        return benutzerService.getAllBenutzer();
    }

    @GetMapping()
    public BenutzerDto getBySessionToken(@RequestHeader("Authorization") String token) {
        return benutzerService.getBySessionToken(token);
    }

    @GetMapping("/{id}")
    public BenutzerDto getById(@PathVariable("id") Long id) {
        return benutzerService.getByID(id);
    }

    @GetMapping("/facilitymanagers")
    public List<BenutzerDto> getFacilityManagers() {
        return benutzerService.getFacilityManagers();
    }

    @PutMapping("/changePassword/{id}")
    public void changePassword(@PathVariable("id") Long id, @RequestBody String password){
        benutzerService.changePassword(id, password);
    }

    @GetMapping("/email")
    public BenutzerDto getByEmail(@RequestParam String email) {
        return benutzerService.getByEmail(email);
    }


}


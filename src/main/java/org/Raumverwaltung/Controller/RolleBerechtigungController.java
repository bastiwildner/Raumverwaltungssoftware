package org.Raumverwaltung.Controller;

import java.util.List;
import org.Raumverwaltung.Service.RolleBerechtigungService;
import org.Raumverwaltung.Transferobjects.RolleBerechtigungDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rolle-berechtigungen")
@RequiredArgsConstructor
public class RolleBerechtigungController {


    private final RolleBerechtigungService rolleBerechtigungService;

    /**
     * Gibt alle Rollen-Berechtigungs-Zuweisungen zurück.
     *
     * @return Eine Liste von Rollen-Berechtigungs-DTOs.
     */
    @GetMapping
    public ResponseEntity<List<RolleBerechtigungDto>> getAll() {
        List<RolleBerechtigungDto> zuweisungen = rolleBerechtigungService.getAll();
        return ResponseEntity.ok(zuweisungen);
    }

    /**
     * Gibt eine spezifische Rollen-Berechtigungs-Zuweisung anhand ihrer ID zurück.
     *
     * @param id Die ID der Rollen-Berechtigungs-Zuweisung.
     * @return Das Rollen-Berechtigungs-DTO.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RolleBerechtigungDto> getById(@PathVariable Long id) {
        RolleBerechtigungDto zuweisung = rolleBerechtigungService.getById(id);
        return ResponseEntity.ok(zuweisung);
    }

    /**
     * Erstellt eine neue Rollen-Berechtigungs-Zuweisung.
     *
     * @param dto Das DTO mit den Eigenschaften der Zuweisung.
     * @return Das erstellte Rollen-Berechtigungs-DTO.
     */
    @PostMapping
    public ResponseEntity<RolleBerechtigungDto> create(@Valid @RequestBody RolleBerechtigungDto dto) {
        RolleBerechtigungDto created = rolleBerechtigungService.create(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Aktualisiert eine bestehende Rollen-Berechtigungs-Zuweisung.
     *
     * @param id  Die ID der zu aktualisierenden Zuweisung.
     * @param dto Das aktualisierte DTO.
     * @return Das aktualisierte Rollen-Berechtigungs-DTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RolleBerechtigungDto> update(@PathVariable Long id, @Valid @RequestBody RolleBerechtigungDto dto) {
        RolleBerechtigungDto updated = rolleBerechtigungService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Löscht eine Rollen-Berechtigungs-Zuweisung.
     *
     * @param id Die ID der zu löschenden Zuweisung.
     * @return Eine Antwort ohne Inhalt.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rolleBerechtigungService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rolle/{id}")
    public List<String> getByRolle(@PathVariable Long id){
        return rolleBerechtigungService.getByRolle(id);
    }

}

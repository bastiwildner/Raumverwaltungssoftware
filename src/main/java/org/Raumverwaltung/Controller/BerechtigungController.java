package org.Raumverwaltung.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Service.BerechtigungService;
import org.Raumverwaltung.Transferobjects.BerechtigungDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/berechtigungen")
@RequiredArgsConstructor
public class BerechtigungController {

    private final BerechtigungService berechtigungService;

    /**
     * Gibt alle Berechtigungen zurück.
     *
     * @return Eine Liste von BerechtigungDtos.
     */
    @GetMapping
    public ResponseEntity<List<BerechtigungDto>> getAll() {
        return ResponseEntity.ok(berechtigungService.getAll());
    }

    /**
     * Gibt eine Berechtigung anhand ihrer ID zurück.
     *
     * @param id Die ID der Berechtigung.
     * @return Das BerechtigungDto.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BerechtigungDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(berechtigungService.getById(id));
    }

    /**
     * Erstellt eine neue Berechtigung.
     *
     * @param dto Das DTO mit den Eigenschaften der neuen Berechtigung.
     * @return Das erstellte BerechtigungDto.
     */
    @PostMapping
    public ResponseEntity<BerechtigungDto> create(@RequestBody @Valid BerechtigungDto dto) {
        return ResponseEntity.ok(berechtigungService.create(dto));
    }

    /**
     * Aktualisiert eine bestehende Berechtigung.
     *
     * @param id  Die ID der zu aktualisierenden Berechtigung.
     * @param dto Das DTO mit den neuen Eigenschaften.
     * @return Das aktualisierte BerechtigungDto.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BerechtigungDto> update(@PathVariable Long id, @RequestBody @Valid BerechtigungDto dto) {
        return ResponseEntity.ok(berechtigungService.update(id, dto));
    }

    /**
     * Löscht eine Berechtigung.
     *
     * @param id Die ID der zu löschenden Berechtigung.
     * @return Eine leere Antwort.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        berechtigungService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

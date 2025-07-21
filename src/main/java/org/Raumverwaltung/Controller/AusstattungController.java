package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Service.AusstattungService;
import org.Raumverwaltung.Transferobjects.AusstattungDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ausstattung")
@RequiredArgsConstructor
public class AusstattungController {

    private final AusstattungService ausstattungService;

    /**
     * Erstelle eine neue Ausstattung.
     */
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public AusstattungDto create(@RequestBody AusstattungDto ausstattungDto) {
        return ausstattungService.create(ausstattungDto);
    }

    /**
     * Aktualisiere eine bestehende Ausstattung.
     */
    @PutMapping("/{id}")
    public AusstattungDto update(@PathVariable Long id, @RequestBody AusstattungDto ausstattungDto) {
        return ausstattungService.update(id, ausstattungDto);
    }

    /**
     * Lösche eine Ausstattung anhand der ID.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ausstattungService.delete(id);
    }

    /**
     * Hole alle Ausstattungen eines Raumes.
     */
    @GetMapping("/raum/{raumId}")
    public List<AusstattungDto> findByRaumId(@PathVariable Long raumId) {
        return ausstattungService.findByRaumId(raumId);
    }

    /**
     * Füge eine Ausstattung zu einem Raum hinzu.
     */
    @PostMapping("/{raumId}/add")
    @ResponseStatus(HttpStatus.CREATED)
    public AusstattungDto addAusstattung(@PathVariable Long raumId, @RequestBody AusstattungDto ausstattungDto) {
        ausstattungDto.setRaumId(raumId);
        return ausstattungService.create(ausstattungDto);
    }

    /**
     * Aktualisiere mehrere Ausstattungen für einen Raum.
     */
    @PutMapping("/raum/{raumId}")
    @ResponseStatus(HttpStatus.OK)
    public void updateAusstattungForRoom(
        @PathVariable Long raumId,
        @RequestBody Map<String, Object> payload
    ) {
        List<Map<String, Object>> ausstattungList = (List<Map<String, Object>>) payload.get("ausstattung");
        List<Long> zuLoeschen = ((List<?>) payload.get("zuLoeschen"))
                .stream()
                .map(item -> Long.valueOf(item.toString()))
                .toList();

        ausstattungService.updateAusstattungForRoom(raumId, ausstattungList, zuLoeschen);
    }

    /**
     * Markiere eine Ausstattung als "funktionstüchtig".
     */
    @PutMapping("/{id}/funktionstuechtig")
    @ResponseStatus(HttpStatus.OK)
    public AusstattungDto markAsFunctional(@PathVariable Long id) {
        return ausstattungService.markAsFunctional(id);
    }

    /**
     * Markiere eine Ausstattung als "Ticket erstellt".
     */
    @PutMapping("/{id}/ticket-erstellt")
    @ResponseStatus(HttpStatus.OK)
    public AusstattungDto markAsTicketCreated(@PathVariable Long id) {
        return ausstattungService.markAsTicketCreated(id);
    }
}
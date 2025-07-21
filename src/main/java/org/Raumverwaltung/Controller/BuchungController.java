package org.Raumverwaltung.Controller;

import org.Raumverwaltung.Service.BuchungService;
import org.Raumverwaltung.Enum.SerienBuchungTyp;
import org.Raumverwaltung.Transferobjects.BenutzerDto;
import org.Raumverwaltung.Transferobjects.BuchungDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/buchungen")
public class BuchungController {

    private final BuchungService buchungService;

    public BuchungController(BuchungService buchungService) {
        this.buchungService = buchungService;
    }

    /**
     * GET-Methode: Ruft alle Buchungen eines bestimmten Benutzers ab.
     *
     * @param gebuchtVonId Die ID des Benutzers
     * @return Liste der Buchungen, die von diesem Benutzer gemacht wurden
     */
    @GetMapping("/benutzer/{gebuchtVonId}")
    public ResponseEntity<List<BuchungDto>> getBuchungenByGebuchtVon(@PathVariable Long gebuchtVonId) {
        try {
            List<BuchungDto> buchungen = buchungService.getBuchungenByGebuchtVon(gebuchtVonId);
            return ResponseEntity.ok(buchungen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * GET-Methode: Ruft alle Buchungen aus dem System ab.
     * @return Liste der Buchungen, die von diesem Benutzer gemacht wurden
     */
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<BuchungDto> getAllBenutzer() {
        return buchungService.getAlleBuchungen();
    }

    /**
     * GET-Methode: Ruft Buchungen eines Raums zwischen zwei Daten ab.
     *
     * @param raumId     Die ID des Raums
     * @param startDatum Startdatum (String)
     * @param endDatum   Enddatum (String)
     * @return Liste der Buchungen
     */
    @GetMapping("/{raumId}")
    public ResponseEntity<List<BuchungDto>> getBuchungen(
            @PathVariable Long raumId,
            @RequestParam String startDatum,
            @RequestParam String endDatum) {
        try {
            LocalDate start = LocalDate.parse(startDatum);
            LocalDate end = LocalDate.parse(endDatum);
            List<BuchungDto> buchungen = buchungService.getBuchungen(raumId, start, end);
            return ResponseEntity.ok(buchungen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * GET-Methode: Ruft Buchungen einer Kalenderwoche ab.
     *
     * @param kw  Kalenderwoche
     * @param jahr Jahr
     * @return Liste der Buchungen innerhalb einer ausgewählten Woche
     */
    @GetMapping("/kalenderwoche")
    public ResponseEntity<List<BuchungDto>> getKalenderwoche(@RequestParam int kw, @RequestParam int jahr) {
        try {
            WeekFields weekFields = WeekFields.of(Locale.getDefault());
            LocalDate start = LocalDate.of(jahr, 1, 1)
                    .with(weekFields.weekOfYear(), kw)
                    .with(weekFields.dayOfWeek(), 1); // Montag als erster Tag der Woche
            LocalDate end = start.plusDays(6); // Ende der Woche (Sonntag)

            List<BuchungDto> buchungen = buchungService.getWochenBuchungen(start, end);
            return ResponseEntity.ok(buchungen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * GET-Methode: Ruft alle Buchungen eines bestimmten Raums ab.
     *
     * @param raumId Die ID des Raums
     * @return Liste der Buchungen für den Raum
     */
    @GetMapping("/raum/{raumId}")
    public ResponseEntity<List<BuchungDto>> getBuchungenByRaum(@PathVariable Long raumId) {
        try {
            List<BuchungDto> buchungen = buchungService.getBuchungenByRaum(raumId);
            return ResponseEntity.ok(buchungen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * POST-Methode: Erstellt eine neue Buchung.
     *
     * @param buchungDto Die Daten der neuen Buchung
     * @return Die erstellte Buchung
     */
    @PostMapping
    public ResponseEntity<BuchungDto> createBuchung(@Valid @RequestBody BuchungDto buchungDto) {
        try {
            BuchungDto createdBuchung = buchungService.save(buchungDto, true);
            return ResponseEntity.status(201).body(createdBuchung); // 201 Created
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * PUT-Methode: Aktualisiert eine bestehende Buchung.
     *
     * @param buchungId  Die ID der zu aktualisierenden Buchung
     * @param buchungDto Die aktualisierten Daten der Buchung
     * @return Die aktualisierte Buchung
     */
    @PutMapping("/{buchungId}")
    public ResponseEntity<?> updateBuchung(
            @PathVariable Long buchungId,
            @Valid @RequestBody BuchungDto buchungDto) {
        try {
            BuchungDto updatedBuchung = buchungService.update(buchungId, buchungDto);
            return ResponseEntity.ok(updatedBuchung);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * DELETE-Methode: Löscht eine bestehende Buchung.
     *
     * @param buchungId Die ID der zu löschenden Buchung
     * @return Leere Antwort mit Status 204 (No Content)
     */
    @DeleteMapping("/{buchungId}")
    public ResponseEntity<Void> deleteBuchung(@PathVariable Long buchungId) {
        try {
            buchungService.delete(buchungId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    /**
     * POST-Methode: Erstellt eine Serienbuchung.
     *
     * @param buchungDto         Die Daten der Buchung
     * @param serienBuchungTyp   Der Typ der Serienbuchung
     * @param serieBis           Das Enddatum der Serie
     * @return Liste der erstellten Buchungen
     */
    @PostMapping("/serien")
    public ResponseEntity<List<BuchungDto>> createSerienBuchung(
            @Valid @RequestBody BuchungDto buchungDto,
            @RequestParam SerienBuchungTyp serienBuchungTyp,
            @RequestParam LocalDate serieBis) {
        try {
            List<BuchungDto> serienBuchungen = buchungService.saveSerienBuchung(buchungDto, serienBuchungTyp, serieBis);
            return ResponseEntity.status(201).body(serienBuchungen); // 201 Created
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
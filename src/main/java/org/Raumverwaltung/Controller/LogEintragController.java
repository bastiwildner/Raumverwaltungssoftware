package org.Raumverwaltung.Controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.Raumverwaltung.Model.LogEintrag;
import org.Raumverwaltung.Service.LogEintragService;
import org.Raumverwaltung.Transferobjects.LogEintragDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * REST-Controller für LogEinträge.
 * Stellt Endpunkte zum Abrufen von Log-Einträgen bereit, gefiltert nach Benutzer, Aktion oder Zeitraum.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/logeintraege")
public class LogEintragController {

    private final LogEintragService logEintragService;

    /**
     * Holt alle Log-Einträge für einen bestimmten Benutzer.
     *
     * @param benutzerId Die ID des Benutzers, dessen Log-Einträge abgerufen werden sollen.
     * @return ResponseEntity mit einer Liste von LogEintragDto-Objekten.
     */
    @GetMapping("/benutzer/{benutzerId}")
    public ResponseEntity<List<LogEintragDto>> getLogEintraegeForBenutzer(@PathVariable Long benutzerId) {
        return ResponseEntity.ok(
                logEintragService.holeLogEintraegeFuerBenutzer(benutzerId)
                        .stream()
                        .map(logEintragService::mapToDto)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Holt alle Log-Einträge für eine bestimmte Aktion.
     *
     * @param aktion Die Aktion, nach der gefiltert werden soll.
     * @return ResponseEntity mit einer Liste von LogEintragDto-Objekten.
     */
    @GetMapping("/aktion/{aktion}")
    public ResponseEntity<List<LogEintragDto>> getLogEintraegeForAktion(@PathVariable String aktion) {
        return ResponseEntity.ok(
                logEintragService.holeLogEintraegeFuerAktion(aktion)
                        .stream()
                        .map(logEintragService::mapToDto)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Holt alle Log-Einträge innerhalb eines bestimmten Zeitraums.
     *
     * @param start Startzeit im ISO 8601-Format (z. B. "2024-12-20T10:15:30").
     * @param end   Endzeit im ISO 8601-Format.
     * @return ResponseEntity mit einer Liste von LogEintragDto-Objekten.
     */
    @GetMapping("/zeitraum")
    public ResponseEntity<List<LogEintragDto>> getLogEintraegeImZeitraum(
            @RequestParam String start, @RequestParam String end) {

        LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_DATE_TIME);
        LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_DATE_TIME);

        return ResponseEntity.ok(
                logEintragService.holeLogEintraegeImZeitraum(startDateTime, endDateTime)
                        .stream()
                        .map(logEintragService::mapToDto)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Holt die Log-Einträge der letzten 30 Tage.
     *
     * @return ResponseEntity mit einer Liste von LogEintragDto-Objekten.
     */
    @GetMapping("/letzte30tage")
    public ResponseEntity<List<LogEintragDto>> getLogEintraegeLetzte30Tage() {
        return ResponseEntity.ok(
                logEintragService.holeLogEintraegeLetzte30Tage()
                        .stream()
                        .map(logEintragService::mapToDto)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Exportiert die gefilterten Logeinträge als CSV-Datei.
     *
     * @param start Startzeit im ISO 8601-Format (z. B. "2024-12-20T10:15:30").
     * @param end   Endzeit im ISO 8601-Format.
     * @return ResponseEntity mit der CSV-Datei.
     * @throws IOException falls ein Fehler beim Export auftritt.
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportiereLogEintraegeAlsCsv(
            @RequestParam String start, @RequestParam String end) throws IOException {

        LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_DATE_TIME);
        LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_DATE_TIME);

        List<LogEintrag> logEintraege = logEintragService.holeLogEintraegeImZeitraum(startDateTime, endDateTime);

        byte[] csvData = logEintragService.exportiereLogEintraegeAlsCsv(logEintraege);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=logeintraege.csv");
        headers.add("Content-Type", "text/csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    /**
     * Protokolliert eine Aktion, die von einem Benutzer ausgeführt wurde.
     *
     * @param benutzerId Die ID des Benutzers, der die Aktion ausgeführt hat.
     * @param aktion     Beschreibung der ausgeführten Aktion.
     * @param details    Zusätzliche Details zur Aktion.
     * @return ResponseEntity mit dem Status der Protokollierung.
     */
    @PostMapping("/protokolliere")
    public ResponseEntity<Void> protokolliereAktion(
            @RequestParam Long benutzerId,
            @RequestParam String aktion,
            @RequestParam String details) {

        logEintragService.protokolliereAktion(benutzerId, aktion, details);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Holt alle Log-Einträge.
     *
     * @return ResponseEntity mit einer Liste von LogEintragDto-Objekten.
     */
    @GetMapping("/alle")
    public ResponseEntity<List<LogEintragDto>> getAlleLogEintraege() {
        return ResponseEntity.ok(
                logEintragService.holeAlleLogEintraege()
                        .stream()
                        .map(logEintragService::mapToDto)
                        .collect(Collectors.toList())
        );
    }

}
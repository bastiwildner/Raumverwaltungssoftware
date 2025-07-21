package org.Raumverwaltung.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.LogEintrag;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.LogEintragRepository;
import org.Raumverwaltung.Transferobjects.LogEintragDto;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LogEintragService {

    private final LogEintragRepository logEintragRepository;
    private final BenutzerRepository benutzerRepository;

    /**
     * Protokolliert eine Aktion, die von einem Benutzer ausgeführt wurde.
     *
     * @param benutzerId Die ID des Benutzers, der die Aktion ausgeführt hat.
     * @param aktion Beschreibung der ausgeführten Aktion.
     * @param details Zusätzliche Details zur Aktion.
     */
    public void protokolliereAktion(Long benutzerId, String aktion, String details) {
        Benutzer benutzer = benutzerRepository.findById(benutzerId)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer mit ID " + benutzerId + " nicht gefunden."));

        LogEintrag logEintrag = new LogEintrag();
        logEintrag.setBenutzer(benutzer);
        logEintrag.setAktion(aktion);
        logEintrag.setDetails(details);

        logEintragRepository.save(logEintrag);
    }

    /**
     * Holt alle Log-Einträge.
     *
     * @return Liste aller Log-Einträge.
     */
    public List<LogEintrag> holeAlleLogEintraege() {
        return logEintragRepository.findAll();
    }

    /**
     * Holt alle Log-Einträge für einen bestimmten Benutzer.
     *
     * @param benutzerId Die ID des Benutzers.
     * @return Liste der Log-Einträge für den Benutzer.
     */
    public List<LogEintrag> holeLogEintraegeFuerBenutzer(Long benutzerId) {
        return logEintragRepository.findByBenutzerId(benutzerId);
    }

    /**
     * Holt alle Log-Einträge für eine bestimmte Aktion.
     *
     * @param aktion Die Beschreibung der Aktion.
     * @return Liste der Log-Einträge für die Aktion.
     */
    public List<LogEintrag> holeLogEintraegeFuerAktion(String aktion) {
        return logEintragRepository.findByAktion(aktion);
    }

    /**
     * Holt alle Log-Einträge innerhalb eines bestimmten Zeitraums.
     *
     * @param start Start des Zeitraums.
     * @param end Ende des Zeitraums.
     * @return Liste der Log-Einträge innerhalb des Zeitraums.
     */
    public List<LogEintrag> holeLogEintraegeImZeitraum(LocalDateTime start, LocalDateTime end) {
        return logEintragRepository.findByZeitstempelBetween(start, end);
    }

    /**
     * Konvertiert ein LogEintrag-Objekt in ein LogEintragDto.
     *
     * @param logEintrag Das LogEintrag-Objekt.
     * @return Das entsprechende LogEintragDto.
     */
    public LogEintragDto mapToDto(LogEintrag logEintrag) {
        return LogEintragDto.builder()
                .id(logEintrag.getId())
                .benutzerId(logEintrag.getBenutzer().getId())
                .aktion(logEintrag.getAktion())
                .zeitstempel(LocalDateTime.parse(logEintrag.getZeitstempel().toString()))
                .details(logEintrag.getDetails())
                .build();
    }

    /**
     * Holt die Log-Einträge der letzten 30 Tage in absteigender Reihenfolge.
     *
     * @return Liste der Log-Einträge der letzten 30 Tage.
     */
    public List<LogEintrag> holeLogEintraegeLetzte30Tage() {
        LocalDateTime vor30Tagen = LocalDateTime.now().minusDays(30);
        return logEintragRepository.findLogEintraegeLetzte30Tage(vor30Tagen);
    }

    /**
     * Exportiert die Logeinträge als CSV.
     *
     * @param logEintraege Die Liste der Logeinträge.
     * @return CSV als Byte-Array.
     */
    public byte[] exportiereLogEintraegeAlsCsv(List<LogEintrag> logEintraege) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
            // CSV-Header
            writer.write("ID,Benutzer ID,Aktion,Zeitstempel,Details\n");

            // CSV-Daten
            for (LogEintrag logEintrag : logEintraege) {
                writer.write(String.format("%d,%d,%s,%s,%s\n",
                        logEintrag.getId(),
                        logEintrag.getBenutzer().getId(),
                        logEintrag.getAktion(),
                        logEintrag.getZeitstempel(),
                        logEintrag.getDetails()));
            }
        }

        return outputStream.toByteArray();
    }
}

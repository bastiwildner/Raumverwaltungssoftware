package org.Raumverwaltung.Transferobjects;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.Raumverwaltung.Enum.Wochentag;

@Data
public class OeffnungszeitenDto {

    private Long id;

    @NotNull(message = "Gebäude-ID darf nicht null sein.")
    private Long gebaeudeId;

    @NotNull(message = "Der Tag darf nicht null sein.")
    private Wochentag tag;

    @NotNull(message = "Öffnungszeit darf nicht null sein.")
    private LocalTime oeffnungszeit;

    @NotNull(message = "Schließzeit darf nicht null sein.")
    private LocalTime schliesszeit;

    private Long erstelltVonId;

    private LocalDateTime letzteAenderung;
}
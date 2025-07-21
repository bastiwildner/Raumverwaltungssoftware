package org.Raumverwaltung.Transferobjects;

import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.Raumverwaltung.Enum.Wochentag;

@Data
public class BackupDto {
    private Long id;
    @NotBlank(message = "Datum erstellt darf nicht leer sein.")
    private LocalDateTime datumErstellt;
    @NotBlank(message = "Speicherort darf nicht leer sein.")
    private String speicherort;
    @NotBlank(message = "Groesse darf nicht leer sein.")
    private int groesse;
    @NotBlank(message = "Der Benutzer hat keine ID.")
    private Long erstelltVonId;
    private Wochentag wochentag;
    private LocalTime zeitpunkt;
}
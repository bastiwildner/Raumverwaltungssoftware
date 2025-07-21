package org.Raumverwaltung.Transferobjects;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.Raumverwaltung.Enum.EventTyp;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class BuchungDto {
    private Long id;
    private Long raumId;
    private LocalDate datum;
    private LocalTime beginn;
    private LocalTime ende;
    private Long gebuchtVonId;
    private EventTyp eventTyp;
    private String betreff; // Neues Betreff-Feld hinzugefügt

    public BuchungDto(){}
}
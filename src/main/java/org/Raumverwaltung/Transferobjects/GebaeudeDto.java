package org.Raumverwaltung.Transferobjects;

import lombok.Data;
import org.Raumverwaltung.Model.Benutzer;

@Data
public class GebaeudeDto {
    private Long id;
    private String name;
    private String strasse;
    private String hausnummer;
    private int plz;
    private String stadt;
    private String land;
    private Long schluesselId;
    private Long verwaltetVonId;
    private Benutzer verwaltetVon;
}

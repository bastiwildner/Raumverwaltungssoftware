package org.Raumverwaltung.Transferobjects;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RaumDto {

    private Long id;

    @NotNull(message = "Gebäude-ID darf nicht null sein.")
    private Long gebaeudeId;

    @NotBlank(message = "Der Name des Raums darf nicht leer sein.")
    @Size(max = 100, message = "Der Name des Raums darf maximal 100 Zeichen lang sein.")
    private String name;

    @Min(value = 1, message = "Die Kapazität muss mindestens 1 betragen.")
    private int kapazitaet;

    @Min(value = 1, message = "Die Größe muss mindestens 1 m² betragen.")
    private double groesse;

    @NotBlank(message = "Der Raumtyp darf nicht leer sein.")
    private String typ;

    private List<String> ausstattung;

}
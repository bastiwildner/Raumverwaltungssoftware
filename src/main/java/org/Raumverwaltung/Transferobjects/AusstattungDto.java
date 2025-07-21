package org.Raumverwaltung.Transferobjects;

import org.Raumverwaltung.Enum.Status;
import org.Raumverwaltung.Model.Ausstattung;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AusstattungDto {

    private Long id;

    @NotNull(message = "Die Raum-ID darf nicht leer sein.")
    private Long raumId;

    @NotBlank(message = "Die Bezeichnung der Ausstattung darf nicht leer sein.")
    private String bezeichnung;

    private String beschreibung;

    private Status status;
}
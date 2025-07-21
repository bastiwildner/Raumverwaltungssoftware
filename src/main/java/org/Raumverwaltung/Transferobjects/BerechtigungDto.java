package org.Raumverwaltung.Transferobjects;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;


@Data
public class BerechtigungDto {
    private Long id;
    @NotBlank(message = "Der Name der Berechtigung darf nicht leer sein.")
    private String name;
    @NotBlank(message = "Die Beschreibung der Berechtigung darf nicht leer sein.")
    private String beschreibung;
}
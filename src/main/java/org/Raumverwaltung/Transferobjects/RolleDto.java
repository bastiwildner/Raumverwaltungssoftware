package org.Raumverwaltung.Transferobjects;

import lombok.Data;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;



@Data
public class RolleDto{

        private Long id;
    
        @NotBlank(message = "Der Name der Rolle darf nicht leer sein.")
        @Size(max = 100, message = "Der Name der Rolle darf maximal 100 Zeichen lang sein.")
        private String name;
    
        @NotBlank(message = "Die Beschreibung der Rolle darf nicht leer sein.")
        @Size(max = 255, message = "Die Beschreibung der Rolle darf maximal 255 Zeichen lang sein.")
        private String beschreibung;
}
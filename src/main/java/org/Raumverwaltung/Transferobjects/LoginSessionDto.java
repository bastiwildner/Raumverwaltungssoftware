package org.Raumverwaltung.Transferobjects;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;
import org.Raumverwaltung.Model.Benutzer;

import java.time.LocalDateTime;
@Data
public class LoginSessionDto {

    private Long id;

    @NotNull(message = "Der Benutzer darf nicht null sein.")
    @Valid
    private Benutzer benutzer;

    @NotNull(message = "Die Login-Zeit darf nicht null sein.")
    private LocalDateTime loginZeit;

    private LocalDateTime logoutZeit;

    @NotNull(message = "Der Session Token darf nicht null sein.")
    private String sessionToken;

}

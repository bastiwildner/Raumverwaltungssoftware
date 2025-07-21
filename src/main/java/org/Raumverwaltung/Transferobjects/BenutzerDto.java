package org.Raumverwaltung.Transferobjects;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.Rolle;

@Getter
@Setter
@Data
public class BenutzerDto {

    private Long id;

    @NotBlank(message = "Vorname darf nicht Leer sein")
    @Pattern(regexp = "^[a-zA-ZäöüÄÖÜß]+$",
            message = "Vorname darf keine Zahlen oder Sonderzeichen enthalten")
    private String vorname;

    @NotBlank(message = "Nachname darf nicht Leer sein")
    @Pattern(regexp = "^[a-zA-ZäöüÄÖÜß]+$",
            message = "Nachname darf keine Zahlen oder Sonderzeichen enthalten")
    private String nachname;

    @NotBlank(message = "E-Mail darf nicht Leer sein")
    @Email(regexp = "^[a-zA-ZäöüÄÖÜß]+$",message = "Vorname darf keine Zahlen oder Sonderzeichen enthalten")
    private String email;

    @NotBlank(message = "Passwort darf nicht Leer sein")
    @Size(max = 24, message = "Das Passwort darf maximal 24 Zeichen enthalten")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
            message = "Das Passwort muss sich aus mindestens acht Zeichen, einer Zahl und einem Sonderzeichen zusammensetzen")
    private String passwort;

    private Benutzer.Status status;
    
    
    private Rolle rolle;
    private Long rolleId;
}

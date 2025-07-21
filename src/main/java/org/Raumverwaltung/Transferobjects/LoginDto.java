package org.Raumverwaltung.Transferobjects;

import lombok.Data;

@Data
public class LoginDto {
    private String email;
    private String passwort;
    private String sessionToken;
}

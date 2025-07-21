package org.Raumverwaltung.Transferobjects;


import lombok.Data;

@Data
public class RolleBerechtigungDto {
    private Long id;
    
    private Long rolleId;
    
    private Long berechtigungId;
}
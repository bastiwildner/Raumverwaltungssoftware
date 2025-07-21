package org.Raumverwaltung.Transferobjects;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LogEintragDto {
    private Long id;
    private Long benutzerId;
    private String aktion;
    private LocalDateTime zeitstempel;
    private String details;
}

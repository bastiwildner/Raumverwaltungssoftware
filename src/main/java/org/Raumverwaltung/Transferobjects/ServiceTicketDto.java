package org.Raumverwaltung.Transferobjects;

import lombok.Data;
import org.Raumverwaltung.Enum.Prioritaet;
import org.Raumverwaltung.Enum.StatusServiceTicket;
import org.Raumverwaltung.Enum.Grund;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ServiceTicketDto {
    private Long id;

    @NotNull(message = "Betreff darf nicht null sein.")
    private String betreff;

    @NotNull(message = "Grund darf nicht null sein.")
    private Grund grund;

    @NotNull(message = "Priorität darf nicht null sein.")
    private Prioritaet prioritaet;

    private String beschreibung;

    @NotNull(message = "Ausstattung-ID darf nicht null sein.")
    private Long ausstattungId;

    @NotNull(message = "Erstellt von-ID darf nicht null sein.")
    private Long erstelltVonId;

    @NotNull(message = "Zuständiger-ID darf nicht null sein.")
    private Long zustaendigerId;

    private StatusServiceTicket status;
    private LocalDateTime datumErstellt;
}
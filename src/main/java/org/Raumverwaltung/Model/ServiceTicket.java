package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.Raumverwaltung.Enum.Grund;
import org.Raumverwaltung.Enum.Prioritaet;
import org.Raumverwaltung.Enum.StatusServiceTicket;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ServiceTicket")
public class ServiceTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "zustaendiger")
    private Benutzer zustaendiger;

    @ManyToOne
    @JoinColumn(name = "ausstattung_ID")
    private Ausstattung ausstattung;

    @ManyToOne
    @JoinColumn(name = "erstellt_Von")
    private Benutzer erstelltVon;

    private String betreff;

    @Enumerated(EnumType.STRING)
    private Grund grund;

    private String beschreibung;
    private LocalDateTime datumErstellt;

    @Enumerated(EnumType.STRING)
    private StatusServiceTicket status;

    @Enumerated(EnumType.STRING)
    private Prioritaet prioritaet;
}
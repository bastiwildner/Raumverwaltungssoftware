package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.Raumverwaltung.Enum.EventTyp;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "Buchung")
public class Buchung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "raum_id", nullable = false)
    private Raum raum;

    @ManyToOne
    @JoinColumn(name = "gebucht_von", nullable = false)
    private Benutzer gebuchtVon;

    @Enumerated(EnumType.STRING)
    private EventTyp eventtyp;

    private LocalDate datum;
    private LocalTime beginn;
    private LocalTime ende;

    private String betreff;

}

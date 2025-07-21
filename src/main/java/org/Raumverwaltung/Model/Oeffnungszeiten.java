package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.Raumverwaltung.Enum.Wochentag;

@Data
@Entity
@Table(name = "Oeffnungszeiten")
public class Oeffnungszeiten {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = false, updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "gebaeude_id", nullable = false)
    private Gebaeude gebaeude;

    @Enumerated(EnumType.STRING)
    private Wochentag tag;

    private LocalTime oeffnungszeit;
    private LocalTime schliesszeit;

    @ManyToOne
    @JoinColumn(name = "erstellt_von")
    private Benutzer erstelltVon;

    @Column(name = "letzte_aenderung")
    private LocalDateTime letzteAenderung;

    @PrePersist
    protected void onCreate() {
        letzteAenderung = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        letzteAenderung = LocalDateTime.now();
    }
}
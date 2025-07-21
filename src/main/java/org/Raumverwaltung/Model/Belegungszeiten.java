package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Belegungszeiten")
public class Belegungszeiten {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private Raum raum;

    private LocalDateTime beginn;
    private LocalDateTime ende;

    @ManyToOne
    @JoinColumn(name = "gebucht_von")
    private Benutzer gebuchtVon;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        BESTAETIGT, AUSSTEHEND, ABGESAGT
    }

}

package org.Raumverwaltung.Model;

import org.Raumverwaltung.Enum.Status;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Ausstattung")
public class Ausstattung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "raum_id", nullable = false)
    private Raum raum;

    @Column(nullable = false, length = 100)
    private String bezeichnung;

    private String beschreibung;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}


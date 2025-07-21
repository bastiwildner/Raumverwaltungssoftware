package org.Raumverwaltung.Model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Raum")
public class Raum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "gebaeude_id", nullable = false)
    private Gebaeude gebaeude;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int kapazitaet;

    @Column(nullable = false)
    private double groesse;

    @Column(name = "raumtyp", nullable = true)
    private String typ;

    @OneToMany(mappedBy = "raum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ausstattung> ausstattungen;
}
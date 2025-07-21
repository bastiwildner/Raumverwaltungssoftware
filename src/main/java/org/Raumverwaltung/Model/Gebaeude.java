package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Data
@Table(name = "Gebaeude")
public class Gebaeude {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    private String name;
    private String strasse;
    private String hausnummer;
    private int plz;
    private String stadt;
    private String land;

    @ManyToOne
    @JoinColumn(name = "verwaltet_von")
    private Benutzer verwaltetVon;

}

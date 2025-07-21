package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Backup")
public class Backup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    private LocalDateTime datumErstellt;
    private String speicherort;
    private int groesse;

    @ManyToOne
    @JoinColumn(name = "erstellt_von")
    private Benutzer erstelltVon;
}

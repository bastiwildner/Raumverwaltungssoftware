package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Rolle")
public class Rolle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    private String name;
    private String beschreibung;

}

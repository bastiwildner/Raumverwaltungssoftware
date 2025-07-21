package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Getter
@Setter
@Table(name = "Benutzer")
public class Benutzer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    private String vorname;
    private String nachname;
    private String email;
    private String passwort;



    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "rolle_id", referencedColumnName = "id")
    private Rolle rolle;

    public enum Status {
        passiv, aktiv, gesperrt
    }


}

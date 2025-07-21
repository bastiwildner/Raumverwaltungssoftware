package org.Raumverwaltung.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
@Entity
@Table(name = "LogEintrag")
public class LogEintrag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = false, updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "benutzer_id", nullable = false)
    private Benutzer benutzer;

    @NotEmpty
    @Column(nullable = false, length = 255)
    private String aktion;

    @Column(nullable = false, columnDefinition = "datetime")
    private LocalDateTime zeitstempel;

    @NotEmpty
    @Column(length = 255)
    private String details;

    @PrePersist
    protected void onCreate() {
        this.zeitstempel = LocalDateTime.now();
    }
}
 
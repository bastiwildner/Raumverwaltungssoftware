package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "LoginSession")
public class LoginSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable=false, updatable=false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "benutzer_id", nullable = false)
    private Benutzer benutzer;

    @Column(name = "login_zeit")
    private LocalDateTime loginZeit;
    @Column(name = "logout_zeit")
    private LocalDateTime logoutZeit;
    @Column(name = "session_token")
    private String sessionToken;
}

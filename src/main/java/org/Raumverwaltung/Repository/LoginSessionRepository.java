package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository-Schnittstelle für die Verwaltung von Login-Sitzungen.
 * Ermöglicht CRUD-Operationen und benutzerdefinierte Abfragen auf der LoginSession-Entität.
 */
@Repository
public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {

    /**
     * Findet eine Login-Sitzung anhand ihres Tokens.
     *
     * @param sessionToken Der Session-Token.
     * @return Optional<LoginSession>, wenn eine Sitzung mit dem angegebenen Token gefunden wurde.
     */
    Optional<LoginSession> findBySessionToken(String sessionToken);
}


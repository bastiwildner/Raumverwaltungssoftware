package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.RolleBerechtigung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolleBerechtigungRepository extends JpaRepository<RolleBerechtigung, Long> {
    /**
     * Findet alle Zuweisungen basierend auf der ID einer Rolle.
     *
     * @param rolleId Die ID der Rolle.
     * @return Eine Liste von Rollen-Berechtigungs-Zuweisungen.
     */
    List<RolleBerechtigung> findByRolle_Id(Long rolleId);
}

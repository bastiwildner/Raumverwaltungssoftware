package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.LogEintrag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEintragRepository extends JpaRepository<LogEintrag, Long> {

    /**
     * Holt Log-Einträge basierend auf der Benutzer-ID.
     *
     * @param benutzerId Die ID des Benutzers.
     * @return Liste der Log-Einträge des Benutzers.
     */
    @Query("SELECT l FROM LogEintrag l WHERE l.benutzer.id = :benutzerId")
    List<LogEintrag> findByBenutzerId(@Param("benutzerId") Long benutzerId);

    /**
     * Holt Log-Einträge innerhalb eines Zeitraums.
     *
     * @param start Startzeitpunkt.
     * @param end   Endzeitpunkt.
     * @return Liste der Log-Einträge im Zeitraum.
     */
    @Query("SELECT l FROM LogEintrag l WHERE l.zeitstempel BETWEEN :start AND :end")
    List<LogEintrag> findByZeitstempelBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Holt Log-Einträge basierend auf der Aktion.
     *
     * @param aktion Die Beschreibung der Aktion.
     * @return Liste der Log-Einträge mit der Aktion.
     */
    @Query("SELECT l FROM LogEintrag l WHERE l.aktion = :aktion")
    List<LogEintrag> findByAktion(@Param("aktion") String aktion);

    /**
     * Holt Log-Einträge der letzten 30 Tage in absteigender Reihenfolge.
     *
     * @return Liste der Log-Einträge der letzten 30 Tage.
     */
    @Query("SELECT l FROM LogEintrag l WHERE l.zeitstempel >= :start ORDER BY l.zeitstempel DESC")
    List<LogEintrag> findLogEintraegeLetzte30Tage(@Param("start") LocalDateTime start);

}

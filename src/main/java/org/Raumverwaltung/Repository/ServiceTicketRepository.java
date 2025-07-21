package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Ausstattung;
import org.Raumverwaltung.Model.ServiceTicket;
import org.Raumverwaltung.Enum.StatusServiceTicket;
import org.Raumverwaltung.Enum.Prioritaet;
import org.Raumverwaltung.Transferobjects.AusstattungDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {

    /**
     * Suche nach Service-Tickets basierend auf optionalen Kriterien:
     * Betreff, Status und Priorität.
     * - Der Betreff wird als Teilstring (LIKE) gesucht.
     * - Status filtert nach einem bestimmten Status.
     * - Priorität filtert nach einer bestimmten Priorität.
     *
     * @param betreff Der (optionale) Betreff des Tickets
     * @param status Der (optionale) Status des Tickets
     * @param prioritaet Die (optionale) Priorität des Tickets
     * @return Eine Liste von Tickets, die den Kriterien entsprechen
     */
    @Query("SELECT t FROM ServiceTicket t " +
            "WHERE (:betreff IS NULL OR t.betreff LIKE CONCAT('%', :betreff, '%')) " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:prioritaet IS NULL OR t.prioritaet = :prioritaet)")
    List<ServiceTicket> search(
        @Param("betreff") String betreff,
        @Param("status") StatusServiceTicket status,
        @Param("prioritaet") Prioritaet prioritaet
    );

    /**
     * Findet alle Service-Tickets, die mit einem bestimmten Raum verknüpft sind.
     *
     * @param raumId Die ID des Raums
     * @return Eine Liste von Service-Tickets, die mit dem Raum verknüpft sind
     */
    @Query("SELECT t FROM ServiceTicket t WHERE t.ausstattung.raum.id = :raumId")
    List<ServiceTicket> findByAusstattungRaumId(@Param("raumId") Long raumId);

    @Query("SELECT t FROM ServiceTicket t WHERE t.ausstattung.id = :ausstattungId")
    List<ServiceTicket> findByAusstattungId(Long ausstattungId);
}

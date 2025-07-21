package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Raum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaumRepository extends JpaRepository<Raum, Long> {
    /**
     * Findet alle Räume, die zu einem bestimmten Gebäude gehören.
     *
     * @param gebaeudeId Die ID des Gebäudes
     * @return Eine Liste von Räumen, die dem Gebäude zugeordnet sind
     */
    List<Raum> findByGebaeudeId(Long gebaeudeId);

    /**
     * Suche nach Räumen basierend auf optionalen Kriterien: Name, Mindestkapazität und Ausstattung.
     * - Der Name wird als Teilstring (LIKE) gesucht.
     * - Mindestkapazität filtert Räume mit gleich großer oder höherer Kapazität.
     * - Ausstattung filtert Räume, die die gewünschte Ausstattung besitzen.
     *
     * @param name Der (optionale) Name des Raumes
     * @param minKapazitaet Die (optionale) Mindestkapazität
     * @param ausstattung Die (optionale) Ausstattung
     * @return Eine Liste von Räumen, die den Kriterien entsprechen
     */
    @Query("SELECT r FROM Raum r " +
            "WHERE (:name IS NULL OR r.name LIKE CONCAT('%', :name, '%')) " +
            "AND (:minKapazitaet IS NULL OR r.kapazitaet >= :minKapazitaet) " +
            "AND (:ausstattung IS NULL OR EXISTS " +
            "(SELECT a FROM Ausstattung a WHERE a.raum.id = r.id AND a.bezeichnung = :ausstattung))")    
    List<Raum> search(
        @Param("name") String name, 
        @Param("minKapazitaet") Integer minKapazitaet, 
        @Param("ausstattung") String ausstattung
    );
}
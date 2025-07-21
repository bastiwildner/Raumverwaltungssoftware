package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Buchung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Repository
public interface BuchungRepository extends JpaRepository<Buchung, Long> {
    // Findet alle Buchungen für einen bestimmten Raum innerhalb eines Datumsbereichs
    List<Buchung> findByRaum_IdAndDatumBetween(Long raumId, LocalDate startDatum, LocalDate endDatum);

    // Findet alle Buchungen für einen bestimmten Raum an einem bestimmten Datum
    List<Buchung> findByRaum_IdAndDatum(Long raumId, LocalDate datum);

    // Findet alle Buchungen für eine bestimmte Person (gebuchtVonId)
    List<Buchung> findByGebuchtVonId(Long gebuchtVonId);

    // Findet alle Buchungen für einen bestimmten Raum (Raum-ID)
    List<Buchung> findByRaum_Id(Long raumId);

    // Findet alle Buchungen innerhalb eines bestimmten Datumsbereichs (über alle Räume hinweg)
    List<Buchung> findByDatumBetween(LocalDate start, LocalDate end);
}
package org.Raumverwaltung.Repository;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import org.Raumverwaltung.Enum.Wochentag;
import org.Raumverwaltung.Model.Gebaeude;
import org.Raumverwaltung.Model.Oeffnungszeiten;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OeffnungszeitenRepository extends JpaRepository<Oeffnungszeiten, Long> {
    List<Oeffnungszeiten> findByGebaeudeId(Long gebaeudeId); // Suche nach Öffnungszeiten eines Gebäudes

    Oeffnungszeiten findByGebaeudeIdAndTag(Long id, @NotNull(message = "Der Tag darf nicht null sein.") Wochentag tag);
}
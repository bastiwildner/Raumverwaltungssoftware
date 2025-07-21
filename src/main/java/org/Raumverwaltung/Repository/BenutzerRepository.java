package org.Raumverwaltung.Repository;
import java.util.List;
import java.util.Optional;

import org.Raumverwaltung.Model.Benutzer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BenutzerRepository extends JpaRepository<Benutzer, Long> {
    Optional<Benutzer> findByEmail(String email);

    List<Benutzer> findByRolleId(Long rolleId);
}

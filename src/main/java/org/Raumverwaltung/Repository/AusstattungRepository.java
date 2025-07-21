package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Ausstattung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AusstattungRepository extends JpaRepository<Ausstattung, Long> {
    List<Ausstattung> findByRaumId(Long raumId);
}
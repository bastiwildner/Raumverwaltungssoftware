package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Gebaeude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GebaeudeRepository extends JpaRepository<Gebaeude, Long> {
}

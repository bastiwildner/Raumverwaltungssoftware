package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Berechtigung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BerechtigungRepository extends JpaRepository<Berechtigung, Long> {
}

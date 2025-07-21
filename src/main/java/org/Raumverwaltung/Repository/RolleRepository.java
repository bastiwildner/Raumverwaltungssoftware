package org.Raumverwaltung.Repository;

import java.util.List;
import java.util.Optional;

import org.Raumverwaltung.Model.Rolle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RolleRepository extends JpaRepository<Rolle, Long> {
    @Query("SELECT r FROM Rolle r WHERE (:name IS NULL OR r.name LIKE %:name%) AND (:beschreibung IS NULL OR r.beschreibung LIKE %:beschreibung%)")
    List<Rolle> search(@Param("name") String name, @Param("beschreibung") String beschreibung);
}

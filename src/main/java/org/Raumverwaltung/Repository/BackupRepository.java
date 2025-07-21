package org.Raumverwaltung.Repository;

import org.Raumverwaltung.Model.Backup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackupRepository extends JpaRepository<Backup, Long> {
}
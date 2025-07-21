package org.Raumverwaltung.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import org.Raumverwaltung.Enum.Wochentag;
import org.Raumverwaltung.Model.Backup;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Repository.BackupRepository;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Transferobjects.BackupDto;
import org.modelmapper.ModelMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.smattme.MysqlExportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BackupService {
    private final BackupRepository backupRepository;
    private final BenutzerRepository benutzerRepository;
    private final ModelMapper modelMapper;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


    @Async
    public BackupDto scheduleBackup(BackupDto backupDto) {
        LocalDateTime executionTime = calculateNextExecutionTime(backupDto.getWochentag(), backupDto.getZeitpunkt());

        AtomicReference<BackupDto> result = new AtomicReference<>();
        long delay = Duration.between(LocalDateTime.now(), executionTime).getSeconds();

        System.out.println("Backup wird geplant für " + executionTime + " (in " + delay + " Sekunden)");

        scheduler.schedule(() -> {
            result.set(createBackup(backupDto));
        }, delay, TimeUnit.SECONDS);
        return result.get();
    }

    private LocalDateTime calculateNextExecutionTime(Wochentag wochentag, LocalTime uhrzeit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetDateTime = now.with(TemporalAdjusters.nextOrSame(Wochentag.mapToDayOfWeek(wochentag))).with(uhrzeit);

        if (targetDateTime.isBefore(now)) {
            targetDateTime = targetDateTime.plusWeeks(1);
        }

        return targetDateTime;
    }

    public BackupDto createBackup(BackupDto backupDto) {
        Benutzer erstelltVon = benutzerRepository.findById(backupDto.getErstelltVonId())
                .orElseThrow(() -> new IllegalArgumentException("Benutzer mit ID " + backupDto.getErstelltVonId() + " nicht gefunden."));

        Properties properties = new Properties();
        properties.setProperty(MysqlExportService.DB_NAME, "gruppe1");
        properties.setProperty(MysqlExportService.DB_USERNAME, "toseTest");
        properties.setProperty(MysqlExportService.DB_PASSWORD, "toseTest2024!");
        properties.setProperty(MysqlExportService.DB_HOST, "132.231.36.101");
        properties.setProperty(MysqlExportService.DB_PORT, "3306");
        properties.setProperty(MysqlExportService.JDBC_DRIVER_NAME, "com.mysql.cj.jdbc.Driver");

        String backupDir = backupDto.getSpeicherort();
        if (backupDir == null || backupDir.isEmpty()) {
            throw new IllegalArgumentException("Speicherort darf nicht leer sein.");
        }

        properties.setProperty(MysqlExportService.TEMP_DIR, backupDir);
        String backupFileName = "Backup_" + LocalDateTime.now().toString().replace(":", "-") + ".zip";
        properties.setProperty(MysqlExportService.PRESERVE_GENERATED_ZIP, "true");
        properties.setProperty(MysqlExportService.PRESERVE_GENERATED_SQL_FILE, "true");

        Backup backup = modelMapper.map(backupDto, Backup.class);

        try {
            MysqlExportService mysqlExportService = new MysqlExportService(properties);
            mysqlExportService.export();
            backup.setSpeicherort(mysqlExportService.getGeneratedZipFile().getAbsolutePath());
            backup.setDatumErstellt(LocalDateTime.now());
            backup.setErstelltVon(erstelltVon);
            System.out.println("Backup Complete: " + backupFileName);
        } catch (Exception e) {
            System.err.println("Error during backup: " + e.getMessage());
        }

        return modelMapper.map(backupRepository.save(backup), BackupDto.class);
    }

    public List<BackupDto> getAllBackups() {
        return backupRepository.findAll().stream()
                .map(backup -> modelMapper.map(backup, BackupDto.class))
                .collect(Collectors.toList());
    }

    public void deleteBackup(Long id) {
        backupRepository.deleteById(id);
    }
     public void restoreBackup(String backupFilePath) throws IOException {
        restoreDatabaseFromSql(backupFilePath);
    }

    private void restoreDatabaseFromSql(String sqlFilePath) {
        String jdbcUrl = "jdbc:mysql://132.231.36.101:3306/gruppe1";
        String username = "toseTest";
        String password = "toseTest2024!";

        try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password);
             Statement stmt = conn.createStatement()) {

            String sql = new String(Files.readAllBytes(Paths.get(sqlFilePath)));
            stmt.execute(sql);
            System.out.println("Database restored successfully from " + sqlFilePath);

        } catch (Exception e) {
            System.err.println("Error restoring database: " + e.getMessage());
        }
    }
}

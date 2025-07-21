package org.Raumverwaltung.Controller;

import java.io.IOException;
import java.util.List;

import org.Raumverwaltung.Service.BackupService;
import org.Raumverwaltung.Transferobjects.BackupDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/backupVerwalten")
@RequiredArgsConstructor
public class BackupController {
    private final BackupService backupService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public BackupDto createBackup(@RequestBody BackupDto backupDto) {
        try {
            return backupService.scheduleBackup(backupDto);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fehler beim Erstellen des Backups: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<BackupDto> getAllBackups() {
        return backupService.getAllBackups();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBackup(@PathVariable Long id) {
        backupService.deleteBackup(id);
    }
   
    @PostMapping("/restore")
    @ResponseStatus(HttpStatus.OK)
    public void restoreBackup(@RequestBody String backupFilePath) throws IOException {
        backupService.restoreBackup(backupFilePath);
    } 
}
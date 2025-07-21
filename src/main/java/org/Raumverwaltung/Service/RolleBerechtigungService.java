package org.Raumverwaltung.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.Raumverwaltung.Model.Berechtigung;
import org.Raumverwaltung.Model.Rolle;
import org.Raumverwaltung.Model.RolleBerechtigung;
import org.Raumverwaltung.Repository.BerechtigungRepository;
import org.Raumverwaltung.Repository.RolleRepository;
import org.Raumverwaltung.Transferobjects.RolleBerechtigungDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.Raumverwaltung.Repository.RolleBerechtigungRepository;

@Service
@RequiredArgsConstructor
public class RolleBerechtigungService {

    private final RolleBerechtigungRepository rolleBerechtigungRepository;
    private final RolleRepository rolleRepository;
    private final BerechtigungRepository berechtigungRepository;
    private final ModelMapper modelMapper;

    /**
     * Erstellt eine neue Rollen-Berechtigungs-Zuweisung und speichert sie in der Datenbank.
     * 
     * @param dto Das DTO mit den Eigenschaften der Zuweisung.
     * @return Das erstellte Rollen-Berechtigungs-DTO.
     */
    public RolleBerechtigungDto create(@Valid RolleBerechtigungDto dto) {
        Rolle rolle = rolleRepository.findById(dto.getRolleId())
            .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + dto.getRolleId() + " nicht gefunden."));
        
        Berechtigung berechtigung = berechtigungRepository.findById(dto.getBerechtigungId())
            .orElseThrow(() -> new IllegalArgumentException("Berechtigung mit ID " + dto.getBerechtigungId() + " nicht gefunden."));

        RolleBerechtigung entity = new RolleBerechtigung();
        entity.setRolle(rolle);
        entity.setBerechtigung(berechtigung);

        return modelMapper.map(rolleBerechtigungRepository.save(entity), RolleBerechtigungDto.class);
    }

    /**
     * Aktualisiert eine bestehende Rollen-Berechtigungs-Zuweisung.
     * 
     * @param id Die ID der zu aktualisierenden Zuweisung.
     * @param dto Das aktualisierte DTO.
     * @return Das aktualisierte Rollen-Berechtigungs-DTO.
     */
    public RolleBerechtigungDto update(Long id, @Valid RolleBerechtigungDto dto) {
        RolleBerechtigung entity = rolleBerechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Rolle-Berechtigung mit ID " + id + " nicht gefunden."));

        if (dto.getRolleId() != null) {
            Rolle rolle = rolleRepository.findById(dto.getRolleId())
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + dto.getRolleId() + " nicht gefunden."));
            entity.setRolle(rolle);
        }

        if (dto.getBerechtigungId() != null) {
            Berechtigung berechtigung = berechtigungRepository.findById(dto.getBerechtigungId())
                .orElseThrow(() -> new IllegalArgumentException("Berechtigung mit ID " + dto.getBerechtigungId() + " nicht gefunden."));
            entity.setBerechtigung(berechtigung);
        }

        return modelMapper.map(rolleBerechtigungRepository.save(entity), RolleBerechtigungDto.class);
    }

    /**
     * Löscht eine Rollen-Berechtigungs-Zuweisung.
     * 
     * @param id Die ID der zu löschenden Zuweisung.
     */
    public void delete(Long id) {
        RolleBerechtigung entity = rolleBerechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Rolle-Berechtigung mit ID " + id + " nicht gefunden."));

        rolleBerechtigungRepository.delete(entity);
    }

    /**
     * Findet alle Rollen-Berechtigungs-Zuweisungen.
     * 
     * @return Eine Liste von Rollen-Berechtigungs-DTOs.
     */
    public List<RolleBerechtigungDto> getAll() {
        return rolleBerechtigungRepository.findAll().stream()
            .map(entity -> modelMapper.map(entity, RolleBerechtigungDto.class))
            .collect(Collectors.toList());
    }

    /**
     * Findet eine Rollen-Berechtigungs-Zuweisung anhand ihrer ID.
     * 
     * @param id Die ID der Zuweisung.
     * @return Das Rollen-Berechtigungs-DTO.
     */
    public RolleBerechtigungDto getById(Long id) {
        RolleBerechtigung entity = rolleBerechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Rolle-Berechtigung mit ID " + id + " nicht gefunden."));
        
        return modelMapper.map(entity, RolleBerechtigungDto.class);
    }

    public List<String> getByRolle(Long id){
        return rolleBerechtigungRepository.findByRolle_Id(id).stream()
                .map(entity -> entity.getBerechtigung().getName())
                .collect(Collectors.toList());
    }

}

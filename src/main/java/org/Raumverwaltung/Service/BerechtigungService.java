package org.Raumverwaltung.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Berechtigung;

import org.Raumverwaltung.Transferobjects.BerechtigungDto;
import org.Raumverwaltung.Repository.BerechtigungRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BerechtigungService {

    private final BerechtigungRepository berechtigungRepository;
    private final ModelMapper modelMapper;

    /**
     * Erstellt eine neue Berechtigung und speichert sie in der Datenbank.
     *
     * @param dto Das DTO mit den Eigenschaften der neuen Berechtigung.
     * @return Das erstellte BerechtigungDto.
     */
    public BerechtigungDto create(@Valid BerechtigungDto dto) {
        Berechtigung entity = modelMapper.map(dto, Berechtigung.class);
        return modelMapper.map(berechtigungRepository.save(entity), BerechtigungDto.class);
    }

    /**
     * Aktualisiert eine vorhandene Berechtigung.
     *
     * @param id  Die ID der zu aktualisierenden Berechtigung.
     * @param dto Das DTO mit den neuen Eigenschaften.
     * @return Das aktualisierte BerechtigungDto.
     */
    public BerechtigungDto update(Long id, @Valid BerechtigungDto dto) {
        Berechtigung entity = berechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Berechtigung mit ID " + id + " nicht gefunden."));

        if (dto.getName() != null) entity.setName(dto.getName());

        return modelMapper.map(berechtigungRepository.save(entity), BerechtigungDto.class);
    }

    /**
     * Löscht eine Berechtigung.
     *
     * @param id Die ID der zu löschenden Berechtigung.
     */
    public void delete(Long id) {
        Berechtigung entity = berechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Berechtigung mit ID " + id + " nicht gefunden."));
        berechtigungRepository.delete(entity);
    }

    /**
     * Findet alle Berechtigungen.
     *
     * @return Eine Liste von BerechtigungDtos.
     */
    public List<BerechtigungDto> getAll() {
        return berechtigungRepository.findAll().stream()
            .map(entity -> modelMapper.map(entity, BerechtigungDto.class))
            .collect(Collectors.toList());
    }

    /**
     * Findet eine Berechtigung anhand ihrer ID.
     *
     * @param id Die ID der Berechtigung.
     * @return Das BerechtigungDto.
     */
    public BerechtigungDto getById(Long id) {
        Berechtigung entity = berechtigungRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Berechtigung mit ID " + id + " nicht gefunden."));
        return modelMapper.map(entity, BerechtigungDto.class);
    }
}

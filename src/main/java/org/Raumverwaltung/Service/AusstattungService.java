package org.Raumverwaltung.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Ausstattung;
import org.Raumverwaltung.Enum.Status;
import org.Raumverwaltung.Model.Raum;
import org.Raumverwaltung.Repository.AusstattungRepository;
import org.Raumverwaltung.Repository.RaumRepository;
import org.Raumverwaltung.Transferobjects.AusstattungDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AusstattungService {

    private final AusstattungRepository ausstattungRepository;
    private final RaumRepository raumRepository;
    private final ModelMapper modelMapper;

    /**
     * Erstellt oder aktualisiert Ausstattung für einen Raum.
     * @param raumId Die Raum-ID.
     * @param ausstattungList Die Liste der Ausstattungen (neu/aktualisiert).
     * @param zuLoeschen Die Liste der IDs, die gelöscht werden sollen.
     */
    public void updateAusstattungForRoom(Long raumId, List<Map<String, Object>> ausstattungList, List<Long> zuLoeschen) {

        if (zuLoeschen != null && !zuLoeschen.isEmpty()) {
            ausstattungRepository.deleteAllById(zuLoeschen);
        }

        if (ausstattungList != null) {
            for (Map<String, Object> ausstattungData : ausstattungList) {
                Ausstattung ausstattung;

                Long id = ausstattungData.get("id") != null ? Long.valueOf(ausstattungData.get("id").toString()) : null;

                if (id != null) {
                    ausstattung = ausstattungRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Ausstattung mit ID " + id + " nicht gefunden."));
                } else {
                    Raum raum = raumRepository.findById(raumId)
                        .orElseThrow(() -> new IllegalArgumentException("Raum mit ID " + raumId + " nicht gefunden."));
                    ausstattung = new Ausstattung();
                    ausstattung.setRaum(raum);
                    ausstattung.setStatus(Status.funktionstuechtig); // Standardstatus
                }

                ausstattung.setBezeichnung(ausstattungData.get("bezeichnung").toString());
                ausstattung.setBeschreibung(ausstattungData.get("beschreibung") != null 
                    ? ausstattungData.get("beschreibung").toString() 
                    : null);

                ausstattungRepository.save(ausstattung);
            }
        }
    }

    /**
     * Findet alle Ausstattungen für einen bestimmten Raum.
     * @param raumId Die Raum-ID.
     * @return Eine Liste von AusstattungDto.
     */
    public List<AusstattungDto> findByRaumId(Long raumId) {
        return ausstattungRepository.findByRaumId(raumId).stream()
            .map(ausstattung -> modelMapper.map(ausstattung, AusstattungDto.class))
            .collect(Collectors.toList());
    }

    /**
     * Löscht eine Ausstattung.
     * @param id Die ID der Ausstattung.
     */
    public void delete(Long id) {
        ausstattungRepository.deleteById(id);
    }

    /**
     * Erstellt eine Ausstattung.
     */
    public AusstattungDto create(@Valid AusstattungDto ausstattungDto) {
        Raum raum = raumRepository.findById(ausstattungDto.getRaumId())
                .orElseThrow(() -> new IllegalArgumentException("Raum mit ID " + ausstattungDto.getRaumId() + " nicht gefunden."));

        Ausstattung ausstattung = modelMapper.map(ausstattungDto, Ausstattung.class);
        ausstattung.setRaum(raum);
        ausstattung.setStatus(Status.funktionstuechtig);

        return modelMapper.map(ausstattungRepository.save(ausstattung), AusstattungDto.class);
    }

    /**
     * Aktualisiert eine bestehende Ausstattung.
     */
    public AusstattungDto update(Long id, @Valid AusstattungDto ausstattungDto) {
        Ausstattung ausstattung = ausstattungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ausstattung mit ID " + id + " nicht gefunden."));

        ausstattung.setBezeichnung(ausstattungDto.getBezeichnung());
        ausstattung.setBeschreibung(ausstattungDto.getBeschreibung());

        return modelMapper.map(ausstattungRepository.save(ausstattung), AusstattungDto.class);
    }

    public AusstattungDto markAsFunctional(Long id) {
        Ausstattung ausstattung = ausstattungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ausstattung mit ID " + id + " nicht gefunden."));
    
        ausstattung.setStatus(Status.funktionstuechtig);
        ausstattungRepository.save(ausstattung);
    
        return modelMapper.map(ausstattung, AusstattungDto.class);
    }
    
    public AusstattungDto markAsTicketCreated(Long id) {
        Ausstattung ausstattung = ausstattungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ausstattung mit ID " + id + " nicht gefunden."));
    
        ausstattung.setStatus(Status.ticket_erstellt);
        ausstattungRepository.save(ausstattung);
    
        return modelMapper.map(ausstattung, AusstattungDto.class);
    }
}
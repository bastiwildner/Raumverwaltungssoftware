package org.Raumverwaltung.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Gebaeude;
import org.Raumverwaltung.Model.Raum;
import org.Raumverwaltung.Repository.GebaeudeRepository;
import org.Raumverwaltung.Repository.RaumRepository;
import org.Raumverwaltung.Transferobjects.RaumDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaumService {

    private final RaumRepository repository;
    private final GebaeudeRepository gebaeudeRepository;
    private final ModelMapper modelMapper;


    /**
     * Erstellt einen neuen Raum und speichert ihn in der Datenbank.
     * @param dto Das RaumDto mit den Eigenschaften des zu erstellenden Raums.
     * @return Das erstellte RaumDto mit der generierten ID.
     */
    public RaumDto create(@Valid RaumDto dto) {
       Gebaeude gebaeude = gebaeudeRepository.findById(dto.getGebaeudeId())
           .orElseThrow(() -> new IllegalArgumentException("Gebäude mit ID " + dto.getGebaeudeId() + " nicht gefunden."));

        Raum entity = modelMapper.map(dto, Raum.class);
        entity.setGebaeude(gebaeude);

        return modelMapper.map(repository.save(entity), RaumDto.class);
    }

    /**
     * Aktualisiert einen vorhandenen Raum mit den übergebenen Werten.
     * @param id Die ID des zu aktualisierenden Raums.
     * @param dto Das RaumDto mit den neuen Werten.
     * @return Das aktualisierte RaumDto.
     */
    public RaumDto update(Long id, @Valid RaumDto dto) {
        Raum entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Raum mit ID " + id + " nicht gefunden."));
        entity.setName(dto.getName());
        entity.setGroesse(dto.getGroesse());
        entity.setTyp(dto.getTyp());
        entity.setKapazitaet(dto.getKapazitaet());
        return modelMapper.map(repository.save(entity), RaumDto.class);
    }

    /**
     * Löscht einen Raum aus der Datenbank.
     * @param id Die ID des zu löschenden Raums.
     */
    public void delete(Long id) {
        Raum entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Raum mit ID " + id + " nicht gefunden."));
        repository.delete(entity);
    }

    /**
     * Findet alle Räume, die einem bestimmten Gebäude zugeordnet sind.
     * @param gebaeudeId Die ID des Gebäudes, zu dem die Räume gehören.
     * @return Eine Liste von RaumDtos, die dem Gebäude zugeordnet sind.
     */
    public List<RaumDto> findByGebaeudeId(Long gebaeudeId) {
        return repository.findByGebaeudeId(gebaeudeId).stream()
            .map(entity -> modelMapper.map(entity, RaumDto.class))
            .toList();
    }

    /**
     * Findet einen Raum anhand seiner ID und gibt ihn zurück.
     * @param id Die ID des gesuchten Raums.
     * @return Das RaumDto mit den Eigenschaften des Raums.
     */
    public RaumDto getById(Long id) {
        Raum raum = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Raum mit ID " + id + " nicht gefunden."));
    
        RaumDto dto = modelMapper.map(raum, RaumDto.class);
        
        if (raum.getAusstattungen() != null && !raum.getAusstattungen().isEmpty()) {
            List<String> ausstattungList = raum.getAusstattungen().stream()
                .map(a -> a.getBezeichnung())
                .toList();
            dto.setAusstattung(ausstattungList);
        } else {
            dto.setAusstattung(List.of()); 
        }
    
        return dto;
    }
    
    public List<RaumDto> searchRaeume(String name, Integer minKapazitaet, String ausstattung) {
        List<Raum> raeume = repository.search(name, minKapazitaet, ausstattung);
        return raeume.stream()
            .map(raum -> {
                RaumDto dto = modelMapper.map(raum, RaumDto.class);
                List<String> ausstattungList = raum.getAusstattungen().stream()
                    .map(a -> a.getBezeichnung())
                    .collect(Collectors.toList());
                dto.setAusstattung(ausstattungList);
                return dto;
            })
            .toList();
    }
}
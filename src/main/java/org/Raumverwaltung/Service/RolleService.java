package org.Raumverwaltung.Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Rolle;
import org.Raumverwaltung.Repository.RolleRepository;
import org.Raumverwaltung.Transferobjects.RolleDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolleService {

    private final RolleRepository rolleRepository;
    private final ModelMapper modelMapper;

    /**
     * Erstellt eine neue Rolle und speichert sie in der Datenbank.
     *
     * @param dto Das RolleDto mit den Eigenschaften der zu erstellenden Rolle.
     * @return Das erstellte RolleDto mit der generierten ID.
     */
    public RolleDto create(@Valid RolleDto dto) {
        Rolle entity = modelMapper.map(dto, Rolle.class);
        return modelMapper.map(rolleRepository.save(entity), RolleDto.class);
    }

    /**
     * Aktualisiert eine vorhandene Rolle mit den übergebenen Werten.
     *
     * @param id  Die ID der zu aktualisierenden Rolle.
     * @param dto Das RolleDto mit den neuen Werten.
     * @return Das aktualisierte RolleDto.
     */
    public RolleDto update(Long id, @Valid RolleDto dto) {
        Rolle entity = rolleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + id + " nicht gefunden."));

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getBeschreibung() != null) entity.setBeschreibung(dto.getBeschreibung());

        return modelMapper.map(rolleRepository.save(entity), RolleDto.class);
    }

    /**
     * Löscht eine Rolle aus der Datenbank.
     *
     * @param id Die ID der zu löschenden Rolle.
     */
    public void delete(Long id) {
        Rolle entity = rolleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + id + " nicht gefunden."));
        rolleRepository.delete(entity);
    }

    /**
     * Gibt eine Rolle anhand ihrer ID zurück.
     *
     * @param id Die ID der gesuchten Rolle.
     * @return Das RolleDto mit den Eigenschaften der Rolle.
     */
    public RolleDto getById(Long id) {
        Rolle rolle = rolleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rolle mit ID " + id + " nicht gefunden."));
        return modelMapper.map(rolle, RolleDto.class);
    }

    /**
     * Gibt alle Rollen zurück.
     *
     * @return Eine Liste von RolleDtos.
     */
    public List<RolleDto> getAll() {
        return rolleRepository.findAll().stream()
                .map(entity -> modelMapper.map(entity, RolleDto.class))
                .collect(Collectors.toList());
    }

    /**
     * Sucht Rollen basierend auf optionalen Kriterien.
     *
     * @param name        Der Name der Rolle (optional).
     * @param beschreibung Eine Beschreibung der Rolle (optional).
     * @return Eine Liste von Rollen, die den Kriterien entsprechen.
     */
    public List<RolleDto> searchRollen(String name, String beschreibung) {
        List<Rolle> rollen = rolleRepository.search(name, beschreibung);
        return rollen.stream()
                .map(rolle -> modelMapper.map(rolle, RolleDto.class))
                .collect(Collectors.toList());
    }
}

package org.Raumverwaltung.Service;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.Gebaeude;
import org.Raumverwaltung.Model.Oeffnungszeiten;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.GebaeudeRepository;
import org.Raumverwaltung.Repository.OeffnungszeitenRepository;
import org.Raumverwaltung.Transferobjects.OeffnungszeitenDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.Raumverwaltung.Enum.Wochentag;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OeffnungszeitenService {

    private final OeffnungszeitenRepository repository;
    private final GebaeudeRepository gebaeudeRepository;
    private final BenutzerRepository benutzerRepository;
    private final ModelMapper modelMapper;

    /**
     * Sucht Öffnungszeiten für ein bestimmtes Gebäude.
     * @param gebaeudeId Die ID des Gebäudes
     * @return Die Liste der Öffnungszeiten
     */
    public List<OeffnungszeitenDto> findByGebaeudeId(Long gebaeudeId) {
        List<Oeffnungszeiten> entities = repository.findByGebaeudeId(gebaeudeId);
        return entities.stream()
                .map(entity -> modelMapper.map(entity, OeffnungszeitenDto.class))
                .toList();
    }

    /**
     * Fügt Öffnungszeiten hinzu oder aktualisiert diese basierend auf den übergebenen DTO-Daten.
     * Wenn für Mo-Fr oder Sa-So bereits Öffnungszeiten existieren, werden diese aktualisiert.
     * Wenn keine existieren, werden neue Öffnungszeiten für diese Tage angelegt.
     * @param dto Das DTO mit den Öffnungszeiten
     * @return Das aktualisierte oder neu erstellte DTO
     */
    public OeffnungszeitenDto update(Long id, OeffnungszeitenDto dto) {
        Gebaeude gebaeude = gebaeudeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gebäude mit ID " + id + " nicht gefunden."));

        List<Oeffnungszeiten> existingEntries = repository.findByGebaeudeId(gebaeude.getId());

        if (dto.getTag() == Wochentag.Mo) {
            updateOrCreateOpeningHoursForWeekdays(existingEntries, dto, Wochentag.Mo, gebaeude);
        }
        else if (dto.getTag() == Wochentag.Sa) {
            updateOrCreateOpeningHoursForWeekend(existingEntries, dto, Wochentag.Sa, gebaeude);
        }
        else {
            throw new IllegalArgumentException("Nur Mo oder Sa als Wochentag erlaubt.");
        }

        repository.saveAll(existingEntries);

        return modelMapper.map(existingEntries.get(0), OeffnungszeitenDto.class);
    }

    // Methode zum Hinzufügen oder Aktualisieren der Öffnungszeiten für Mo-Fr (Wochentage)
    private void updateOrCreateOpeningHoursForWeekdays(List<Oeffnungszeiten> existingEntries, OeffnungszeitenDto dto, Wochentag tag, Gebaeude gebaeude) {
        boolean existsForWeekdays = existingEntries.stream()
                .anyMatch(entry -> List.of(Wochentag.Mo, Wochentag.Di, Wochentag.Mi, Wochentag.Do, Wochentag.Fr).contains(entry.getTag()));

        if (existsForWeekdays) {
            for (Oeffnungszeiten existingEntity : existingEntries) {
                if (List.of(Wochentag.Mo, Wochentag.Di, Wochentag.Mi, Wochentag.Do, Wochentag.Fr).contains(existingEntity.getTag())) {
                    if (dto.getOeffnungszeit() != null) {
                        existingEntity.setOeffnungszeit(dto.getOeffnungszeit());
                    }
                    if (dto.getSchliesszeit() != null) {
                        existingEntity.setSchliesszeit(dto.getSchliesszeit());
                    }
                    existingEntity.setLetzteAenderung(LocalDateTime.now());
                }
            }
        } else {
            for (Wochentag wochentag : List.of(Wochentag.Mo, Wochentag.Di, Wochentag.Mi, Wochentag.Do, Wochentag.Fr)) {
                Oeffnungszeiten newEntity = modelMapper.map(dto, Oeffnungszeiten.class);
                newEntity.setGebaeude(gebaeude);
                newEntity.setTag(wochentag);
                newEntity.setLetzteAenderung(LocalDateTime.now());
                existingEntries.add(newEntity);
            }
        }
    }

    private void updateOrCreateOpeningHoursForWeekend(List<Oeffnungszeiten> existingEntries, OeffnungszeitenDto dto, Wochentag tag, Gebaeude gebaeude) {
        boolean existsForWeekend = existingEntries.stream()
                .anyMatch(entry -> List.of(Wochentag.Sa, Wochentag.So).contains(entry.getTag()));

        if (existsForWeekend) {
            for (Oeffnungszeiten existingEntity : existingEntries) {
                if (List.of(Wochentag.Sa, Wochentag.So).contains(existingEntity.getTag())) {
                    if (dto.getOeffnungszeit() != null) {
                        existingEntity.setOeffnungszeit(dto.getOeffnungszeit());
                    }
                    if (dto.getSchliesszeit() != null) {
                        existingEntity.setSchliesszeit(dto.getSchliesszeit());
                    }
                    existingEntity.setLetzteAenderung(LocalDateTime.now());
                }
            }
        } else {
            for (Wochentag wochentag : List.of(Wochentag.Sa, Wochentag.So)) {
                Oeffnungszeiten newEntity = modelMapper.map(dto, Oeffnungszeiten.class);
                newEntity.setGebaeude(gebaeude);
                newEntity.setTag(wochentag); // Setze den richtigen Tag
                newEntity.setLetzteAenderung(LocalDateTime.now());
                existingEntries.add(newEntity); // Füge neue Öffnungszeiten hinzu
            }
        }
    }

    public void updateOpeningHours(List<OeffnungszeitenDto> openingHours) {
        for (OeffnungszeitenDto oeffnungszeit : openingHours) {
            if (oeffnungszeit.getOeffnungszeit() != null && oeffnungszeit.getSchliesszeit() != null) {
                if (oeffnungszeit.getTag() == Wochentag.Mo || oeffnungszeit.getTag() == Wochentag.Sa) {
                    Oeffnungszeiten existingOpeningHours = repository.findByGebaeudeIdAndTag(oeffnungszeit.getGebaeudeId(), oeffnungszeit.getTag());

                    if (existingOpeningHours != null) {
                        existingOpeningHours.setOeffnungszeit(oeffnungszeit.getOeffnungszeit());
                        existingOpeningHours.setSchliesszeit(oeffnungszeit.getSchliesszeit());

                        repository.save(existingOpeningHours);
                    } else {
                        Oeffnungszeiten oeffnungszeiten = modelMapper.map(oeffnungszeit, Oeffnungszeiten.class);
                        repository.save(oeffnungszeiten);
                    }
                }
            }
        }
    }


    /**
     * Löscht eine Öffnungszeit basierend auf der ID.
     * @param id Die ID der zu löschenden Öffnungszeit
     */
    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<OeffnungszeitenDto> create(List<OeffnungszeitenDto> dto) {
        List<OeffnungszeitenDto> created = new ArrayList<>();
        for (OeffnungszeitenDto oeffnungszeiten : dto){

            if (oeffnungszeiten.getOeffnungszeit() == null || oeffnungszeiten.getSchliesszeit() == null){
                break;
            }

            Benutzer benutzer = benutzerRepository.findById(oeffnungszeiten.getErstelltVonId())
                    .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + oeffnungszeiten.getErstelltVonId() + " nicht gefunden."));

            Oeffnungszeiten zeit = modelMapper.map(oeffnungszeiten, Oeffnungszeiten.class);
            zeit.setErstelltVon(benutzer);
            repository.save(zeit);
            created.add(modelMapper.map(zeit, OeffnungszeitenDto.class));
        }
        return created;
    }
}

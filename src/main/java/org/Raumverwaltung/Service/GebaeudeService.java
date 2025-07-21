package org.Raumverwaltung.Service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.Gebaeude;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.GebaeudeRepository;
import org.Raumverwaltung.Transferobjects.GebaeudeDto;
import org.Raumverwaltung.Transferobjects.OeffnungszeitenDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@RequiredArgsConstructor
@Service
public class GebaeudeService {

    private final GebaeudeRepository gebaeudeRepository;
    private final ModelMapper modelMapper;
    private final BenutzerRepository benutzerRepository;
    private final OeffnungszeitenService oeffnungszeitenService;

    public GebaeudeDto create(GebaeudeDto gebaeudeDto) {

        Benutzer benutzer = benutzerRepository.findById(gebaeudeDto.getVerwaltetVonId())
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + gebaeudeDto.getVerwaltetVonId() + " nicht gefunden."));

        gebaeudeDto.setVerwaltetVon(benutzer);

        Gebaeude entity = convertToEntity(gebaeudeDto);

        return convertToDto(gebaeudeRepository.save(entity));
    }

    public void delete(Long id) {

        List<OeffnungszeitenDto> oeffnungszeitenDto = oeffnungszeitenService.findByGebaeudeId(id);
        for (OeffnungszeitenDto dto : oeffnungszeitenDto){
            oeffnungszeitenService.delete(dto.getId());
        }

        gebaeudeRepository.deleteById(id);
    }

    private GebaeudeDto convertToDto(Gebaeude entity) {
        return modelMapper.map(entity, GebaeudeDto.class);
    }

    private Gebaeude convertToEntity(GebaeudeDto dto) {
        return modelMapper.map(dto, Gebaeude.class);
    }
    public Benutzer getFacilityManagerByBuildingId(Long id) {
        Gebaeude gebaeude = gebaeudeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Gebäude nicht gefunden"));
        Benutzer facilityManager = gebaeude.getVerwaltetVon();
        if (facilityManager == null) {
            throw new EntityNotFoundException("Facility Manager nicht gefunden");
        }
        return facilityManager;
    }


    public List<GebaeudeDto> getAllGebaeude() {
        return gebaeudeRepository.findAll().stream()
                .map(gebaeude -> modelMapper.map(gebaeude, GebaeudeDto.class))
                .collect(Collectors.toList());
    }

    public GebaeudeDto update(Long id, GebaeudeDto gebaeudeDto) {
        // Bestehendes Gebäude aus der Datenbank abrufen
        Gebaeude existingGebaeude = gebaeudeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Gebäude mit ID " + id + " nicht gefunden."));

        Benutzer benutzer = benutzerRepository.findById(gebaeudeDto.getVerwaltetVonId())
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + gebaeudeDto.getVerwaltetVonId() + " nicht gefunden."));

        if (gebaeudeDto.getName() != null) {
            existingGebaeude.setName(gebaeudeDto.getName());
        }
        if (gebaeudeDto.getStrasse() != null) {
            existingGebaeude.setStrasse(gebaeudeDto.getStrasse());
        }
        if (gebaeudeDto.getHausnummer() != null) {
            existingGebaeude.setHausnummer(gebaeudeDto.getHausnummer());
        }
        if (gebaeudeDto.getPlz() != 0) {
            existingGebaeude.setPlz(gebaeudeDto.getPlz());
        }
        if (gebaeudeDto.getStadt() != null) {
            existingGebaeude.setStadt(gebaeudeDto.getStadt());
        }
        if (gebaeudeDto.getLand() != null) {
            existingGebaeude.setLand(gebaeudeDto.getLand());
        }
        if (gebaeudeDto.getVerwaltetVonId() != null){
            existingGebaeude.setVerwaltetVon(benutzer);
        }

        Gebaeude updatedGebaeude = gebaeudeRepository.save(existingGebaeude);

        return convertToDto(updatedGebaeude);
    }

    public GebaeudeDto findById(Long id) {
        Gebaeude gebaeude = gebaeudeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gebäude mit ID " + id + " nicht gefunden."));
        return modelMapper.map(gebaeude, GebaeudeDto.class);
    }
}

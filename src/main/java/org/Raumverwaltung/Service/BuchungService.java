package org.Raumverwaltung.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.Raumverwaltung.Enum.SerienBuchungTyp;
import org.Raumverwaltung.Enum.EventTyp;
import org.Raumverwaltung.Enum.Wochentag;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.Buchung;
import org.Raumverwaltung.Model.Raum;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.BuchungRepository;
import org.Raumverwaltung.Repository.RaumRepository;
import org.Raumverwaltung.Transferobjects.BenutzerDto;
import org.Raumverwaltung.Transferobjects.BuchungDto;
import org.Raumverwaltung.Transferobjects.OeffnungszeitenDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;

@Service
@RequiredArgsConstructor
public class BuchungService {

    private final BuchungRepository buchungRepository;
    private final BenutzerRepository benutzerRepository;
    private final RaumRepository raumRepository;
    private final OeffnungszeitenService oeffnungszeitenService;
    private final EmailService emailService;
    private final ModelMapper modelMapper;

    /**
     * Buchungen für eine Kalenderwoche abrufen.
     *
     * @param start Startdatum der Woche (Montag)
     * @param end   Enddatum der Woche (Freitag)
     * @return Liste der Buchungen in der Woche
     */
    public List<BuchungDto> getWochenBuchungen(LocalDate start, LocalDate end) {
        return buchungRepository
                .findByDatumBetween(start, end)
                .stream()
                .map(buchung -> new BuchungDto(
                        buchung.getId(),
                        buchung.getRaum().getId(),
                        buchung.getDatum(),
                        buchung.getBeginn(),
                        buchung.getEnde(),
                        buchung.getGebuchtVon().getId(),
                        buchung.getEventtyp(),
                        buchung.getBetreff()))
                .toList();
    }

    /**
     * Buchungen für einen bestimmten Raum abrufen.
     *
     * @param raumId ID des Raums
     * @return Liste der Buchungen für den Raum
     */
    public List<BuchungDto> getBuchungenByRaum(Long raumId) {
        return buchungRepository
                .findByRaum_Id(raumId)
                .stream()
                .map(buchung -> new BuchungDto(
                        buchung.getId(),
                        buchung.getRaum().getId(),
                        buchung.getDatum(),
                        buchung.getBeginn(),
                        buchung.getEnde(),
                        buchung.getGebuchtVon().getId(),
                        buchung.getEventtyp(),
                        buchung.getBetreff()))
                .toList();
    }

    /**
     * Buchungen für einen bestimmten Benutzer abrufen.
     *
     * @param gebuchtVonId ID des Benutzers, der die Buchung vorgenommen hat
     * @return Liste der Buchungen, die von diesem Benutzer gemacht wurden
     */
    public List<BuchungDto> getBuchungenByGebuchtVon(Long gebuchtVonId) {
        return buchungRepository
                .findByGebuchtVonId(gebuchtVonId)
                .stream()
                .map(buchung -> new BuchungDto(
                        buchung.getId(),
                        buchung.getRaum().getId(),
                        buchung.getDatum(),
                        buchung.getBeginn(),
                        buchung.getEnde(),
                        buchung.getGebuchtVon().getId(),
                        buchung.getEventtyp(),
                        buchung.getBetreff()
                ))
                .sorted(Comparator.comparing(BuchungDto::getDatum))
                .collect(Collectors.toList());
    }

    // Ruft alle Buchungen ab.
    public List<BuchungDto> getAlleBuchungen() {
        LocalDate heute = LocalDate.now();
        return buchungRepository.findAll().stream()
                .filter(buchung -> !buchung.getDatum().isBefore(heute)) // Filter für Buchungen ab heute
                .map(buchung -> modelMapper.map(buchung, BuchungDto.class))
                .sorted(Comparator.comparing(BuchungDto::getDatum))
                .toList();
    }


    /**
     * Buchungen in einem bestimmten Zeitraum abrufen
     * 
     * @param raumId
     * @param startDatum
     * @param endDatum
     * @return
     */
    public List<BuchungDto> getBuchungen(Long raumId, LocalDate startDatum, LocalDate endDatum) {
        return buchungRepository
                .findByRaum_IdAndDatumBetween(raumId, startDatum, endDatum)
                .stream()
                .map(buchung -> new BuchungDto(
                        buchung.getId(),
                        buchung.getRaum().getId(),
                        buchung.getDatum(),
                        buchung.getBeginn(),
                        buchung.getEnde(),
                        buchung.getGebuchtVon().getId(),
                        buchung.getEventtyp(),
                        buchung.getBetreff()))
                .toList();
    }

    /**
     * Speichert eine neue Buchung in der Datenbank.
     *
     * @param buchungDto
     * @return
     */
    public BuchungDto save(BuchungDto buchungDto, boolean singleBuchung) {
        validateTimeLogic(buchungDto);

        if (isRaumGeschlossen(buchungDto)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Die Buchung liegt außerhalb der Öffnungszeiten.");
        }

        if (isFeiertag(buchungDto.getDatum())) {
            throw new IllegalStateException("Buchungen an Feiertagen sind nicht erlaubt.");
        }

        if (!benutzerRepository.existsById(buchungDto.getGebuchtVonId())) {
            throw new EntityNotFoundException("Benutzer nicht gefunden");
        }

        if (!raumRepository.existsById(buchungDto.getRaumId())) {
            throw new EntityNotFoundException("Raum nicht gefunden");
        }

        if (isBuchungÜberlappend(buchungDto)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Termine der Serie überlappen sich mit bestehenden Buchungen.");
        }

        if (isRaumWartungOderUeberlastet(buchungDto)) {
            throw new IllegalStateException("Der Raum ist derzeit nicht verfügbar (Wartung oder Überlastung).");
        }

        Buchung buchung = new Buchung();
        buchung.setDatum(buchungDto.getDatum());
        buchung.setBeginn(buchungDto.getBeginn());
        buchung.setEnde(buchungDto.getEnde());
        buchung.setEventtyp(buchungDto.getEventTyp());
        buchung.setBetreff(buchungDto.getBetreff());

        buchung.setRaum(new Raum());
        buchung.getRaum().setId(buchungDto.getRaumId());
        buchung.setGebuchtVon(new Benutzer());
        buchung.getGebuchtVon().setId(buchungDto.getGebuchtVonId());

        Buchung gespeicherteBuchung = buchungRepository.save(buchung);

        if(singleBuchung){
            Benutzer benutzer = benutzerRepository.findById(buchungDto.getGebuchtVonId())
                    .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + buchungDto.getGebuchtVonId() + " nicht gefunden."));

            Raum raum = raumRepository.findById(buchungDto.getRaumId())
                    .orElseThrow(() -> new EntityNotFoundException("Raum nicht gefunden"));

            String subject = "Buchungsbestätigung";
            String body = String.format("Ihre Buchung wurde erfolgreich erstellt.\n\n" +
                            "Betreff: %s\nDatum: %s\nZeit: %s - %s\nRaum: %s\n\nDanke für Ihre Buchung!",
                    buchungDto.getBetreff(), buchungDto.getDatum(), buchungDto.getBeginn().toString(), buchungDto.getEnde().toString(), raum.getName());

            emailService.sendSimpleEmail(benutzer.getEmail(), subject, body);
        }

        return new BuchungDto(
                gespeicherteBuchung.getId(),
                gespeicherteBuchung.getRaum().getId(),
                gespeicherteBuchung.getDatum(),
                gespeicherteBuchung.getBeginn(),
                gespeicherteBuchung.getEnde(),
                gespeicherteBuchung.getGebuchtVon().getId(),
                gespeicherteBuchung.getEventtyp(),
                gespeicherteBuchung.getBetreff()
        );
    }

    // Buchung aktualisieren
    public BuchungDto update(Long buchungId, BuchungDto buchungDto) {
        Buchung existingBuchung = buchungRepository.findById(buchungId)
                .orElseThrow(() -> new EntityNotFoundException("Buchung nicht gefunden"));

        boolean isTimeChanged = !existingBuchung.getBeginn().equals(buchungDto.getBeginn()) ||
                !existingBuchung.getEnde().equals(buchungDto.getEnde()) ||
                !existingBuchung.getDatum().equals(buchungDto.getDatum());

        boolean isEventTypeChanged = !existingBuchung.getEventtyp().equals(buchungDto.getEventTyp());

        boolean isBetreffChanged = !existingBuchung.getBetreff().equals(buchungDto.getBetreff());

        if (isTimeChanged && isBuchungÜberlappend(buchungDto)) {
            throw new IllegalStateException(
                    "Die aktualisierte Buchung überschneidet sich mit einer bestehenden Buchung");
        }

        if (isEventTypeChanged && !isTimeChanged) {
            existingBuchung.setEventtyp(buchungDto.getEventTyp());
        } else {
            existingBuchung.setDatum(buchungDto.getDatum());
            existingBuchung.setBeginn(buchungDto.getBeginn());
            existingBuchung.setEnde(buchungDto.getEnde());
            existingBuchung.setEventtyp(buchungDto.getEventTyp());
        }

        if (isBetreffChanged) {
            existingBuchung.setBetreff(buchungDto.getBetreff());
        }

        Raum raum = new Raum();
        raum.setId(buchungDto.getRaumId());
        existingBuchung.setRaum(raum);

        Benutzer gebuchtVon = new Benutzer();
        gebuchtVon.setId(buchungDto.getGebuchtVonId());
        existingBuchung.setGebuchtVon(gebuchtVon);

        Buchung updatedBuchung = buchungRepository.save(existingBuchung);

        return new BuchungDto(
                updatedBuchung.getId(),
                updatedBuchung.getRaum().getId(),
                updatedBuchung.getDatum(),
                updatedBuchung.getBeginn(),
                updatedBuchung.getEnde(),
                updatedBuchung.getGebuchtVon().getId(),
                updatedBuchung.getEventtyp(),
                updatedBuchung.getBetreff()
        );
    }

    // Löschen einer Buchung
    public void delete(Long buchungId) {
        if (!buchungRepository.existsById(buchungId)) {
            throw new EntityNotFoundException("Buchung nicht gefunden");
        }

        Buchung buchung = buchungRepository.findById(buchungId)
                .orElseThrow(() -> new EntityNotFoundException("Buchung mit ID " + buchungId + " nicht gefunden."));

        String subject = "Buchung storniert";
        String body = String.format("Ihre Buchung wurde erfolgreich storniert.\n\n" +
                        "Betreff: %s\nDatum: %s\nZeit: %s - %s\nRaum: %s",
                buchung.getBetreff(), buchung.getDatum().toString(), buchung.getBeginn(), buchung.getEnde(), buchung.getRaum().getName());

        emailService.sendSimpleEmail(buchung.getGebuchtVon().getEmail(), subject, body);

        buchungRepository.deleteById(buchungId);
    }

    private boolean isBuchungÜberlappend(BuchungDto buchungDto) {
        List<Buchung> bestehendeBuchungen = buchungRepository.findByRaum_IdAndDatum(
                buchungDto.getRaumId(),
                buchungDto.getDatum());

        return bestehendeBuchungen.stream().anyMatch(buchung ->
                !(buchung.getEnde().isBefore(buchungDto.getBeginn()) || buchung.getBeginn().isAfter(buchungDto.getEnde())) &&
                        !buchung.getEnde().equals(buchungDto.getBeginn())
        );
    }

    private boolean isRaumGeschlossen(BuchungDto buchungDto) {
        Long raumId = buchungDto.getRaumId();
        Raum raum = raumRepository.findById(raumId)
                .orElseThrow(() -> new EntityNotFoundException("Raum nicht gefunden"));

        List<OeffnungszeitenDto> oeffnungszeiten = oeffnungszeitenService.findByGebaeudeId(raum.getGebaeude().getId());
        Wochentag wochentag = Wochentag.fromDayOfWeek(buchungDto.getDatum().getDayOfWeek());
        return buchungDto.getBeginn().isBefore(oeffnungszeiten.getFirst().getOeffnungszeit())
                || buchungDto.getEnde().isAfter(oeffnungszeiten.getFirst().getSchliesszeit());
    }

    private boolean isFeiertag(LocalDate datum) {
        List<LocalDate> feiertage = List.of(
                LocalDate.of(datum.getYear(), 1, 1),
                LocalDate.of(datum.getYear(), 12, 25)
        );

        return feiertage.contains(datum);
    }

    private void validateTimeLogic(BuchungDto buchungDto) {
        if (buchungDto.getBeginn().isAfter(buchungDto.getEnde())
                || buchungDto.getBeginn().equals(buchungDto.getEnde())) {
            throw new IllegalArgumentException("Die Beginnzeit muss vor der Endzeit liegen.");
        }
    }

    private boolean isRaumWartungOderUeberlastet(BuchungDto buchungDto) {
        Long raumId = buchungDto.getRaumId();

        boolean isInWartung = checkRaumWartung(raumId);

        boolean isUeberlastet = checkRaumUeberlastung(raumId, buchungDto.getDatum());

        return isInWartung || isUeberlastet;
    }

    private boolean checkRaumWartung(Long raumId) {
        return false;
    }

    private boolean checkRaumUeberlastung(Long raumId, LocalDate datum) {
        return false;
    }

    public List<BuchungDto> saveSerienBuchung(BuchungDto buchungDto, SerienBuchungTyp serienBuchungTyp,
            LocalDate serieBis) {
        List<BuchungDto> serienBuchungen = new ArrayList<>();
        List<BuchungDto> overlappingBookings = new ArrayList<>();
        LocalDate aktuellesDatum = buchungDto.getDatum();
        while (!aktuellesDatum.isAfter(serieBis)) {

                BuchungDto neueBuchung = new BuchungDto(
                        buchungDto.getId(),
                        buchungDto.getRaumId(),
                        aktuellesDatum,
                        buchungDto.getBeginn(),
                        buchungDto.getEnde(),
                        buchungDto.getGebuchtVonId(),
                        buchungDto.getEventTyp(),
                        buchungDto.getBetreff()
                );
                serienBuchungen.add(neueBuchung);

            if (isBuchungÜberlappend(neueBuchung)) {
                overlappingBookings.add(neueBuchung);
            }

            switch (serienBuchungTyp) {
                case TAEGLICH -> aktuellesDatum = aktuellesDatum.plusDays(1);
                case WOECHENTLICH -> aktuellesDatum = aktuellesDatum.plusWeeks(1);
                case MONATLICH -> aktuellesDatum = aktuellesDatum.plusMonths(1);
            }
        }

        if (!overlappingBookings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Buchungen der Serie überlappen sich mit bestehenden Buchungen.");
        }

        List<BuchungDto> gespeicherteBuchungen = new ArrayList<>();
        for (BuchungDto buchung : serienBuchungen) {
            gespeicherteBuchungen.add(save(buchung, false));
        }

        Benutzer benutzer = benutzerRepository.findById(buchungDto.getGebuchtVonId())
                .orElseThrow(() -> new EntityNotFoundException("Benutzer mit ID " + buchungDto.getGebuchtVonId() + " nicht gefunden."));

        Raum raum = raumRepository.findById(buchungDto.getRaumId())
                .orElseThrow(() -> new EntityNotFoundException("Raum mit ID " + buchungDto.getRaumId() + " nicht gefunden."));

        String subject = "Serienbuchung Bestätigung";
        String body = String.format("Ihre Serienbuchung wurde erfolgreich erstellt.\n\n" +
                        "Betreff: %s\nStartdatum: %s\nEnddatum: %s\nUhrzeit: %s - %s\nRaum: %s\n\nDanke für Ihre Buchung!",
                buchungDto.getBetreff(), buchungDto.getDatum().toString(), serieBis.toString(), buchungDto.getBeginn(), buchungDto.getEnde(), raum.getName());

        emailService.sendSimpleEmail(benutzer.getEmail(), subject, body);

        return serienBuchungen;
    }
}
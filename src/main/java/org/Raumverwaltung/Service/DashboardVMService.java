package org.Raumverwaltung.Service;

import java.time.*;
import java.util.Date;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Enum.StatusServiceTicket;
import org.Raumverwaltung.Model.Buchung;
import org.Raumverwaltung.Model.Raum;
import org.Raumverwaltung.Repository.BuchungRepository;
import org.Raumverwaltung.Repository.RaumRepository;
import org.Raumverwaltung.Repository.ServiceTicketRepository;
import org.Raumverwaltung.Transferobjects.OeffnungszeitenDto;
import org.modelmapper.internal.bytebuddy.asm.Advice;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DashboardVMService {

    private final RaumRepository raumRepository;
    private final BuchungRepository buchungRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    private final OeffnungszeitenService oeffnungszeitenService;

    /**
     * Berechnet die Raumauslastung für eine bestimmt Zeitspanne x.
     *
     * @return Die Raumauslastung als Prozentsatz.
     */
    public double calculateRaumauslastungAktuellerZeitpunkt() {
        long totalRaeume = raumRepository.count();

        LocalDateTime now = LocalDateTime.now();

        long bookedRaeume = buchungRepository.findAll().stream()
                .filter(buchung -> {
                    LocalDateTime buchungsStart = LocalDateTime.of(buchung.getDatum(), buchung.getBeginn());
                    LocalDateTime buchungsEnde = LocalDateTime.of(buchung.getDatum(), buchung.getEnde());
                    return (buchungsStart.isBefore(now) || buchungsStart.isEqual(now)) && // Buchung hat begonnen
                            (buchungsEnde.isAfter(now) || buchungsEnde.isEqual(now));      // Buchung ist noch nicht beendet
                })
                .map(buchung -> buchung.getRaum().getId())
                .distinct()
                .count();

        if (totalRaeume == 0) {
            return 0;
        }

        return (double) bookedRaeume / totalRaeume * 100;
    }

    public double durchschnittlicheRaumauslastungHeute() {
        long totalRaeume = raumRepository.count();
        if (totalRaeume == 0) return 0;

        LocalDate today = LocalDate.now();
        double gesamtAnteil = 0;

        for (Raum raum : raumRepository.findAll()) {
            Duration oeffnungsdauer = oeffnungszeitenService
                    .findByGebaeudeId(raum.getGebaeude().getId())
                    .stream()
                    .map(off -> {
                        Duration d = Duration.between(off.getOeffnungszeit(), off.getSchliesszeit());
                        if (d.isNegative()) {
                            d = d.plusDays(1);
                        }
                        System.out.println("Öffnungszeit für Raum " + raum.getId() + ": " + d.toMinutes() + " Minuten");
                        return d;
                    })
                    .reduce(Duration.ZERO, Duration::plus);

            Duration gesamtBuchungsdauer = buchungRepository.findByRaum_Id(raum.getId())
                    .stream()
                    .filter(buchung -> buchung.getDatum().isEqual(today))
                    .map(buchung -> {
                        Duration d = Duration.between(buchung.getBeginn(), buchung.getEnde());
                        if (d.isNegative()) {
                            d = d.plusDays(1);
                        }
                        System.out.println("Buchung für Raum " + raum.getId() + ": " + d.toMinutes() + " Minuten");
                        return d;
                    })
                    .reduce(Duration.ZERO, Duration::plus);

            double raumAnteil = (double) gesamtBuchungsdauer.toMinutes() / oeffnungsdauer.toMinutes();
            gesamtAnteil += raumAnteil;

            System.out.println("Auslastung Raum " + raum.getId() + ": " + raumAnteil * 100 + "%");
        }

        double ergebnis = (gesamtAnteil / totalRaeume) * 100;
        System.out.println("Durchschnittliche Auslastung: " + ergebnis + "%");
        return ergebnis;
    }



    /**
     * Zählt die Anzahl der offenen Service-Tickets.
     *
     * @return Die Anzahl der offenen Service-Tickets.
     */
    public long countOffeneServiceTickets() {
        return serviceTicketRepository.findAll().stream()
                .filter(ticket -> ticket.getStatus() == StatusServiceTicket.offen)
                .count();
    }

    /**
     * Zählt die Anzahl der Raumbuchungen für eine bestimmte Zeitspanne.
     *
     * @param startDate Das Anfangsdatum
     * @param endDate Das Enddatum
     * @return Die Anzahl der Raumbuchungen
     */
    public long countRaumbuchungen(Date startDate, Date endDate) {
        LocalDate today = LocalDate.now();
        return buchungRepository.findAll().stream()
                .filter(buchung -> buchung.getDatum().isEqual(today))
                .count();
    }

    public long countRaumbuchungenWoche() {
        LocalDate today = LocalDate.now();
        LocalDate end = today;
        boolean running = true;
        while(running){
            if (end.plusDays(1).getDayOfWeek() != DayOfWeek.MONDAY){
                end = end.plusDays(1);
            } else{
                running = false;
            }
        }
        LocalDate finalEnd = end;
        return buchungRepository.findAll().stream()
                .filter(buchung -> !buchung.getDatum().isBefore(today) && !buchung.getDatum().isAfter(finalEnd))
                .count();
    }

    public long countRaumbuchungenMonat() {
        LocalDate today = LocalDate.now();
        LocalDate lastDay = today.plusDays(today.lengthOfMonth()-today.getDayOfMonth());
        return buchungRepository.findAll().stream()
                .filter(buchung -> !buchung.getDatum().isBefore(today) && !buchung.getDatum().isAfter(lastDay))
                .count();
    }
}

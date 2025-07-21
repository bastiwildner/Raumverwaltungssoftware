package org.Raumverwaltung.Controller;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.Raumverwaltung.Service.DashboardVMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class DashboardVMController {

    private final DashboardVMService dashboardVMService;

    @Autowired
    public DashboardVMController(DashboardVMService dashboardVMService) {
        this.dashboardVMService = dashboardVMService;
    }

    @GetMapping("/raumauslastung")
    public double getRaumauslastung(@RequestParam String startDate, @RequestParam String endDate) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        try {
            Date start = formatter.parse(startDate);
            Date end = formatter.parse(endDate);
            return dashboardVMService.calculateRaumauslastungAktuellerZeitpunkt();
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format", e);
        }
    }

    @GetMapping("/raumauslastungHeute")
    public double durchschnittlicheRaumauslastungHeute() {
        return dashboardVMService.durchschnittlicheRaumauslastungHeute();
    }

    @GetMapping("/offeneServiceTickets")
    public long getOffeneServiceTickets() {
        return dashboardVMService.countOffeneServiceTickets();
    }

    @GetMapping("/anzahlRaumbuchungen")
    public long getRaumbuchungen(@RequestParam String startDate, @RequestParam String endDate) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        try {
            Date start = formatter.parse(startDate);
            Date end = formatter.parse(endDate);
            return dashboardVMService.countRaumbuchungen(start, end);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format", e);
        }
    }

    @GetMapping("/anzahlRaumbuchungenWoche")
    public long getRaumbuchungenWoche() {
        return dashboardVMService.countRaumbuchungenWoche();
    }

    @GetMapping("/anzahlRaumbuchungenMonat")
    public long getRaumbuchungenMonat() {
        return dashboardVMService.countRaumbuchungenMonat();
    }
}
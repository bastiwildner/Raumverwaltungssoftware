package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;

import org.Raumverwaltung.Enum.Prioritaet;
import org.Raumverwaltung.Enum.StatusServiceTicket;
import org.Raumverwaltung.Model.ServiceTicket;
import org.Raumverwaltung.Service.ServiceTicketService;
import org.Raumverwaltung.Transferobjects.AusstattungDto;
import org.Raumverwaltung.Transferobjects.ServiceTicketDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final ServiceTicketService serviceTicketService;

    // POST: Erstellen eines neuen Service-Tickets
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<String> create(@Valid @RequestBody ServiceTicketDto serviceTicketDto) {
        String response = serviceTicketService.createServiceTicket(serviceTicketDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT: Aktualisieren eines bestehenden Service-Tickets
    @PutMapping("/update/{id}")
    public ResponseEntity<ServiceTicketDto> update(@Valid @RequestBody ServiceTicketDto serviceTicketDto) {
        ServiceTicketDto updatedTicket = serviceTicketService.updateServiceTicket(serviceTicketDto);
        return ResponseEntity.ok(updatedTicket);
    }

    // DELETE: Löschen eines Service-Tickets anhand der ID
    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        serviceTicketService.deleteServiceTicket(id);
    }

    // GET: Abrufen aller Service-Tickets
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<ServiceTicketDto> getAllServiceTickets() {
        return serviceTicketService.getAllServiceTickets();
    }

    // GET: Abrufen eines Service-Tickets anhand der ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceTicketDto> getById(@PathVariable Long id) {
        ServiceTicketDto serviceTicketDto = serviceTicketService.getServiceTicketById(id);
        return ResponseEntity.ok(serviceTicketDto);
    }

    // DELETE: Löschen aller Service-Tickets eines Raums
    @DeleteMapping("/raum/{raumId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByRaumId(@PathVariable Long raumId) {
        serviceTicketService.deleteServiceTicketsByRaumId(raumId);
    }

    // GET: Suche nach Service-Tickets basierend auf Suchkriterien
    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public List<ServiceTicketDto> searchServiceTickets(
            @RequestParam(required = false) String betreff,
            @RequestParam(required = false) Prioritaet prioritaet,
            @RequestParam(required = false) StatusServiceTicket status) {
        return serviceTicketService.searchServiceTickets(betreff, status, prioritaet);
    }

    @GetMapping("/roomAndEquipment/{id}")
    public List<ServiceTicketDto> getByRoomAndEquipment(@PathVariable Long id){
        return serviceTicketService.getByRoomAndEquipment(id);
    }

    @PutMapping("/closeTickets/{id}")
    public void closeOpenTickets(@PathVariable Long id){
        serviceTicketService.closeOpenTicketsWithEquipment(id);
    }
}
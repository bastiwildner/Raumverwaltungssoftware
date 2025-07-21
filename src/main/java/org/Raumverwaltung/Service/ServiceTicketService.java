package org.Raumverwaltung.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.Raumverwaltung.Enum.Grund;
import org.Raumverwaltung.Enum.Prioritaet;
import org.Raumverwaltung.Enum.Status;
import org.Raumverwaltung.Enum.StatusServiceTicket;
import org.Raumverwaltung.Model.Ausstattung;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Model.ServiceTicket;
import org.Raumverwaltung.Repository.AusstattungRepository;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Repository.ServiceTicketRepository;
import org.Raumverwaltung.Transferobjects.AusstattungDto;
import org.Raumverwaltung.Transferobjects.ServiceTicketDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import static org.Raumverwaltung.Enum.StatusServiceTicket.geschlossen;

@Service
public class ServiceTicketService {

    private final ServiceTicketRepository serviceTicketRepository;
    private final BenutzerRepository benutzerRepository;
    private final AusstattungRepository ausstattungRepository;
    private final ModelMapper modelMapper;

    public ServiceTicketService(ServiceTicketRepository serviceTicketRepository,
                                BenutzerRepository benutzerRepository,
                                AusstattungRepository ausstattungRepository, ModelMapper modelMapper) {
        this.serviceTicketRepository = serviceTicketRepository;
        this.benutzerRepository = benutzerRepository;
        this.ausstattungRepository = ausstattungRepository;
        this.modelMapper = modelMapper;
    }

    public String createServiceTicket(ServiceTicketDto dto) {
        Benutzer lehrender = benutzerRepository.findById(dto.getErstelltVonId())
                .orElseThrow(() -> new EntityNotFoundException("Lehrender nicht gefunden."));

        Ausstattung ausstattung = null;
        if (!Grund.fehlt.equals(dto.getGrund())) {
            ausstattung = ausstattungRepository.findById(dto.getAusstattungId())
                    .orElseThrow(() -> new EntityNotFoundException("Ausstattung nicht gefunden."));
        }

        if (dto.getGrund() == Grund.beschaedigt){
            ausstattung.setStatus(Status.ticket_erstellt);
        }

        Benutzer facilityManager = benutzerRepository.findById(dto.getZustaendigerId())
                .orElseThrow(() -> new EntityNotFoundException("Facility Manager nicht gefunden."));

        ServiceTicket ticket = new ServiceTicket();
        ticket.setBetreff(dto.getBetreff());
        ticket.setGrund(dto.getGrund());
        ticket.setPrioritaet(dto.getPrioritaet());
        ticket.setBeschreibung(dto.getBeschreibung());
        ticket.setAusstattung(ausstattung);
        ticket.setErstelltVon(lehrender);
        ticket.setZustaendiger(facilityManager);
        ticket.setDatumErstellt(LocalDateTime.now());
        ticket.setStatus(StatusServiceTicket.offen);

        serviceTicketRepository.save(ticket);

        return "Service-Ticket erfolgreich erstellt.";
    }


    public ServiceTicketDto updateServiceTicket(ServiceTicketDto dto) {
        Benutzer facilityManager = benutzerRepository.findById(dto.getZustaendigerId())
                .orElseThrow(() -> new EntityNotFoundException("Facility Manager nicht gefunden."));
        
        ServiceTicket ticket = serviceTicketRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Service-Ticket nicht gefunden."));

        if (!ticket.getZustaendiger().equals(facilityManager)) {
            throw new SecurityException("Unbefugter Zugriff.");
        }

        if (dto.getPrioritaet() != null) {
            ticket.setPrioritaet(dto.getPrioritaet());
        }
        if (dto.getStatus() != null) {
            ticket.setStatus(dto.getStatus());
            if(dto.getStatus() == geschlossen){
                Ausstattung ausstattung = ausstattungRepository.findById(dto.getAusstattungId())
                        .orElseThrow(() -> new EntityNotFoundException("Ausstattung nicht gefunden."));
                ausstattung.setStatus(Status.funktionstuechtig);
                ticket.setAusstattung(null);
            }
        }

        ServiceTicket updatedTicket = serviceTicketRepository.save(ticket);
        return convertToDto(updatedTicket);
    }

    public void deleteServiceTicket(Long id) {
        serviceTicketRepository.deleteById(id);
    }

    public List<ServiceTicketDto> searchServiceTickets(String betreff, StatusServiceTicket status, Prioritaet prioritaet) {
        return serviceTicketRepository.search(betreff, status, prioritaet).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    public List<ServiceTicketDto> getAllServiceTickets() {
        return serviceTicketRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ServiceTicketDto getServiceTicketById(Long id) {
        ServiceTicket ticket = serviceTicketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service-Ticket nicht gefunden."));
        return convertToDto(ticket);
    }

    public String deleteServiceTicketsByRaumId(Long raumId) {
        List<ServiceTicket> tickets = serviceTicketRepository.findByAusstattungRaumId(raumId);

        for (ServiceTicket ticket : tickets) {
            sendEmailNotification(ticket);
            serviceTicketRepository.delete(ticket);
        }

        return "Alle zugehörigen Service-Tickets wurden erfolgreich gelöscht.";
    }

    private void sendEmailNotification(ServiceTicket ticket) {
        // Implementiere die E-Mail-Benachrichtigungslogik hier
        System.out.println("E-Mail-Benachrichtigung gesendet für Ticket: " + ticket.getBetreff());
    }

    private ServiceTicketDto convertToDto(ServiceTicket ticket) {
        return modelMapper.map(ticket, ServiceTicketDto.class);
    }

    public List<ServiceTicketDto> getByRoomAndEquipment(Long id) {

        return serviceTicketRepository.findByAusstattungId(id).stream()
                .map(this::convertToDto)
                .toList();

    }

    public void closeOpenTicketsWithEquipment(Long id){

        List<ServiceTicket> serviceTickets = serviceTicketRepository.findByAusstattungId(id).stream()
                .peek(serviceTicket -> serviceTicket.setStatus(geschlossen)).toList();

        for (ServiceTicket serviceTicket : serviceTickets){
            updateServiceTicket(convertToDto(serviceTicket));
        }
}
}
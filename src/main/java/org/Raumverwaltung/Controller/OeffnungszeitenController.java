package org.Raumverwaltung.Controller;

import java.util.List;

import org.Raumverwaltung.Service.OeffnungszeitenService;
import org.Raumverwaltung.Transferobjects.OeffnungszeitenDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/oeffnungszeiten")
public class OeffnungszeitenController {

    private final OeffnungszeitenService service;

    public OeffnungszeitenController(OeffnungszeitenService service) {
        this.service = service;
    }

    @GetMapping("/{gebaeudeId}")
    public List<OeffnungszeitenDto> getOeffnungszeitenByGebaeudeId(@PathVariable Long gebaeudeId) {
        return service.findByGebaeudeId(gebaeudeId);
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public List<OeffnungszeitenDto> create(@RequestBody List<OeffnungszeitenDto> dto) {
        return service.create(dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/update")
    public void updateOpeningHours(@RequestBody List<OeffnungszeitenDto> openingHours) {
        service.updateOpeningHours(openingHours);
    }
}
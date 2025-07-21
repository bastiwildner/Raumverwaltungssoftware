package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Service.GebaeudeService;
import org.Raumverwaltung.Transferobjects.GebaeudeDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gebaeude")
@RequiredArgsConstructor
public class GebaeudeController {

    private final GebaeudeService gebaeudeService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public GebaeudeDto create(@RequestBody GebaeudeDto gebaeudeDTO){
        return gebaeudeService.create(gebaeudeDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") Long id) {
        gebaeudeService.delete(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public GebaeudeDto update(@PathVariable("id") Long id, @RequestBody GebaeudeDto gebaeudeDto) {
       return gebaeudeService.update(id, gebaeudeDto);
    }

    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<GebaeudeDto> getAllGebaeude() {
        return gebaeudeService.getAllGebaeude();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public GebaeudeDto getById(@PathVariable("id") Long id) {
        return gebaeudeService.findById(id);
    }

    @GetMapping("/{id}/facility-manager")
    @ResponseStatus(HttpStatus.OK)
    public Benutzer getFacilityManagerByBuildingId(@PathVariable("id") Long id) {
        return gebaeudeService.getFacilityManagerByBuildingId(id);
    }

}

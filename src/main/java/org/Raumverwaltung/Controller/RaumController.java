package org.Raumverwaltung.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Service.RaumService;
import org.Raumverwaltung.Transferobjects.RaumDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raeume")
@RequiredArgsConstructor
public class RaumController {

    private final RaumService service;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public RaumDto create(@Valid @RequestBody RaumDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public RaumDto update(@PathVariable Long id, @Valid @RequestBody RaumDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/gebaeude/{gebaeudeId}")
    public List<RaumDto> getByGebaeude(@PathVariable Long gebaeudeId) {
        return service.findByGebaeudeId(gebaeudeId);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public RaumDto getRaumById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public List<RaumDto> searchRaeume(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) Integer minKapazitaet,
        @RequestParam(required = false) String ausstattung
) {
    return service.searchRaeume(name, minKapazitaet, ausstattung);
}
}
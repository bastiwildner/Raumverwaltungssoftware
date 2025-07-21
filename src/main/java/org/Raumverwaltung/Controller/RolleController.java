package org.Raumverwaltung.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Service.RolleService;
import org.Raumverwaltung.Transferobjects.RolleDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rollen")
@RequiredArgsConstructor
public class RolleController {

    private final RolleService rolleService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public RolleDto create(@Valid @RequestBody RolleDto dto) {
        return rolleService.create(dto);
    }

    @PutMapping("/update/{id}")
    public RolleDto update(@PathVariable Long id, @Valid @RequestBody RolleDto dto) {
        return rolleService.update(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        rolleService.delete(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RolleDto> getAll() {
        return rolleService.getAll();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public RolleDto getById(@PathVariable Long id) {
        return rolleService.getById(id);
    }

    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public List<RolleDto> searchRollen(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String beschreibung
    ) {
        return rolleService.searchRollen(name, beschreibung);
    }
}

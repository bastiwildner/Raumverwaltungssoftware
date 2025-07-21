package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Model.Benutzer;
import org.Raumverwaltung.Repository.BenutzerRepository;
import org.Raumverwaltung.Service.BenutzerService;
import org.Raumverwaltung.Service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final BenutzerRepository benutzerRepository;

    @PostMapping("/resetPW")
    public String sendEmail(@RequestParam String email) {

        Benutzer benutzer = benutzerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Venutzer mit Email " + email + " nicht gefunden."));

        String subject = "Passwort zurücksetzen";
        String resetLink = "http://localhost:3000/PasswortAendern/" + benutzer.getId();
        String body = "Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen: \n" + resetLink;

        emailService.sendSimpleEmail(email, subject, body);
        return "E-Mail wurde gesendet!";
    }
}

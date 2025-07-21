package org.Raumverwaltung.Controller;

import lombok.RequiredArgsConstructor;
import org.Raumverwaltung.Service.LoginSessionService;
import org.Raumverwaltung.Transferobjects.LoginDto;
import org.Raumverwaltung.Transferobjects.LoginSessionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class LoginSessionController {

    private final LoginSessionService loginSessionService;

    // POST: Login eines Benutzers
    @PostMapping("/login")
    public ResponseEntity<LoginSessionDto> login(@RequestBody LoginDto loginDto) {
        LoginSessionDto session = loginSessionService.login(loginDto);
        return ResponseEntity.ok(session);
    }

    /**
     * Logout eines Benutzers.
     *
     * @param token Der Sitzungstoken, der beendet werden soll.
     * @return Eine Nachricht, die den erfolgreichen Logout bestätigt.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestParam("token") String token) {
        loginSessionService.logout(token);
        return ResponseEntity.ok("Logout erfolgreich.");
    }
}


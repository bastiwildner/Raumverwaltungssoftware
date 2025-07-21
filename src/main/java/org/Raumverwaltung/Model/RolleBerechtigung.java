package org.Raumverwaltung.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
@Entity
@Table(name = "Rolle_Berechtigung")
public class RolleBerechtigung {
    @EmbeddedId
    private RolleBerechtigungId id;

    @ManyToOne
    @MapsId("rolleId")
    private Rolle rolle;

    @ManyToOne
    @MapsId("berechtigungId")
    private Berechtigung berechtigung;

}

@Data
@Embeddable
class RolleBerechtigungId implements Serializable {
    private Long rolleId;
    private Long berechtigungId;

    @Override
    public int hashCode() {
        return Objects.hash(rolleId, berechtigungId);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RolleBerechtigungId that = (RolleBerechtigungId) o;
        return Objects.equals(rolleId, that.rolleId) &&
                Objects.equals(berechtigungId, that.berechtigungId);
    }
}

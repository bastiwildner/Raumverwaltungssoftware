package org.Raumverwaltung.Enum;

import java.time.DayOfWeek;

public enum Wochentag {
    Mo,
    Di,
    Mi,
    Do,
    Fr,
    Sa,
    So;

    public static Wochentag fromDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> Mo;
            case TUESDAY -> Di;
            case WEDNESDAY -> Mi;
            case THURSDAY -> Do;
            case FRIDAY -> Fr;
            case SATURDAY -> Sa;
            case SUNDAY -> So;
            default -> throw new IllegalArgumentException("Ungültiger Wochentag: " + dayOfWeek);
        };
    }
    public static DayOfWeek mapToDayOfWeek(Wochentag wochentag) {
        return switch (wochentag) {
            case Mo -> DayOfWeek.MONDAY;
            case Di -> DayOfWeek.TUESDAY;
            case Mi -> DayOfWeek.WEDNESDAY;
            case Do -> DayOfWeek.THURSDAY;
            case Fr -> DayOfWeek.FRIDAY;
            case Sa -> DayOfWeek.SATURDAY;
            case So -> DayOfWeek.SUNDAY;
        };
    }
}

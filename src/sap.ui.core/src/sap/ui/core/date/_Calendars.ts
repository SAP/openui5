export class _Calendars {
    static get(sCalendarType: any) {
        if (!mRegistry.has(sCalendarType)) {
            sap.ui.requireSync("sap/ui/core/date/" + sCalendarType);
        }
        return mRegistry.get(sCalendarType);
    }
    static set(sCalendarType: any, CalendarClass: any) {
        mRegistry.set(sCalendarType, CalendarClass);
    }
}
var mRegistry = new Map();
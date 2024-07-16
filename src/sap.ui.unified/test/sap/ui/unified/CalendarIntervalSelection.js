sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/unified/Calendar",
	"sap/m/Button",
	"sap/ui/core/date/UI5Date"
], function(
	Localization,
	nextUIUpdate,
	unifiedLibrary,
	App,
	Page,
	Calendar,
	Button,
	UI5Date
) {
	"use strict";
	var CalendarDayType = unifiedLibrary.CalendarDayType,
		DateRange = unifiedLibrary.DateRange,
		DateTypeRange = unifiedLibrary.DateTypeRange,
		oCalendar1;

	var oButton2 = new Button("B2", {
		text : "Interval",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.destroySelectedDates();
			oCalendar1.addSelectedDate(new DateRange("DR1",{startDate: UI5Date.getInstance(2015, 0, 2), endDate: UI5Date.getInstance(2015, 0, 7)}));
			oCalendar1.setIntervalSelection(true);
			oCalendar1.setSingleSelection(true);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oApp = new App("myApp").placeAt("body");

	var oPage = new Page({
		title: "Calendar",
		content : [
			oButton2
		]
	});

	function fnCalendarFactory() {
		return new Calendar("Cal1", {
			selectedDates: [new DateRange("DR1",{startDate: UI5Date.getInstance(2015, 0, 2)})],
			specialDates: [ new DateTypeRange("SDR01",{startDate: UI5Date.getInstance(2015, 1, 2), type: CalendarDayType.Type01}),
							new DateTypeRange("SDR02",{startDate: UI5Date.getInstance(2015, 1, 3), type: CalendarDayType.Type02}),
							new DateTypeRange("SDR03",{startDate: UI5Date.getInstance(2015, 1, 4), type: CalendarDayType.Type03}),
							new DateTypeRange("SDR04",{startDate: UI5Date.getInstance(2015, 1, 5), type: CalendarDayType.Type04}),
							new DateTypeRange("SDR05",{startDate: UI5Date.getInstance(2015, 1, 6), type: CalendarDayType.Type05}),
							new DateTypeRange("SDR06",{startDate: UI5Date.getInstance(2015, 1, 7), type: CalendarDayType.Type06}),
							new DateTypeRange("SDR07",{startDate: UI5Date.getInstance(2015, 1, 8), type: CalendarDayType.Type07}),
							new DateTypeRange("SDR08",{startDate: UI5Date.getInstance(2015, 1, 9), type: CalendarDayType.Type08}),
							new DateTypeRange("SDR09",{startDate: UI5Date.getInstance(2015, 1, 10), type: CalendarDayType.Type09}),
							new DateTypeRange("SDR10",{startDate: UI5Date.getInstance(2015, 1, 11), type: CalendarDayType.Type10}),
							new DateTypeRange("SDR11",{startDate: UI5Date.getInstance(2015, 1, 12), type: CalendarDayType.Type10, color:"#ffffff"}),
							new DateTypeRange("SDR12",{startDate: UI5Date.getInstance(2015, 1, 13), type: CalendarDayType.Type10, color:"#ffff66"}),
							new DateTypeRange("SDR13",{startDate: UI5Date.getInstance(2015, 1, 14), endDate: UI5Date.getInstance(2015, 1, 16), type: CalendarDayType.Type10})
						]
		});
	}

	oApp.addPage(oPage);

});
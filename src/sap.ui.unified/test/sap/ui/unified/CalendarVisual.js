sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/CalendarType",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/unified/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	'sap/ui/core/date/UI5Date'
], function(
	Localization,
	CalendarType,
	nextUIUpdate,
	unifiedLibrary,
	App,
	Page,
	Calendar,
	DateRange,
	DateTypeRange,
	Button,
	VerticalLayout,
	UI5Date
) {
	"use strict";
	var CalendarDayType = unifiedLibrary.CalendarDayType,
		oCalendar1,
		oButton1 = new Button("B1", {
			text : "Single",
			press : function(){
				Localization.setLanguage("en-US");
				oCalendar1 && oCalendar1.destroy();
				oCalendar1 = fnCalendarFactory();
				oCalendar1.setIntervalSelection(false);
				oCalendar1.setSingleSelection(true);
				oPage.insertContent(oCalendar1, 0);
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
				oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
			}
		});

	var oButton2 = new Button("B2", {
		text : "Interval",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.destroySelectedDates();
			oCalendar1.addSelectedDate(new DateRange("DR1",{startDate: new Date(2015, 0, 2), endDate: new Date(2015, 0, 7)}));
			oCalendar1.setIntervalSelection(true);
			oCalendar1.setSingleSelection(true);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton3 = new Button("B3", {
		text : "Multi",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setIntervalSelection(false);
			oCalendar1.setSingleSelection(false);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton4 = new Button("B4", {
		text : "2 Types",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setIntervalSelection(false);
			oCalendar1.setSingleSelection(true);
			oCalendar1.setSecondaryCalendarType(CalendarType.Islamic);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton5 = new Button("B5", {
		text : "Width",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setIntervalSelection(false);
			oCalendar1.setSingleSelection(true);
			oCalendar1.setWidth("400px");
			oCalendar1.addDisabledDate(new DateRange({
				startDate: UI5Date.getInstance(2015, 0, 8)
			}));
			oCalendar1.addDisabledDate(new DateRange({
				startDate: UI5Date.getInstance(2015, 0, 16),
				endDate: UI5Date.getInstance(2015, 0, 20)
			}));
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton6 = new Button("B6", {
		text : "4 Months",
		press : function(){
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setIntervalSelection(false);
			oCalendar1.setSingleSelection(true);
			oCalendar1.setWidth("100%");
			oCalendar1.setMonths(4);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 31));
		}
	});

	var oButton70 = new Button("B70", {
		text : "Chinese calendar",
		press : function() {
			Localization.setLanguage("zh-CN");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setLocale("zh_CN");
			oCalendar1.destroySelectedDates();
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton7 = new Button("B7", {
		text : "2 Months Chinese calendar",
		press : function() {
			Localization.setLanguage("zh-CN");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setLocale("zh_CN");
			oCalendar1.destroySelectedDates();
			oCalendar1.setMonths(2);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton8 = new Button("B8", {
		text : "2 Months Gregorian calendar",
		press : function() {
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.destroySelectedDates();
			oCalendar1.setMonths(2);
			oCalendar1.setMaxDate(UI5Date.getInstance(2015, 7, 24));
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton9 = new Button("B9", {
			text : "Current Date Button",
			press : function(){
				Localization.setLanguage("en-US");
				oCalendar1 && oCalendar1.destroy();
				oCalendar1 = fnCalendarFactory();
				oCalendar1.setIntervalSelection(false);
				oCalendar1.setSingleSelection(true);
				oCalendar1.setShowCurrentDateButton(true);
				oPage.insertContent(oCalendar1, 0);
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
				oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
			}
		});

	var oButtonRTL = new Button("BRTL", {
		text : "2 months Arabic calendar",
		press : function() {
			Localization.setLanguage("ar");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.setLocale("ar");
			oCalendar1.destroySelectedDates();
			oCalendar1.setMonths(2);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton10 = new Button("B10", {
		text : "2 Months 1 column calendar",
		press : function() {
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.destroySelectedDates();
			oCalendar1.setMonths(2);
			oCalendar1.setMaxDate(UI5Date.getInstance(2015, 7, 24));
			oCalendar1.setWidth("90%");
			oVL.addContent(oCalendar1);
			oVL.setWidth("270px");
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 2));
		}
	});

	var oButton11 = new Button("B11", {
		text : "Non Working Days",
		press : function() {
			Localization.setLanguage("en-US");
			oCalendar1 && oCalendar1.destroy();
			oCalendar1 = fnCalendarFactory();
			oCalendar1.destroySelectedDates();
			oCalendar1.setNonWorkingDays([]);
			oPage.insertContent(oCalendar1, 0);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oCalendar1.focusDate(UI5Date.getInstance(2015, 0, 1));
		}
	});

	var oApp = new App("myApp").placeAt("body");
	var oVL = new VerticalLayout("vLayout");

	var oPage = new Page({
		title: "Calendar",
		content : [
			oButton1,
			oButton2,
			oButton3,
			oButton4,
			oButton5,
			oButton6,
			oButton70,
			oButton7,
			oButton8,
			oButton9,
			oButtonRTL,
			oButton10,
			oButton11,
			oVL
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
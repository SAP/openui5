sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange"
], function(App, Label, Page, CalendarType, DateFormat, VerticalLayout, Calendar, DateRange, DateTypeRange) {
	"use strict";

	var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

	//TODO: These special days are for fix dates during 2015 - this should be made dynamic (like in our samples).
	var aSpecialDays = [
		["20150101",undefined,"Neujahr",1],
		["20150106",undefined,"Heilige Drei Könige",1],
		["20150214",undefined,"Valentinstag",2],
		["20150216",undefined,"Rosenmontag",2],
		["20150217",undefined,"Fastnacht",2],
		["20150218",undefined,"Aschermittwoch",2],
		["20150403",undefined,"Karfreitag",1],
		["20150405",undefined,"Ostersonntag",1],
		["20150406",undefined,"Ostermontag",1],
		["20150501",undefined,"Maifeiertag",1],
		["20150510",undefined,"Muttertag",2],
		["20150514",undefined,"Christi Himmelfahrt",1],
		["20150524",undefined,"Pfingstsonntag",1],
		["20150525",undefined,"Pfingstmontag",1],
		["20150604",undefined,"Fronleichnam",1],
		["20150815",undefined,"Mariä Himmelfahrt",2],
		["20151003",undefined,"Tag der Deutschen Einheit",1],
		["20151004",undefined,"Erntedankfest",2],
		["20151031",undefined,"Reformationstag",2],
		["20151101",undefined,"Allerheiligen",1],
		["20151115",undefined,"Volkstrauertag",2],
		["20151118",undefined,"Buß- und Bettag",2],
		["20151125",undefined,"Totensonntag",2],
		["20151129",undefined,"1. Advent",2],
		["20151206",undefined,"Nikolaus",2],
		["20151206",undefined,"2. Advent",2],
		["20151213",undefined,"3. Advent",2],
		["20151220",undefined,"4. Advent",2],
		["20151224",undefined,"Heiligabend",2],
		["20151225","20141226","Weihnachten",1],
		["20151231",undefined,"Silvester",2],
		["20160101",undefined,"Neujahr",1],
		["20160106",undefined,"Heilige Drei Könige",1]
	];

	// Single Day Selection
	var oSingleDaySelectionLabel = new Label({
		text: "Single Day Selection"
	});
	var oSingleDaySelectionCalendar = new Calendar({
		ariaLabelledBy: oSingleDaySelectionLabel
	});

	for (var i = 0; i < aSpecialDays.length; i++) {
		var aSpecialDay = aSpecialDays[i];
		var sType = "";
		if (aSpecialDay[3] < 10) {
			sType = "Type0" + aSpecialDay[3];
		} else {
			sType = "Type" + aSpecialDay[3];
		}
		oSingleDaySelectionCalendar.addSpecialDate(new DateTypeRange({
			startDate: oFormatYyyymmdd.parse(aSpecialDay[0]),
			endDate: oFormatYyyymmdd.parse(aSpecialDay[1]),
			type: sType,
			tooltip: aSpecialDay[2]
		}));
	}

	var oDate = new Date();
	oDate.setDate(oDate.getDate() + 2);
	oSingleDaySelectionCalendar.addDisabledDate(new DateRange({
		startDate: oDate
	}));


	// Single Interval Selection
	var oSingleIntervalSelectionLabel = new Label({
		text: "Single Interval Selection"
	});
	var oSingleIntervalSelectionCalendar = new Calendar({
		intervalSelection: true,
		ariaLabelledBy: oSingleIntervalSelectionLabel
	});


	// Multiple Days Selection
	var oMultipleDaysSelectionLabel = new Label({
		text: "Multiple Days Selection"
	});
	var oMultipleDaysSelectionCalendar = new Calendar({
		intervalSelection: false,
		singleSelection: false,
		ariaLabelledBy: oMultipleDaysSelectionLabel
	});


	// With Multiple Months
	var oWithMultipleMonthsLabel = new Label({
		text: "With Multiple Months"
	});
	var oWithMultipleMonthsCalendar = new Calendar({
		months: 3,
		ariaLabelledBy: oWithMultipleMonthsLabel
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oSingleDaySelectionLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oSingleDaySelectionCalendar,
			oSingleIntervalSelectionLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oSingleIntervalSelectionCalendar,
			oMultipleDaysSelectionLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oMultipleDaysSelectionCalendar,
			oWithMultipleMonthsLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oWithMultipleMonthsCalendar
		]
	});

	var oApp = new App();
	var oPage = new Page({
		title: "Calendar Accessibility Test Page",
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});

sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/library"
], function(App, Label, Page, VerticalLayout, Calendar, DateRange, DateTypeRange, CalendarLegend, CalendarLegendItem, UI5Date, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	const oCalendarLegend = new CalendarLegend({
		items: [
			new CalendarLegendItem({color: "#98F5F9", text: "Holiday 1"}),
			new CalendarLegendItem({color: "#FFDE59", text: "Holiday 2"}),
			new CalendarLegendItem({color: "hsla(90,10%,30%,0.5)", text: "Vacation"}),
			new CalendarLegendItem({color: "rgb(150,150,0)", text: "Teambuilding"}),

			new CalendarLegendItem({type: "Type06", text: "Holiday 3"}),
			new CalendarLegendItem({type: "Type08", text: "Holiday 4"}),
			new CalendarLegendItem({type: "Type10", text: "Business trip"})
		]
	});

	const oSpecialDate = [
		// Custom colors
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 2), color: "#98F5F9", type: "Type01", tooltip: "Holiday 1"}), // hex format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 3), color: "#FFDE59", type: "Type02", tooltip: "Holiday 2"}), // hex format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 4), color: "hsla(90,10%,30%,0.5)", type: "Type03", tooltip: "Vacation"}), // hsla format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 5), color: "rgb(150,150,0)", type: "Type04", tooltip: "Teambuilding"}), // rgb format

		// Color via corresponding type
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 6), type: "Type06", tooltip: "Holiday 3"}),
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 7), type: "Type08", tooltip: "Holiday 4"}),
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 8), type: "Type10", tooltip: "Business trip"}),

		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 16), color: "#98F5F9", type: "Type01", tooltip: "Holiday 1"}), // hex format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 17), color: "#FFDE59", type: "Type02", tooltip: "Holiday 2"}), // hex format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 18), color: "hsla(90,10%,30%,0.5)", type: "Type03", tooltip: "Vacation"}), // hsla format
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 19), color: "rgb(150,150,0)", type: "Type04", tooltip: "Teambuilding"}), // rgb format

		// Color via corresponding type
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 20), type: "Type06", tooltip: "Holiday 3"}),
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 21), type: "Type08", tooltip: "Holiday 4"}),
		new DateTypeRange({startDate: UI5Date.getInstance(2017, 3, 22), type: "Type10", tooltip: "Business trip"})
	];

	// Single Day Selection
	const oSingleDaySelectionLabel = new Label({
		text: "Calendar with Legend"
	});
	const oSingleDaySelectionCalendar = new Calendar({
		startDate: UI5Date.getInstance(2017, 3, 1),
		ariaLabelledBy: oSingleDaySelectionLabel,
		legend: oCalendarLegend,
		selectedDates: [new DateRange({startDate: UI5Date.getInstance(2017, 3, 12)})],
		specialDates: oSpecialDate
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oSingleDaySelectionLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oSingleDaySelectionCalendar,
			oCalendarLegend
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "CalendarLegend Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});

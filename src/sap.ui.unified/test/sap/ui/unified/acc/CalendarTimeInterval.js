sap.ui.define([
	"sap/m/Label",
	"sap/ui/unified/CalendarTimeInterval",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date"
], function(
	Label,
	CalendarTimeInterval,
	App,
	Page,
	VerticalLayout,
	coreLibrary,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oLabel1 = new Label({
		text: "Single selection",
		wrapping: true,
		labelFor: "Cal1"
	});
	var oCalendar1 = new CalendarTimeInterval("Cal1", {
		items: 7,
		width: "320px"
	});

	var oStartDate = UI5Date.getInstance();
	oStartDate.setDate(15);
	oStartDate.setMonth(oStartDate.getMonth() - 1);

	var oLabel2 = new Label({
		text: "Single interval Selection",
		wrapping: true,
		labelFor: "Cal2"
	});
	var oCalendar2 = new CalendarTimeInterval("Cal2",{
		width: "320px",
		startDate: oStartDate,
		items: 7,
		intervalMinutes: 30,
		intervalSelection: true
	});

	var oLabel3 = new Label({
		text: "Multiple selection",
		wrapping: true,
		labelFor: "Cal3"
	});
	var oCalendar3 = new CalendarTimeInterval("Cal3",{
		width: "320px",
		items: 7,
		intervalMinutes: 120,
		intervalSelection: false,
		singleSelection: false,
		pickerPopup: true
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oLabel1, oCalendar1,
			oLabel2, oCalendar2,
			oLabel3, oCalendar3
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "CalendarTimeInterval Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
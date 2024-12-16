sap.ui.define([
	"sap/m/Label",
	"sap/ui/unified/CalendarDateInterval",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date"
], function(
	Label,
	CalendarDateInterval,
	App,
	Page,
	VerticalLayout,
	coreLibrary,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oCal = new CalendarDateInterval("Cal1",{
		days: 7,
		width: "320px"
	});

	var oStartDate = UI5Date.getInstance();
	oStartDate.setDate(oStartDate.getDate() - 1);
	var oCal2 = new CalendarDateInterval("Cal2", {
		width: "320px",
		startDate: oStartDate,
		days: 7,
		intervalSelection: true
	});

	var oStartDateEndMonth = UI5Date.getInstance();
	oStartDateEndMonth.setDate(28);
	var oCal3 = new CalendarDateInterval("Cal3",{
		width: "320px",
		startDate: oStartDateEndMonth,
		days: 7,
		intervalSelection: false,
		singleSelection: false
	});

	var oApp = new App();
	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "Single selection",
				labelFor: "Cal1",
				wrapping: true
			}),
			oCal,
			new Label({
				text: "Single interval selection",
				labelFor: "Cal2",
				wrapping: true
			}),
			oCal2,
			new Label({
				text: "Multiple selection",
				labelFor: "Cal3",
				wrapping: true
			}),
			oCal3
		]
	}).addStyleClass("sapUiContentPadding");

	var oPage = new Page({
		title: "CalendarDateInterval Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [oPageLayout]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
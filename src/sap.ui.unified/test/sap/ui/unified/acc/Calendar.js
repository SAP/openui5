sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/core/library"
], function(App, Label, Page, VerticalLayout, Calendar, DateRange, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oSingleDaySelectionLabel = new Label({
		text: "Single Day Selection",
		wrapping: true
	});
	var oSingleDaySelectionCalendar = new Calendar({
		ariaLabelledBy: oSingleDaySelectionLabel
	});

	var oDate = new Date();
	oDate.setDate(oDate.getDate() + 2);
	oSingleDaySelectionCalendar.addDisabledDate(new DateRange({
		startDate: oDate
	}));

	var oWithMultipleMonthsLabel = new Label({
		text: "With Multiple Months",
		wrapping: true
	});
	var oWithMultipleMonthsCalendar = new Calendar({
		months: 2,
		ariaLabelledBy: oWithMultipleMonthsLabel
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oSingleDaySelectionLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oSingleDaySelectionCalendar,
			oWithMultipleMonthsLabel.addStyleClass("sapUiSmallMarginTopBottom"),
			oWithMultipleMonthsCalendar
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "Calendar Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});

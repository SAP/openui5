sap.ui.define([
	"sap/base/i18n/date/CalendarType",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/DateRangeSelection",
	"sap/m/FormattedText",
	"sap/m/App",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/date/UI5Date"
], function(
	CalendarType,
	Element,
	coreLibrary,
	Page,
	Label,
	DateRangeSelection,
	FormattedText,
	App,
	VerticalLayout,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var iEvent = 0;

	function handleChange(oEvent) {
		var oDRS = oEvent.getSource(),
			sFrom = oEvent.getParameter("from"),
			sTo = oEvent.getParameter("to"),
			bValid = oEvent.getParameter("valid");

		iEvent++;

		var oText = Element.getElementById("TextEvent");
		oText.setText("Event " + iEvent + "\nId: " + oEvent.getSource().getId() + "\nFrom: " + sFrom + "\nTo: " + sTo + "\nvalid: " + bValid);
		if (bValid) {
			oDRS.setValueState(ValueState.None);
		} else {
			oDRS.setValueState(ValueState.Error);
		}
	}

	var dateFrom = UI5Date.getInstance();
	dateFrom.setUTCDate(16);
	dateFrom.setUTCMonth(1);
	dateFrom.setUTCFullYear(2014);

	var dateTo = UI5Date.getInstance();
	dateTo.setUTCDate(27);
	dateTo.setUTCMonth(1);
	dateTo.setUTCFullYear(2014);

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "DRS1 - Initial DateRangeSelection control:",
				labelFor: "DRS1",
				wrapping: true
			}),
			new DateRangeSelection("DRS1", { displayFormat: "dd.MM.yyyy", change: handleChange}),

			new Label({
				text: "DRS2 - DateRangeSelection control with given range and with shortcut for today:",
				labelFor: "DRS2",
				wrapping: true
			}),
			new DateRangeSelection("DRS2", {
				delimiter: "#",
				displayFormat: "yyyy/MM/dd",
				dateValue: dateFrom,
				secondDateValue: dateTo,
				showCurrentDateButton: true,
				change: handleChange
			}),

			new Label({
				text: "DRS3 - DateRangeSelection control with placeholder from CLDR:",
				labelFor: "DRS3",
				wrapping: true
			}),
			new DateRangeSelection("DRS3", {
				delimiter: "",
				displayFormat: "short",
				change: handleChange
			}),

			new Label({
				text: "islamic DateRangeSelection with secondary gregorianic",
				labelFor: "DRS4",
				wrapping: true
			}),
			new DateRangeSelection("DRS4", {
				displayFormatType: "Islamic",
				secondaryCalendarType: CalendarType.Gregorian,
				change: handleChange
			}),

			new Label({
				text: "DateRangeSelection with minDate=2016-01-01 and maxDate=2016-12-31",
				labelFor: "DRS7",
				wrapping: true
			}),
			new DateRangeSelection("DRS7", {
				minDate: UI5Date.getInstance("2016", "0", "01"),
				maxDate: UI5Date.getInstance("2016", "11", "31"),
				change: handleChange
			}),

			new Label({
				text: "DateRangeSelection with displayFormat=\"yyyy-MM\"",
				labelFor: "DRS8",
				wrapping: true
			}),
			new DateRangeSelection("DRS8", { displayFormat: "yyyy-MM", change: handleChange}),

			new Label({
				text: "DateRangeSelection with displayFormat=\"yyyy\"",
				labelFor: "DRS10",
				wrapping: true
			}),
			new DateRangeSelection("DRS10", { displayFormat: "yyyy", change: handleChange }),

			new Label({
				text: "Please select a travel period (scenario with Error state): ",
				labelFor: "DRS5",
				wrapping: true
			}),
			new DateRangeSelection("DRS5", {
				displayFormat: "dd.MM.yyyy",
				valueState: ValueState.Error,
				formattedValueStateText: new FormattedText({
					htmlText: "We're sorry, there is no option to select these dates"
				})
			}),

			new Label({
				text: "Please select a travel period (scenario with Warning state): ",
				labelFor: "DRS6",
				wrapping: true
			}),
			new DateRangeSelection("DRS6", {
				displayFormat: "dd.MM.yyyy",
				valueState: ValueState.Warning,
				formattedValueStateText: new FormattedText({
					htmlText: "Please keep in mind that the indicated interval conflicts with another trip"
				})
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oPage = new Page({
		title: "DateRangeSelection Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [oPageLayout]
	});

	var oApp = new App();
	oApp.addPage(oPage);
	oApp.placeAt("body");
});

sap.ui.define([
	"sap/m/App",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, DateTimePicker, Label, Page, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleChange(oEvent){
		var oDP = oEvent.getSource();
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oDP.setValueState(ValueState.None);
		} else {
			oDP.setValueState(ValueState.Error);
		}
	}

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "Choose a date and time",
				labelFor: "DTP1",
				wrapping: true
			}),
			new DateTimePicker("DTP1", {
				change: handleChange
			}),
			new Label({
				text: "Value format defined. Select a date and time",
				labelFor: "DTP2",
				wrapping: true
			}),
			new DateTimePicker("DTP2", {
				value: "2016-02-16,12-50-30",
				valueFormat: "yyyy-MM-dd,HH-mm-ss",
				displayFormat: "long/short",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "DatePicker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});

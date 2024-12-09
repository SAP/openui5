sap.ui.define([
	"sap/m/App",
	"sap/m/DatePicker",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, DatePicker, Label, Page, VerticalLayout, coreLibrary) {
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
				text: "Choose a date",
				labelFor: "DP1",
				wrapping: true
			}),
			new DatePicker("DP1", {
				change: handleChange
			}),
			new Label({
				text: "Value format defined. Select a date",
				labelFor: "DP2",
				wrapping: true
			}),
			new DatePicker("DP2", {
				value: "2014-03-26",
				valueFormat: "yyyy-MM-dd",
				displayFormat: "long",
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

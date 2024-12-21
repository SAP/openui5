sap.ui.define([
	"sap/ui/layout/VerticalLayout",
	"sap/m/TimePicker",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/library",
	"sap/m/library"
], function(
	VerticalLayout,
	TimePicker,
	Label,
	App,
	Page,
	coreLibrary,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.TimePickerMaskMode
	var TimePickerMaskMode = mobileLibrary.TimePickerMaskMode;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var handleChange = function(oEvent) {
		var oTP = oEvent.getSource();
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oTP.setValueState(ValueState.None);
		} else {
			oTP.setValueState(ValueState.Error);
		}
	};

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "Initial TimePicker with custom placeholder",
				labelFor: "TP1",
				wrapping: true
			}),
			new TimePicker("TP1",{
				change: handleChange,
				placeholder: "Enter time"
			}),
			new Label({
				text: "TimePicker with given Value and Formatter",
				labelFor: "TP2",
				wrapping: true
			}),
			new TimePicker("TP2", {
				value: "14:14",
				valueFormat: "HH:mm",
				displayFormat: "HH:mm",
				change: handleChange
			}),
			new Label({
				text: "TimePicker with without mask",
				labelFor: "TP3",
				wrapping: true
			}),
			new TimePicker("TP3", {
				maskMode: TimePickerMaskMode.Off,
				change: handleChange
			}),
			new Label({
				text: "TimePicker with showCurrentTimeButton set to true",
				labelFor: "TP4",
				wrapping: true
			}),
			new TimePicker("TP4", {
				showCurrentTimeButton: true,
				change: handleChange
			}),
			new Label({
				text: "TimePicker with 24 hour spport",
				labelFor: "TP5",
				wrapping: true
			}),
			new TimePicker("TP5", {
				value: "23:40:50",
				valueFormat: "HH:mm:ss",
				displayFormat: "HH:mm:ss",
				support2400: true,
				change: handleChange
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oPage = new Page({
		title: "TimePicker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	var oApp = new App();
	oApp.addPage(oPage);
	oApp.placeAt("body");
});

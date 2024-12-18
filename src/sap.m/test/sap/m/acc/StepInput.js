sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/StepInput",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Label, StepInput, Page, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({labelFor: "I1", text: "value = 1.32567, displayValuePrecision = 3", wrapping: true}),
			new StepInput("I1", {
				value: 1.32567,
				displayValuePrecision: 3
			}),
			new Label({labelFor: "I2", text: "value = 1.32, displayValuePrecision = 0", wrapping: true}),
			new StepInput("I2", {
				value: 1.32,
				displayValuePrecision: 0
			}),
			new Label({labelFor: "I3", text: "value = 1.32, displayValuePrecision = 3, step = 0.05", wrapping: true}),
			new StepInput("I3",{
				value: 1.32,
				displayValuePrecision: 3,
				step: 0.05
			}),
			new Label({labelFor: "I4", text: "Step = 1 (default behavior); value = 6, min = 5, max = 15", wrapping: true}),
			new StepInput("I4",{
				min: 6,
				value: 5
			}),
			new Label({labelFor: "I5", text: "Step = 1.1, displayValuePrecision = 1", wrapping: true}),
			new StepInput("I5", {
				step: 1.1,
				displayValuePrecision: 1
			}),
			new Label({labelFor: "I6", text: "Input with initial state", wrapping: true}),
			new StepInput("I6", {
				valueState: ValueState.Error
			}),
			new Label({labelFor: "I7", text: "Input with initial state", wrapping: true}),
			new StepInput("I7", {
				valueState: ValueState.Warning
			})
		]
	});

	var oPage = new Page("page", {
		title: "StepInput Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	oApp.addPage(oPage);
	oApp.placeAt("body");
});

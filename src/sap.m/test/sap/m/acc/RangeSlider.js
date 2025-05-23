sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/RangeSlider",
	"sap/m/ResponsiveScale",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label"
], function(App, CheckBox, Page, RangeSlider, ResponsiveScale, Toolbar, ToolbarSpacer, Label) {
	"use strict";

	var oDefaultLabel = new Label("defaultLabel", { text: "Default" }).addStyleClass("sapUiTinyMarginTopBottom"),
		oDefaultRangeSlider = new RangeSlider({
			showHandleTooltip: false,
			showAdvancedTooltip: true,
			range: [-20,50],
			min: -20,
			max: 100,
			ariaLabelledBy: oDefaultLabel.getId()
		}).addStyleClass("sapUiSmallMarginTopBottom"),
		oStepsLabel = new Label("stepsLabel", { text: "RangeSlider with steps" }).addStyleClass("sapUiTinyMarginTopBottom"),
		oStepsRangeSlider = new RangeSlider("RangeSlider7", {
			width: "50%",
			step: 2,
			showAdvancedTooltip: true,
			min: 1,
			max: 17,
			range: [2, 15],
			showHandleTooltip: false,
			ariaLabelledBy: oStepsLabel.getId()
		}).addStyleClass("sapUiSmallMarginTopBottom"),
		oInputsLabel = new Label("inputsLabel", { text: "RangeSlider with inputs" }).addStyleClass("sapUiSmallMarginTop"),
		oInputsRangeSlider = new RangeSlider({
			width: "100%",
			showAdvancedTooltip: true,
			min: -100,
			max: 100,
			range: [-35, 40],
			showHandleTooltip: false,
			inputsAsTooltips: true,
			name: "RangeSlider10",
			ariaLabelledBy: oInputsLabel.getId()
		}).addStyleClass("sapUiMediumMarginTopBottom"),
		oDecimalNumbersLabel = new Label("decimalNumbersLabel", { text: "RangeSlider with decimal numbers" }).addStyleClass("sapUiSmallMarginTop"),
		oDecimalNumbersRangeSlider = new RangeSlider({
			width: "100%",
			showAdvancedTooltip: true,
			min: -10,
			max: 10,
			range: [-5.05, 3],
			showHandleTooltip: false,
			inputsAsTooltips: true,
			name: "RangeSlider12",
			step: 0.05,
			ariaLabelledBy: oDecimalNumbersLabel.getId()
		}).addStyleClass("sapUiMediumMarginTopBottom"),
		oTickmarksLabel = new Label("tickmarksLabel", { text: "RangeSlider with tickmarks" }).addStyleClass("sapUiSmallMarginTop"),
		oTickmarksdRahgeslider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			ariaLabelledBy: oTickmarksLabel.getId()
		}).addStyleClass("sapUiMediumMarginTopBottom"),
		oLabelsLabel = new Label("labelsLabel", { text: "RangeSlider with tickmarks and labels" }).addStyleClass("sapUiSmallMarginTop"),
		oLabelsRangeSlider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 5}),
			ariaLabelledBy: oLabelsLabel.getId()
		}).addStyleClass("sapUiMediumMarginTopBottom"),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		});

	new App().addPage(new Page({
		title: "RangeSlider Accessibility Test Page",
		content: [
			oDefaultLabel, oDefaultRangeSlider, oStepsLabel, oStepsRangeSlider, oInputsLabel, oInputsRangeSlider,
			oDecimalNumbersLabel, oDecimalNumbersRangeSlider, oTickmarksLabel, oTickmarksdRahgeslider, oLabelsLabel, oLabelsRangeSlider
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}).addStyleClass("sapUiContentPadding")).placeAt("body");
});

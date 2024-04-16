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

	var oDefaultLabel = new Label("defaultLabel", { text: "Default" }),
		oDefaultRangeSlider = new RangeSlider({
			showHandleTooltip: false,
			showAdvancedTooltip: true,
			range: [-20,50],
			min: -20,
			max: 100,
			ariaLabelledBy: oDefaultLabel.getId()
		}),
		oStepsLabel = new Label("stepsLabel", { text: "RangeSlider with steps" }),
		oStepsRangeSlider = new RangeSlider("RangeSlider7", {
			width: "50%",
			step: 2,
			showAdvancedTooltip: true,
			min: 1,
			max: 17,
			range: [2, 15],
			showHandleTooltip: false,
			ariaLabelledBy: oStepsLabel.getId()
		}),
		oInputsLabel = new Label("inputsLabel", { text: "RangeSlider with inputs" }),
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
		}),
		oDecimalNumbersLabel = new Label("decimalNumbersLabel", { text: "RangeSlider with decimal numbers" }),
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
		}),
		oTickmarksLabel = new Label("tickmarksLabel", { text: "RangeSlider with tickmarks" }),
		oTickmarksdRahgeslider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			ariaLabelledBy: oTickmarksLabel.getId()
		}),
		oLabelsLabel = new Label("labelsLabel", { text: "RangeSlider with tickmarks and labels" }),
		oLabelsRangeSlider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 5}),
			ariaLabelledBy: oLabelsLabel.getId()
		}),
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

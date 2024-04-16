sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/ResponsiveScale",
	"sap/m/Slider",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label"
], function(App, CheckBox, Page, ResponsiveScale, Slider, Toolbar, ToolbarSpacer, Label) {
	"use strict";

	var oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("page1", {
			title: "Slider Accessibility Test Page",
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		}).addStyleClass("sapUiContentPadding"),

		oDefaultLabel = new Label("defaultLabel",{ text: "Default" }),
		oDefaultSlider = new Slider({
			value: 30,
			min: 0,
			max: 100,
			ariaLabelledBy: oDefaultLabel.getId()
		}),

		oDisabledLabel = new Label("disabledLabel", { text: "Disabled" }),
		oDisabledSlider = new Slider({
			value: 20,
			enabled: false,
			ariaLabelledBy: oDisabledLabel.getId()
		}),

		oTooltipLabel = new Label("tooltipLabel", { text: "Slider with tooltip" }),
		oTooltipSlider = new Slider({
			value: 10.3,
			step: 0.1,
			min: 0,
			max: 20,
			showAdvancedTooltip: true,
			ariaLabelledBy: oTooltipLabel.getId()
		}),

		oInputLabel = new Label("inputLabel", { text: "Slider with input" }),
		oInputSlider = new Slider({
			value: 160,
			step: 0.5,
			min: 0,
			max: 500,
			showAdvancedTooltip: true,
			inputsAsTooltips: true,
			ariaLabelledBy: oInputLabel.getId()
		}),

		oTickMarksLabel = new Label("tickmarksLabel", { text: "Slider with tickmarks" }),
		oTickMarksSlider = new Slider({
			enableTickmarks: true,
			ariaLabelledBy: oTickMarksLabel.getId()
		}),

		oLabelsLabel = new Label("labelsLabel", { text: "Slider with tickmarks and labels" }),
		oLabelsSlider = new Slider({
			min: 0,
			max: 40,
			step: 5,
			enableTickmarks: true,
			showAdvancedTooltip: true,
			scale: new ResponsiveScale({
				tickmarksBetweenLabels: 1
			}),
			ariaLabelledBy: oLabelsLabel.getId()
		});

	new App("myApp", {initialPage: "page1", pages: [oPage]}).placeAt("body");

	// Wait for a tick, so the Page would be rendered and the Sliders could be resized properly on any browser
	setTimeout(function () {
		[
			oDefaultLabel, oDefaultSlider, oDisabledLabel, oDisabledSlider,
			oTooltipLabel, oTooltipSlider, oInputLabel, oInputSlider,
			oTickMarksLabel, oTickMarksSlider, oLabelsLabel, oLabelsSlider
		].forEach(oPage.addContent, oPage);
	});
});

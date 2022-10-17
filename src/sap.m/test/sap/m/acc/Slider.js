sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/ResponsiveScale",
	"sap/m/Slider",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/HTML"
], function(App, CheckBox, Page, ResponsiveScale, Slider, Toolbar, ToolbarSpacer, HTML) {
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

		oDefaultTitle = new HTML({ content: "<h2>Default</h2>" }),
		oDefaultSlider = new Slider({
			value: 30,
			min: 0,
			max: 100
		}),

		oDisabledTitle = new HTML({ content: "<h2>Disabled</h2>" }),
		oDisabledSlider = new Slider({
			value: 20,
			enabled: false
		}),

		oTooltipTitle = new HTML({ content: "<h2>Slider with tooltip</h2>" }),
		oTooltipSlider = new Slider({
			value: 10.3,
			step: 0.1,
			min: 0,
			max: 20,
			showAdvancedTooltip: true
		}),

		oInputTitle = new HTML({ content: "<h2>Slider with input</h2>" }),
		oInputSlider = new Slider({
			value: 160,
			step: 0.5,
			min: 0,
			max: 500,
			showAdvancedTooltip: true,
			inputsAsTooltips: true
		}),

		oTickMarksTitle = new HTML({ content: "<h2>Slider with tickmarks</h2>" }),
		oTickMarksSlider = new Slider({enableTickmarks: true}),

		oLabelsTitle = new HTML({ content: "<h2>Slider with tickmarks and labels</h2>" }),
		oLabelsSlider = new Slider({
			min: 0,
			max: 40,
			step: 5,
			enableTickmarks: true,
			showAdvancedTooltip: true,
			scale: new ResponsiveScale({
				tickmarksBetweenLabels: 1
			})
		});

	new App("myApp", {initialPage: "page1", pages: [oPage]}).placeAt("body");

	// Wait for a tick, so the Page would be rendered and the Sliders could be resized properly on any browser
	setTimeout(function () {
		[
			oDefaultTitle, oDefaultSlider, oDisabledTitle, oDisabledSlider,
			oTooltipTitle, oTooltipSlider, oInputTitle, oInputSlider,
			oTickMarksTitle, oTickMarksSlider, oLabelsTitle, oLabelsSlider
		].forEach(oPage.addContent, oPage);
	});
});

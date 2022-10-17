sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/RangeSlider",
	"sap/m/ResponsiveScale",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/HTML"
], function(App, CheckBox, Page, RangeSlider, ResponsiveScale, Toolbar, ToolbarSpacer, HTML) {
	"use strict";

	var oDefaultRangeSlider = new RangeSlider({
			showHandleTooltip: false,
			showAdvancedTooltip: true,
			range: [-20,50],
			min: -20,
			max: 100
		}),
		oStepsRangeSlider = new RangeSlider("RangeSlider7", {
			width: "50%",
			step: 2,
			showAdvancedTooltip: true,
			min: 1,
			max: 17,
			range: [2, 15],
			showHandleTooltip: false
		}),
		oInputsRangeSlider = new RangeSlider({
			width: "100%",
			showAdvancedTooltip: true,
			min: -100,
			max: 100,
			range: [-35, 40],
			showHandleTooltip: false,
			inputsAsTooltips: true,
			name: "RangeSlider10"
		}),
		oDecimalNumbersRangeSlider = new RangeSlider({
			width: "100%",
			showAdvancedTooltip: true,
			min: -10,
			max: 10,
			range: [-5.05, 3],
			showHandleTooltip: false,
			inputsAsTooltips: true,
			name: "RangeSlider12",
			step: 0.05
		}),
		oTickmarksdRahgeslider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true
		}),
		oLabelsRangeSlider = new RangeSlider({
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 5})
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
			new HTML({ content: "<h2>Default</h2>" }),
			oDefaultRangeSlider,

			new HTML({ content: "<h2>RangeSlider with steps</h2>" }),
			oStepsRangeSlider,

			new HTML({ content: "<h2>RangeSlider with inputs</h2>" }),
			oInputsRangeSlider,

			new HTML({ content: "<h2>RangeSlider with decimal numbers</h2>" }),
			oDecimalNumbersRangeSlider,

			new HTML({ content: "<h2>RangeSlider with tickmarks</h2>" }),
			oTickmarksdRahgeslider,

			new HTML({ content: "<h2>RangeSlider with tickmarks and labels</h2>" }),
			oLabelsRangeSlider
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}).addStyleClass("sapUiContentPadding")).placeAt("body");
});

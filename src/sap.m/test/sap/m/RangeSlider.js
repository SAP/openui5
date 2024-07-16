// Note: the HTML page 'RangeSlider.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/HTML",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/RangeSlider",
	"sap/m/ResponsiveScale",
	"sap/m/Title",
	"sap/base/Log"
], async function(Core, HTML, App, Page, RangeSlider, ResponsiveScale, Title, Log) {
	"use strict";

	await Core.ready();

	var oDefaultTitle = new Title({ text: "Default RangeSlider" }),
		oRangeSlider1 = new RangeSlider("rangeSlider1", {
			range: [0, 100],
			liveChange: function (oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change: function (oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			}
		}),

		oRangeSlider2 = new RangeSlider("rangeSlider2", {
			showAdvancedTooltip: true,
			range: [50,100],
			min: 50,
			max: 150,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			}
		}),

		oRangeSlider3 = new RangeSlider("rangeSlider3", {
			width: "70%",
			showAdvancedTooltip: true,
			enabled: false,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			showHandleTooltip: false
		});

	var oStepsTitle = new Title({
			text: "RangeSlider with steps",
			width: "100%"
		}),
		oRangeSlider4 = new RangeSlider("rangeSlider4", {
			width: "100%",
			step: 5,
			showAdvancedTooltip: true,
			min: -50,
			max: 50,
			range: [-45, 45],
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			showHandleTooltip: false
		});

	var oInputsTitle = new Title({ text: "RangeSlider with inputs" }),
		oRangeSlider5 = new RangeSlider("rangeSlider5", {
			width: "100%",
			showAdvancedTooltip: true,
			min: -100,
			max: 100,
			range: [-35, 40],
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			showHandleTooltip: false,
			inputsAsTooltips: true,
			name: "RangeSlider10"
		});

	var oDecimalNumbersTitle = new Title({ text: "RangeSlider with decimal numbers" }),
		oRangeSlider6 = new RangeSlider("rangeSlider6", {
			width: "100%",
			showAdvancedTooltip: true,
			min: -100,
			max: 100,
			range: [-35.5, 40],
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' range property to " + oControlEvent.getParameter("range") + " on " + this);
			},
			showHandleTooltip: false,
			name: "RangeSlider11",
			step: 0.5
		});

	var oTickmarksTitle = new Title({ text: "RangeSlider with tickmarks" }),
		oRangeSlider7 = new RangeSlider("rangeSlider7", {
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true
		}).addStyleClass("sapUiSmallMarginBottom");

	var oTickmarksAndLabelsTitle = new Title({ text: "RangeSlider with tickmarks and labels" }),
		oRangeSlider8 = new RangeSlider("rangeSlider8", {
			showAdvancedTooltip: true,
			showHandleTooltip: false,
			inputsAsTooltips: true,
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 5})
		}).addStyleClass("sapUiSmallMarginBottom");

	var oPage = new Page("page", {
		title: "sap.m.RangeSlider",
		content: [
			oDefaultTitle,
			oRangeSlider1,
			oRangeSlider2,
			oRangeSlider3,
			oStepsTitle,
			oRangeSlider4,
			oInputsTitle,
			oRangeSlider5,
			oDecimalNumbersTitle,
			oRangeSlider6,
			oTickmarksTitle,
			oRangeSlider7,
			oTickmarksAndLabelsTitle,
			oRangeSlider8,
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", {
		initialPage: "page"
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
// Note: the HTML page 'Slider.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/HTML",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/ResponsiveScale",
	"sap/m/Slider",
	"sap/base/Log"
], async function(Core, HTML, App, Page, ResponsiveScale, Slider, Log) {
	"use strict";
	await Core.ready();

	var oDefaultTitle = new HTML({ content: "<h2>Default</h2>" }),
		oSlider0 = new Slider("__slider0", {
			value: 30,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider1 = new Slider("__slider1", {
			name: "custom-name",
			value: 25,
			width: "100px",
			step: 1,
			progress : false,
			visible: true,
			enabled: true,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider2 = new Slider("__slider2", {
			value: 69,
			min: 10,
			max: 100,
			width: "150px",
			step: 10,
			progress : true,
			visible: true,
			enabled: true,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider3 = new Slider("__slider3", {
			value: 70,
			min: 10,
			max: 100,
			width: "150px",
			step: 5,
			progress : true,
			visible: true,
			enabled: true,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider4 = new Slider("__slider4", {
			value: 27,
			width: "10em",
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider5 = new Slider("__slider5", {
			value: 20,
			width: "15em",
			enabled: false,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider6 = new Slider("__slider6", {
			value: 10.34,
			step: 0.1,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oSlider7 = new Slider("__slider7", {
			value: 10.35,
			step: 0.01,
			min: 0,
			max: 500,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			}
		}),

		oTooltipTitle = new HTML({ content: "<h2>Slider with tooltip</h2>" }),
		oSlider8 = new Slider("__slider8", {
			value: 50.34,
			step: 0.1,
			min: 50,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			showAdvancedTooltip: true
		}),

		oInputTitle = new HTML({ content: "<h2>Slider with input</h2>" }),
		oSlider9 = new Slider("__slider9", {
			value: 160,
			step: 0.5,
			min: 0,
			max: 500,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			showAdvancedTooltip: true,
			inputsAsTooltips: true
		}),

		oTickMarksTitle = new HTML({ content: "<h2>Slider with tickmarks</h2>" }),
		oSlider10 = new Slider("__slider10", {enableTickmarks: true}),

		oLabelsTitle = new HTML({ content: "<h2>Slider with tickmarks and labels</h2>" }),
		oSlider11 = new Slider("__slider11", {
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 5})
		}),

		oSlider12 = new Slider("__slider12", {
			min: 1,
			max: 48,
			step: 1,
			width: "70%",
			enableTickmarks: true,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			scale: new ResponsiveScale({
				tickmarksBetweenLabels: 2
			})
		}).addStyleClass("sapMSliderOffset"),

		oSlider13 = new Slider("__slider13", {
			min: 1,
			max: 48,
			step: 1,
			width: "300px",
			enableTickmarks: true,
			liveChange: function(oControlEvent) {
				Log.info("Event fired: 'liveChange' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			change : function(oControlEvent) {
				Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("value") + " on " + this);
			},
			scale: new ResponsiveScale({
				tickmarksBetweenLabels: 2
			})
		}).addStyleClass("sapMSliderOffset")

	var oPage = new Page("page", {
		title: "Mobile Slider Control",
		content: [
			oDefaultTitle,
			oSlider0,
			oSlider1,
			oSlider2,
			oSlider3,
			oSlider4,
			oSlider5,
			oSlider6,
			oSlider7,
			oTooltipTitle,
			oSlider8,
			oInputTitle,
			oSlider9,
			oTickMarksTitle,
			oSlider10,
			oLabelsTitle,
			oSlider11,
			oSlider12,
			oSlider13
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", {
		initialPage: "page"
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
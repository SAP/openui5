// Note: the HTML page 'DynamicDateRangeVisual.html' loads this module via data-sap-ui-on-init

// We have to mock the current date in order to have stable visual tests as the dates used in the
// DynamicDateRange control are relative to the current date. The case where there are no arguments passed to
// the Date object returns a solid date in the past.

var oMockedDate = new Date(2015,0,1,6);
Date = class extends Date{
	constructor(options) {
		if (options) {
			super(options);
		} else {
			super(oMockedDate);
		}
	}
};

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Label",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateUtil",
	"sap/m/Button",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/library",
	"sap/ui/core/Configuration"
], function(
	App,
	Page,
	VBox,
	Label,
	DynamicDateRange,
	DynamicDateUtil,
	Button,
	UI5Date,
	coreLibrary,
	Configuration
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	function handleChange(oEvent) {
		var oDDR = oEvent.oSource;
		var bValid = oEvent.getParameter("valid");

		if (bValid) {
			oDDR.setValueState(ValueState.None);
		} else {
			oDDR.setValueState(ValueState.Error);
		}
	}

	new App({
		pages: [
			new Page("Page1", {
				title: "DynamicDateRange",
				content: [
					new Label("DDR1-label", {text: "Group headers disabled when there are more than ten options available", labelFor: "DDR1"}),
					new DynamicDateRange("DDR1", {
						change: handleChange,
						width: '300px',
						options: DynamicDateUtil.getAllOptionKeys()
					}),
					new Label("DDR2-label", {text: "Fixed date and date range options with 'Calendar' based UI", labelFor: "DDR2"}),
					new DynamicDateRange("DDR2", {
						width: '300px',
						change: handleChange,
						options: [
							"DATE",
							"DATERANGE",
							"SPECIFICMONTH",
							"SPECIFICMONTHINYEAR",
							"FROM",
							"TO"
						],
					}),
					new Label("DDR3-label", {text: "Relative date and date range options with 'StepInput' based UI", labelFor: "DDR3"}),
					new DynamicDateRange("DDR3", {
						enableGroupHeaders: false,
						width: '300px',
						change: handleChange,
						options: [
							"LASTDAYS",
							"LASTMONTHS",
							"LASTYEARS",
							"NEXTDAYS",
							"TODAYFROMTO"
						],
					}),
					new Label("DDR4-label", {text: "DateTime options", labelFor: "DDR4"}),
					new DynamicDateRange("DDR4", {
						enableGroupHeaders: false,
						width: '300px',
						value: {
							operator: 'DATETIME',
							values: [UI5Date.getInstance(2000, 11, 20, 17, 0, 0)]
						},
						change: handleChange,
						options: [
							"DATETIME",
							"FROMDATETIME",
							"TODATETIME"
						],
					}),
					new Label("DDR5-label", {text: "Special selection for visual tests", labelFor: "DDR5"}),
					new DynamicDateRange("DDR5", {
						enableGroupHeaders: false,
						width: '300px',
						options: [
							"DATETIME",
							"TODAY"
						]
					}),
					new Button("btnEtcGMT-12", {
						text: "Etc/GMT-12",
						press: handleTimezoneButtonPress
					}),
					new Button("btnUTC", {
						text: "UTC",
						press: handleTimezoneButtonPress
					}),
					new Button("btnEtcGMT12", {
						text: "Etc/GMT+12",
						press: handleTimezoneButtonPress
					})
				]
			})
		]
	}).placeAt("body");
});

function handleTimezoneButtonPress(e) {
	Configuration.setTimezone(e.getSource().getText())/*Not inside AMD call*/;
	sap.ui.getCore().byId("DDR5")/*Not inside AMD call*/.setValue(null);
}
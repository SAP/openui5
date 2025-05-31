sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Label",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateUtil",
	"sap/m/Button",
	"sap/ui/core/Element",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/library"
], function(
	Localization,
	App,
	Page,
	VBox,
	Label,
	DynamicDateRange,
	DynamicDateUtil,
	Button,
	Element,
	UI5Date,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	var oMockedDate = new Date(2015,0,1,6);
	/*global Date:true */
	Date = class extends Date {
		constructor(options) {
			if (options) {
				super(options);
			} else {
				super(oMockedDate);
			}
		}
	};

	function handleChange(oEvent) {
		var oDDR = oEvent.oSource;
		var bValid = oEvent.getParameter("valid");

		if (bValid) {
			oDDR.setValueState(ValueState.None);
		} else {
			oDDR.setValueState(ValueState.Error);
		}
	}

	function handleTimezoneButtonPress(e) {
		Localization.setTimezone(e.getSource().getText());
		Element.getElementById("DDR5").setValue(null);
	}

	new App({
		pages: [
			new Page("Page1", {
				title: "DynamicDateRange",
				content: [
					new DynamicDateRange("DDR1", {
						change: handleChange,
						width: '300px',
						options: DynamicDateUtil.getAllOptionKeys()
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
						]
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
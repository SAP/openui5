sap.ui.define([
	"sap/m/App",
	"sap/m/DatePicker",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/core/library"
], function(App, DatePicker, Label, Page, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var app = new App("myApp");

	function handleChange(oEvent){
		var oDP = oEvent.getSource();
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oDP.setValueState(ValueState.None);
		} else {
			oDP.setValueState(ValueState.Error);
		}
	}

	var page1 = new Page("page1", {
		title:"Mobile DatePicker",
		content : [
			new Label({text: "initial DatePicker", labelFor: "DP1"}),
			new DatePicker("DP1", { change: handleChange }),
			new Label({text: "DatePicker with given Value and Formatter", labelFor: "DP2"}),
			new DatePicker("DP2", { value: "2014-03-26", valueFormat: "yyyy-MM-dd", displayFormat: "long", change: handleChange })
		]
	});

	app.addPage(page1);

	app.placeAt("body");
});

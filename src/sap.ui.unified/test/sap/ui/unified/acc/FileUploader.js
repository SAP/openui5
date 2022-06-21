sap.ui.define([
	"sap/m/Label",
	"sap/ui/core/library",
	"sap/ui/unified/FileUploader"
], function(Label, coreLibrary, FileUploader) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	new FileUploader("FU1", {
		name: "FU1",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		change: function(oEvent){
			if (oEvent.getParameter("newValue") == "Test1.html") {
				oEvent.getSource().setValueState(ValueState.Error);
			} else {
				oEvent.getSource().setValueState(ValueState.None);
			}
		}
	}).placeAt("sample1");

	new Label({text: "Label", labelFor: "FU2"}).placeAt("sample2");
	new FileUploader("FU2", {
		name: "FU2",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456"
	}).placeAt("sample2");

	new FileUploader("FU3", {
		name: "FU3",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		enabled: false
	}).placeAt("sample3");

	new FileUploader("FU4", {
		name: "FU4",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		tooltip: "Tooltip"
	}).placeAt("sample4");

	new Label({text: "Label", labelFor: "FU5"}).placeAt("sample5");
	new FileUploader("FU5", {
		name: "FU5",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		tooltip: "Tooltip"
	}).placeAt("sample5");

	new FileUploader("FU6", {
		name: "FU6",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		buttonOnly: true,
		buttonText: "Choose"
	}).placeAt("sample6");

	new FileUploader("FU7", {
		name: "FU7",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		valueState: ValueState.Error
	}).placeAt("sample7");

	new FileUploader("FU8", {
		name: "FU8",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		placeholder: "choose file"
	}).placeAt("sample8");

	new FileUploader("FU9", {
		name: "FU9",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		additionalData: "abc=123&test=456",
		icon: "sap-icon://save",
		iconOnly: true
	}).placeAt("sample9");
});

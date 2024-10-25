sap.ui.define([
	"sap/m/Label",
	"sap/ui/core/library",
	"sap/ui/unified/FileUploader",
	"sap/ui/layout/VerticalLayout",
	"sap/m/App",
	"sap/m/Page"
], function(Label, coreLibrary, FileUploader, VerticalLayout, App, Page) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var TitleLevel = coreLibrary.TitleLevel;

	var oLabel1 = new Label({text: "Simple FileUploader", labelFor: "FU1"});
	var oFU1 = new FileUploader("FU1", {
		name: "FU1",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		change: function(oEvent){
			if (oEvent.getParameter("newValue") == "Test1.html") {
				oEvent.getSource().setValueState(ValueState.Error);
			} else {
				oEvent.getSource().setValueState(ValueState.None);
			}
		}
	});

	var oLabel2 = new Label({text: "FileUploader with Label", labelFor: "FU2"});
	var oFU2 = new FileUploader("FU2", {
		name: "FU2",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456"
	});

	var oLabel3 = new Label({text: "Disabled FileUploader", labelFor: "FU3"});
	var oFU3 = new FileUploader("FU3", {
		name: "FU3",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		enabled: false
	});

	var oLabel4 = new Label({text: "FileUploader with Tooltip", labelFor: "FU4"});
	var oFU4 = new FileUploader("FU4", {
		name: "FU4",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		tooltip: "Tooltip"
	});

	var oLabel5 = new Label({text: "FileUploader with Tooltip and Label", labelFor: "FU5"});
	var oFU5 = new FileUploader("FU5", {
		name: "FU5",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		tooltip: "Tooltip"
	});

	var oLabel6 = new Label({text: "FileUploader with only Button", labelFor: "FU6"});
	var oFU6 = new FileUploader("FU6", {
		name: "FU6",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		buttonOnly: true,
		buttonText: "Choose"
	});

	var oLabel7 = new Label({text: "FileUploader with ValueState", labelFor: "FU7"});
	var oFU7 = new FileUploader("FU7", {
		name: "FU7",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		valueState: ValueState.Error
	});

	var oLabel8 = new Label({text: "FileUploader with Placeholder", labelFor: "FU8"});
	var oFU8 = new FileUploader("FU8", {
		name: "FU8",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		placeholder: "choose file"
	});

	var oLabel9 = new Label({text: "FileUploader with icon only", labelFor: "FU9"});
	var oFU9 = new FileUploader("FU9", {
		name: "FU9",
		uploadUrl: "../../../../../upload/",
		sendXHR: true,
		value: "",
		additionalData: "abc=123&test=456",
		icon: "sap-icon://save",
		iconOnly: true
	});

	var oLayout = new VerticalLayout({
		content: [
			oLabel1,
			oFU1,
			oLabel2,
			oFU2,
			oLabel3,
			oFU3,
			oLabel4,
			oFU4,
			oLabel5,
			oFU5,
			oLabel6,
			oFU6,
			oLabel7,
			oFU7,
			oLabel8,
			oFU8,
			oLabel9,
			oFU9
		]
	}).addStyleClass("sapUiContentPadding");

	var app = new App("myApp");
	var page = new Page("page", {
		title: "Test Page for sap.ui.unified.FileUploader",
		titleLevel: TitleLevel.H1,
		content: [
			oLayout
		]
	});

	app.addPage(page);
	app.placeAt("body");
});

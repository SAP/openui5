sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/unified/FileUploader",
	"sap/ui/unified/FileUploaderParameter"
], function(Log, Button, Label, MessageBox, Text, XMLView, FileUploader, FileUploaderParameter) {
	"use strict";

	var oFileUploader1 = new FileUploader("upload_1", {
		name: "test1",
		uploadUrl: "../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		fileType: ["pptx", "txt", "js"],
		maximumFileSize: 2,
		uploadOnChange: false,
		multiple: true,
		buttonText: "Choose!",
		additionalData: "abc=123&test=456",
		uploadProgress: function (oEvent) {
			var nLoaded, nTotal;
			if (oEvent.getParameter("lengthComputable")) {
				nLoaded = oEvent.getParameter("loaded");
				nTotal = oEvent.getParameter("total");
				oTVProgress.setText("Upload Progress in Bytes: " +
						nLoaded + " of " + nTotal + " loaded (" +
						(nLoaded / nTotal * 100) + "%)"
				);
			}
		},
		uploadAborted : function (oEvent) {
			oTVComplete.setText("aborted");
		},
		uploadComplete : function (oEvent) {
			oTVComplete.setText("completed(" + oEvent.getParameter("status") + "): " + oEvent.getParameter("response"));
		},
		fileSizeExceed: function (oEvent) {
			var fileSize = oEvent.getParameter("fileSize"),
				fileName = oEvent.getParameter("fileName");
			oTVComplete.setText("The chosen file '" + fileName + "' is " + fileSize + " MB big, this exceeds the maximum filesize of " + oFileUploader1.getMaximumFileSize() + " MB.");
		}
	});

	var oLabel = new Label({ text: "Fileuploader to the local server (multiple allowed): ", labelFor: oFileUploader1});
	oLabel.placeAt("target1");
	oFileUploader1.placeAt("target1");

	var oFileUploader2 = new FileUploader("upload_2", {
		name: "test2",
		uploadUrl: "../../../../upload/",
		sendXHR: true,
		value: "",
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		mimeType: "image/png,image/jpeg,image/bmp",
		maximumFileSize: 5,
		maximumFilenameLength: 10,
		uploadOnChange: false,
		buttonText: "Durchsuchen...",
		uploadProgress: function (oEvent) {
			var nLoaded, nTotal;
			if (oEvent.getParameter("lengthComputable")) {
				nLoaded = oEvent.getParameter("loaded");
				nTotal = oEvent.getParameter("total");
				oTVProgress.setText("Upload Progress in Bytes: " +
						nLoaded + " of " + nTotal + " loaded (" +
						(nLoaded / nTotal * 100) + "%)"
				);
			}
		},
		uploadAborted : function (oEvent) {
			oTVComplete.setText("aborted");
		},
		uploadComplete : function (oEvent) {
			oTVComplete.setText("completed(" + oEvent.getParameter("status") + "): " + oEvent.getParameter("response"));
		},
		fileSizeExceed: function (oEvent) {
			var fileSize = oEvent.getParameter("fileSize"),
				fileName = oEvent.getParameter("fileName");
			oTVComplete.setText("The chosen file '" + fileName + "' is " + fileSize + " MB big, this exceeds the maximum filesize of " + oFileUploader2.getMaximumFileSize() + " MB.");
		},
		filenameLengthExceed: function (oEvent) {
			var sFilename = oEvent.getParameter("fileName"),
				iFilenameLength = sFilename.length;
			oTVComplete.setText("The chosen file is longer than expected, " + (iFilenameLength - this.getMaximumFilenameLength()) + " chars longer.");
		}
	});

	var oLabel = new Label({ text: "Fileuploader to the SAPUI5 Test-Server: ", labelFor: oFileUploader2});
	oLabel.placeAt("target2");
	oFileUploader2.placeAt("target2");

	var oFileUploader3 = new FileUploader("upload_3", {
		name: "test3",
		uploadUrl: "../../../../upload/",
		value: "",
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		additionalData: "abc=123&test=456",
		parameters: [
			new FileUploaderParameter({name: "name1", value: "value1"}),
			new FileUploaderParameter({name: "name2", value: "value2"}),
			new FileUploaderParameter({name: "name3", value: "value3"})
		]
	});

	var oLabel3 = new Label({ text: "Fileuploader to the local server (incl. parameters): ", labelFor: oFileUploader3});
	oLabel3.placeAt("target3");
	oFileUploader3.placeAt("target3");


	var oFileUploader4 = new FileUploader("upload_4", {
		name: "test4",
		uploadUrl: "../../../../upload/",
		sendXHR: true,
		value: "",
		multiple: true,
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		additionalData: "abc=123&test=456",
		headerParameters: [
			new FileUploaderParameter({name: "header1", value: "value1"}),
			new FileUploaderParameter({name: "header2", value: "value2"}),
			new FileUploaderParameter({name: "header3", value: "value3"})
		],
		parameters: [
			new FileUploaderParameter({name: "name1", value: "value1"}),
			new FileUploaderParameter({name: "name2", value: "value2"}),
			new FileUploaderParameter({name: "name3", value: "value3"})
		],
		uploadProgress: function (oEvent) {
			var nLoaded, nTotal;
			if (oEvent.getParameter("lengthComputable")) {
				nLoaded = oEvent.getParameter("loaded");
				nTotal = oEvent.getParameter("total");
				oTVProgress.setText("Upload Progress in Bytes: " +
						nLoaded + " of " + nTotal + " loaded (" +
						(nLoaded / nTotal * 100) + "%)"
				);
			}
		},
		uploadAborted : function (oEvent) {
			oTVComplete.setText("aborted");
		},
		uploadComplete : function (oEvent) {
			oTVComplete.setText("completed: " + oEvent.getParameter("status"));
		}
	});

	var oLabel4 = new Label({ text: "Fileuploader to the local server (incl. header parameters): ", labelFor: oFileUploader4});
	oLabel4.placeAt("target4");
	oFileUploader4.placeAt("target4");

	var oFileUploader5 = new FileUploader("upload_5", {
		name: "test5",
		uploadUrl: "../../../../upload/",
		sendXHR: true,
		value: "",
		multiple: true,
		width: "400px",
		enabled: true,
		tooltip: "Upload your file to the local server.",
		placeholder: "Uploader should not work, after diabling...",
		uploadProgress: function (oEvent) {
			var nLoaded, nTotal;
			if (oEvent.getParameter("lengthComputable")) {
				nLoaded = oEvent.getParameter("loaded");
				nTotal = oEvent.getParameter("total");
				oTVProgress.setText("Upload Progress in Bytes: " +
						nLoaded + " of " + nTotal + " loaded (" +
						(nLoaded / nTotal * 100) + "%)"
				);
			}
		},
		uploadAborted : function (oEvent) {
			oTVComplete.setText("aborted");
		},
		uploadComplete : function (oEvent) {
			oTVComplete.setText("completed: " + oEvent.getParameter("status"));
		}
	});

	var oLabel5 = new Label({ text: "Disabled FileUploader", labelFor: oFileUploader5});
	oLabel5.placeAt("target7");
	oFileUploader5.placeAt("target7");

	var oButton = new Button({
		text : "Upload Uploader 1",
		press : function() {
			oFileUploader1.upload();
		}
	});
	oButton.placeAt("target5");

	var oButton2 = new Button({
		text : "Upload Uploader 2",
		press : function() {
			oFileUploader2.upload();
		}
	});
	oButton2.placeAt("target5");

	var oButton3 = new Button({
		text : "Upload Uploader 3",
		press : function() {
			oFileUploader3.upload();
		}
	});
	oButton3.placeAt("target5");

	var oButton4 = new Button({
		text : "Upload Uploader 4",
		press : function() {
			oFileUploader4.upload();
		}
	});
	oButton4.placeAt("target5");

	var oButton5 = new Button({
		text: "Upload & Abort - Uploader 4",
		press: function () {
			oFileUploader4.upload();
			oFileUploader4.abort();
		}
	});
	oButton5.placeAt("target5");

	var oButton6 = new Button({
		text: "Toggle Value State of Uploader 4",
		press: function () {
			var sValStat;
			switch (oFileUploader4.getValueState()) {
			case "None":
				sValStat = "Success";
				break;
			case "Success":
				sValStat = "Error";
				break;
			case "Error":
				sValStat = "Warning";
				break;
			case "Warning":
				sValStat = "BLUB";
				break;
			case "BLUB":
				sValStat = "None";
				break;
			}
			oFileUploader4.setValueState(sValStat);
			Log.info("value state was set to " + oFileUploader4.getValueState());
		}
	});
	oButton6.placeAt("target6");

	var oButton7 = new Button({
		text: "Upload",
		press: function () {
			oFileUploader5.setEnabled(false);
			oFileUploader5.upload();
			setTimeout(function(){
				oFileUploader5.setEnabled(true);
			}, 3000);
		}
	});
	oButton7.placeAt("target7");

	var oFileUploader6 = new FileUploader("upload_6", {
		name: "test6",
		uploadUrl: "../../../../upload/",
		value: "",
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		icon: "images/save_grey.png",
		iconHovered: "images/save_white.png",
		iconSelected: "images/save_old.png",
		uploadComplete: function (oEvent) {
			MessageBox.show("File has been uploaded via File Uploader 6!");
		}
	});

	var oLabel6 = new Label({ text: "Fileuploader to the local server (with icon): ", labelFor: oFileUploader6});
	oLabel6.placeAt("target8");
	oFileUploader6.placeAt("target8");

	var oFileUploader7 = new FileUploader("upload_7", {
		name: "test7",
		uploadUrl: "../../../../upload/",
		value: "",
		width: "400px",
		tooltip: "Upload your file to the local server.",
		placeholder: "Choose a file for uploading...",
		icon: "sap-icon://lead",
		iconFirst: false,
		uploadComplete: function (oEvent) {
			MessageBox.show("File has been uploaded via File Uploader 7!");
		}
	});

	var oLabel7 = new Label({ text: "Fileuploader to the local server (with icon font): ", labelFor: oFileUploader7});
	oLabel7.placeAt("target9");
	oFileUploader7.placeAt("target9");

	var oButton8 = new Button({
		text : "Upload Uploader 6",
		press : function() {
			oFileUploader6.upload();
		}
	});
	oButton8.placeAt("target10");

	var oButton9 = new Button({
		text : "Upload Uploader 7",
		press : function() {
			oFileUploader7.upload();
		}
	});
	oButton9.placeAt("target10");

	var oTVProgress = new Text({
		text: "progress messages go here"
	});
	oTVProgress.placeAt("progressMsgs");

	var oTVComplete = new Text({
		text: "complete messages go here"
	});
	oTVComplete.placeAt("completeMsgs");



	/*
	 * Testing the FUP from an XML-View.
	 * There was a bug concerning file- and mime-types, which happend
	 * only with XML-Views.
	 */
	// simple controller for fup-test
	sap.ui.controller("fup.controller", {
		handleTypeMissmatch: function(oEvent) {
			return;
		},
		handleUploadPress: function (oEvent) {
			this.getView().byId("xmlUploader").upload();
		}
	});

	// define a new (simple) View type as an XmlView
	// - using data binding for the Button text
	// - binding a controller method to the Button's "press" event
	// - also mixing in some plain HTML
	// note: typically this would be a standalone file
	var xml =
		'<mvc:View '
		+ '  controllerName="fup.controller" '
		+ '  xmlns:l="sap.ui.layout" '
		+ '  xmlns:u="sap.ui.unified" '
		+ '  xmlns:mvc="sap.ui.core.mvc" '
		+ '  xmlns="sap.m"> '
		+ '  <l:VerticalLayout> '
		+ '    <u:FileUploader '
		+ '      id="xmlUploader" '
		+ '      name="myFileUpload" '
		+ '      typeMissmatch="handleTypeMissmatch" '
		+ '      style="Emphasized" '
		+ '      fileType="pptx,txt,jpg" '
		+ '      uploadUrl="../../../../upload/" '
		+ '      width="400px" '
		+ '      tooltip="Upload your file to the local server" '
		+ '      uploadComplete="handleUploadComplete"/> '
		+ '    <Button '
		+ '      text="Upload File" '
		+ '      press="handleUploadPress"/> '
		+ '  </l:VerticalLayout>'
		+ '</mvc:View>';

	// instantiate the View
	XMLView.create({
		definition: xml
	}).then(function(fupXMLView) {
		// put the View onto the screen
		fupXMLView.placeAt("xmlTarget");
	});

	/**
	 * Test if the FUP can be resetted cleanly
	 */
	var oResetFUP = new FileUploader({
		additionalData: "abc=123&test=456",
		uploadUrl: "../../../../upload/",
		sendXHR: true,
		uploadComplete: function (oEvent) {
			oTVComplete.setText("Upload completed with status: " + oEvent.getParameter("status"));
		}
	});
	var oResetButtonClear = new Button({
		text: "Reset Uploader",
		press: function(oEvent) {
			oResetFUP.clear();
		}
	});
	var oResetButtonUpload = new Button({
		text: "Start Upload",
		press: function (oEvent) {
			oResetFUP.upload();
		}
	});

	oResetFUP.placeAt("reset-tests");
	oResetButtonClear.placeAt("reset-tests");
	oResetButtonUpload.placeAt("reset-tests");
});

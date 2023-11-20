sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function(Button, Dialog, Text) {
	"use strict";
	return {
		createContent: function(oController) {
			var oDialog = new Dialog("jsDialog", {title: "JavaScript Fragment Dialog"});

			var oText = new Text("jsDialogTxt", {text: "{/dialogText}"});
			oDialog.addContent(oText);

			var oButton = new Button("jsDialogBtn", {
				text: "Close",
				press: oController.closeDialog
			});
			oDialog.addButton(oButton);

			return oDialog;
		}
	};
});
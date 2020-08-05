sap.ui.define([
	"sap/ui/commons/Button",
	"sap/ui/commons/Dialog",
	"sap/ui/commons/TextView"
], function(Button, Dialog, TextView) {
	"use strict";
	sap.ui.jsfragment("testdata.fragments.JSFragmentDialog", {
		createContent: function(oController) {
			var oDialog = new Dialog("jsDialog", {title: "JavaScript Fragment Dialog"});

			var oText = new TextView("jsDialogTxt", {text: "{/dialogText}"});
			oDialog.addContent(oText);

			var oButton = new Button("jsDialogBtn", {
				text: "Close",
				press: oController.closeDialog
			});
			oDialog.addButton(oButton);

			return oDialog;
		}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text"
], function(
	Controller,
	Dialog,
	Button,
    Text
	) {
	"use strict";

	return Controller.extend("sap.m.sample.dialog.Controller", {
		onOpenMessageDialog: function () {
			if (!this.oMessageDialog) {
				var oText = new Text("__dialogWorldDomination", {
					text: "Do you want to start a new world domination campaign?"
				}).addStyleClass("sapUiTinyMargin");

				this.oMessageDialog = new Dialog({
					title: "World Domination",
					type: "Message",
					ariaLabelledBy: ["__dialogWorldDomination"],
					content: [oText],
					buttons: [
						new Button({
							text: "Accept",
							press: function () {
								this.oMessageDialog.close();
							}.bind(this)
						}),
						new Button({
							text: "Decline",
							press: function () {
								this.oMessageDialog.close();
							}.bind(this)
						})
					]
				});

				this.getView().addDependent(this.oMessageDialog);
				this.oMessageDialog.open();
			} else {
				this.oMessageDialog.open();
			}
		}
	});
});

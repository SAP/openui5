sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text"
], function (JSONModel, Controller, Button, Dialog, MessageToast, Text) {
	"use strict";
	return Controller.extend("sap.uxap.sample.ObjectPageBeforeNavigate.controller.ObjectPageBeforeNavigate", {
		onInit: function () {
			var oJsonModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/HRData.json"));
			this.getView().setModel(oJsonModel, "ObjectPageModel");
			this.bEditMode = false;
			this.oOPL = this.getView().byId("ObjectPageLayout");
			this.oSelectedSection = null;
			this.oPreviousSelectedSection = null;
		},
		onEdit: function () {
			this.bEditMode = !this.bEditMode;
			var sEditMode =  this.bEditMode ? "enabled" : "disabled";
			MessageToast.show("Edit mode " + sEditMode);
		},
		onBeforeNavigate: function (oEvent) {
			if (!this.bEditMode) {
				return;
			}

			var oSection = oEvent.getParameter("section");

			oEvent.preventDefault();

			if (!this.oDialog) {
				this.oDialog = new Dialog({
					title: "Unsaved changes",
					content: new Text({
						text: "You are in 'Edit' mode. Are you sure you want to navigate to other section?"
					}),
					beginButton: new Button({
						text: "OK",
						press: function () {
							this.oDialog.close();
							this.oPreviousSelectedSection = this.oSelectedSection;
							this.oOPL.setSelectedSection(this.oSelectedSection);
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oDialog.close();
							this.oSelectedSection = this.oPreviousSelectedSection;
						}.bind(this)
					})
				});

				this.getView().addDependent(this.oDialog);
				this.oDialog.attachAfterClose(function () {
					this.oSelectedSection.getDomRef().focus();
				}.bind(this));
			}

			if (this.oSelectedSection !== oSection) {
				this.oDialog.open();
				this.oPreviousSelectedSection = this.oSelectedSection;
			}

			this.oSelectedSection = oSection;
		}
	});
});

sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageBox, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBox.C", {

		onInit : function() {
			// create any data and a model and set it to the view
			var oData = {
				checkBox1Text : "CheckBox",
				checkBox2Text : "CheckBox - focused"
			};
			var oModel = new JSONModel(oData);
			var oView = this.getView();
			oView.setModel(oModel)
		},

		handleConfirmationMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				"Approve purchase order 12345?", {
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleAlertMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.alert(
				"The quantity you have reported exceeds the quantity planed.",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleErrorMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				"Select a team in the \"Development\" area.\n\"Marketing\" isn't assigned to this area.",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleInfoMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.information(
				"You booking will be reserved for 24 hours.",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleWarningMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"The project schedule was last updated over a year ago.",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleSuccessMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.success(
				"Project 1234567 was created and assigned to team \"ABC\".",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		}
	});


	return CController;

});

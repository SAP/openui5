sap.ui.define([
		'sap/m/Button',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Button, MessageToast, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DraftIndicator.C", {

		handleSetSavingDraftPress: function (oEvent) {
			var oDraftIndi = this.byId("draftIndi");
			oDraftIndi.showDraftSaving();
		},

		handleShowDraftSavedPress: function (oEvent) {
			var oDraftIndi = this.byId("draftIndi");
			oDraftIndi.showDraftSaved();
		},

		handleClearDraftStatePress: function (oEvent) {
			var oDraftIndi = this.byId("draftIndi");
			oDraftIndi.clearDraftState();
		}

	});


	return CController;

});
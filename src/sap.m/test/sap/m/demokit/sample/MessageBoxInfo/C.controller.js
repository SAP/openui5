sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageBox, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxInfo.C", {

		onInit : function() {
			// create any data and a model and set it to the view
			var oData = {
				details: "The security token required to upload the file to the backend system cannot be retrieved. Try refreshing your browser.",
				message: "Your file could not be uploaded because of a security problem."
			};
			var oModel = new JSONModel(oData);
			var oView = this.getView();
			oView.setModel(oModel);
		},

		showInfo: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oModelTemp = this.getView().getModel().getData();
			MessageBox.show(oModelTemp.message, {
				icon: MessageBox.Icon.INFORMATION,
				title: "Information",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				id: "messageBoxId1",
				defaultAction: MessageBox.Action.NO,
				details: oModelTemp.details,
				styleClass: bCompact? "sapUiSizeCompact" : ""
			});
		}
	});


	return CController;

});

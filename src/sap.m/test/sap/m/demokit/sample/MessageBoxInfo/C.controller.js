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
				details: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
				message: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.",
				checkBox1Text: "CheckBox1",
				checkBox2Text: "CheckBox2"
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

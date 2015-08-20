sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageBox, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxInitialFocus.C", {

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

		handleConfirmMessageBoxPress_InitialFocus: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
					"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "Focus on a Button",
						styleClass: bCompact? "sapUiSizeCompact" : "",
						initialFocus: MessageBox.Action.CANCEL
					}
			);
		},

		handleShowMessageBoxPress_InitialFocus: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive',
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "Focus on a Custom Button",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Custom Button"],
						styleClass: bCompact? "sapUiSizeCompact" : "",
						initialFocus: "Custom Button"
					}
			);
		}
	});


	return CController;

});

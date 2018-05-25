sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.CustomListItem.List", {

		onInit: function(oEvent) {

			// create and set JSON Model
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(this.oModel);
		},

		onExit : function() {
			// destroy the model
			this.oModel.destroy();
		},

		handlePress: function (evt) {
			var sSrc = evt.getSource().getTarget();
			var oDialog = new sap.m.Dialog({
				content: new sap.m.Image({
					src: sSrc
				}),
				beginButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			oDialog.open();
		}

	});



	return ListController;

});
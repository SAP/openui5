sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller"
], function (Messaging, Controller) {
	"use strict";
	return Controller.extend("sap.ui.core.internal.samples.composite.xmlcomposite.ex2.Test",
		{
			onInit: function () {
				var oView = this.getView();

				// Register the view with the message manager
				Messaging.registerObject(oView, true);
			},

			handlePress: function (oEvent) {
				var oFloatModel = oEvent.getSource().getModel("floatModel");
				oFloatModel.setProperty("/value", oFloatModel.getProperty("/value") * 0.9);

				var oStringModel = oEvent.getSource().getModel("stringModel");
				oStringModel.setProperty("/value", (parseFloat(oStringModel.getProperty("/value")) * 0.9).toString());
			}
		});
});

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	'sap/m/Text',
	"sap/m/MessageToast"
], function (Controller, UIComponent, JSONModel, Dialog, Button, mobileLibrary, Text, MessageToast) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.BookDetails", {
		onInit: function () {
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			var oDataModel = new JSONModel({
				date: new Date(),
				dateTime: new Date(),
				time: new Date()
			});
			this.getView().setModel(oDataModel, "data");

            var oView = this.getView();
			oView.unbindElement();
            oView.bindElement("/Books(1)");
		}
	});
});

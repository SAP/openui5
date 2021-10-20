sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("serializer.view.TestHtml", {

		onInit : function () {
			var model = new JSONModel({
				name : "Skoda Fabia",
				price : "14000"
			});
			this.getView().setModel(model);
		},

		handleButtonPress : function () {
			this.getView().byId("buttonPressLabel").setText("Button Pressed!");
		},

		formatPrice : function (sValue) {
			return sValue + " EUR";
		}
	});

});
sap.ui.define(['sap/ui/model/json/JSONModel'], function(JSONModel) {
	"use strict";

	sap.ui.controller("serializer.view.TestHtml", {

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
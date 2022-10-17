sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel"
], function(MessageToast, Controller, XMLView, JSONModel) {
	"use strict";

	var MyController = Controller.extend("myController", {
		onInit: function() {
			var model = new JSONModel();
			model.setData({
				buttonText: "Click Me!"
			});
			this.getView().setModel(model);
		},
		doSomething: function() {
			MessageToast.show("Hello World!");
		}
	});

	XMLView.create({
		definition: document.getElementById('myXml').textContent,
		controller: new MyController()
	}).then(function(oView) {
		oView.placeAt("content");
	});
});

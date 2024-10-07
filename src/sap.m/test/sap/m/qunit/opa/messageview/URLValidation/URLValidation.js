sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (
	XMLView,
	Controller,
	JSONModel
) {
	"use strict";

	var MyController = Controller.extend("mainView.controller", {
		onInit: function () {
			var oModel = new JSONModel();
			oModel.setData([{
				description:"click the link, then < btn, then back in details and press the link again <a href=\"#\">Relative URL that is allowed after validation.</a> test click",
				message:"press to go to details",
				group:"one"
			}]);

			var oView = this.getView();
			oView.setModel(oModel);

			var oMessageView = oView.byId("messageView");

			oMessageView.setAsyncURLHandler(function (config) {
				config.promise.resolve({
					allowed: true,
					id: config.id
				});
			});

			oMessageView.setAsyncDescriptionHandler(function (config) {
				config.promise.resolve({
					allowed: true,
					id: config.id
				});
			});
		}
	});

	XMLView.create({
		id: "idView",
		definition: document.getElementById("mainView").textContent,
		controller: new MyController()
	}).then(function (oView) {
		oView.placeAt("content");
	});
});

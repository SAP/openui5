sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/mvc/XMLView",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel"
	], function (
		XMLView,
		Controller,
		JSONModel
	) {
		var MyController = Controller.extend("mainView.controller", {
			onInit: function () {
				var oModel = new JSONModel({
					suggestions: []
				});
				var oView = this.getView();
				oView.setModel(oModel);
			},
			onValueHelpRequest: function(e) {
				var resultInput = this.byId("iResult");
				resultInput.setValue(e.getParameter("_userInputValue"));
			},
			onSuggest: function (event) {
				const oControl = this.byId("iTypeAhead");
				const value = event.getParameter("suggestValue");
				if (value === "abxc") {
					oControl.getModel().setProperty("/suggestions", [{ term: "busy indicator suggestion" }]);
					setTimeout(() => {
						oControl.getModel().setProperty("/suggestions", []);
					}, 2000);
				}
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
});

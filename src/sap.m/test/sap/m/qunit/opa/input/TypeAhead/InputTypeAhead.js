sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/m/Panel",
		"sap/m/Text",
		"sap/ui/core/Item",
		"sap/ui/core/mvc/XMLView",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/core/util/MockServer"
	], function (
		Panel,
		Text,
		Item,
		XMLView,
		Controller,
		ODataModel,
		MockServer
	) {
		var MyController = Controller.extend("mainView.controller", {
			onValueHelpRequest: function(e) {
				var resultInput = this.byId("iResult");
				resultInput.setValue(e.getParameter("_userInputValue"));
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

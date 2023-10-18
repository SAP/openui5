sap.ui.getCore().attachInit(function () {
		"use strict";

		sap.ui.require(
				[
						"sap/ui/core/mvc/XMLView",
						"sap/ui/core/mvc/Controller",
						"sap/ui/model/json/JSONModel"
				],
				function (XMLView, Controller, JSONModel) {
						const MyController = Controller.extend("mainView.controller", {
								onInit: function () {
										const oModel = new JSONModel();
										this.getView().setModel(oModel);
								},
								onSuggest: function (oEvent) {
										const oData = {
												items: [
														{ key: "1", value: "70000" },
														{ key: "2", value: "70020" }
												]
										};
										const aItems = oData.items
												.filter((oItem) =>
														oItem.value.includes(
																oEvent.getParameter("suggestValue")
														)
												)
												.slice(0, 5);

										// simulate network request
										setTimeout(
												function () {
														this.getView().getModel().setData({
																items: aItems
														});
												}.bind(this),
												400
										);
								}
						});

						XMLView.create({
								id: "idView",
								definition: document.getElementById("mainView").textContent,
								controller: new MyController()
						}).then(function (oView) {
								oView.placeAt("content");
						});
				}
		);
});

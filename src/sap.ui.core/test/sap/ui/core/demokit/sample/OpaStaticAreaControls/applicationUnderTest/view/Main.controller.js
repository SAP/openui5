sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/StandardListItem"
], function (Controller, JSONModel, MessageToast, Dialog, Button, List, StandardListItem) {
	"use strict";

	var MainController = Controller.extend("view.Main", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		showMessageToast: function(oEvent) {
			var msg = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam volutpat ultricies varius.";
			MessageToast.show(msg);
		},

		showDialog: function () {
			if (!this._dialog) {
				this._dialog = new Dialog({
					title: "Products",
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}"
							})
						}
					}),
					beginButton: new Button({
						id: "OKButton",
						text: "OK",
						press: function () {
							this._dialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this._dialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this._dialog);
			}

			this._dialog.open();
		}

	});

	return MainController;

});

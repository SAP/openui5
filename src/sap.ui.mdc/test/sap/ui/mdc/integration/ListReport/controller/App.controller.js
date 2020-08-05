/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	'sap/m/Text',
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"../Operators"
], function(Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.App", {

		onInit: function() {
			var oCM = new ConditionModel();

			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "books" }), "app");

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.onRouteMatched.bind(this));
		},


		onNavigate: function(oEvent) {
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo(oEvent.getParameter("selectedKey"));
		},

		onExit: function() {
			var oRouter = UIComponent.getRouterFor(this);

			if (oRouter) {
				oRouter.detachRouteMatched(this.onRouteMatched);
			}
		},

		onRouteMatched: function(oEvent) {
			var oParameters = oEvent.getParameters();
			var sRouteName = oParameters.name;

			switch (sRouteName) {
				case "":
				case "books":
				case "bookdetails":
					sRouteName = "books";
					break;

				case "orders":
				case "orderdetails":
					sRouteName = "orders";
					break;

				case "authors":
				case "authordetails":
					sRouteName = "authors";
					break;

				default:
					sRouteName = "books";
					break;
			}

			var oAppModel = this.getView().getModel("app");
			oAppModel.setProperty("/routeName", sRouteName);
		}
	});
});

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	'sap/m/Text',
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"../Operators",
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Operators, Filter, oCore) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.App", {

		onStartRTA: function () {
			var oOwnerComponent = this.getOwnerComponent();
			oCore.loadLibrary("sap/ui/rta", { async: true }).then(function () {
				sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
					startKeyUserAdaptation({
						rootControl: oOwnerComponent.getAggregation("rootControl")
					});
				});
			});
		},

		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);


			var oCM = new ConditionModel();

			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "books" }), "app");

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.onRouteMatched.bind(this));
		},


		onNavigate: function (oEvent) {
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo(oEvent.getParameter("selectedKey"));
		},

		onExit: function () {
			var oRouter = UIComponent.getRouterFor(this);

			if (oRouter) {
				oRouter.detachRouteMatched(this.onRouteMatched);
			}
		},

		onRouteMatched: function (oEvent) {
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
				case "orderitemdetails":
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

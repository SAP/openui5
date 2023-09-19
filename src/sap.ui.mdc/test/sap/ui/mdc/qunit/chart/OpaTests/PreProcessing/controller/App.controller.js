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
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, oCore) {
	"use strict";

	return Controller.extend("applicationUnderTestMDCChart.controller.App", {

		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);


			const oCM = new ConditionModel();

			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "books" }), "app");

			const oRouter = UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.onRouteMatched.bind(this));
		},

		onRouteMatched: function (oEvent) {
			const oParameters = oEvent.getParameters();
			let sRouteName = oParameters.name;

			switch (sRouteName) {
				case "":
				case "chartNew":
					sRouteName = "chartNew";
					break;

				default:
					sRouteName = "chartNew";
					break;
			}

			const oAppModel = this.getView().getModel("app");
			oAppModel.setProperty("/routeName", sRouteName);
		}
	});
});

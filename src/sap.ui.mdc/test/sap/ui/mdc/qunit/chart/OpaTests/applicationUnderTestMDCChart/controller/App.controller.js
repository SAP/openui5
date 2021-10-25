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
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/ui/model/Filter"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter) {
	"use strict";

	return Controller.extend("applicationUnderTestMDCChart.controller.App", {

		onInit: function () {

			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);


			var oCM = new ConditionModel();

			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "books" }), "app");

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.onRouteMatched.bind(this));
		},

		onRouteMatched: function (oEvent) {
			var oParameters = oEvent.getParameters();
			var sRouteName = oParameters.name;

			switch (sRouteName) {
				case "":
				case "chartNew":
					sRouteName = "chartNew";
					break;

				default:
					sRouteName = "chartNew";
					break;
			}

			var oAppModel = this.getView().getModel("app");
			oAppModel.setProperty("/routeName", sRouteName);
		}
	});
});

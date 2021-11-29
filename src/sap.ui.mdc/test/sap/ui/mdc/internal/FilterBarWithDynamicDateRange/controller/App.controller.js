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
	"../Operators",
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Operators, Filter, oCore) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.App", {

		onInit: function () {
			oCore.getMessageManager().registerObject(this.getView(), true);

			var oCM = new ConditionModel();
			this.getView().setModel(oCM, "cm");

			this.getView().setModel(new JSONModel({ routeName: "authors" }), "app");
		}
	});
});

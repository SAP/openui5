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

		onFeatureToggle: function() {

			if (!this._oSelectDialog){

				var oJsonModel = new JSONModel({
					items: [
						{
							name: "Inbuilt Filtering"
						}
					]
				});

				this._oSelectDialog = new SelectDialog({
					title: "Enable Features",
					contentHeight: "50%",
					rememberSelections: true,
					items: {
						path: "features>/items",
						template: new StandardListItem({
							title: "{features>name}"
						})
					},
					search: function(oEvent) {
						var sValue = oEvent.getParameter("value");
						var oFilter = new Filter("name", "Contains", sValue);
						var oBinding = oEvent.getParameter("itemsBinding");
						oBinding.filter([oFilter]);
					},
					confirm: function(oEvt) {
						var aSelectedItems = oEvt.getParameter("selectedItems");

						var bInbuiltFiltering = !!aSelectedItems.find(function(oItem){
							return oItem.getTitle() == "Inbuilt Filtering";
						});

						this.toggleInbuiltFiltering(bInbuiltFiltering);

					}.bind(this)
				});
				this._oSelectDialog.setMultiSelect(true);
				this._oSelectDialog.setModel(oJsonModel, "features");
			}

			this._oSelectDialog.open();
		},

		toggleInbuiltFiltering: function(bEnablInbuiltFilter) {
			var aTables = this.byId("app").findAggregatedObjects("sap.ui.mdc.Table", function(o){ return o.isA("sap.ui.mdc.Table");});
			aTables.forEach(function(oTable){
				var aP13nMode = oTable.getP13nMode() || [];
				if (aP13nMode.indexOf("Filter") < 0 && bEnablInbuiltFilter) {
					aP13nMode.push("Filter");
				} else if (aP13nMode.indexOf("Filter") > -1 && !bEnablInbuiltFilter) {
					aP13nMode.splice(aP13nMode.indexOf("Filter"), 1);
				}
				oTable.setP13nMode(aP13nMode);
			});
		},

		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);


			var oCM = new ConditionModel();

			this.getView().setModel(oCM, "cm");
			this.getView().setModel(new JSONModel({ routeName: "chart" }), "app");

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
				case "chart":
					sRouteName = "chart";
					break;

				default:
					sRouteName = "chart";
					break;
			}

			var oAppModel = this.getView().getModel("app");
			oAppModel.setProperty("/routeName", sRouteName);
		}
	});
});

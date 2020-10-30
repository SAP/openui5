sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickViewNavOrigin.C", {

		onInit: function () {
			var oCardData = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewNavOrigin/model/CardData.json")),
				oEmployeeData = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewNavOrigin/model/EmployeeData.json"));

			this.getView()
				.setModel(oCardData, "CardModel")
				.setModel(oEmployeeData, "EmployeeModel");
		},

		onAfterRendering: function () {
			var oButton = this.byId("quickViewBtn");
			oButton.$().attr("aria-haspopup", true);
		},

		openQuickView: function (oEvent, oModel) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pQuickView) {
				this._pQuickView = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.QuickViewNavOrigin.QuickViewNavOrigin",
					controller: this
				}).then(function (oQuickView) {
					oView.addDependent(oQuickView);
					return oQuickView;
				});
			}
			this._pQuickView.then(function(oQuickView){
				oQuickView.setModel(oModel);
				oQuickView.openBy(oButton);
			});
		},

		handleQuickViewBtnPress: function (oEvent) {
			var oModel = this.getView().getModel("CardModel");
			this.openQuickView(oEvent, oModel);
		},

		onNavigate: function (oEvent) {
			var oNavOrigin = oEvent.getParameter("navOrigin");
			if (oNavOrigin) {
				var oCardModel = this.getView().getModel("CardModel"),
					oEmployeeModel = this.getView().getModel("EmployeeModel"),
					oEmployee = oEmployeeModel.getProperty("/" + oNavOrigin.getText()),
					aPages = oCardModel.getProperty("/pages");

				aPages.splice(1, 1, oEmployee);
				oCardModel.setProperty("/pages", aPages);
			}
		}

	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickViewNavOrigin.QuickViewNavOrigin", {

		onInit: function () {
			// load JSON sample data
			var oCardData = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewNavOrigin/model/CardData.json")),
				oEmployeeData = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewNavOrigin/model/EmployeeData.json"));

			this.getView()
				.setModel(oCardData, "CardModel")
				.setModel(oEmployeeData, "EmployeeModel");
		},

		onAfterRendering: function () {
			var oButton = this.byId('quickViewBtn');
			oButton.$().attr('aria-haspopup', true);
		},

		openQuickView: function (oEvent, oModel) {
			var oButton = oEvent.getSource();

			if (!this._oQuickView) {
				Fragment.load({
					name: "sap.m.sample.QuickViewNavOrigin.QuickViewNavOrigin",
					controller: this
				}).then(function (oQuickView) {
					this._oQuickView = oQuickView;
					this.getView().addDependent(this._oQuickView);
					this._oQuickView.setModel(oModel);
					this._oQuickView.openBy(oButton);
				}.bind(this));
			} else {
				this._oQuickView.setModel(oModel);
				this._oQuickView.openBy(oButton);
			}
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
				// this.getView().setModel(oCardModel, "CardModel");
			}
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		}

	});
});
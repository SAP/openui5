sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Fragment, Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickViewAvatarConfiguration.C", {

		onInit: function () {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewAvatarConfiguration/model/data.json"));
		},

		onAfterRendering: function () {
			var oButton = this.byId("showQuickView");
			oButton.$().attr("aria-haspopup", true);
		},

		handleButtonPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pQuickView) {
				this._pQuickView = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.QuickViewAvatarConfiguration.QuickViewAvatarConfiguration",
					controller: this
				}).then(function (oQuickView) {
					oQuickView.setModel(this.oModel);
					oView.addDependent(oQuickView);
					return oQuickView;
				}.bind(this));
			}
			this._pQuickView.then(function(oQuickView) {
				oQuickView.openBy(oButton);
			});
		},

		handleAvatarPress: function () {
			MessageToast.show("Avatar was pressed");
		},

		formatBadgeIcon: function (sPageId) {
			if (sPageId === "companyEmployeePageId") {
				return "sap-icon://edit";
			}

			return null;
		}

	});
});
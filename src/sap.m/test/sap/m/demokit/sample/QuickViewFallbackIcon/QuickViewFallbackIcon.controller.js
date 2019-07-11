sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.QuickViewFallbackIcon.QuickViewFallbackIcon", {

		onInit: function () {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewFallbackIcon/model/data.json"));
		},

		onAfterRendering: function () {
			var oButton = this.byId("showQuickView");
			oButton.$().attr("aria-haspopup", true);
		},

		handleButtonPress: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oQuickView) {
				Fragment.load({
					name: "sap.m.sample.QuickViewFallbackIcon.QuickViewFallbackIcon"
				}).then(function(oQuickView) {
					oQuickView.setModel(this.oModel);
					this._oQuickView = oQuickView;
					this.getView().addDependent(oQuickView);
					oQuickView.openBy(oButton);
				}.bind(this));
			} else {
				this._oQuickView.openBy(oButton);
			}
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		}
	});

	return CController;
});

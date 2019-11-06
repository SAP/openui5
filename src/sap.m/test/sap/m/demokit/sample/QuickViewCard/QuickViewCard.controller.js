sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickViewCard.QuickViewCard", {

		onInit: function () {
			// load JSON sample data
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewCard/model/data.json"));
			this.getView().setModel(oModel);
		},

		onBeforeRendering: function () {
			var oButton = this.byId("buttonBack");
			oButton.setEnabled(false);
		},

		onAfterRendering: function () {
			this.byId("quickViewCardContainer").$().css("maxWidth", "320px");
		},

		onButtonBackClick: function () {
			var oQuickViewCard = this.byId("quickViewCard");
			oQuickViewCard.navigateBack();
		},

		onNavigate: function (oEvent) {
			var oNavOrigin = oEvent.getParameter("navOrigin");

			if (oNavOrigin) {
				MessageToast.show('Link "' + oNavOrigin.getText() + '" was clicked');
			} else {
				MessageToast.show("Back button was clicked");
			}
		},

		onAfterNavigate: function (oEvent) {
			var oButton = this.byId("buttonBack");
			oButton.setEnabled(!oEvent.getParameter("isTopPage"));
		}

	});
});
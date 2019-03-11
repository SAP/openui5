sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.NavigationService", {
		onInit: function () {
			var oCard = this.getView().byId("CardNavigationActionEvent");
			if (oCard) {
				oCard.attachEvent("onAction", this.onAction);
			}

			oCard = this.getView().byId("TableCardNavigationActionEvent");
			if (oCard) {
				oCard.attachEvent("onAction", this.onAction);
			}
		},
		onAction: function (oEvent) {
			var oSemanticObject = oEvent.getParameter("semanticObject");
			var mManifestParameters = oEvent.getParameter("manifestParameters");
			// Header is clicked there is no semantic object so directly use the URL
			var sUrl;
			if (mManifestParameters && mManifestParameters.url) {
				sUrl = mManifestParameters.url;
			}
			if (oSemanticObject && oSemanticObject.url) {
				sUrl = oSemanticObject.url;
			}
			window.open(sUrl, "_blank");
		}
    });

});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log"
], function (Controller, Log) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.NavigationService", {
		onAction: function (oEvent) {
			var mManifestParameters = oEvent.getParameter("manifestParameters");
			// Header is clicked there is no semantic object so directly use the URL
			var sUrl;
			if (mManifestParameters && mManifestParameters.url) {
				sUrl = mManifestParameters.url;
			}
			window.open(sUrl, "_blank");
		},
		onActionLog: function (oEvent) {
			Log.info("[CARD]" + oEvent.getParameter("type"));
			Log.info("[CARD]" + JSON.stringify(oEvent.getParameter("manifestParameters"), null, 2));
			Log.info("[CARD]" + oEvent.getParameter("actionSource"));
		}
    });

});
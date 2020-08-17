sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function(Component, JSONModel, Log) {
	"use strict";

	return Component.extend("sap.my.test.widget.component.Component", {
		metadata : {
			manifest: "json"
		},
		onCardReady: function (oCard) {
			Log.info("Widget parameters: " + JSON.stringify(oCard.getCombinedParameters()));
			Log.info("Widget manifest: " + JSON.stringify(oCard.getManifestEntry("/sap.card")));

			this.card = oCard;

			oCard.resolveDestination("myDestination").then(function (sUrl) {
				var oModel = new JSONModel(sUrl + "/Products?$format=json&$top=2");
				this.setModel(oModel, "products");
			}.bind(this));

			this.setModel(new JSONModel(oCard.getCombinedParameters()), "cardParameters");
		}
	});
});

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel"
	],
	function(UIComponent, JSONModel) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.demo.cardExplorer.samples.Destinations.sampleComponent.Component", {
		onCardReady: function (oCard) {
			oCard.resolveDestination("myDestination").then(function (sUrl) {
				var oModel = new JSONModel(sUrl + "/Products?$format=json&$top=5");
				this.setModel(oModel, "products");
			}.bind(this));
		}
	});

	return Component;

});

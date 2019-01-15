sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var AnalyticalCardController = Controller.extend("sap.ui.integration.sample.AnalyticalCard.AnalyticalCard", {
		onInit: function () {
			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/AnalyticalCard/model/cardManifests.json"));
			this.getView().setModel(cardManifests, "manifests");
		}
	});

	return AnalyticalCardController;

});

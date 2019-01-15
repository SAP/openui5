sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var ListCardController = Controller.extend("sap.ui.integration.sample.ListCard.ListCard", {
		onInit: function () {
			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/ListCard/model/cardManifest.json"));
			this.getView().setModel(cardManifests, "manifests");
		}
	});

	return ListCardController;

});

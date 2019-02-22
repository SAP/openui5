sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var ObjectCardController = Controller.extend("sap.ui.integration.sample.ObjectCard.ObjectCard", {
		onInit: function () {
			var cardManifests = new JSONModel();

			cardManifests.loadData(sap.ui.require.toUrl("sap/ui/integration/sample/ObjectCard/model/manifest.json"));
			this.getView().setModel(cardManifests, "manifests");
		}
	});

	return ObjectCardController;

});

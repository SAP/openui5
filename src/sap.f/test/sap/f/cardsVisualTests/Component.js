sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"./services/SampleServices"
], function (UIComponent, JSONModel, SampleServices) {
	"use strict";

	return UIComponent.extend("sap.f.cardsVisualTests.Component", {
		metadata : {
			manifest: "json"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			var oModel = new JSONModel();
			oModel.loadData("./cardsVisualTests/model/examples.json");
			this.setModel(oModel);

			var oCardManifests = new JSONModel();
			oCardManifests.loadData("./cardsVisualTests/model/cardManifests.json");
			this.setModel(oCardManifests, "manifests");
		}
	});

});

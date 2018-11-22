sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.f.cardsdemo.Component", {
		metadata : {
			manifest: "json"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			var oModel = new JSONModel();
			oModel.loadData("./model/examples.json");
			this.setModel(oModel);

			var oCardManifests = new JSONModel();
			oCardManifests.loadData("./model/cardManifests.json");
			this.setModel(oCardManifests, "manifests");
		}
	});

});

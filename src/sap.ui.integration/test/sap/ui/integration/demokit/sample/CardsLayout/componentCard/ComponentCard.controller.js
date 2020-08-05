sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardsLayout.componentCard.ComponentCard", {

		onInit: function () {
			var mapImageUrl = sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/componentCard/images/map.png");
			this.getView().setModel(new JSONModel({ mapImageUrl: mapImageUrl }));
		}

	});
});
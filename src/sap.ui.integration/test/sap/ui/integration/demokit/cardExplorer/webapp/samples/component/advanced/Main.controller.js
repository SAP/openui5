sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/library"
], function (Controller, library) {
	"use strict";
	var CardPreviewMode = library.CardPreviewMode;

	return Controller.extend("my.component.sample.advanced.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.card,
				oParameters = oCard.getCombinedParameters(),
				sCity = oParameters.city;
			if (oCard.getPreviewMode() === CardPreviewMode.MockData) {
				sCity = "MockData " + sCity;
			}

			this.byId("cityValue").setText(sCity);
		}
	});
});
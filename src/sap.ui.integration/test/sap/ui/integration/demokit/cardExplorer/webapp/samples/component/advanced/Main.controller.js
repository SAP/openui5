sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("my.component.sample.advanced.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.card,
				oParameters = oCard.getCombinedParameters(),
				sCity = oParameters.city;
			if (oCard.getProperty("useMockData")) {
				sCity = "Mock " + sCity;
			}

			this.byId("cityValue").setText(sCity);
		}
	});
});
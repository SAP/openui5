sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("my.component.sample.advanced.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oParameters = oComponent.card.getCombinedParameters(),
				sCity = oParameters.city;

			this.byId("cityValue").setText(sCity);
		}
	});
});
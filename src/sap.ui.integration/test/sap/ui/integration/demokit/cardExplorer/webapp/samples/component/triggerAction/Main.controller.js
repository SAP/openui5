sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("my.component.sample.triggerAction.Main", {
		handleSeeDetails: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.oCard,
				oParams = oCard.getCombinedParameters(),
				sProductName = oParams.productName;

			oCard.triggerAction({
				type: "Navigation",
				parameters: {
					"url": "/details.html?productName=" + sProductName
				}
			});
		}
	});
});
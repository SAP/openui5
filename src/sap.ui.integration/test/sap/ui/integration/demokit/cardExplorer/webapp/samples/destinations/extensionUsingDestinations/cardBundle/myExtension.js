sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	var oExtension = new Extension();

	oExtension.getDataFromDestination = function () {
		var oCard = this.getCard();

		// Make request to a destination.
		return oCard.request({
				"url": "{{destinations.myDestination}}/Products",
				"parameters": {
					"$format": "json",
					"$top": oCard.getCombinedParameters().maxItems,
					"$orderby": "ProductID asc"
				}
			}).then(function (oData) {
				// If needed modify the data or chain another request.
				return oData;
			}).catch(function (oErr) {
				Log.error(oErr);
			});
	};

	return oExtension;
});
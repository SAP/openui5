sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var FilterExtension = Extension.extend("card.explorer.filters.search.multiple.FilterExtension");

	FilterExtension.prototype.getData = function (selectedShipper, countryQuery) {
		var oCard = this.getCard();

		// Request data based on the filters in the card.
		// If needed, their value can be pre-processed before the data request.
		return oCard.request({
			url: "{{destinations.Northwind_V4}}/Orders",
			parameters: {
				$top: oCard.getCombinedParameters().maxOrdersShown,
				$filter: "Shipper/ShipperID eq " + selectedShipper + " and contains(ShipCountry, '" + countryQuery + "')"
			}
		});
	};

	return FilterExtension;
});
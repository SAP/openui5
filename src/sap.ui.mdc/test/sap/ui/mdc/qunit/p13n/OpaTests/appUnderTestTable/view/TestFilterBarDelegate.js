sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate"
], function (FilterBarDelegate) {
	"use strict";

	var oCustomDelegate = Object.assign({}, FilterBarDelegate);

	oCustomDelegate.fetchProperties = function() {
		var oFilterPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		return oFilterPromise.then(function(aProperties){
			aProperties.forEach(function(oProperty, iIndex){
				if (oProperty.name.includes("countryOfOrigin/") || oProperty.path && oProperty.path.includes("countryOfOrigin/")){
					oProperty.label = "Country " + oProperty.label;
				}
				if (oProperty.name.includes("localized/") || oProperty.path && oProperty.path.includes("localized/")){
					oProperty.label = "Localized " + oProperty.label;
				}
				if (oProperty.name.includes("regionOfOrigin/") || oProperty.path && oProperty.path.includes("regionOfOrigin/")){
					oProperty.label = "Region " + oProperty.label;
				}
			});
			return aProperties;
		});
	};

	return oCustomDelegate;

});

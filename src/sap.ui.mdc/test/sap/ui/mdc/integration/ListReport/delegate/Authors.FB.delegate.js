/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate"
], function(FilterBarDelegate) {
	"use strict";

	var FilterBarAuthorsSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarAuthorsSampleDelegate._getProperty = function(aProperties, sName) {
		var oNamedProperty = null;
		aProperties.some(function(oProperty) {
			if (oProperty.name === sName) {
				oNamedProperty = oProperty;
			}
			return oNamedProperty !== null;
		});

		return oNamedProperty;
	};

	FilterBarAuthorsSampleDelegate.fetchProperties = function(oFilterBar) {
		return new Promise(function(fResolve) {
			FilterBarDelegate.fetchProperties(oFilterBar).then(function(aProperties) {
				aProperties.forEach(function(oProperty) {
					if (oProperty.maxConditions === -1) {
						oProperty.fieldHelp = "FVH_Generic_Multi";
					}
				});

				var oProperty = FilterBarAuthorsSampleDelegate._getProperty(aProperties, "dateOfBirth");
				if (oProperty) {
					oProperty.fieldHelp = "fhAdob";
				}
				oProperty = FilterBarAuthorsSampleDelegate._getProperty(aProperties, "dateOfDeath");
				if (oProperty) {
					oProperty.fieldHelp = "fhAdod";
				}
				oProperty = FilterBarAuthorsSampleDelegate._getProperty(aProperties, "countryOfOrigin_code");
				if (oProperty) {
					oProperty.fieldHelp = "IOFFVHCountry";
				}
				oProperty = FilterBarAuthorsSampleDelegate._getProperty(aProperties, "regionOfOrigin_code");
				if (oProperty) {
					oProperty.fieldHelp = "IOFFVHRegion";
				}
				oProperty = FilterBarAuthorsSampleDelegate._getProperty(aProperties, "cityOfOrigin_city");
				if (oProperty) {
					oProperty.fieldHelp = "IOFFVHCity";
				}

				fResolve(aProperties);
			});
		});
	};

	FilterBarAuthorsSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {

		var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);

		oFilterFieldPromise.then(function (oFilterField) {

			if (sName === "dateOfBirth") {
				oFilterField.setOperators(["RENAISSANCE","MEDIEVAL","MODERN","CUSTOMRANGE","NOTINRANGE"]);
				return oFilterField;
			}
		});

		return oFilterFieldPromise;

	};
	return FilterBarAuthorsSampleDelegate;
});

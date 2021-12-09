/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate",
	'sap/ui/mdc/enum/FieldDisplay'
], function(FilterBarDelegate, FieldDisplay) {
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

		var bSearchExists = false;

		return new Promise(function(fResolve) {

			FilterBarDelegate.fetchProperties(oFilterBar).then(function(aProperties) {
				aProperties.forEach(function(oProperty) {

					if (oProperty.name.indexOf("/") >= 0) {
						oProperty.hiddenFilter = true;
					}

					if (oProperty.name === "$search") {
						bSearchExists = true;
					} else if (oProperty.name === "ID") {
						oProperty.formatOptions = {groupingEnabled: false};
					} else if (oProperty.name === "name") {
						oProperty.fieldHelp = "fhName";
					} else if (oProperty.name === "dateOfBirth") {
						oProperty.fieldHelp = "fhAdob";
					} else if (oProperty.name === "dateOfDeath") {
						// oProperty.fieldHelp = "fhAdod";
						oProperty.maxConditions = 1;
					} else if (oProperty.name === "countryOfOrigin_code") {
						oProperty.fieldHelp = "IOFFVHCountry";
						oProperty.display = FieldDisplay.ValueDescription;
					} else if (oProperty.name === "regionOfOrigin_code") {
						oProperty.fieldHelp = "IOFFVHRegion";
						oProperty.display = FieldDisplay.ValueDescription;
					} else if (oProperty.name === "cityOfOrigin_city") {
						oProperty.fieldHelp = "IOFFVHCity";
						oProperty.display = FieldDisplay.ValueDescription;
					}

					if (oProperty.maxConditions === -1 && !oProperty.fieldHelp) {
						oProperty.fieldHelp = "FVH_Generic_Multi";
					}
				});

				if (!bSearchExists) {
					aProperties.push({
						  name: "$search",
						  typeConfig: FilterBarDelegate.getTypeUtil().getTypeConfig("Edm.String", null, null)
					});
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

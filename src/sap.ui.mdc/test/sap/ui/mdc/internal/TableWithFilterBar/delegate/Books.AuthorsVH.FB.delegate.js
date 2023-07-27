/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate"
], function(FilterBarDelegate) {
	"use strict";

	var FilterBarBooksAuthorsVHSampleDelegate = Object.assign({}, FilterBarDelegate);
	FilterBarBooksAuthorsVHSampleDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	FilterBarBooksAuthorsVHSampleDelegate._getProperty = function(aProperties, sName) {
		var oNamedProperty = null;
		aProperties.some(function(oProperty) {
			if (oProperty.name === sName) {
				oNamedProperty = oProperty;
			}
			return oNamedProperty !== null;
		});

		return oNamedProperty;
	};

	FilterBarBooksAuthorsVHSampleDelegate.fetchProperties = function(oFilterBar) {

		// var sCollectionName = oFilterBar.getPayload().collectionName;

		return new Promise(function(fResolve) {

			FilterBarDelegate.fetchProperties(oFilterBar).then(function(aProperties) {
				var bSearchExists = false;
				aProperties.forEach(function(oProperty) {
					if (oProperty.name.indexOf("/") >= 0) {
						oProperty.hiddenFilter = true;
					}

					if (oProperty.name === "$search") {
						bSearchExists = true;
					} else if (oProperty.name === "dateOfBirth") {
						oProperty.valueHelp = "FH2";
						// oProperty.maxConditions = 1;
					}

					if (oProperty.maxConditions === -1 && !oProperty.valueHelp) {
						oProperty.valueHelp = "FVH_Generic_Multi";
					}
				});

				if (!bSearchExists) {
					aProperties.push({
						  label: "",
						  name: "$search",
						  dataType: "Edm.String"
					});
				}

				fResolve(aProperties);
			});
		});
	};

	return FilterBarBooksAuthorsVHSampleDelegate;
});

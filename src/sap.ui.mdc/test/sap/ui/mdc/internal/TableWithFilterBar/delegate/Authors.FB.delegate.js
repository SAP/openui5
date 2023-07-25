/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	'sap/ui/fl/Utils'
], function(FilterBarDelegate, FieldDisplay, JsControlTreeModifier, FlUtils) {
	"use strict";

	var FilterBarAuthorsSampleDelegate = Object.assign({}, FilterBarDelegate);
	FilterBarAuthorsSampleDelegate.apiVersion = 2;//CLEANUP_DELEGATE

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
					} else if (oProperty.name === "dateOfDeath") {
						oProperty.maxConditions = 1;
					}

					if (oProperty.display) {
						delete oProperty.display;
					}
					if (oProperty.valueHelp) {
						delete oProperty.valueHelp;
					}

				});

				if (!bSearchExists) {
					aProperties.push({
						  label: "foo", // label is a required propertyInfo porerty
						  name: "$search",
						  dataType: "Edm.String"
					});
				}

				fResolve(aProperties);
			});
		});
	};

	FilterBarAuthorsSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {

		mPropertyBag = mPropertyBag || {
			modifier: JsControlTreeModifier,
			view: FlUtils.getViewForControl(oFilterBar),
			appComponent: FlUtils.getAppComponentForControl(oFilterBar)
		};

		var oModifier = mPropertyBag.modifier;
		// var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);
		var oView = mPropertyBag.view ? mPropertyBag.view : FlUtils.getViewForControl(oFilterBar);

		oFilterFieldPromise.then(function (oFilterField) {

			if (oProperty.name === "ID") {
				// oProperty.formatOptions = {groupingEnabled: false};
			} else if (oProperty.name === "name") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("fhName"));
				// oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (oProperty.name === "dateOfBirth") {
				oModifier.setProperty(oFilterField, "operators", ["RENAISSANCE","MEDIEVAL","MODERN","CUSTOMRANGE","NOTINRANGE"]);
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("fhAdob"));
				// oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (oProperty.name === "dateOfDeath") {
				// oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (oProperty.name === "countryOfOrigin_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("IOFFVHCountry"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.ValueDescription);
			} else if (oProperty.name === "regionOfOrigin_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("IOFFVHRegion"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.ValueDescription);
			} else if (oProperty.name === "cityOfOrigin_city") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("IOFFVHCity"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.ValueDescription);
			}

			if (oProperty.maxConditions === -1 && !oProperty.fieldHelp) {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FVH_Generic_Multi"));
			}


		});

		return oFilterFieldPromise;

	};
	return FilterBarAuthorsSampleDelegate;
});

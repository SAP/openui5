/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	'sap/ui/fl/Utils',
	'sap/ui/mdc/enums/FieldDisplay',
	'delegates/util/DelegateCache'
], function(FilterBarDelegate, JsControlTreeModifier, FlUtils, FieldDisplay, DelegateCache) {
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

				const oCacheSettings = {
					"name": { "valueHelp": "fhName" },
					"dateOfBirth": { "valueHelp": "fhAdob", "operators": ["RENAISSANCE", "MEDIEVAL", "MODERN", "CUSTOMRANGE", "NOTINRANGE"] },
					"cityOfOrigin_city": { "valueHelp": "IOFFVHCity", "display": FieldDisplay.ValueDescription},
					"countryOfOrigin_code": { "valueHelp": "IOFFVHCountry", "display": FieldDisplay.ValueDescription, "delegate": {"name": "sap/ui/v4demo/delegate/FieldBase.delegate", "payload": {"pasteDescription": true}}},
					"regionOfOrigin_code": { "valueHelp": "IOFFVHRegion", "display": FieldDisplay.ValueDescription}
				};

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

					if (oProperty.maxConditions === -1 ) {
						const oCurrentSettings = DelegateCache.get(oFilterBar, oProperty.name) || oCacheSettings[oProperty.name] || {};
						if (!oCurrentSettings.valueHelp) {
							oCacheSettings[oProperty.name] = {...oCurrentSettings, valueHelp: "FVH_Generic_Multi"};
						}
					}
				});

				if (!bSearchExists) {
					aProperties.push({
						  label: "foo", // label is a required propertyInfo porerty
						  name: "$search",
						  dataType: "Edm.String"
					});
				}

				DelegateCache.add(oFilterBar.originalNode || oFilterBar, oCacheSettings);

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

		return FilterBarDelegate._createFilterField.apply(this, arguments);
	};
	return FilterBarAuthorsSampleDelegate;
});

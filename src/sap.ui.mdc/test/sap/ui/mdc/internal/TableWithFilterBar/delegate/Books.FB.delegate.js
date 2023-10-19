/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/mdc/enums/FieldDisplay', 'sap/ui/mdc/enums/OperatorName', 'delegates/util/DelegateCache'
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, FieldDisplay, OperatorName, DelegateCache) {
	"use strict";

	var FilterBarBooksSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarBooksSampleDelegate.fetchProperties = function (oFilterBar) {
		var oFetchPropertiesPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		var bSearchExists = false;

		return oFetchPropertiesPromise.then(function (aProperties) {
			aProperties.forEach(function(oPropertyInfo){
				if (oPropertyInfo.display) {
					delete oPropertyInfo.display;
				}

				if (oPropertyInfo.name.indexOf("/") >= 0) {
					oPropertyInfo.hiddenFilter = true;
				}

				if (oPropertyInfo.name === "$search") {
					bSearchExists = true;
					oPropertyInfo.label = "";
				} else if (oPropertyInfo.name === "ID") {
					oPropertyInfo.formatOptions = {groupingEnabled: false};
				} else if (oPropertyInfo.name === "author_ID") {
					oPropertyInfo.formatOptions = {groupingEnabled: false};
				} else if (oPropertyInfo.name === "title") {
					oPropertyInfo.caseSensitive = false;
				} else if (oPropertyInfo.name === "language_code") {
					oPropertyInfo.maxConditions = 1;
					oPropertyInfo.constraints = {nullable: false, maxLength: 3}; // to test not nullable
				} else if (oPropertyInfo.name === "stock") {
					oPropertyInfo.label = "Stock range";
					oPropertyInfo.maxConditions = 1;
				} else if (oPropertyInfo.name === "subgenre_code") {
					oPropertyInfo.label = "Sub Genre";
				} else if (oPropertyInfo.name === "detailgenre_code") {
					oPropertyInfo.label = "Detail Genre";
				} else if (oPropertyInfo.name === "author/dateOfBirth") {
					oPropertyInfo.maxConditions = 1;
				} else if (oPropertyInfo.name === "author/dateOfDeath") {
					oPropertyInfo.maxConditions = 1;
				} else if (oPropertyInfo.name === "currency_code") {
					oPropertyInfo.maxConditions = 1; // normally only one currency should be used, otherwise it makes no sense related to price
				} else if (oPropertyInfo.name === "createdAt") {
					oPropertyInfo.maxConditions = 1; // to use DynamicDateRange
				}
			});

			if (!bSearchExists) {
				aProperties.push({
					  name: "$search",
					  dataType: "Edm.String",
					  label: ""
				});
			}

			DelegateCache.add(oFilterBar, {
				"stock": { "operators": [OperatorName.BT] },
				"author_ID": { "valueHelp": "FH1", display: FieldDisplay.Description},
				"title": { "valueHelp": "FH4" },
				"published": { "defaultOperator": "RENAISSANCE", "valueHelp": "FHPublished", "operators": [OperatorName.EQ, OperatorName.GT, OperatorName.LT, OperatorName.BT, "MEDIEVAL", "RENAISSANCE", "MODERN", OperatorName.LASTYEAR] },
				"language_code": { "valueHelp": "FHLanguage", "display": FieldDisplay.Description},
				"classification_code": { "valueHelp": "FHClassification", "display": FieldDisplay.Description},
				"genre_code": { "valueHelp": "FHGenre", "display": FieldDisplay.Description},
				"subgenre_code": { "valueHelp": "FHSubGenre", "display": FieldDisplay.Description },
				"detailgenre_code": { "valueHelp": "FHDetailGenre", "display": FieldDisplay.Description},
				"currency_code": { "valueHelp": "FH-Currency", display: FieldDisplay.Value, operators: [OperatorName.EQ]},
				"createdAt": { "operators": ["MYDATE", "MYDATERANGE", OperatorName.EQ, OperatorName.GE, OperatorName.LE, OperatorName.BT, OperatorName.LT, OperatorName.TODAY, OperatorName.YESTERDAY, OperatorName.TOMORROW, OperatorName.LASTDAYS, "MYNEXTDAYS", OperatorName.THISWEEK, OperatorName.THISMONTH, OperatorName.THISQUARTER, OperatorName.THISYEAR, OperatorName.NEXTHOURS, OperatorName.NEXTMINUTES, OperatorName.LASTHOURS] }
			}, "$Filters");

			return aProperties;
		});
	};

	FilterBarBooksSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {

		mPropertyBag = mPropertyBag || {
			modifier: JsControlTreeModifier,
			view: FlUtils.getViewForControl(oFilterBar),
			appComponent: FlUtils.getAppComponentForControl(oFilterBar)
		};

		var oModifier = mPropertyBag.modifier;
		var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);

		return oFilterFieldPromise.then(function (oFilterField) {
			if (sName === "stock") {

				return oModifier.createControl("sap.ui.v4demo.controls.CustomRangeSlider", mPropertyBag.appComponent, mPropertyBag.view, "customSlider", {
					max: 9999,
					width: "100%"
				}).then(function(oCustomRangeSlider) {

					if (oCustomRangeSlider.addStyleClass) {
						oCustomRangeSlider.addStyleClass("sapUiMediumMarginBottom");
					} else {
						oModifier.setAssociation(oCustomRangeSlider, "class", "sapUiMediumMarginBottom");
					}
					return oModifier.insertAggregation(oFilterField, "contentEdit", oCustomRangeSlider, 0, mPropertyBag.view);
				}).then(function() {
					return oFilterField;
				});
			}

			return oFilterField;
		});
	};

	FilterBarBooksSampleDelegate.visualizeValidationState = function(oFilterBar, mValidation) {


		var oView = oFilterBar._getView();
		if (oView) {
			var oDynamicPage = oView.byId("dynamicPage");
			if (oDynamicPage && oDynamicPage.getHeaderExpanded()) {
				FilterBarDelegate.visualizeValidationState.apply(this, arguments);
			}
		}
	};

	return FilterBarBooksSampleDelegate;
});

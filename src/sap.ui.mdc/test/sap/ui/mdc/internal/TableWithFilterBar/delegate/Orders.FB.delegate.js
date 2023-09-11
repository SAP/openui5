/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/mdc/enums/FieldDisplay', 'sap/ui/mdc/enums/OperatorName', 'sap/ui/model/odata/type/Int32', 'delegates/util/DelegateCache'

], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, FieldDisplay, OperatorName, TypeInt32, DelegateCache) {
	"use strict";

	var FilterBarOrdersSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarOrdersSampleDelegate.fetchProperties = function (oFilterBar) {
		var oFetchPropertiesPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		var bSearchExists = false;

		return oFetchPropertiesPromise.then(function (aProperties) {
			aProperties.forEach(function(oPropertyInfo){

				if (oPropertyInfo.name.indexOf("/") >= 0 && oPropertyInfo.name !== "Items*/book_ID" && oPropertyInfo.name !== "Items+/book_ID") {
					oPropertyInfo.hiddenFilter = true;
				}

				if (oPropertyInfo.name === "$search") {
					bSearchExists = true;
				} else if (oPropertyInfo.name === "OrderNo") {
					oPropertyInfo.label = "Order Number";
				} else if (oPropertyInfo.name === "orderTime") {
					oPropertyInfo.label = "Order Time";
				} else if (oPropertyInfo.name === "currency_code") {
					oPropertyInfo.maxConditions = 1; // normally only one currency should be used, otherwise it makes no sense related to price
				}
			});

			if (!aProperties.find(function(aItem) { return aItem.name === "Items*/book_ID"; } ) ) {
				aProperties.push({
					name: "Items*/book_ID",
					label: "Order w. one Item for Book (Any)",
					groupLabel: "none",
					dataType: "Edm.Int32"
				});
			}

			if (!aProperties.find(function(aItem) { return aItem.name === "Items+/book_ID"; } ) ) {
				aProperties.push({
					name: "Items+/book_ID",
					label: "Order w. all Items for Book (All)",
					groupLabel: "none",
					dataType: "Edm.Int32"
				});
			}

			if (!bSearchExists) {
				aProperties.push({
					  name: "$search",
					  label: "",
					  dataType: "Edm.String"
				});
			}

			DelegateCache.add(oFilterBar, {
				"OrderNo": {valueHelp: "FH1"},
				"currency_code": {valueHelp: "FH-Currency", display: FieldDisplay.Value, operators: [OperatorName.EQ]},
				"ID": {valueHelp: "VH-ID", display: FieldDisplay.ValueDescription, operators: [OperatorName.EQ], additionalDataType: {name: "sap.ui.model.odata.type.String", constraints: {maxLength: 10, isDigitSequence: true}}}
			}, "$Filters");

			return aProperties;
		});
	};

	FilterBarOrdersSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {
		mPropertyBag = mPropertyBag || {
			modifier: JsControlTreeModifier,
			view: FlUtils.getViewForControl(oFilterBar),
			appComponent: FlUtils.getAppComponentForControl(oFilterBar)
		};
		return FilterBarDelegate._createFilterField.apply(this, arguments);
	};


	return FilterBarOrdersSampleDelegate;
});

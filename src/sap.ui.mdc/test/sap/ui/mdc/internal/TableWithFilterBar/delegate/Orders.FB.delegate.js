/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/mdc/enums/FieldDisplay', 'sap/ui/model/odata/type/Int32'
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, FieldDisplay, TypeInt32) {
	"use strict";

	var FilterBarOrdersSampleDelegate = Object.assign({}, FilterBarDelegate);
	FilterBarOrdersSampleDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	FilterBarOrdersSampleDelegate.fetchProperties = function () {
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

				if (oPropertyInfo.display) {
					delete oPropertyInfo.display;
				}
				if (oPropertyInfo.valueHelp) {
					delete oPropertyInfo.valueHelp;
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

			return aProperties;
		});

		// { name: "author_ID",
		// groupLabel: "none",
		// label: "Author ID",
		// type: "Edm.Int32",
		// baseType:new TypeInt32(),
		// required: false,
		// hiddenFilter: false,
		// visible: true,
		// maxConditions : -1,
		// fieldHelp: "FHAuthor"}
	};

	FilterBarOrdersSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {


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
			if (oProperty.name === "OrderNo") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FH1"));
			} else if (oProperty.name === "currency_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FH-Currency"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Value);
				oModifier.setProperty(oFilterField, "operators", ["EQ"]);
			}
		});

		return oFilterFieldPromise;

	};


	return FilterBarOrdersSampleDelegate;
});

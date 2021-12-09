/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/model/odata/type/Int32'
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, TypeInt32) {
	"use strict";

	var FilterBarOrdersSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarOrdersSampleDelegate.fetchProperties = function () {
		var oFetchPropertiesPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		var bSearchExists = false;

		return oFetchPropertiesPromise.then(function (aProperties) {
			aProperties.forEach(function(oPropertyInfo){

				if (oPropertyInfo.name === "$search") {
					bSearchExists = true;
				}

				if (oPropertyInfo.name === "OrderNo") {
					oPropertyInfo.label = "Order Number";
				}

				if (oPropertyInfo.name === "orderTime") {
					oPropertyInfo.label = "Order Time";
				}

			});

			if (!aProperties.find(function( aItem) { return aItem.name === "Items*/book_ID"; } ) ) {
				aProperties.push({
					name: "Items*/book_ID",
					label: "Order w. one Item for Book (Any)",
					groupLabel: "none",
					typeConfig: {
						baseType: "Numeric",
						className: "Edm.In32",
						typeInstance: new TypeInt32()
					}
				});
			}

			if (!aProperties.find(function( aItem) { return aItem.name === "Items+/book_ID"; } ) ) {
				aProperties.push({
					name: "Items+/book_ID",
					label: "Order w. all Items for Book (All)",
					groupLabel: "none",
					typeConfig: {
						baseType: "Numeric",
						className: "Edm.Int32",
						typeInstance: new TypeInt32()
					}
				});
			}

			if (!bSearchExists) {
				aProperties.push({
					  name: "$search",
					  typeConfig: FilterBarDelegate.getTypeUtil().getTypeConfig("Edm.String", null, null)
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

		mPropertyBag = 	{
			modifier: JsControlTreeModifier,
			view: FlUtils.getViewForControl(oFilterBar),
			appComponent: FlUtils.getAppComponentForControl(oFilterBar)
		};

		// var oModifier = mPropertyBag.modifier;
		// var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);

		oFilterFieldPromise.then(function (oFilterField) {

		});

		return oFilterFieldPromise;

	};


	return FilterBarOrdersSampleDelegate;
});

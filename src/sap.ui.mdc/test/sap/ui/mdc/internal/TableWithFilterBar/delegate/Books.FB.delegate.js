/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/mdc/enum/FieldDisplay'
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, FieldDisplay) {
	"use strict";

	var FilterBarBooksSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarBooksSampleDelegate.fetchProperties = function () {
		var oFetchPropertiesPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		var bSearchExists = false;

		return oFetchPropertiesPromise.then(function (aProperties) {
			aProperties.forEach(function(oPropertyInfo){

				if (oPropertyInfo.name.indexOf("/") >= 0) {
					oPropertyInfo.hiddenFilter = true;
				}

				if (oPropertyInfo.name === "$search") {
					bSearchExists = true;
				} else if (oPropertyInfo.name === "ID") {
					oPropertyInfo.formatOptions = {groupingEnabled: false};
				} else if (oPropertyInfo.name === "author_ID") {
					oPropertyInfo.fieldHelp = "FH1";
					oPropertyInfo.label = "Author ID";
					oPropertyInfo.display = FieldDisplay.Description;
					oPropertyInfo.formatOptions = {groupingEnabled: false};
				} else if (oPropertyInfo.name === "title") {
					oPropertyInfo.fieldHelp = "FH4";
					oPropertyInfo.label = "Title";
					oPropertyInfo.caseSensitive = false;
				} else if (oPropertyInfo.name === "published") {
					oPropertyInfo.fieldHelp = "FHPublished";
					oPropertyInfo.label = "Published";
					oPropertyInfo.filterOperators = ["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"];
				} else if (oPropertyInfo.name === "language_code") {
					oPropertyInfo.fieldHelp = "FHLanguage";
					oPropertyInfo.display = FieldDisplay.Description;
					oPropertyInfo.constraints = {nullable: false, maxLength: 3}; // to test not nullable
				} else if (oPropertyInfo.name === "stock") {
					oPropertyInfo.label = "Stock range";
					oPropertyInfo.maxConditions = 1;
					oPropertyInfo.filterOperators = ["BT"];
				} else if (oPropertyInfo.name === "classification_code") {
					oPropertyInfo.fieldHelp = "FHClassification";
					oPropertyInfo.label = "Classification";
					oPropertyInfo.display = FieldDisplay.Description;
				} else if (oPropertyInfo.name === "genre_code") {
					oPropertyInfo.fieldHelp = "FHGenre";
					oPropertyInfo.label = "Genre";
					oPropertyInfo.display = FieldDisplay.Description;
				} else if (oPropertyInfo.name === "subgenre_code") {
					oPropertyInfo.fieldHelp = "FHSubGenre";
					oPropertyInfo.label = "Sub Genre";
					oPropertyInfo.display = FieldDisplay.Description;
				} else if (oPropertyInfo.name === "detailgenre_code") {
					oPropertyInfo.fieldHelp = "FHDetailGenre";
					oPropertyInfo.label = "Detail Genre";
					oPropertyInfo.display = FieldDisplay.Description;
				} else if (oPropertyInfo.name === "author/dateOfBirth") {
					// oPropertyInfo.fieldHelp = "fhAdob";
					oPropertyInfo.maxConditions = 1;
				} else if (oPropertyInfo.name === "author/dateOfDeath") {
					oPropertyInfo.fieldHelp = "fhAdod";
					oPropertyInfo.maxConditions = 1;
				} else if (oPropertyInfo.name === "currency_code") {
					oPropertyInfo.fieldHelp = "FH-Currency";
					oPropertyInfo.display = FieldDisplay.Value; // for currencies description key is the name
					oPropertyInfo.maxConditions = 1; // normally only one currency should be used, otherwise it makes no sense related to price
					oPropertyInfo.filterOperators = ["EQ"]; // for currency only fixed values make sense
				} else if (oPropertyInfo.name === "createdAt") {
					oPropertyInfo.maxConditions = 1; // to use DynamicDateRange
					oPropertyInfo.filterOperators = ["MYDATE", "MYDATERANGE", "EQ", "GE", "LE", "BT", "TODAY", "YESTERDAY", "TOMORROW", "LASTDAYS", "MYNEXTDAYS", "THISWEEK", "THISMONTH", "THISQUARTER", "THISYEAR"];
				}

			});

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
		// baseType:new sap.ui.model.odata.type.Int32(),
		// required: false,
		// hiddenFilter: false,
		// visible: true,
		// maxConditions : -1,
		// fieldHelp: "FHAuthor"}
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

		oFilterFieldPromise.then(function (oFilterField) {

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
			} else if (sName === "published") {
				oModifier.setProperty(oFilterField, "defaultOperator", "RENAISSANCE");
			}
		});

		return oFilterFieldPromise;

	};


	return FilterBarBooksSampleDelegate;
});

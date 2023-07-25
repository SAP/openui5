/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier', 'sap/ui/mdc/enums/FieldDisplay', "sap/ui/mdc/enums/FilterBarValidationStatus"
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier, FieldDisplay, FilterBarValidationStatus) {
	"use strict";

	var FilterBarBooksSampleDelegate = Object.assign({}, FilterBarDelegate);
	FilterBarBooksSampleDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	FilterBarBooksSampleDelegate.fetchProperties = function () {
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
		var oView = mPropertyBag.view ? mPropertyBag.view : FlUtils.getViewForControl(oFilterBar);

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
					oModifier.setProperty(oFilterField, "operators", ["BT"]);
					return oFilterField;
				});
			} else if (sName === "author_ID") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FH1"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "title") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FH4"));
			} else if (sName === "published") {
				oModifier.setProperty(oFilterField, "defaultOperator", "RENAISSANCE");
				oModifier.setProperty(oFilterField, "operators", ["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"]);
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHPublished"));
			} else if (sName === "language_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHLanguage"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "classification_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHClassification"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "genre_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHGenre"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "subgenre_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHSubGenre"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "detailgenre_code") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FHDetailGenre"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "author/dateOfDeath") {
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("fhAdod"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Description);
			} else if (sName === "currency_code") {
				oModifier.setProperty(oFilterField, "operators", ["EQ"]);
				oModifier.setAssociation(oFilterField, "valueHelp", oView.createId("FH-Currency"));
				oModifier.setProperty(oFilterField, "display", FieldDisplay.Value);
			} else if (sName === "createdAt") {
				oModifier.setProperty(oFilterField, "operators", ["MYDATE", "MYDATERANGE", "EQ", "GE", "LE", "BT", "LT", "TODAY", "YESTERDAY", "TOMORROW", "LASTDAYS", "MYNEXTDAYS", "THISWEEK", "THISMONTH", "THISQUARTER", "THISYEAR", "NEXTHOURS", "NEXTMINUTES", "LASTHOURS"]);
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

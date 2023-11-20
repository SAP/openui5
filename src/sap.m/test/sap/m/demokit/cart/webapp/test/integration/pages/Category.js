sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press"
], function (
	Opa5,
	Common,
	PropertyStrictEquals,
	AggregationFilled,
	AggregationLengthEquals,
	BindingPath,
	Properties,
	Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheCategory : {
			baseClass: Common,
			viewName: "Category",

			actions: {
				iPressOnTheFirstProduct: function () {
					return this.waitFor({
						controlType: "sap.m.ObjectListItem",
						matchers: new BindingPath({path: "/Products('HT-1254')"}),
						actions: new Press(),
						errorMessage: "The product list does not contain required selection"
					});
				},

				iPressTheFilterButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://filter"}),
						actions: new Press(),
						errorMessage: "The filter button was not found and could not be pressed"
					});
				},

				iPressOnTheProductBlasterExtreme: function () {
					this.waitFor({
						controlType: "sap.m.ObjectListItem",
						matchers: new Properties({title : "Blaster Extreme"}),
						actions: new Press(),
						errorMessage: "The product Blaster Extreme was not found and could not be pressed"
					});
				},

				iSelectTheAvailabilityFilteringOption: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "availabilityFilterTitle", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The Availability filtering option was not found and could not be pressed"
					});
				},
				iSelectTheSupplierFilteringOption: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "supplierFilterTitle", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The supplier filtering option was not found and could not be pressed"
					});
				},
				iSelectTheAvailableFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "statusA", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be selected"
					});
				},

				iSelectTheDiscontinuedFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "statusD", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be selected"
					});
				},
				iSelectTheTechnocomFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Technocom"}),
						actions: new Press(),
						errorMessage: "The Technocom check box was not found and could not be selected"
					});
				},

				iSelectTheOutOfStockFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "statusO", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The out of stock check box was not found and could not be selected"
					});
				},

				iDeselectTheAvailableFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "statusA", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be deselected"
					});
				},

				iDeselectTheDiscontinuedFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "statusD", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be deselected"
					});
				},
				iDeselectTheTechnoComFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Technocom"}),
						actions: new Press(),
						errorMessage: "The Technocom check box was not found and could not be deselected"
					});
				},
				iPressOkButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "VIEWSETTINGS_ACCEPT", "text", "sap.m");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The ok button in the dialog was not found and could not be pressed"
					});
				},
				iPressCancelButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "VIEWSETTINGS_CANCEL", "text", "sap.m");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The cancel button in the dialog was not found and could not be pressed"
					});
				},
				iPressTheBackButtonInCategory: function () {
					return this.waitFor({
						id: "page",
						actions: new Press(),
						errorMessage: "The nav back button was not displayed"
					});
				},
				//Back Button in filter dialog
				iPressTheBackButtonInDialog: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://nav-back"}),
						actions: new Press(),
						errorMessage: "The back button in the dialog was not found and could not be pressed"
					});
				},
				iPressResetButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "VIEWSETTINGS_RESET", "text", "sap.m");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The reset button in the dialog was not found and could not be pressed"
					});
				},
				iSelectThePriceFilteringOption: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "priceFilterTitle", "title");
						}.bind(this),
						actions: new Press(),
						errorMessage: "The price filtering option was not found and could not be pressed"
					});
				},
				iSetPriceFilterValues: function () {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 5000}),
						success: function (oSlider) {
							oSlider[0].setValue(200).setValue2(500);
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"

					});
				},

				iChangeThePriceFilterValues: function () {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 500}),
						success: function (oSlider) {
							oSlider[0].setValue(500).setValue2(1000);
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"

					});
				},
				iChangeToTheDefaultPriceFilterValues: function () {
					this.waitFor({
						controlType: "sap.m.RangeSlider",
						matchers: new PropertyStrictEquals({name: "value2", value: 500}),
						success: function (oSlider) {
							oSlider[0].setValue(0).setValue2(5000);
							// the slider change event is not fired automatically and need to be manually fired
							oSlider[0].fireEvent("change", {range: oSlider[0].getRange()});
						},
						errorMessage: "The range slider control was not displayed and could not be scrolled"

					});
				},

				iFilterOnAvailability: function () {
					this.iPressTheFilterButton();
					this.iSelectTheAvailabilityFilteringOption();
					this.iSelectTheAvailableFilter();
					this.iSelectTheDiscontinuedFilter();
					this.iPressOkButton();
				},
				iFilterOnSupplier: function () {
					this.iPressTheFilterButton();
					this.iSelectTheSupplierFilteringOption();
					this.iSelectTheTechnocomFilter();
					this.iPressOkButton();
				},
				iFilterOnAvailabilityAndPrice: function () {
					this.iPressTheFilterButton();
					this.iSelectTheOutOfStockFilter();
					this.iPressTheBackButtonInDialog();
					this.iSelectThePriceFilteringOption();
					this.iSetPriceFilterValues();
					this.iPressOkButton();
				},
				iCancelAPriceFilterChange: function () {
					this.iPressTheFilterButton();
					this.iChangeThePriceFilterValues();
					this.iPressCancelButton();
				},
				iChangeToTheDefaultFilterPriceValues: function () {
					this.iSelectThePriceFilteringOption();
					this.iChangeToTheDefaultPriceFilterValues();
					this.iPressOkButton();
				},
				iRemoveTheAvailabilityFilters: function () {
					this.iPressTheFilterButton();
					this.iDeselectTheAvailableFilter();
					this.iDeselectTheDiscontinuedFilter();
					this.iPressOkButton();
				},
				iRemoveTheSupplierFilter: function () {
					this.iPressTheFilterButton();
					this.iDeselectTheTechnoComFilter();
					this.iPressOkButton();
				},

				iPressOnCompareLink: function (ProductId) {
					return this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: [
							new BindingPath({path: "/Products('" + ProductId + "')"}),
							new Properties({text: "Compare"})
						],
						actions: new Press(),
						errorMessage: "The product list does not contain required selection " + ProductId
					});
				}
			},

			assertions: {

				iShouldSeeTheProductList: function () {
					return this.waitFor({
						id: "productList",
						timeout: 30,
						success: function (oList) {
							Opa5.assert.ok(
								oList,
								"The product list was found"
							);
						},
						errorMessage: "The product list was not found"
					});
				},

				iShouldBeTakenToTheFlatScreensCategory: function () {
					return this.waitFor({
						controlType: "sap.m.Page",
						matchers: new PropertyStrictEquals({name: "title", value: "Flat Screens"}),
						success: function (aPage) {
							Opa5.assert.ok(
								aPage,
								"The flat screens category page was found"
							);
						},
						errorMessage: "The flat screens category page was not found"
					});
				},

				iShouldBeTakenToTheSpeakerCategory: function () {
					return this.waitFor({
						controlType: "sap.m.Page",
						matchers: new PropertyStrictEquals({name: "title", value: "Speakers"}),
						success: function (aPage) {
							Opa5.assert.ok(
								aPage,
								"The speaker category page was found"
							);
						},
						errorMessage: "The speaker category page was not found"
					});
				},

				iShouldSeeSomeEntriesInTheProductList: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationFilled({name: "items"}),
						success: function (oList) {
							Opa5.assert.ok(
								oList.getItems().length > 0,
								"The product list has entries"
							);
						},
						errorMessage: "The product list does not contain any entries"
					});
				},
				iShouldSeeAllProductsOfTheCategory: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationFilled({name: "items"}),
						success: function (oList) {
							Opa5.assert.ok(
								oList.getItems().length === 3,
								"All products of the category are visible"
							);
						},
						errorMessage: "The product list was not filtered"
					});
				},

				iShouldSeeAFilterButton: function () {
					this.waitFor({
						id: "masterListFilterButton",
						success: function () {
							Opa5.assert.ok(true, "The Master list page has a filter button");
						},
						errorMessage: "The Master list page has no filter button"
					});
				},

				iShouldOnlySeeTheAvailableAndDiscontinuedProducts: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 2}),
						success: function (oList) {
							Opa5.assert.ok(oList, "The category list shows just the available and discontinued products");
						},
						errorMessage: "The category list shows products other than available or discontinued"
					});
				},
				iShouldOnlySeeTheOutOfStockProducts: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success: function (oList) {
							Opa5.assert.ok(oList, "The category list shows just the out of stock products");
						},
						errorMessage: "The category list shows products other than out of stock"
					});
				},
				iShouldOnlySeeTheTechnoComProducts: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success: function (oList) {
							Opa5.assert.ok(oList, "The category list shows just the TechnoCom products");
						},
						errorMessage: "The category list shows products from supplier other than TechnoCom "
					});
				},
				iShouldOnlySeeOutOfStockAndCheapProducts: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationLengthEquals({name: "items", length: 1}),
						success: function (oList) {
							Opa5.assert.ok(oList, "The category list shows only cheap and out of stock products");
						},
						errorMessage: "The category list did not show cheap and out of stock products"
					});
				},

				iShouldSeeAnAvailabilityInfoToolbar: function () {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Availability"}),
						success: function () {
							Opa5.assert.ok(true, "The category list has an info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},
				iShouldSeeAnAvailabilityAndPriceInfoToolbar: function () {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Availability, Price (200 - 500 EUR)"}),
						success: function () {
							Opa5.assert.ok(true, "The category list has info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},
				iShouldSeeASupplierInfoToolbar: function () {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Supplier"}),
						success: function () {
							Opa5.assert.ok(true, "The category list has an info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},
				iShouldNotSeeAnInfoToolbar: function () {
					this.waitFor({
						id: "productList",
						success: function (oList) {
							var oInfoToolbar = oList.getAggregation("infoToolbar");
							var sTitleText = oInfoToolbar.getAggregation("content")[0].getText();
							Opa5.assert.ok(oInfoToolbar.getVisible() === false &&
								sTitleText === "",
								"The category list has no info toolbar");
						},
						errorMessage: "The category list has an info toolbar"
					});
				},
				iShouldTestTheFilterCount: function (iCountNumber) {
					var sSuccessMessage = "The price filter count is correctly set up";
					var sErrorMessage = "The price filter count doesn't correctly set up";

					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "priceFilterTitle", "title");
						}.bind(this),
						success: function(oItem) {
							Opa5.assert.ok(oItem[0].getCounter() === iCountNumber, sSuccessMessage);
						},
						errorMessage: sErrorMessage
					});
				},
				iShouldOnlySeeAvailableAndDiscontinuedProductsWithInfoToolbar: function () {
					this.iShouldOnlySeeTheAvailableAndDiscontinuedProducts();
					this.iShouldSeeAnAvailabilityInfoToolbar();
				},
				iShouldOnlySeeTechnoComProductsAndAnInfoToolbar: function () {
					this.iShouldOnlySeeTheTechnoComProducts();
					this.iShouldSeeASupplierInfoToolbar();
				},
				iShouldOnlySeeOutOfStockProductsAndAnInfoToolbar: function () {
					this.iShouldOnlySeeTheOutOfStockProducts();
					this.iShouldSeeAnAvailabilityInfoToolbar();
				},

				iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar: function () {
					this.iShouldOnlySeeOutOfStockAndCheapProducts();
					this.iShouldSeeAnAvailabilityAndPriceInfoToolbar();
				},

				iShouldSeeAllProductsAndNoInfoToolbar: function () {
					this.iShouldSeeAllProductsOfTheCategory();
					this.iShouldNotSeeAnInfoToolbar();
				},

				iShouldSeeCompareLinkOnListEntry: function () {
					this.waitFor({
						controlType: "sap.m.ObjectAttribute",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "CompareWith", "text");
						}.bind(this),
						success: function () {
							Opa5.assert.ok(true, "List entry has an compare link");
						},
						errorMessage: "List entry has no compare link"
					});
				}
			}
		}
	});
});

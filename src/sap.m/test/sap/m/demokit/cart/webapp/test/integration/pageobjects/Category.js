sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/BindingPath',
    'sap/ui/test/matchers/Properties',
	'sap/ui/test/actions/Press'
], function (Opa5, PropertyStrictEquals, AggregationFilled, BindingPath, Properties,Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheCategory : {
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

				iGoToTheCartPage: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://cart"}),
						actions: new Press(),
						errorMessage: "The cart button was not found and could not be pressed"
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
						matchers: new PropertyStrictEquals({name: "title", value: "Availability"}),
						actions: new Press(),
						errorMessage: "The Availability filtering option was not found and could not be pressed"
					});
				},

				iSelectTheAvailableFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Available"}),
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be selected"
					});
				},

				iSelectTheDiscontinuedFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Discontinued"}),
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be selected"
					});
				},

				iSelectTheOutOfStockFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Out of Stock"}),
						actions: new Press(),
						errorMessage: "The out of stock check box was not found and could not be selected"
					});
				},

				iDeselectTheAvailableFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Available"}),
						actions: new Press(),
						errorMessage: "The available check box was not found and could not be deselected"
					});
				},

				iDeselectTheDiscontinuedFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Discontinued"}),
						actions: new Press(),
						errorMessage: "The discontinued check box was not found and could not be deselected"
					});
				},

				iDeselectThePriceFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "More than 500 EUR"}),
						actions: new Press(),
						errorMessage: "The 'more than 500 EUR' check box was not found and could not be deselected"
					});
				},

				iPressOkButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "text", value: "OK"}),
						actions: new Press(),
						errorMessage: "The ok button in the dialog was not found and could not be pressed"
					});
				},

                iPressTheBackButton: function () {
                    this.waitFor({
                        controlType: "sap.m.Button",
                        matchers: new Properties({type: "Back"}),
                        actions: new Press(),
                        errorMessage: "The back button was not found and could not be pressed"
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

				iSelectThePriceFilteringOption: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Price"}),
						actions: new Press(),
						errorMessage: "The price filtering option was not found and could not be pressed"
					});
				},

				iSelectTheMoreThanFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "More than 500 EUR"}),
						actions: new Press(),
						errorMessage: "The more than 500 EUR check box was not found and could not be selected"
					});
				},

				iSelectTheLessThanFilter: function () {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({name: "title", value: "Less than 500 EUR"}),
						actions: new Press(),
						errorMessage: "The less than 500 EUR check box was not found and could not be selected"
					});
				},

				iFilterOnAvailability: function () {
					this.iPressTheFilterButton();
					this.iSelectTheAvailabilityFilteringOption();
					this.iSelectTheAvailableFilter();
					this.iSelectTheDiscontinuedFilter();
					this.iPressOkButton();
				},

				iFilterOnAvailabilityAndPrice: function () {
					this.iPressTheFilterButton();
					this.iPressTheBackButtonInDialog();
					this.iSelectTheAvailabilityFilteringOption();
					this.iSelectTheOutOfStockFilter();
					this.iPressTheBackButtonInDialog();
					this.iSelectThePriceFilteringOption();
					this.iSelectTheLessThanFilter();
					this.iPressOkButton();
				},

				iFilterOnPrice: function () {
					this.iPressTheFilterButton();
					this.iPressTheBackButtonInDialog();
					this.iSelectThePriceFilteringOption();
					this.iSelectTheMoreThanFilter();
					this.iPressOkButton();
				},

				iRemoveTheAvailabilityFilters: function () {
					this.iPressTheFilterButton();
					this.iDeselectTheAvailableFilter();
					this.iDeselectTheDiscontinuedFilter();
					this.iPressOkButton();
				},

				iRemoveThePriceFilter: function () {
					this.iPressTheFilterButton();
					this.iDeselectThePriceFilter();
					this.iPressOkButton();
				}
			},

			assertions: {

			    iShouldSeeTheProductList: function () {
					return this.waitFor({
						id: "productList",
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

				iShouldOnlySeeAvailableProducts: function () {
					this.waitFor({
						id: "productList",
						matchers: new AggregationFilled({name: "items"}),
						success: function (oList) {
							Opa5.assert.ok(
								oList.getItems().length === 2,
								"The product list has been filtered"
							);
						},
						errorMessage: "The product list was not filtered"
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
						success: function (oList) {
							Opa5.assert.ok(oList.getAggregation("items").length === 2, "The category list shows just the available and discontinued products");
						},
						errorMessage: "The category list shows products other than available or discontinued"
					});
				},

				iShouldSeeAllProducts: function () {
					this.waitFor({
						id: "productList",
						success: function (oList) {
							Opa5.assert.ok(oList.getAggregation("items").length === 3, "The category list shows all products");
						},
						errorMessage: "The category list did not show all products"
					});
				},

				iShouldOnlySeeExpensiveProducts: function () {
					this.waitFor({
						id: "productList",
						success: function (oList) {
							Opa5.assert.ok(oList.getAggregation("items").length === 1, "The category list shows only products with a price over 500 EUR");
						},
						errorMessage: "The category list did not show prices more than 500 EUR"
					});
				},

				iShouldOnlySeeOutOfStockAndCheapProducts: function () {
					this.waitFor({
						id: "productList",
						success: function (oList) {
							Opa5.assert.ok(oList.getAggregation("items").length === 1, "The category list shows only cheap and out of stock products");
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

				iShouldSeeAnPriceInfoToolbar: function () {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Price"}),
						success: function () {
							Opa5.assert.ok(true, "The category list has info toolbar");
						},
						errorMessage: "The info toolbar of the category list was not found"
					});
				},

				iShouldSeeAnAvailabilityAndPriceInfoToolbar: function () {
					this.waitFor({
						id: "categoryInfoToolbarTitle",
						matchers: new PropertyStrictEquals({name: "text", value: "Filtered by Availability, Price"}),
						success: function () {
							Opa5.assert.ok(true, "The category list has info toolbar");
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

				iShouldOnlySeeAvailableAndDiscontinuedProductsWithInfoToolbar: function () {
					this.iShouldOnlySeeTheAvailableAndDiscontinuedProducts();
					this.iShouldSeeAnAvailabilityInfoToolbar();
				},

				iShouldOnlySeeExpensiveProductsAndAnInfoToolbar: function () {
					this.iShouldOnlySeeExpensiveProducts();
					this.iShouldSeeAnPriceInfoToolbar();
				},

				iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar: function () {
					this.iShouldOnlySeeOutOfStockAndCheapProducts();
					this.iShouldSeeAnAvailabilityAndPriceInfoToolbar();
				},

				iShouldSeeAllProductsAndNoInfoToolbar: function () {
					this.iShouldSeeAllProducts();
					this.iShouldNotSeeAnInfoToolbar();
				}
			}
		}
	});
});

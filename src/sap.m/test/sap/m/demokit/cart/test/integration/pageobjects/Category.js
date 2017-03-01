sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/actions/Press'
], function (Opa5, PropertyStrictEquals, AggregationFilled, BindingPath, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheCategory : {
			viewName : "Category",

			actions : {
				iPressOnTheFirstProduct : function () {
					return this.waitFor({
						controlType : "sap.m.ObjectListItem",
						matchers : new BindingPath({path : "/Products('HT-1254')"}),
						actions : new Press(),
						errorMessage : "The product list does not contain required selection"
					});
				},

				iGoToTheCartPage : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://cart"}),
						actions : new Press(),
						errorMessage : "The cart button was not found and could not be pressed"
					});
				},

				iPressTheAvailabilityFilterToggleButton : function () {
					this.waitFor({
						controlType : "sap.m.ToggleButton",
						matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://complete"}),
						actions : new Press(),
						errorMessage : "The filter toggle button was not found and could not be pressed"
					});
				}
			},

			assertions : {
				iShouldSeeTheProductList : function () {
					return this.waitFor({
						id : "productList",
						success : function (oList) {
							Opa5.assert.ok(
								oList,
								"The product list was found"
							);
						},
						errorMessage : "The product list was not found"
					});
				},

				iShouldBeTakenToTheSecondCategory : function () {
					return this.waitFor({
						controlType : "sap.m.Page",
						matchers : new PropertyStrictEquals({name : "title", value : "Flat Screens"}),
						success : function (aPage) {
							Opa5.assert.ok(
								aPage,
								"The category page was found"
							);
						},
						errorMessage : "The category page was not found"
					});
				},

				theProductListShouldHaveSomeEntries : function () {
					this.waitFor({
						id : "productList",
						matchers : new AggregationFilled({name : "items"}),
						success : function (oList) {
							Opa5.assert.ok(
								oList.getItems().length > 0,
								"The product list has entries"
							);
						},
						errorMessage : "The product list does not contain any entries"
					});
				},

				iShouldOnlySeeAvailableProducts : function () {
					this.waitFor({
						id : "productList",
						matchers : new AggregationFilled({name : "items"}),
						success : function (oList) {
							Opa5.assert.ok(
								oList.getItems().length === 2,
								"The product list has been filtered"
							);
						},
						errorMessage : "The product list was not filtered"
					});
				},

				iShouldSeeAllProductsOfTheCategory : function () {
					this.waitFor({
						id : "productList",
						matchers : new AggregationFilled({name : "items"}),
						success : function (oList) {
							Opa5.assert.ok(
								oList.getItems().length === 3,
								"All products of the category are visible"
							);
						},
						errorMessage : "The product list was not filtered"
					});
				}
			}
		}
	});
});

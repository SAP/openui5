sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/I18NText"
], function (
	Opa5,
	Common,
	PropertyStrictEquals,
	Press,
	Properties,
	BindingPath,
	I18NText) {
	"use strict";

	Opa5.createPageObjects({
		onTheComparison: {
			baseClass: Common,
			viewName: "Comparison",

			actions: {
				iDeleteAProduct: function (ProductId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new BindingPath({path: "/Products('" + ProductId + "')"}),
							new Properties({icon: "sap-icon://sys-cancel"})
						],
						actions : new Press(),
						errorMessage: "The press action could not be executed"
					});
				},
				iAddTheDisplayedProductToTheCart: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "addToCartShort", "text");
						}.bind(this),
						actions : new Press(),
						errorMessage: "The press action could not be executed"
					});
				},
				iToggleTheCart: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://cart"}),
						actions: new Press(),
						errorMessage: "The cart button was not found and could not be pressed"
					});
				}
			},

			assertions: {
				iShouldSeeAProduct: function (ProductId) {
					return this.waitFor({
						controlType: "sap.m.Panel",
						matchers: new BindingPath({path: "/Products('" + ProductId + "')"}),
						success: function () {
							Opa5.assert.ok(true, "Product is visible");
						},
						errorMessage: "There is no product displayed"
					});
				},

				iShouldSeeAPlaceholder: function () {
					return this.waitFor({
						controlType: "sap.m.Label",
						matchers: new I18NText({
							propertyName: "text",
							key: "HowTo1Label"
						}),
						success: function () {
							this.waitFor({
								controlType: "sap.m.Label",
								matchers: new I18NText({
									propertyName: "text",
									key: "HowTo2Label"
								}),
								success: function () {
									this.waitFor({
										controlType: "sap.m.Label",
										matchers: new I18NText({
											propertyName: "text",
											key: "HowTo3Label"
										}),
										success: function () {
											Opa5.assert.ok(true, "Placeholder is visible");
										},
										errorMessage: "Placeholder is displayed incorrectly"
									});
								},
								errorMessage: "Placeholder is displayed incorrectly"
							});
						},
						errorMessage: "Placeholder is displayed incorrectly"
					});
				},

				iShouldSeeTwoProducts: function (productA, productB) {
					this.iShouldSeeAProduct(productA);
					this.iShouldSeeAProduct(productB);
				},

				iShouldSeeAProductAndAPlaceholder: function (product) {
					this.iShouldSeeAProduct(product);
					this.iShouldSeeAPlaceholder();
				}
			}
		}
	});
});

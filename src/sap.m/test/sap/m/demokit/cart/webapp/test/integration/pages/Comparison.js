sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/I18NText"
], (Opa5, PropertyStrictEquals, Press, Properties, BindingPath, I18NText) => {
	"use strict";

	Opa5.createPageObjects({
		onTheComparison: {
			viewName: "Comparison",
			actions: {
				iDeleteAProduct(ProductId) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new BindingPath({path: `/Products('${ProductId}')`}),
							new Properties({icon: "sap-icon://sys-cancel"})
						],
						actions: new Press(),
						errorMessage: "The press action could not be executed"
					});
				},

				iAddTheDisplayedProductToTheCart() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: {
							i18NText: {
								propertyName: "text",
								key: "addToCartShort"
							}
						},
						actions: new Press(),
						errorMessage: "The press action could not be executed"
					});
				},

				iToggleTheCart() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://cart"}),
						actions: new Press(),
						errorMessage: "The cart button was not found and could not be pressed"
					});
				}
			},

			assertions: {
				iShouldSeeAProduct(ProductId) {
					return this.waitFor({
						controlType: "sap.m.Panel",
						matchers: new BindingPath({path: `/Products('${ProductId}')`}),
						success() {
							Opa5.assert.ok(true, "Product is visible");
						},
						errorMessage: "There is no product displayed"
					});
				},

				iShouldSeeAPlaceholder() {
					return this.waitFor({
						controlType: "sap.m.Label",
						matchers: new I18NText({
							propertyName: "text",
							key: "HowTo1Label"
						}),
						success() {
							this.waitFor({
								controlType: "sap.m.Label",
								matchers: new I18NText({
									propertyName: "text",
									key: "HowTo2Label"
								}),
								success() {
									this.waitFor({
										controlType: "sap.m.Label",
										matchers: new I18NText({
											propertyName: "text",
											key: "HowTo3Label"
										}),
										success() {
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

				iShouldSeeTwoProducts(productA, productB) {
					this.iShouldSeeAProduct(productA);
					this.iShouldSeeAProduct(productB);
				},

				iShouldSeeAProductAndAPlaceholder(product) {
					this.iShouldSeeAProduct(product);
					this.iShouldSeeAPlaceholder();
				}
			}
		}
	});
});

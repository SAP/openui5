sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/Press'
], function (Opa5, PropertyStrictEquals, Press) {
	"use strict";

	var sViewName = "Product";
	Opa5.createPageObjects({
		onTheProduct: {

			actions: {
				iAddTheDisplayedProductToTheCart: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://cart-3"}),
						actions : new Press(),
						errorMessage: "The press action could not be executed"
					});
				},
				iPressOnTheProductPicture: function () {
					return this.waitFor({
						id : "productImage",
						viewName : sViewName,
						actions : new Press()
					});
				},
				iPressTheCloseButtonOfTheLightBox: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : [
							new PropertyStrictEquals({
								name : "text",
								value : "Close"
							}),
							new PropertyStrictEquals({
								name : "enabled",
								value : true
							})
						],
						actions : new Press(),
						errorMessage : "Did not find the Close button"
					});
				},

				iPressTheBackButton: function () {
					return this.waitFor({
						id: "page",
						viewName: "Category",
						actions: new Press(),
						errorMessage: "The nav back button was not displayed"
					});
				}
			},

			assertions: {

				iShouldSeeALightBox: function () {
					return this.waitFor({
						viewName : sViewName,
						id : "lightBox",
						success : function () {
							Opa5.assert.ok(true, "Light Box is visible");
						}
					});
				},

				iShouldSeeTheProductPage: function () {
					return this.waitFor({
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The product Page was successfully displayed");
						},
						errorMessage: "The product page was not displayed"
					});
				}
			}

		}
	});

});

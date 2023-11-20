sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (
	Opa5,
	Common,
	PropertyStrictEquals,
	Press,
	Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheProduct: {
			baseClass: Common,
			viewName: "Product",

			actions: {
				iPressTheBackButtonInProduct: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "type", value: "Back"}),
						actions: new Press(),
						errorMessage: "The nav back button was not displayed"
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

				iPressOnTheProductPicture: function () {
					return this.waitFor({
						id : "productImage",
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

				iShouldSeeALightBox: function () {
					return this.waitFor({
						id : "lightBox",
						success : function () {
							Opa5.assert.ok(true, "Light Box is visible");
						}
					});
				},

				iShouldSeeAnAvatarButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Properties({icon: "sap-icon://customer"}),
						success: function () {
							Opa5.assert.ok(true, "Avatar button is visible");
						},
						errorMessage: "There is no avatar button"
					});
				},

				iShouldSeeTheProductPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The product page was successfully displayed");
						},
						errorMessage: "The product page was not displayed"
					});
				},

				iShouldSeeTheBlasterExtremeDetailPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Blaster Extreme page was successfully displayed");
						},
						errorMessage: "The Blaster Extreme page was not displayed"
					});
				},

				iShouldSeeTheSmartphoneAlphaDetailPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Smartphone Alpha page was successfully displayed");
						},
						errorMessage: "The Smartphone Alpha page was not displayed"
					});
				},
				iShouldSeeTheRightProduct: function () {
					return this.waitFor({
						controlType: "sap.m.ObjectHeader",
						matchers: new PropertyStrictEquals({name: "title", value: "Bending Screen 21HD"}),
						success: function () {
							Opa5.assert.ok(true, "The 'Bending Screen 21HD' product is bookmarakbel");
						},
						errorMessage: "The'Bending Screen 21HD' product was not found"
					});
				}
			}
		}
	});
});

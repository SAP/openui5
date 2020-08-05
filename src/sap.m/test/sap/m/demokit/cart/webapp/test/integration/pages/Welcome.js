sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties"
], function (
	Opa5,
	Press,
	BindingPath,
	AggregationLengthEquals,
	Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheWelcomePage: {
			viewName: "Welcome",
			actions: {
				iPressTheMenuButton : function () {
					return this.waitFor({
						matchers: new Properties({ icon : "sap-icon://menu2" }),
						actions: new Press(),
						errorMessage: "No Menu button found"
					});
				},

				iPressTheProductLink: function () {
					return this.waitFor({
						controlType: "sap.m.ObjectIdentifier",
						matchers: new BindingPath({
							modelName: "view",
							path: "/Promoted/0"
						}),
						actions: new Press(),
						errorMessage: "The product link was not displayed"
					});
				},

				iPressOnTheCartButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new BindingPath({
							modelName: "view",
							path: "/Viewed/0"
						}),
						actions: new Press(),
						errorMessage: "The cart button was not displayed"
					});
				},

				iPressOnTheProductSmartphoneAlphaTitle: function () {
					this.waitFor({
						controlType: "sap.m.ObjectIdentifier",
						matchers: new Properties({title : "Smartphone Alpha"}),
						actions: new Press(),
						errorMessage: "The product Smartphone Alpha was not found and could not be pressed"
					});
				},

				iPressTheProductImage: function () {
					return this.waitFor({
						controlType: "sap.m.Image",
						matchers: new BindingPath({
							modelName: "view",
							path: "/Viewed/0"
						}),
						actions: new Press(),
						errorMessage: "The product image was not displayed"
					});
				},

				iToggleTheCart: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new Properties({icon : "sap-icon://cart"}),
						actions : new Press(),
						errorMessage : "The cart button was not found and could not be pressed"
					});
				}
			},

			assertions: {

				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
						timeout: 30,
						success: function () {
							Opa5.assert.ok(true, "The welcome page was successfully displayed");
						},
						errorMessage: "The welcome page was not displayed"
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

				iShouldSeeTheRightAmountOfProducts: function() {
					this.waitFor({
						id: "promotedRow",
						matchers: new AggregationLengthEquals({
							name: "content",
							length: 2
						}),
						success: function () {
							Opa5.assert.ok(true, "The welcome page has two promoted items");
						},
						errorMessage: "The welcome page did not show two promoted items"
					});

					 this.waitFor({
						id: "viewedRow",
						matchers: new AggregationLengthEquals({
							name: "content",
							length: 4
						}),
						success: function () {
							Opa5.assert.ok(true, "The welcome page has four viewed items");
						},
						errorMessage: "The welcome page did not show four viewed items"
					});

					return this.waitFor({
						id: "favoriteRow",
						matchers: new AggregationLengthEquals({
							name: "content",
							length: 4
						}),
						success: function () {
							Opa5.assert.ok(true, "The welcome page has four favorite items");
						},
						errorMessage: "The welcome page did not show four favorite items"
					});
				}
			}
		}
	});

});

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (
	Opa5,
	Press,
	BindingPath,
	AggregationLengthEquals,
	Properties,
	PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheWelcomePage: {
			viewName: "Welcome",
			actions: {

				iLookAtTheScreen : function () {
					return this;
				},

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
				}
			},

			assertions: {

				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
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

				iShouldSeeTheProductInLightBox: function () {
					return this.waitFor({
						controlType: "sap.m.LightBox",
						success: function (oBox) {
							Opa5.assert.ok(oBox[0].getImageContent()[0].getTitle().length > 0, "The product " + oBox[0].getImageContent()[0].getTitle() + " was displayed in light box");
						},
						errorMessage: "The product was not displayed in the light box"
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

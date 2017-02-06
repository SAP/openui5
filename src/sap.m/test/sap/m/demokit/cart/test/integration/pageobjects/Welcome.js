sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/AggregationLengthEquals'
], function (Opa5, Press, BindingPath, AggregationLengthEquals) {

	var sViewName = "Welcome";
	Opa5.createPageObjects({
		onTheWelcomePage: {
			actions: {

				iPressTheProductLink: function () {
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: sViewName,
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
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "view",
							path: "/Promoted/0"
						}),
						actions: new Press(),
						errorMessage: "The cart button was not displayed"
					});
				},

				iPressTheProductImage: function () {
					return this.waitFor({
						controlType: "sap.m.Image",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "view",
							path: "/Viewed/0"
						}),
						actions: new Press(),
						errorMessage: "The product image was not displayed"
					});
				}
			},

			assertions: {

				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The welcome page was successfully displayed");
						},
						errorMessage: "The welcome page was not displayed"
					});
				},

				iShouldSeeTheProductInLightBox: function () {
					return this.waitFor({
						controlType: "sap.m.LightBox",
						viewName: sViewName,
						success: function (oBox) {
							Opa5.assert.ok(oBox[0].getImageContent()[0].getTitle().length > 0, "The product " + oBox[0].getImageContent()[0].getTitle() + " was displayed in light box");
						},
						errorMessage: "The product was not displayed in the light box"
					});
				},

				iShouldSeeTheRightAmountOfProducts: function() {
					this.waitFor({
						id: "promotedRow",
						viewName: sViewName,
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
						viewName: sViewName,
						matchers: new AggregationLengthEquals({
							name: "content",
							length: 4
						}),
						success: function () {
							Opa5.assert.ok(true, "The welcome page has four viewed items");
						},
						errorMessage: "The welcome page did not show four viewed items"
					});

					this.waitFor({
						id: "favoriteRow",
						viewName: sViewName,
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

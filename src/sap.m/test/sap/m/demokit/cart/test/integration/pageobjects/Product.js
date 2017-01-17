sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/actions/Press'
	], function (Opa5, PropertyStrictEquals, Press) {

		Opa5.createPageObjects({
			onTheProduct: {
				viewName: "Product",
				actions: {
					iAddTheDisplayedProductToTheCart: function () {
						return this.waitFor({
							controlType: "sap.m.Button",
							matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://add"}),
							actions : new Press(),
							errorMessage: "The press action could not be executed"
						})
					},
					iPressOnTheProductPicture: function () {
						return this.waitFor({
							id : "productImage",
							viewName : "Product",
							actions : new Press()
						})
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

					iShouldSeeALightBox: function () {
						return this.waitFor({
							viewName : "Product",
							id : "lightBox",
							success : function () {
								Opa5.assert.ok(true, "Light Box is visible");
							}
						})
					}
				}

			}
		});

	}
);

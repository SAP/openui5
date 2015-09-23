sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals'
	], function (Opa5, PropertyStrictEquals) {

		Opa5.createPageObjects({
			onTheProduct: {

				actions: {

					iAddTheDisplayedProductToTheCart: function () {
						return this.waitFor({
							viewName: "Product",
							controlType: "sap.m.Button",
							matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://add"}),
							success: function (aBtn) {
								aBtn[0].$().trigger("tap");
							},
							errorMessage: "The press action could not be executed"
						});
					}
				}

			}
		});

	}
);
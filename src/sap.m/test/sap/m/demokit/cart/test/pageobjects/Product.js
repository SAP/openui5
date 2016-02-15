sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/actions/Press'
	], function (Opa5, PropertyStrictEquals, Press) {

		Opa5.createPageObjects({
			onTheProduct: {

				actions: {

					iAddTheDisplayedProductToTheCart: function () {
						return this.waitFor({
							viewName: "Product",
							controlType: "sap.m.Button",
							matchers: new PropertyStrictEquals({name: "icon", value: "sap-icon://add"}),
							actions : new Press(),
							errorMessage: "The press action could not be executed"
						});
					}
				}

			}
		});

	}
);

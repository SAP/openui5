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
							matchers: [
								new PropertyStrictEquals({name: "icon", value: "sap-icon://add"}),
								// TODO: move me to sap.ui.test.matchers - no Busy parent
								// TODO: add a second one - all parents fullfill condition
								// Checks if a parent in the control tree is busy
								function (oButton) {
									var oParent = oButton.getParent();
									while(oParent) {
										// this condition can be generic
										if (oParent.getBusy && oParent.getBusy() === true) {
											return false;
										}
										oParent = oParent.getParent();
									}

									return true;
								}

							],
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
sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/test/actions/Press'
	], function (Opa5, BindingPath, Press) {

		Opa5.createPageObjects({
			onHome : {

				actions : {

					iPressOnTheSecondCategory : function () {
						return this.waitFor({
							controlType : "sap.m.StandardListItem",
							matchers : new BindingPath({path : "/ProductCategories('FS')"}),
							actions : new Press(),
							errorMessage : "The category list does not contain required selection"
						});
					}
				}

			}
		});

	}
);

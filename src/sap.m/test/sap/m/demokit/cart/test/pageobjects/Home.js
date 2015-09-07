sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/BindingPath'
	], function (Opa5, BindingPath) {

		Opa5.createPageObjects({
			onHome : {

				actions : {

					iPressOnTheSecondCategory : function () {
						return this.waitFor({
							controlType : "sap.m.StandardListItem",
							matchers : new BindingPath({path : "/ProductCategories('FS')"}),
							success : function (aListItems) {
								aListItems[0].$().trigger("tap");
							},
							errorMessage : "The category list does not contain required selection"
						});
					}
				}

			}
		});

	}
);
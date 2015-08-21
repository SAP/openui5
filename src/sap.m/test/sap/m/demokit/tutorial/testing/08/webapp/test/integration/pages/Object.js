sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/bulletinboard/test/integration/pages/Common'
	],
	function (Opa5, PropertyStrictEquals, Common) {
		"use strict";

		var sViewName = "Object";

		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				assertions: {
					iShouldSeeTheRememberedObject: function () {
						return this.waitFor({
							success: function () {
								var sBindingPath = this.getContext().currentItem.getBindingContext().getPath();
								return this.waitFor({
									id: "page",
									viewName: sViewName,
									matchers: function (oPage) {
										return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
									},
									success: function (oPage) {
										Opa5.assert.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
									},
									errorMessage: "Remembered object " + sBindingPath + " is not shown"
								});
							}
						});
					}
				}
			}
		});
	});

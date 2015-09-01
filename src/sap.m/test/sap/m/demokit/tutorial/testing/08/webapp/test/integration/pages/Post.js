sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/Properties',
		'sap/ui/demo/bulletinboard/test/integration/pages/Common'
	],
	function (Opa5, Properties, Common) {
		"use strict";

		var sViewName = "Post";

		Opa5.createPageObjects({
			onThePostPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton: function () {
						return this.waitFor({
							id: "page",
							viewName: sViewName,
							success: function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage: "Did not find the nav button on object page"
						});
					}
				},
				assertions: {
					theTitleShouldDisplayTheName: function (sName) {
						return this.waitFor({
							success: function () {
								return this.waitFor({
									id: "objectHeader",
									viewName: sViewName,
									matchers: new Properties({
										title: sName
									}),
									success: function (oPage) {
										Opa5.assert.ok(true, "was on the remembered detail page");
									},
									errorMessage: "The Post " + sName + " is not shown"
								});
							}
						});
					}
				}
			}
		});
	});

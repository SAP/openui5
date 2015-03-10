sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/worklist/test/integration/pages/Common'
	],
	function(Opa5, PropertyStrictEquals, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheAppPage: {
				baseClass: Common,
				actions: {
				},
				assertions: {
					iShouldSeeTheBusyIndicatorForTheWholeApp: function () {
						return this.waitFor({
							id : "app",
							viewName : "App",
							matchers : new PropertyStrictEquals({
								name: "busy",
								value: true
							}),
							success : function (oRootView) {
								// we set the view busy, so we need to query the parent of the app
								ok(true, "The rootview is busy");
							},
							errorMessage : "Did not find the App control"
						});
					}
				}
			}
		});
	});

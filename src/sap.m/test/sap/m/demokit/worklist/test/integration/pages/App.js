sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/demo/worklist/test/integration/pages/Common'
	],
	function(Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheAppPage: {
				baseClass: Common,
				actions: {
				},
				assertions: {
					iShouldSeeTheBusyIndicatorForTheWholeApp: function () {
						return this.waitFor({
							id : "idAppControl",
							viewName : "App",
							matchers : function (oAppControl) {
								return oAppControl.getParent() && oAppControl.getParent().getBusy();
							},
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

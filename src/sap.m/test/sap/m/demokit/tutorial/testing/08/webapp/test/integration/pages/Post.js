sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/actions/Press'
], function (Opa5, Properties, Press) {
		"use strict";

		var sViewName = "Post";

		Opa5.createPageObjects({
			onThePostPage: {
				actions: {
					iPressTheBackButton: function () {
						return this.waitFor({
							id: "page",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the nav button on object page"
						});
					}
				},
				assertions: {
					theTitleShouldDisplayTheName: function (sName) {
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
				}
			}
		});
	});

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
				},
				iPressOnTheTabWithTheKey: function (sKey) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						viewName : sViewName,
						matchers: new Properties({
							key: sKey
						}),
						actions: new Press(),
						errorMessage: "Cannot find the icon tab bar"
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
						success: function () {
							Opa5.assert.ok(true, "was on the remembered detail page");
						},
						errorMessage: "The Post " + sName + " is not shown"
					});
				},

				iShouldSeeTheViewCounter: function () {
					return this.waitFor({
						id: "viewCounter",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The view counter was visible");
						},
						errorMessage: "The view counter could not be found"
					});
				}
			}
		}
	});
});

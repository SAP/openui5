sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/demo/iconexplorer/test/integration/pages/Common"
], function($, Opa5, PropertyStrictEquals, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			baseClass: Common,

			actions: {
				iWaitUntilTheAppBusyIndicatorIsGone: function () {
					return this.waitFor({
						id: "app",
						viewName: "App",
						matchers: new PropertyStrictEquals({
							name: "busy",
							value : false
						}),
						errorMessage: "Did not find the App control"
					});
				}
			},

			assertions: {
				iShouldSeeTheBusyIndicatorForTheWholeApp: function () {
					return this.waitFor({
						id: "app",
						viewName: "App",
						matchers: new PropertyStrictEquals({
							name: "busy",
							value : true
						}),
						success: function () {
							// we set the view busy, so we need to query the parent of the app
							Opa5.assert.ok(true, "The rootview is busy");
						},
						errorMessage: "Did not find the App control"
					});
				},

				iShouldSeeAMessageToast: function(sMsg) {
					return this.waitFor({
						//increase opa's polling because the message toast is only shown for a brief moment
						pollingInterval: 100,
						check: function() {
							return !!$(".sapMMessageToast").length;
						},
						success: function() {
							Opa5.assert.ok(true, sMsg + ": The message toast was displayed");
						},
						errorMessage:  sMsg + ": The message toast was not displayed"
					});
				}
			}
		}
	});
});
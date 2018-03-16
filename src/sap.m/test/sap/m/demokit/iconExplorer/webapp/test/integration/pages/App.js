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
						// inline-matcher directly as function
						matchers: function(oAppControl) {
							// we set the view busy, so we need to query the parent of the app
							return oAppControl.getParent() && oAppControl.getParent().getBusy() === false;
						},
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
							// we cannot mock loading the json files in the IconModel class.
							// on browsers other than chrome it is too fast to make this check work
							value : !!sap.ui.Device.browser.chrome
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
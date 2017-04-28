sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/masterdetail/test/integration/pages/Common",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Common, PropertyStrictEquals) {
	"use strict";

	var sViewName = "App",
		sAppControl = "idAppControl";

	Opa5.createPageObjects({
		onTheAppPage : {
			baseClass : Common,

			actions : {

				iWaitUntilTheBusyIndicatorIsGone : function () {
					return this.waitFor({
						id : sAppControl,
						viewName : sViewName,
						// inline-matcher directly as function
						matchers : function(oRootView) {
							// we set the view busy, so we need to query the parent of the app
							return oRootView.getParent().getBusy() === false;
						},
						errorMessage : "The app is still busy."
					});
				}

			},

			assertions : {

				iShouldSeeTheBusyIndicator : function () {
					return this.waitFor({
						id : sAppControl,
						viewName : sViewName,
						success : function (oRootView) {
							// we set the view busy, so we need to query the parent of the app
							Opa5.assert.ok(oRootView.getParent().getBusy(), "The app is busy");
						},
						errorMessage : "The app is not busy."
					});
				},

				iShouldSeeTheMessageBox : function () {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Dialog",
						matchers : new PropertyStrictEquals({ name: "type", value: "Message"}),
						success: function () {
							Opa5.assert.ok(true, "The correct MessageBox was shown");
						}
					});
				}

			}

		}

	});

});
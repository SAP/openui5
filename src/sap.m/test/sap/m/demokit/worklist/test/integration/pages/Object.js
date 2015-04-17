sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/PropertyStrictEquals",
		"sap/ui/demo/worklist/test/integration/pages/Common",
		"sap/ui/demo/worklist/test/integration/pages/shareOptions"
	],
	function(Opa5, PropertyStrictEquals, Common, shareOptions) {
		"use strict";

		var sViewName = "Object";

		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				actions:  jQuery.extend({
					iPressTheBackButton : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success: function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage : "Did not find the nav button on object page"
						});
					}
				}, shareOptions.createActions(sViewName)),
				assertions: jQuery.extend({

					iShouldSeeTheObject : function (sObjectNumber) {
						var sTitleName = "Object " + sObjectNumber;
						return this.waitFor({
							id : "objectHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName }) ],
							success : function () {
								ok(true, "was on the " + sTitleName + " page");
							},
							errorMessage : "We are not on the " + sTitleName + " page"
						});
					},

					iShouldSeeTheObjectViewsBusyIndicator : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								ok(oPage.getBusy(), "The object view is busy");
							},
							errorMessage : "The worklist view is not busy"
						});
					},

					theObjectViewsBusyIndicatorDelayIsZero : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								strictEqual(oPage.getBusyIndicatorDelay(), 0, "The object view's busy indicator delay is zero.");
							},
							errorMessage : "The object view's busy indicator delay is not zero."
						});
					},

					theObjectViewsBusyIndicatorDelayIsRestored : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								strictEqual(oPage.getBusyIndicatorDelay(), 1000, "The object view's busy indicator delay default is restored.");
							},
							errorMessage : "The object view's busy indicator delay is still zero."
						});
					}
				}, shareOptions.createAssertions(sViewName))
			}
		});
	});

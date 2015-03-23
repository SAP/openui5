sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/worklist/test/integration/pages/Common'
	],
	function(Opa5, PropertyStrictEquals, Common) {
		"use strict";

		var sViewName = "Object";

		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				actions: {
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
				},
				assertions: {

					iShouldSeeTheObject : function (sObjectNumber) {
						var sTitleName = "Object " + sObjectNumber;
						return this.waitFor({
							id : "objectHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName }) ],
							success : function (oObjectHeader) {
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
								ok(oPage.getBusyIndicatorDelay() == 0, "The object view's busy indicator delay is zero.");
							},
							errorMessage : "The object view's busy indicator delay is not zero."
						});
					},

					theObjectViewsBusyIndicatorDelayIsRestored : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								ok(oPage.getBusyIndicatorDelay() == 1000, "The object view's busy indicator delay default is restored.");
							},
							errorMessage : "The object view's busy indicator delay is still zero."
						});
					}
				}
			}
		});
	});

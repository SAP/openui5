sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/worklist/test/integration/pages/Common',
		'sap/ui/demo/worklist/test/integration/pages/shareOptions'
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

					iShouldSeeTheRememberedObject : function () {
						return this.waitFor({
							success : function () {
								var sBindingPath = this.getContext().currentItem.getBindingContext().getPath();
								return this.waitFor({
									id : "page",
									viewName : sViewName,
									matchers : function (oPage) {
										return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
									},
									success : function (oPage) {
										QUnit.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
									},
									errorMessage : "Remembered object " + sBindingPath + " is not shown"
								});
							}
						});
					},

					iShouldSeeTheObjectViewsBusyIndicator : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							matchers: function (oPage) {
								return oPage.getBusy();
							},
							success : function (oPage) {
								ok(oPage.getBusy(), "The object view is busy");
							},
							errorMessage : "The object view is not busy"
						});
					},

					theViewIsNotBusyAnymore : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							matchers: function (oPage) {
								return !oPage.getBusy();
							},
							success : function (oPage) {
								ok(!oPage.getBusy(), "The object view is not busy");
							},
							errorMessage : "The object view is busy"
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

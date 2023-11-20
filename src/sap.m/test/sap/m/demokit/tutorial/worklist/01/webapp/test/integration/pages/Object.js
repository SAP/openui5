sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"./Common",
	"./shareOptions"
], function (Opa5, Press, PropertyStrictEquals, Common, shareOptions) {
	"use strict";

	var sViewName = "Object";

	Opa5.createPageObjects({
		onTheObjectPage: {
			baseClass : Common,

			actions : Object.assign({
				iPressTheBackButton : function () {
					return this.waitFor({
						id : "page",
						viewName : sViewName,
						actions: new Press(),
						errorMessage : "Did not find the nav button on object page"
					});
				}

			}, shareOptions.createActions(sViewName)),

			assertions: Object.assign({

				iShouldSeeTheRememberedObject : function () {
					return this.waitFor({
						success : function () {
							var sBindingPath = this.getContext().currentItem.bindingPath;
							this.waitFor({
								id : "page",
								viewName : sViewName,
								matchers : function (oPage) {
									return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
								},
								success : function (oPage) {
									Opa5.assert.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
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
						matchers : function (oPage) {
							return oPage.getBusy();
						},
						autoWait: false,
						pollingInterval: 100,
						success : function (oPage) {
							Opa5.assert.ok(oPage.getBusy(), "The object view is busy");
						},
						errorMessage : "The object view is not busy"
					});
				},

				theViewIsNotBusyAnymore : function () {
					return this.waitFor({
						id : "page",
						viewName : sViewName,
						matchers : function (oPage) {
							return !oPage.getBusy();
						},
						autoWait: false,
						success : function (oPage) {
							Opa5.assert.ok(!oPage.getBusy(), "The object view is not busy");
						},
						errorMessage : "The object view is busy"
					});
				},

				theObjectViewsBusyIndicatorDelayIsZero : function () {
					return this.waitFor({
						id : "page",
						viewName : sViewName,
						success : function (oPage) {
							Opa5.assert.strictEqual(oPage.getBusyIndicatorDelay(), 0, "The object view's busy indicator delay is zero.");
						},
						errorMessage : "The object view's busy indicator delay is not zero."
					});
				},

				theObjectViewsBusyIndicatorDelayIsRestored : function () {
					return this.waitFor({
						id : "page",
						viewName : sViewName,
						matchers: new PropertyStrictEquals({
							name : "busyIndicatorDelay",
							value: 1000
						}),
						success : function () {
							Opa5.assert.ok(true, "The object view's busy indicator delay default is restored.");
						},
						errorMessage : "The object view's busy indicator delay is still zero."
					});
				},

				theObjectViewShouldContainOnlyFormattedUnitNumbers : function () {
					return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
						sViewName,
						"Object numbers are properly formatted",
						"Object view has no entries which can be checked for their formatting");
				},

				theShareTileButtonShouldContainTheRememberedObjectName : function () {
					return this.waitFor({
						id : "shareTile",
						viewName : sViewName,
						matchers : function (oButton) {
							var sObjectName = this.getContext().currentItem.name;
							var sTitle = oButton.getTitle();
							return sTitle && sTitle.indexOf(sObjectName) > -1;
						}.bind(this),
						success : function () {
							Opa5.assert.ok(true, "The Save as Tile button contains the object name");
						},
						errorMessage : "The Save as Tile did not contain the object name"
					});
				}

			}, shareOptions.createAssertions(sViewName))

		}

	});

});
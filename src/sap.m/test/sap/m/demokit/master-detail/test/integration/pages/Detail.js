sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/PropertyStrictEquals"
	],
	function(Opa5, Common, AggregationLengthEquals, PropertyStrictEquals) {
		"use strict";

		var sViewName = "Detail";

		Opa5.createPageObjects({
			onTheDetailPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success: function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage : "Did not find the nav button on detail page"
						});
					},

					iPressOnTheShareButton : function () {
						return this.waitFor({
							id: "shareButton",
							viewName : sViewName,
							success: function (oButton) {
								oButton.$().trigger("tap");
							},
							errorMessage : "Did not find the share button on detail page"
						});
					}
				},
				assertions: {
					iShouldSeeTheBusyIndicator: function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oView) {
								// we set the view busy, so we need to query the parent of the app
								QUnit.ok(oView.getBusy(), "The detail view is busy");
							},
							errorMessage : "The detail view is not busy."
						});
					},

					theObjectPageShowsTheFirstObject : function () {
						return this.waitFor({
							controlType : "sap.m.ObjectHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : "Object 1"}) ],
							success : function () {
								QUnit.ok(true, "was on the first object page");
							},
							errorMessage : "First object is not shown"
						});
					},

					iShouldBeOnPage : function (sTitleName) {
						return this.waitFor({
							controlType : "sap.m.ObjectHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName}) ],
							success : function (aControls) {
								QUnit.strictEqual(aControls.length, 1, "found only one Objectheader with the object name");
								QUnit.ok(true, "was on the " + sTitleName + " " + sViewName + " page");
							},
							errorMessage : "We are not on " + sTitleName
						});
					},

					iShouldBeOnTheObjectNPage : function (iObjIndex) {
						return this.iShouldBeOnPage("Object " + iObjIndex);
					},

					iShouldSeeTheObjectLineItemsList : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							success : function (oList) {
								QUnit.ok(oList, "Found the line items list.");
							}
						});
					},

					theLineItemsListShouldHave4Entries : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
							success : function () {
								QUnit.ok(true, "The list has 4 items");
							},
							errorMessage : "The list does not have 4 items."
						});
					},

					theLineItemsHeaderShouldDisplay4Entries : function () {
						return this.waitFor({
							id : "lineItemsHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "text", value : "Line Items (4)"}) ],
							success : function () {
								QUnit.ok(true, "The line item list displays 4 items");
							},
							errorMessage : "The line item list does not display 4 items."
						});
					},

					theFirstLineItemHasIDLineItemID1 : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
							success : function (oList) {
								var oFirstItem = oList.getItems()[0];
								QUnit.strictEqual(oFirstItem.getBindingContext().getProperty("LineItemID"), "LineItemID_1", "The first line item has Id 'LineItemID_1'");
							},
							errorMessage : "The first line item does not have Id 'LineItemID_1'."
						});
					},

					iShouldSeeTheShareEmailButton: function () {
						return this.waitFor({
							id: "shareEmail",
							viewName: sViewName,
							success: function (oButton) {
								QUnit.ok(true, "The E-Mail button is visible");
							},
							errorMessage: "The E-Mail button was not found"
						});
					},

					iShouldSeeTheShareTileButton: function () {
						return this.waitFor({
							id: "shareTile",
							viewName: sViewName,
							success: function (oButton) {
								QUnit.ok(true, "The Save as Tile button is visible");
							},
							errorMessage: "The Save as Tile  button was not found"
						});
					},

					iShouldSeeTheShareJamButton: function () {
						return this.waitFor({
							id: "shareJam",
							viewName: sViewName,
							success: function (oButton) {
								QUnit.ok(true, "The Jam share button is visible");
							},
							errorMessage: "The Jam share button was not found"
						});
					}
				}
			}
		});
	});

sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/PropertyStrictEquals"
	],
	function(Opa5, Common, AggregationLengthEquals, PropertyStrictEquals) {
		"use strict";

		Opa5.createPageObjects({
			onTheDetailPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton : function () {
						return this.waitFor({
							id : "page",
							viewName : "Detail",
							success: function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage : "Did not find the nav button on detail page"
						});
					}
				},
				assertions: {
					iShouldSeeTheBusyIndicator: function () {
						return this.waitFor({
							id : "page",
							viewName : "Detail",
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								QUnit.ok(oPage.getParent().getBusy(), "The master view is busy");
							},
							errorMessage : "The master view is not busy."
						});
					},

					theObjectPageShowsTheFirstObject : function () {
						return this.waitFor({
							controlType : "sap.m.ObjectHeader",
							viewName : "Detail",
							matchers : [ new PropertyStrictEquals({name : "title", value : "Object 1"}) ],
							success : function () {
								QUnit.ok(true, "was on the first object page");
							},
							errorMessage : "First object is not shown"
						});
					},

					iShouldBeOnPage : function (sViewName, sTitleName) {
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
						return this.iShouldBeOnPage("Detail", "Object " + iObjIndex);
					},

					iShouldSeeTheObjectLineItemsList : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : "Detail",
							success : function (oList) {
								QUnit.ok(oList, "Found the line items list.");
							}
						});
					},

					theLineItemsListShouldHave4Entries : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : "Detail",
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
							viewName : "Detail",
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
							viewName : "Detail",
							matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
							success : function (oList) {
								var oFirstItem = oList.getItems()[0];
								QUnit.strictEqual(oFirstItem.getBindingContext().getProperty("LineItemID"), "LineItemID_1", "The first line item has Id 'LineItemID_1'");
							},
							errorMessage : "The first line item does not have Id 'LineItemID_1'."
						});
					}
				}
			}
		});
	});

sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/PropertyStrictEquals"
	], function(Opa5, Common, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals) {
		"use strict";

		var sViewName = "Detail";

		Opa5.createPageObjects({
			onTheDetailPage : {
				baseClass : Common,

				actions : {

					iPressTheBackButton : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage : "Did not find the nav button on detail page"
						});
					}

				},

				assertions : {

					iShouldSeeTheBusyIndicator : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								Opa5.assert.ok(oPage.getBusy(), "The detail view is busy");
							},
							errorMessage : "The detail view is not busy."
						});
					},

					iShouldSeeNoBusyIndicator : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							matchers : function (oPage) {
								return !oPage.getBusy();
							},
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								Opa5.assert.ok(!oPage.getBusy(), "The detail view is not busy");
							},
							errorMessage : "The detail view is busy."
						});
					},

					theObjectPageShowsTheFirstObject : function () {
						return this.iShouldBeOnTheObjectNPage(0);
					},

					iShouldBeOnTheObjectNPage : function (iObjIndex) {
						return this.waitFor(this.createAWaitForAnEntitySet({
							entitySet : "Objects",
							success : function (aEntitySet) {
								var sItemName = aEntitySet[iObjIndex].Name;

								this.waitFor({
									controlType : "sap.m.ObjectHeader",
									viewName : sViewName,
									matchers : new PropertyStrictEquals({name : "title", value: aEntitySet[iObjIndex].Name}),
									success : function () {
										Opa5.assert.ok(true, "was on the first object page with the name " + sItemName);
									},
									errorMessage : "First object is not shown"
								});
							}
						}));
					},

					iShouldSeeTheRememberedObject : function () {
						return this.waitFor({
							success : function () {
								var sBindingPath = this.getContext().currentItem.bindingPath;
								this._waitForPageBindingPath(sBindingPath);
							}
						});
					},

					_waitForPageBindingPath : function (sBindingPath) {
						return this.waitFor({
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
					},

					iShouldSeeTheObjectLineItemsList : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							success : function (oList) {
								Opa5.assert.ok(oList, "Found the line items list.");
							}
						});
					},

					theLineItemsListShouldHaveTheCorrectNumberOfItems : function () {
						return this.waitFor(this.createAWaitForAnEntitySet({
							entitySet : "LineItems",
							success : function (aEntitySet) {

								return this.waitFor({
									id : "lineItemsList",
									viewName : sViewName,
									matchers : new AggregationFilled({name : "items"}),
									check: function (oList) {

										var sObjectID = oList.getBindingContext().getProperty("ObjectID");

										var iLength = aEntitySet.filter(function (oLineItem) {
											return oLineItem.ObjectID === sObjectID;
										}).length;

										return oList.getItems().length === iLength;
									},
									success : function () {
										Opa5.assert.ok(true, "The list has the correct number of items");
									},
									errorMessage : "The list does not have the correct number of items."
								});
							}
						}));
					},

					theDetailViewShouldContainOnlyFormattedUnitNumbers : function () {
						return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectHeader",
							sViewName,
							"Object header are properly formatted",
							"Object view has no entries which can be checked for their formatting");
					},

					theLineItemsTableShouldContainOnlyFormattedUnitNumbers : function () {
						return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
							sViewName,
							"Object numbers are properly formatted",
							"LineItmes Table has no entries which can be checked for their formatting");
					},

					theLineItemsHeaderShouldDisplayTheAmountOfEntries : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							matchers : new AggregationFilled({name : "items"}),
							success : function (oList) {
								var iNumberOfItems = oList.getItems().length;
								return this.waitFor({
									id : "lineItemsHeader",
									viewName : sViewName,
									matchers : new PropertyStrictEquals({name: "text", value: "LineItems (" + iNumberOfItems + ")"}),
									success : function () {
										Opa5.assert.ok(true, "The line item list displays " + iNumberOfItems + " items");
									},
									errorMessage : "The line item list does not display " + iNumberOfItems + " items."
								});
							}
						});
					}
				}

			}

		});

	}
);
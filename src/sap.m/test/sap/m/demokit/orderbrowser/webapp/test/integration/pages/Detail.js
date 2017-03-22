sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/actions/Press",
		"sap/ui/demo/orderbrowser/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/PropertyStrictEquals"
	], function(Opa5, Press, Common, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals) {
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
							actions: new Press(),
							errorMessage : "Did not find the nav button on detail page"
						});
					},
					iPressProcessorTab: function () {
						return this.waitFor({
							id: "iconTabFilterProcessor",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the processor tab on detail page"
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
							entitySet : "Orders",
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
							entitySet : "Order_Details",
							success : function (aEntitySet) {

								return this.waitFor({
									id : "lineItemsList",
									viewName : sViewName,
									matchers : new AggregationFilled({name : "items"}),
									check: function (oList) {

										var sObjectID = oList.getBindingContext().getProperty("OrderID");

										var iLength = aEntitySet.filter(function (oLineItem) {
											return oLineItem.OrderID === sObjectID;
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
									matchers : new PropertyStrictEquals({name: "text", value: "Line Items (" + iNumberOfItems + ")"}),
									success : function () {
										Opa5.assert.ok(true, "The line item list displays " + iNumberOfItems + " items");
									},
									errorMessage : "The line item list does not display " + iNumberOfItems + " items."
								});
							}
						});
					},

					iShouldSeeTheShippingInfo : function () {
						return this.waitFor({
							id: "SimpleFormShipAddress",
							viewName: "Shipping",
							success: function () {
								Opa5.assert.ok("The shipping tab is rendered");
							},
							errorMessage: "Did not find shipping info"
						});
					},

					iShouldSeeTheProcessorInfo : function () {
						return this.waitFor({
							id: "SimpleFormProcessorInfo",
							viewName: "Processor",
							success: function () {
								Opa5.assert.ok("The processor tab is rendered");
							},
							errorMessage: "Did not find processor info"
						});
					}
				}

			}

		});

	}
);
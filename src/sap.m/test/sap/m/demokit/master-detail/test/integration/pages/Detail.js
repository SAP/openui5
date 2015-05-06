sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/PropertyStrictEquals"
	],
	function(Opa5, Common, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals) {
		"use strict";
		var sViewName = "Detail";

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
							controlType: "sap.m.Button",
							viewName : sViewName,
							matchers : new sap.ui.test.matchers.PropertyStrictEquals({
								name : "icon",
								value : "sap-icon://action"
							}),
							success: function (oButton) {
								oButton[0].$().trigger("tap");
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
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								QUnit.ok(oPage.getBusy(), "The detail view is busy");
							},
							errorMessage : "The detail view is not busy."
						});
					},

					iShouldSeeNoBusyIndicator: function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							matchers: function (oPage) {
								return !oPage.getBusy();
							},
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								QUnit.ok(!oPage.getBusy(), "The detail view is not busy");
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
										QUnit.ok(true, "was on the first object page with the name " + sItemName);
									},
									errorMessage : "First object is not shown"
								});
							}
						}));
					},

					iShouldSeeTheRememberedObject : function () {
						return this.waitFor({
							success : function () {
								var sBindingPath = this.getContext().currentListItem.getBindingContext().getPath();
								this._waitForPageBindingPath(sBindingPath);
							}
						});
					},

					iShouldSeeTheRememberedObjectId : function () {
						return this.waitFor({
							success : function () {
								var sBindingPath = "/Objects('" + this.getContext().currentId + "')";
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
								QUnit.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
							},
							errorMessage : "Remembered object " + sBindingPath + " is not shown"
						});
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

					theLineItemsListShouldHaveTheCorrectNumberOfItems : function () {
						return this.waitFor(this.createAWaitForAnEntitySet({
							entitySet: "LineItems",
							success: function (aEntitySet) {

								return this.waitFor({
									id : "lineItemsList",
									viewName : sViewName,
									matchers : new AggregationFilled({name : "items"}),
									success : function (oList) {
										var sObjectID = oList.getBindingContext().getProperty("ObjectID");

										var iLength = aEntitySet.filter(function (oLineItem) {
											return oLineItem.ObjectID === sObjectID;
										}).length;

										QUnit.strictEqual(oList.getItems().length, iLength, "The list has the correct number of items");
									},
									errorMessage : "The list does not have the correct number of items."
								});
							}
						}));
					},

					theLineItemsHeaderShouldDisplayTheAmountOfEntries : function () {
						return this.waitFor({
							id : "lineItemsList",
							viewName : sViewName,
							matchers : new AggregationFilled({name : "items"}),
							success : function (oList) {
								var iNumberOfItems = oList.getItems().length;
								return this.waitFor({
									id: "lineItemsHeader",
									viewName: sViewName,
									matchers: new PropertyStrictEquals({name: "text", value: "Line Items (" + iNumberOfItems + ")"}),
									success: function () {
										QUnit.ok(true, "The line item list displays " + iNumberOfItems + " items");
									},
									errorMessage: "The line item list does not display " + iNumberOfItems + " items."
								});
							}
						});
					}
				}
			}
		});
	});

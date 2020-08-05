sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./Common",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/Properties"
], function(Opa5, Press, Common, AggregationFilled, Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheDetailPage: {
			baseClass: Common,
			viewName: "Detail",

			actions: {

				iPressTheHeaderActionButton: function (sId) {
					return this.waitFor({
						id: sId,
						actions: new Press(),
						errorMessage: "Did not find the button with id" + sId + " on detail page"
					});
				}
			},

			assertions: {

				theObjectPageShowsTheFirstObject: function () {
					return this.iShouldBeOnTheObjectNPage(0);
				},

				iShouldBeOnTheObjectNPage: function (iObjIndex) {
					var aEntitySet = this.getEntitySet("Objects");
					return this.waitFor({
						controlType: "sap.m.ObjectHeader",
						matchers: new Properties({
							title: aEntitySet[iObjIndex].Name
						}),
						success: function () {
							Opa5.assert.ok(true, "was on the first object page with the name " + aEntitySet[iObjIndex].Name);
						},
						errorMessage: "First object is not shown"
					});
				},

				iShouldSeeTheRememberedObject: function () {
					return this.waitFor({
						success: function () {
							var sBindingPath = this.getContext().currentItem.bindingPath;
							this._waitForPageBindingPath(sBindingPath);
						}
					});
				},

				_waitForPageBindingPath: function (sBindingPath) {
					return this.waitFor({
						id: "detailPage",
						matchers: function (oPage) {
							return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
						},
						success: function (oPage) {
							Opa5.assert.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
						},
						errorMessage: "Remembered object " + sBindingPath + " is not shown"
					});
				},

				iShouldSeeTheObjectLineItemsList: function () {
					return this.waitFor({
						id: "lineItemsList",
						success: function (oList) {
							Opa5.assert.ok(oList, "Found the line items list.");
						}
					});
				},

				theLineItemsListShouldHaveTheCorrectNumberOfItems: function () {
					return this.waitFor({
						id: "lineItemsList",
						matchers: new AggregationFilled({
							name: "items"
						}),
						check: function (oList) {
							var sObjectID = oList.getBindingContext().getProperty("ObjectID");
							var aEntitySet = this.getEntitySet("LineItems");
							var iLength = aEntitySet.filter(function (oLineItem) {
								return oLineItem.ObjectID === sObjectID;
							}).length;

							return oList.getItems().length === iLength;
						}.bind(this),
						success: function () {
							Opa5.assert.ok(true, "The list has the correct number of items");
						},
						errorMessage: "The list does not have the correct number of items.\nHint: This test needs suitable mock data in localService directory which can be generated via SAP Web IDE"
					});
				},

				theDetailViewShouldContainOnlyFormattedUnitNumbers: function () {
					var rTwoDecimalPlaces =  /^-?\d+\.\d{2}$/;
					return this.waitFor({
						id: "objectHeaderNumber",
						success: function (oNumberControl) {
							Opa5.assert.ok(rTwoDecimalPlaces.test(oNumberControl.getNumber()), "Object numbers are properly formatted");
						},
						errorMessage: "Object view has no entries which can be checked for their formatting"
					});
				},

				theLineItemsHeaderShouldDisplayTheAmountOfEntries: function () {
					return this.waitFor({
						id: "lineItemsList",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function (oList) {
							var iNumberOfItems = oList.getItems().length;
							return this.waitFor({
								id: "lineItemsTitle",
								matchers: new Properties({
									text: "<LineItemsPlural> (" + iNumberOfItems + ")"
								}),
								success: function () {
									Opa5.assert.ok(true, "The line item list displays " + iNumberOfItems + " items");
								},
								errorMessage: "The line item list does not display " + iNumberOfItems + " items."
							});
						}
					});
				},
				iShouldSeeHeaderActionButtons: function () {
					return this.waitFor({
						id: ["closeColumn", "enterFullScreen"],
						success: function () {
							Opa5.assert.ok(true, "The action buttons are visible");
						},
						errorMessage: "The action buttons were not found"
					});
				},

				iShouldSeeTheFullScreenToggleButton: function (sId) {
					return this.waitFor({
						id: sId,
						errorMessage: "The toggle button" + sId + "was not found"
					});
				}

			}

		}

	});

});

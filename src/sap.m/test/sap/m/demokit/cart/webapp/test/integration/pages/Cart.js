sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/AggregationEmpty",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/actions/Press"
], function (
	Opa5,
	Common,
	AggregationFilled,
	AggregationEmpty,
	Properties,
	AggregationContainsPropertyEqual,
	AggregationLengthEquals,
	BindingPath,
	Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheCart : {
			baseClass: Common,
			viewName : "Cart",

			actions : {

				iPressOnTheEditButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new Properties({ icon : "sap-icon://edit"}),
						actions : new Press(),
						errorMessage : "The edit button could not be pressed"
					});
				},

				iPressOnTheDeleteButton : function () {
					return this.waitFor({
						id : "entryList",
						matchers : new Properties({ mode : "Delete"}),
						actions : function (oList) {
							oList.fireDelete({listItem : oList.getItems()[0]});
						},
						errorMessage : "The delete button could not be pressed"
					});
				},

				iPressOnTheSaveChangesButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "cartDoneButtonText", "text");
						}.bind(this),
						actions : new Press(),
						errorMessage : "The accept button could not be pressed"
					});
				},

				iPressOnTheProceedButton : function () {
					return this.waitFor({
						id : "proceedButton",
						actions : new Press()
					});
				},

				iPressOnSaveForLaterForTheFirstProduct : function () {
					return this.waitFor({
						controlType : "sap.m.ObjectAttribute",
						matchers : new BindingPath({path : "/cartEntries/HT-1254", modelName: "cartProducts"}),
						actions : new Press()
					});
				},

				iPressOnAddBackToBasketForTheFirstProduct : function () {
					return this.waitFor({
						controlType : "sap.m.ObjectAttribute",
						matchers : new BindingPath({path : "/savedForLaterEntries/HT-1254", modelName: "cartProducts"}),
						actions : new Press()
					});
				},

				iPressTheBackButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Properties({type: "Back"}),
						actions: new Press(),
						errorMessage: "The back button was not found and could not be pressed"
					});
				}
			},

			assertions : {

				iShouldSeeTheProductInMyCart : function () {
					return this.waitFor({
						id : "entryList",
						matchers : new AggregationFilled({name : "items"}),
						success : function () {
							Opa5.assert.ok(true, "The cart has entries");
						},
						errorMessage : "The cart does not contain any entries"
					});
				},

				iShouldSeeTheCart: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The cart was successfully displayed");
						},
						errorMessage: "The cart was not displayed"
					});
				},

				iShouldNotSeeASaveForLaterFooter : function () {
					return this.waitFor({
						id : "entryList",
						success : function (oList) {
							Opa5.assert.strictEqual("", oList.getFooterText(), "The footer is not visible");
						},
						errorMessage : "The footer is still visible"
					});
				},

				iShouldSeeAnEmptyCart : function () {
					return this.waitFor({
						id : "entryList",
						matchers : new AggregationEmpty({name : "items"}),
						success : function () {
							Opa5.assert.ok(true, "The cart has no entries");
						},
						errorMessage : "The cart does not contain any entries"
					});
				},

				theProceedHelper  : function (bIsEnabled) {
					var sErrorMessage = "The proceed button is enabled";
					var sSuccessMessage = "The proceed button is disabled";
					if (bIsEnabled) {
						sErrorMessage = "The proceed button is disabled";
						sSuccessMessage = "The proceed button is enabled";
					}
					return this.waitFor({
						controlType : "sap.m.Button",
						autoWait: bIsEnabled,
						matchers : new Properties({
							type: "Accept"
					}),
						success : function (aButtons) {
							Opa5.assert.strictEqual(
								aButtons[0].getEnabled(), bIsEnabled, sSuccessMessage
							);
						},
						errorMessage : sErrorMessage
					});
				},

				iShouldSeeTheProceedButtonDisabled : function () {
					return this.theProceedHelper(false);
				},

				iShouldSeeTheProceedButtonEnabled : function () {
					return this.theProceedHelper(true);
				},


				theEditButtonHelper  : function (bIsEnabled) {
					var sErrorMessage = "The edit button is enabled";
					var sSuccessMessage = "The edit button is disabled";
					if (bIsEnabled) {
						sErrorMessage = "The edit button is disabled";
						sSuccessMessage = "The edit button is enabled";
					}
					return this.waitFor({
						controlType : "sap.m.Button",
						autoWait: bIsEnabled,
						matchers : new Properties({
							icon : "sap-icon://edit",
							enabled: bIsEnabled
						}),
						success : function (aButtons) {
							Opa5.assert.strictEqual(
								aButtons[0].getEnabled(), bIsEnabled, sSuccessMessage
							);
						},
						errorMessage : sErrorMessage
					});
				},

				iShouldSeeTheEditButtonDisabled : function () {
					return this.theEditButtonHelper(false);
				},

				iShouldSeeTheEditButtonEnabled : function () {
					return this.theEditButtonHelper(true);
				},

				iShouldSeeTheDeleteButton : function () {
					return this.waitFor({
						controlType : "sap.m.List",
						matchers : new Properties({ mode : "Delete"}),
						success : function (aLists) {
							Opa5.assert.ok(
								aLists[0],
								"The delete button was found"
							);
						},
						errorMessage : "The delete button was not found"
					});
				},

				iShouldNotSeeTheDeletedItemInTheCart : function () {
					return this.waitFor({
						id : "entryList",
						matchers : function (oList) {
							var bExist =  new AggregationContainsPropertyEqual({
								aggregationName : "items",
								propertyName : "title",
								propertyValue : "Bending Screen 21HD"
							}).isMatching(oList);
							return !bExist;
						},
						success: function () {
							Opa5.assert.ok(true, "The cart does not contain our product");
						},
						errorMessage : "The cart contains our product"
					});
				},

				iShouldBeTakenToTheCart : function () {
					return this.waitFor({
						id : "entryList",
						success : function (oList) {
							Opa5.assert.ok(
								oList,
								"The cart was found"
							);
						},
						errorMessage : "The cart was not found"
					});
				},

				iShouldSeeOneProductInMySaveForLaterList: function () {
					return this.waitFor({
						id : "saveForLaterList",
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getItems().length, 1, "Product saved for later");
						}
					});
				},

				iShouldSeeAnEmptySaveForLaterList : function () {
					return this.waitFor({
						id : "saveForLaterList",
						matchers: new AggregationEmpty({ name : "items" }),
						success : function (oList) {
							Opa5.assert.ok(true, "The savelist was empty");
						},
						errorMessage : "The savelist still has entries"
					});
				},

				iShouldSeeTheWelcomeScreen: function () {
					return this.waitFor({
						id : "saveForLaterList",
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getItems().length, 1, "Product saved for later");
						}
					});
				},

				iShouldSeeTheTotalPriceEqualToZero : function () {
					return this.waitFor({
						id: "totalPriceText",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "cartTotalPrice", "text", null, ["0,00 EUR"]);
						}.bind(this),
						success: function () {
							Opa5.assert.ok(true, "Total price is updated correctly");
						},
						errorMessage: "Total price is not updated correctly"
					});
				},

				iShouldSeeTheTotalPriceUpdated: function () {
					return this.waitFor({
						id: "totalPriceText",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "cartTotalPrice", "text", null, ["250,00 EUR"]);
						}.bind(this),
						success: function () {
							Opa5.assert.ok(true, "Total price is updated correctly");
						},
						errorMessage: "Total price is not updated correctly"
					});
				}
			}
		}
	});
});

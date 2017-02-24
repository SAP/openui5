sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/AggregationEmpty',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/AggregationContainsPropertyEqual',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/Ancestor',
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText'
], function (Opa5,
			 AggregationFilled,
			 AggregationEmpty,
			 Properties,
			 AggregationContainsPropertyEqual,
			 AggregationLengthEquals,
			 BindingPath,
			 Ancestor,
			 Press,
			 EnterText) {
	"use strict";

	Opa5.createPageObjects({
		onTheCart : {
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

				iPressOnTheAcceptButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new Properties({ icon : "sap-icon://accept"}),
						actions : new Press(),
						errorMessage : "The accept button could not be pressed"
					});
				},

				iPressOnTheProceedButton : function () {
					return this.waitFor({
						id : "proceedButton",
						actions : new sap.ui.test.actions.Press()
					});
				},

				iFillTheForm : function () {
					this.waitFor({
						viewName : "Order",
						id: "inputName",
						actions: new EnterText({ text: "MyName" })
					});
					this.waitFor({
						viewName : "Order",
						id: "inputAddress",
						actions: new EnterText({ text: "MyAddress" })
					});
					this.waitFor({
						viewName : "Order",
						id: "inputMail",
						actions: new EnterText({ text: "me@example.com" })
					});
					return this.waitFor({
						viewName : "Order",
						id: "inputNumber",
						actions: new EnterText({ text: "1234567891234" })
					});
				},

				iPressOrderNow : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new Properties({ text: "Order Now" }),
						actions : new Press(),
						errorMessage : "Did not find the Order Now button"
					});
				},

				iPressOnSaveForLaterForTheFirstProduct : function () {
					return this.waitFor({
						controlType : "sap.m.ObjectAttribute",
						matchers : new BindingPath({path : "/cartEntries/HT-1254", modelName: "cartProducts"}),
						success: function (aObjectAttributes) {
							this.waitFor({
								controlType : "sap.m.Text",
								matchers: new Ancestor(aObjectAttributes[0], true),
								actions : new Press()
							});
						}
					});
				},
				iPressOnAddBackToBasketForTheFirstProduct : function () {
					return this.waitFor({
						controlType : "sap.m.ObjectAttribute",
						matchers : new BindingPath({path : "/savedForLaterEntries/HT-1254", modelName: "cartProducts"}),
						success: function (aObjectAttributes) {
							this.waitFor({
								controlType : "sap.m.Text",
								matchers: new Ancestor(aObjectAttributes[0], true),
								actions : new Press()
							});
						}
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
						matchers : new AggregationLengthEquals({name : "items", length: 0}),
						success : function () {
							Opa5.assert.ok(true, "The cart has no entries");
						},
						errorMessage : "The cart does not contain any entries"
					});
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

				theEditButtonShouldBeDisabled : function () {
					return this.theEditButtonHelper(false);
				},

				theEditButtonShouldBeEnabled : function () {
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
						success : function (oList) {
							Opa5.assert.strictEqual(
								oList.getItems().length,
								0,
								"The cart does not contain our product"
							);
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
				}
			}

		}
	});

});

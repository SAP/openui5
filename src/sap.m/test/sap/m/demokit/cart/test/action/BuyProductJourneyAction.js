jQuery.sap.declare("sap.ui.demo.cart.test.action.BuyProductJourneyAction");
jQuery.sap.require("sap.ui.test.Opa5");
jQuery.sap.require("sap.ui.test.matchers.PropertyStrictEquals");
jQuery.sap.require("sap.ui.test.actions.Press");
jQuery.sap.require("sap.ui.test.actions.EnterText");

sap.ui.demo.cart.test.action.BuyProductJourneyAction = sap.ui.test.Opa5.extend("sap.ui.demo.cart.test.action.BuyProductJourneyAction", {
			iPressOnTheSecondCategory : function () {

				return this.waitFor({
					controlType : "sap.m.StandardListItem",
					matchers: function (oListItem) {
						return oListItem.getBindingContextPath() === "/ProductCategories('FS')";
					},
					actions : new sap.ui.test.actions.Press(),
					success: function (aListItems) {
						this.getContext().sCategoryName = aListItems[0].getTitle();
					},
					errorMessage : "The category list did not contain a second item"
				});
			},

			iPressOnTheFirstProduct : function () {
				var oFirstItem = this.getContext().oProductList.getItems()[0];

				this.getContext().sProductName = oFirstItem.getTitle();

				new sap.ui.test.actions.Press().executeOn(oFirstItem);
				return this;
			},

			iAddTheDisplayedProductToTheCart : function () {
				var oAddButton = null;
				return this.waitFor({
					viewName : "Product",
					controlType : "sap.m.Button",
					check : function (aButtons) {
						return aButtons && aButtons.some(function (oButton) {
							if (oButton.getText() === "Add to Cart") {
								oAddButton = oButton;
								return !!oAddButton.getBindingContext();
							}
							return false;
						}, this);
					},
					actions : new sap.ui.test.actions.Press(),
					errorMessage : "Did not find the Add to Cart button"
				});
			},

			iGoToTheCartPage : function () {
				return this.waitFor({
					controlType : "sap.m.Button",
					matchers : new sap.ui.test.matchers.PropertyStrictEquals({
						name : "icon",
						value : "sap-icon://cart"
					}),
					actions : new sap.ui.test.actions.Press(),
					errorMessage : "did not find the cart button"
				});
			},

			iLookAtTheScreen : function () {
				return this;
			},

			iPressOnTheProceedButton : function () {

				return this.waitFor({
					viewName : "Cart",
					id : "proceedButton",
					actions : new sap.ui.test.actions.Press()
				});

			},

			iFillTheForm : function () {
				this.waitFor({
					viewName : "Order",
					id: "inputName",
					actions: new sap.ui.test.actions.EnterText({ text: "MyName" })
				});
				this.waitFor({
					viewName : "Order",
					id: "inputAddress",
					actions: new sap.ui.test.actions.EnterText({ text: "MyAddress" })
				});
				this.waitFor({
					viewName : "Order",
					id: "inputMail",
					actions: new sap.ui.test.actions.EnterText({ text: "me@example.com" })
				});
				return this.waitFor({
					viewName : "Order",
					id: "inputNumber",
					actions: new sap.ui.test.actions.EnterText({ text: "1234567891234" })
				});
			},

			iPressOrderNow : function () {
				return this.waitFor({
					searchOpenDialogs : true,
					controlType : "sap.m.Button",
					matchers : [
						new sap.ui.test.matchers.PropertyStrictEquals({
							name : "text",
							value : "Order Now"
						}),
						new sap.ui.test.matchers.PropertyStrictEquals({
							name : "enabled",
							value : true
						})
					],
					actions : new sap.ui.test.actions.Press(),
					errorMessage : "Did not find the Order Now button"
				});
			}
		});

jQuery.sap.declare("sap.ui.demo.cart.test.action.BuyProductJourneyAction");
jQuery.sap.require("sap.ui.test.Opa5");
jQuery.sap.require("sap.ui.test.matchers.PropertyStrictEquals");

sap.ui.demo.cart.test.action.BuyProductJourneyAction = sap.ui.test.Opa5.extend("sap.ui.demo.cart.test.action.BuyProductJourneyAction", {
			iPressOnTheSecondCategory : function (sCategoryName) {

				return this.waitFor({
					controlType : "sap.m.StandardListItem",
					matchers: function (oListItem) {
						return oListItem.getBindingContextPath() === "/ProductCategories('FS')";
					},
					success : function (aListItems) {
						aListItems[0].$().trigger("tap");
						this.getContext().sCategoryName = aListItems[0].getTitle();
					},
					errorMessage : "The category list did not contain a second item"
				});
			},

			iPressOnTheFirstProduct : function () {
				var oFirstItem = this.getContext().oProductList.getItems()[0];

				this.getContext().sProductName = oFirstItem.getTitle();

				oFirstItem.$().trigger("tap");
				return this;
			},

			iAddTheDisplayedProductToTheCart : function () {
				var oAddButton= null;
				return this.waitFor({
					viewName : "Product",
					controlType : "sap.m.Button",
					check : function (aButtons) {
						return aButtons && aButtons.some(function (oButton) {
							if(oButton.getText() === "Add to Cart") {
								oAddButton = oButton;
								return true;
							}
							return false;
						}, this);
					},
					success : function () {
						Opa5.getUtils().triggerTouchEvent("tap", oAddButton.getDomRef());
					},
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
					success : function (aButtons) {
						Opa5.getUtils().triggerTouchEvent("tap", aButtons[0].getDomRef());
					},
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
					success : function (oButton) {
						oButton.$().trigger("tap");
					}
				});

			},

			iFillTheForm : function () {
				return this.waitFor({
					viewName : "Order",
					id : ["inputName", "inputAddress", "inputMail", "inputNumber"],
					success : function (aControls) {
						aControls[0].setValue("MyName");
						aControls[1].setValue("MyAddress");
						aControls[2].setValue("me@example.com");
						aControls[3].setValue("1234567891234");
					},
					errorMessage : "Did not find the Order Now button"
				});
			},

			iPressOrderNow : function () {
				return this.waitFor({
					searchOpenDialogs : true,
					controlType : "sap.m.Button",
					matchers : [
						new sap.ui.test.matchers.PropertyStrictEquals({
							name : "text",
							value : "Order Now",
						}),
						new sap.ui.test.matchers.PropertyStrictEquals({
							name : "enabled",
							value : true,
						}),
					],
					success : function (aButtons) {
						aButtons[0].$().trigger("tap");
					},
					errorMessage : "Did not find the Order Now button"
				});
			}
		});

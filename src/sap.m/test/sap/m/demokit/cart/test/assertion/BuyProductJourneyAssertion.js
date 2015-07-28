jQuery.sap.declare("sap.ui.demo.cart.test.assertion.BuyProductJourneyAssertion");
jQuery.sap.require("sap.ui.test.Opa5");
jQuery.sap.require("sap.ui.test.matchers.AggregationFilled");

sap.ui.demo.cart.test.assertion.BuyProductJourneyAssertion = sap.ui.test.Opa5.extend("sap.ui.demo.cart.test.assertion.BuyProductJourneyAssertion", {
	iShouldSeeTheCategoryList : function () {
		return this.waitFor({
			id : "categoryList",
			viewName : "Home",
			success : function (oList) {
				QUnit.ok(oList, "Found the category List");
			}
		});
	},

	iShouldSeeTheProductList : function () {
		return this.waitFor({
			id : "productList",
			viewName : "Category",
			success : function (oList) {
				this.getContext().oProductList = oList;
				ok(oList, "Found the product List");
			}
		});
	},

	iShouldBeTakenToTheSecondCategory : function () {
		return this.waitFor({
			id : "page-title",
			viewName : "Category",
			check : function (oTitle) {
				return oTitle.getText() === "FS";
			}
		});
	},

	theCategoryListShouldHaveSomeEntries : function () {
		return this.waitFor({
			id : "categoryList",
			viewName : "Home",
			matchers: new sap.ui.test.matchers.AggregationFilled({ name : "items" }),
			success : function () {
				QUnit.ok(true, "CategoryList did contain entries");
			},
			errorMessage : "The category list did not contain entries"
		});
	},

	theProductListShouldHaveSomeEntries : function () {
		return this.waitFor({
			check : function () {
				return this.getContext().oProductList.getItems().length > 0;
			},
			success : function () {
				ok(true, "ProductList did contain entries");
			},
			errorMessage : "The product list did not contain entries"
		});
	},

	iShouldSeeTheProductInMyCart : function () {
		return this.waitFor({
			viewName : "Cart",
			id : "entryList",
			success : function (oList) {
				strictEqual(oList.getItems()[0].getTitle(), this.getContext().sProductName, "The added Product has the correct Title");
			},
			errorMessage : "Did not find the product in the cart"
		});
	},

	iShouldSeeAnEmptyCart : function () {
		return this.waitFor({
			viewName : "Cart",
			id : "entryList",
			check : function (oList) {
				return oList.getItems().length === 0;
			},
			success : function (oList) {
				strictEqual(oList.getItems().length, 0, "The cart was empty after shopping");
			},
			errorMessage : "The cart still has entries"
		});
	},

	theProceedButtonShouldBeEnabled : function () {
		return this.waitFor({
			viewName : "Cart",
			id : "proceedButton",
			success : function (oButton) {
				ok(oButton.getEnabled(), "The button is enabled");
			},
			errorMessage : "The proceed button was not enabled"
		});
	}
});

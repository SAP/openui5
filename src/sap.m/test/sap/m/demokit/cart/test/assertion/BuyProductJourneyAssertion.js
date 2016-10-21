sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/AggregationEmpty"
	], function (Opa5, AggregationFilled, AggregationEmpty) {

		return Opa5.extend("sap.ui.demo.cart.test.assertion.BuyProductJourneyAssertion", {

			iShouldSeeTheCategoryList : function () {
				return this.waitFor({
					id : "categoryList",
					viewName : "Home",
					success : function (oList) {
						Opa5.assert.ok(oList, "Found the category List");
					}
				});
			},

			iShouldSeeTheProductList : function () {
				return this.waitFor({
					id : "productList",
					viewName : "Category",
					success : function (oList) {
						this.getContext().oProductList = oList;
						Opa5.assert.ok(oList, "Found the product List");
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
					matchers: new AggregationFilled({ name : "items" }),
					success : function () {
						Opa5.assert.ok(true, "CategoryList did contain entries");
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
						Opa5.assert.ok(true, "ProductList did contain entries");
					},
					errorMessage : "The product list did not contain entries"
				});
			},

			iShouldSeeTheProductInMyCart : function () {
				return this.waitFor({
					viewName : "Cart",
					id : "entryList",
					success : function (oList) {
						Opa5.assert.strictEqual(oList.getItems()[0].getTitle(), this.getContext().sProductName, "The added Product has the correct Title");
					},
					errorMessage : "Did not find the product in the cart"
				});
			},

			iShouldSeeAnEmptyCart : function () {
				return this.waitFor({
					viewName : "Cart",
					id : "entryList",
					matchers: new AggregationEmpty({ name : "items" }),
					success : function (oList) {
						Opa5.assert.ok(true, "The cart was empty");
					},
					errorMessage : "The cart still has entries"
				});
			},

			iShouldSeeAnEmptySaveForLaterList : function () {
				return this.waitFor({
					viewName : "Cart",
					id : "saveForLaterList",
					matchers: new AggregationEmpty({ name : "items" }),
					success : function (oList) {
						Opa5.assert.ok(true, "The savelist was empty");
					},
					errorMessage : "The savelist still has entries"
				});
			},

			theProceedButtonShouldBeEnabled : function () {
				return this.waitFor({
					viewName : "Cart",
					id : "proceedButton",
					success : function (oButton) {
						Opa5.assert.ok(oButton.getEnabled(), "The button is enabled");
					},
					errorMessage : "The proceed button was not enabled"
				});
			}

		});

	}
);

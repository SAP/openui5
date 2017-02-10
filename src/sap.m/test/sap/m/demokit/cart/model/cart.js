sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (MessageBox, MessageToast) {
	"use strict";

	return {

		/**
		 * Checks for the status of the product that is added to the cart.
		 * If the product is not available, a message dialog will open.
		 * Otherwise the helper function <code>_updateCartItem</code> will be called.
		 * @public
		 * @param {Object} oBundle i18n bundle
		 * @param {Object} oProduct Product that is added to the cart
		 * @param {Object} oCartModel Cart model
		 */
		addToCart: function (oBundle, oProduct, oCartModel) {
			// Items to be added from the welcome view have their content inside a product object
			if (oProduct.Product !== undefined) {
				oProduct = oProduct.Product;
			}
			switch (oProduct.Status) {
				case "D":
					//If item is "discontinued" show message dialog
					MessageBox.show(
						oBundle.getText("PRODUCT_STATUS_DISCONTINUED_MSG"), {
							icon: MessageBox.Icon.ERROR,
							titles: oBundle.getText("PRODUCT_STATUS_DISCONTINUED_TITLE"),
							actions: [MessageBox.Action.CLOSE]
						});
					break;
				case "O":
					// If item is "out of stock" show message dialog
					MessageBox.show(
						oBundle.getText("PRODUCT_STATUS_OUT_OF_STOCK_MSG"), {
							icon: MessageBox.Icon.QUESTION,
							title: oBundle.getText("PRODUCT_STATUS_OUT_OF_STOCK_TITLE"),
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							onClose: function (oAction) {
								// order
								if (MessageBox.Action.OK === oAction) {
									this._updateCartItem(oBundle, oProduct, oCartModel);
								}
							}.bind(this)
						});
					break;
				case "A":
				//If item is "available" add it to cart. Also default,
				//if no status-property is set or case does not match
				default:
					this._updateCartItem(oBundle, oProduct, oCartModel);
					break;
			}
		},

		/**
		 * Function that updates the cart model when a product is added to the cart.
		 * Therefore it first checks, if the products is already in the cart. Then it only updates the counter.
		 * If not, a new object with quantity 1 is added to the cart model.
		 * @private
		 * @param {Object} oBundle i18n bundle
		 * @param {Object} oProductToBeAdded Product that is added to the cart
		 * @param {Object} oCartModel Cart model
		 */
		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel) {
			var oCartData = oCartModel.getData();

			// find existing entry for product
			var oCartEntry = oCartData.cartEntries[oProductToBeAdded.ProductId];

			if (oCartEntry === undefined) {
				// create new entry
				oCartEntry = $.extend({}, oProductToBeAdded);
				oCartEntry.Quantity = 1;
				oCartData.cartEntries[oProductToBeAdded.ProductId] = oCartEntry;
			} else {
				// update existing entry
				oCartEntry.Quantity += 1;
			}
			//if there is at least one entry, the edit button is shown
			oCartModel.setData(oCartData);
			oCartModel.setProperty("/showEditButton", true);
			oCartModel.setProperty("/showProceedButton", true);
			// we need to update the binding to show the total price
			oCartModel.updateBindings(true);
			MessageToast.show(oBundle.getText("PRODUCT_MSG_ADDED_TO_CART", [oProductToBeAdded.Name] ));
		}
	};
});
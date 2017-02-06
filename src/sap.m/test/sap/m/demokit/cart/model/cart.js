sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (MessageBox, MessageToast) {
	"use strict";

	return {
		addToCart: function (oBundle, oProduct, oCartModel) {
			// Items to be added from the welcome view have it's content inside product object
			if (oProduct.Product !== undefined) {
				oProduct = oProduct.Product;
			}
			switch (oProduct.Status) {
				case "D":
					//show message dialog
					MessageBox.show(
						oBundle.getText("PRODUCT_STATUS_DISCONTINUED_MSG"), {
							icon: MessageBox.Icon.ERROR,
							titles: oBundle.getText("PRODUCT_STATUS_DISCONTINUED_TITLE"),
							actions: [MessageBox.Action.CLOSE]
						});
					break;
				case "O":
					// show message dialog
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
				default:
					this._updateCartItem(oBundle, oProduct, oCartModel);
					break;
			}
		},

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
			oCartData.showEditButton = true;
			oCartData.showProceedButton = true;
			MessageToast.show(oBundle.getText("PRODUCT_MSG_ADDED_TO_CART", [oProductToBeAdded.Name] ));
		}
	};
});
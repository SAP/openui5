sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], (MessageBox, MessageToast) => {
	"use strict";

	return {
		/**
		 * Checks for the status of the product that is added to the cart.
		 * If the product is not available, a message dialog will open.
		 * @param {Object} oBundlePromise a promise that resolves with an i18n bundle
		 * @param {Object} oProduct Product that is added to the cart
		 * @param {Object} oCartModel Cart model
		 */
		async addToCart(oBundlePromise, oProduct, oCartModel) {
			// Items to be added from the welcome view have it's content inside product object
			if (oProduct.Product !== undefined) {
				oProduct = oProduct.Product;
			}
			const oResourceBundle = await oBundlePromise;
			switch (oProduct.Status) {
				case "D":
					//show message dialog
					MessageBox.show(
						oResourceBundle.getText("productStatusDiscontinuedMsg"), {
						icon: MessageBox.Icon.ERROR,
						titles: oResourceBundle.getText("productStatusDiscontinuedTitle"),
						actions: [MessageBox.Action.CLOSE]
					});
					break;
				case "O":
					// show message dialog
					MessageBox.show(
						oResourceBundle.getText("productStatusOutOfStockMsg"), {
						icon: MessageBox.Icon.QUESTION,
						title: oResourceBundle.getText("productStatusOutOfStockTitle"),
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: (oAction) => {
							// order
							if (MessageBox.Action.OK === oAction) {
								this._updateCartItem(oResourceBundle, oProduct, oCartModel);
							}
						}
					});
					break;
				case "A":
				default:
					this._updateCartItem(oResourceBundle, oProduct, oCartModel);
					break;
			}
		},

		/**
		 * Function that updates the cart model when a product is added to the cart.
		 * If the product is already in the cart the quantity is increased.
		 * If not, the product is added to the cart with quantity 1.
		 * @param {Object} oBundle i18n bundle
		 * @param {Object} oProductToBeAdded Product that is added to the cart
		 * @param {Object} oCartModel Cart model
		 */
		_updateCartItem(oBundle, oProductToBeAdded, oCartModel) {
			// find existing entry for product
			const oCollectionEntries = {...oCartModel.getData()["cartEntries"]};
			let oCartEntry =  oCollectionEntries[oProductToBeAdded.ProductId];

			if (oCartEntry === undefined) {
				// create new entry
				oCartEntry = {...oProductToBeAdded};
				oCartEntry.Quantity = 1;
				oCollectionEntries[oProductToBeAdded.ProductId] = oCartEntry;
			} else {
				// update existing entry
				oCartEntry.Quantity += 1;
			}
			//update the cart model
			oCartModel.setProperty("/cartEntries", {...oCollectionEntries});
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.Name]));
		}
	};
});
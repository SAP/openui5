sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], (NumberFormat) => {
	"use strict";

	const mStatusState = {
		A: "Success",
		O: "Warning",
		D: "Error"
	};
	const formatter = {
		/**
		 * Formats the price
		 * @param {string} sValue model price value
		 * @returns {string} formatted price
		 */
		price(sValue) {
			const oFloatInstance = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});

			return oFloatInstance.format(sValue);
		},

		/**
		 * Sums up the price for all products in the cart
		 * @param {object} oCartEntries current cart entries
		 * @returns {string} string with the total value
		 */
		async totalPrice(oCartEntries) {
			let fTotalPrice = 0;
			Object.keys(oCartEntries).forEach((sProductId) => {
				const oProduct = oCartEntries[sProductId];
				fTotalPrice += parseFloat(oProduct.Price) * oProduct.Quantity;
			});

			return (await this.requestResourceBundle())
				.getText("cartTotalPrice", [formatter.price(fTotalPrice), "EUR"]);
		},

		/**
		 * Returns the status text based on the product status
		 * @param {string} sStatus product status
		 * @returns {string} the corresponding text if found or the original value
		 */
		async statusText(sStatus) {
			const oBundle = await this.requestResourceBundle();
			const mStatusText = {
				A: oBundle.getText("statusA"),
				O: oBundle.getText("statusO"),
				D: oBundle.getText("statusD")
			};

			return mStatusText[sStatus] || sStatus;
		},

		/**
		 * Returns the product state based on the status
		 * @param {string} sStatus product status
		 * @returns {string} the state text
		 */
		statusState(sStatus) {
			return mStatusState[sStatus] || "None";
		},

		/**
		 * Returns the relative URL to a product picture
		 * @param {string} sUrl image URL
		 * @returns {string} relative image URL
		 */
		pictureUrl(sUrl) {
			if (sUrl){
				return sap.ui.require.toUrl(sUrl);
			} else {
				return undefined;
			}
		},

		/**
		 * Checks if one of the collections contains items.
		 * @param {object} oCollection1 First array or object to check
		 * @param {object} oCollection2 Second array or object to check
		 * @returns {boolean} true if one of the collections is not empty, otherwise - false.
		 */
		hasItems(oCollection1, oCollection2) {
			const bCollection1Filled = !!(oCollection1 && Object.keys(oCollection1).length);
			const bCollection2Filled = !!(oCollection2 && Object.keys(oCollection2).length);

			return bCollection1Filled || bCollection2Filled;
		}
	};

	return formatter;
});
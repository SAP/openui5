sap.ui.define([], function () {
	"use strict";

	return {

		/*
		 * Defines a value state based on the "DeliveryStatus".
		 * Paramter "sDeliveryStatus" is the "DeliveryStatus" of a purchase.
		 * Returns "sValue" the state for the "DeliveryStatus".
		 */
		deliveryStatusState: function (sDeliveryStatus) {
			switch (sDeliveryStatus) {
				case "Shipped":
					return "Success";
				case "Failed Shipping":
					return "Error";
				default:
					return "None";
			}
		}

	};

});

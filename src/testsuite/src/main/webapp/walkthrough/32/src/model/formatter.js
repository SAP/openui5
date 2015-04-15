sap.ui.define([], function () {
	"use strict";

	return {

		statusText: function (sStatus) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			switch (sStatus) {
				case "A":
					return oResourceBundle.getText("invoiceStatusA");
					break;
				case "B":
					return oResourceBundle.getText("invoiceStatusB");
					break;
				case "C":
					return oResourceBundle.getText("invoiceStatusC");
					break;
				default:
					return sStatus;
			}
		}
	};
});

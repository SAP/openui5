sap.ui.define([
	"sap/ui/model/type/String",
	"sap/ui/model/ValidateException",
	"sap/ui/model/resource/ResourceModel"
], function (String, ValidateException, ResourceModel) {
	"use strict";

	var oResourceModel = new ResourceModel({
		bundleName: "sap.ui.demo.cart.i18n.i18n"
	});

	return String.extend("sap.ui.demo.cart.model.EmailType", {

		/**
		 * Validates the value to be parsed
		 *
		 * @public
		 * Since there is only true and false, no client side validation is required
		 * @returns {string}
		 */
		validateValue: function (oValue) {
			// The following Regex is NOT covering all cases of RFC 5322 and only used for demonstration purposes.
			var rEMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			if (!oValue.match(rEMail)) {
				throw new ValidateException(oResourceModel.getResourceBundle().getText("checkoutCodEmailValueTypeMismatch", [oValue]));
			}
		}

	});
});

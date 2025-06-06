sap.ui.define([
	"sap/ui/model/type/String",
	"sap/ui/model/ValidateException",
	"sap/ui/model/resource/ResourceModel"
], (String, ValidateException, ResourceModel) => {
	"use strict";

	const oResourceModel = new ResourceModel({
		bundleName: "sap.ui.demo.cart.i18n.i18n"
	});
	// The following Regex is NOT covering all cases of RFC 5322 and only used for demonstration purposes.
	const rEMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

	return String.extend("sap.ui.demo.cart.model.EmailType", {
		/**
		 * Validates the value to be parsed. Since there is only true and false, no client side validation is required.
		 * @param {string} [sValue] The value to be validated
		 */
		validateValue(sValue) {
			if (!sValue.match(rEMail)) {
				throw new ValidateException(
					oResourceModel.getResourceBundle().getText("checkoutCodEmailValueTypeMismatch", [sValue]));
			}
		}
	});
});

/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * Retrieve the selected text in the first element of the collection.
	 *
	 * <b>Note</b>: This feature is only supported for input element’s type of text, search, url, tel and password.
	 *
	 * @return {string} The selected text.
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/getSelectedText
	 */
	var fnGetSelectedText = function() {
		var oDomRef = this.get(0);

		try {
			if (typeof oDomRef.selectionStart === "number") {
				return oDomRef.value.substring(oDomRef.selectionStart, oDomRef.selectionEnd);
			}
		} catch (e) {
			// note: some browsers fail to read the "selectionStart" and "selectionEnd" properties from HTMLInputElement, e.g.: The input element's type "number" does not support selection.
		}

		return "";
	};

	jQuery.fn.getSelectedText = fnGetSelectedText;
	return jQuery;

});


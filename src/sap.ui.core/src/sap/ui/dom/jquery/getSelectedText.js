/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * Applies the jQuery function extension:
	 * @see jQuery#getSelectedText
	 *
	 * @namespace
	 * @alias module:sap/ui/dom/jquery/getSelectedText
	 * @public
	 */

	/**
	 * Retrieve the selected text in the first element of the collection.
	 *
	 * <b>Note</b>: This feature is only supported for input element’s type of text, search, url, tel and password.
	 *
	 * @return {string} The selected text.
	 * @public
	 * @name jQuery#getSelectedText
	 * @author SAP SE
	 * @since 1.26.0
	 * @function
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


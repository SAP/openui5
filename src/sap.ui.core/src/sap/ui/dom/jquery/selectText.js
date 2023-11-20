/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#selectText} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/selectText
	 * @public
	 * @since 1.58
	 */

	/**
	 * Sets the text selection in the first element of the collection.
	 *
	 * <b>Note</b>: This feature is only supported for input element’s type of text, search, url, tel and password.
	 *
	 * @param {int} iStart Start position of the selection (inclusive)
	 * @param {int} iEnd End position of the selection (exclusive)
	 * @return {jQuery} The jQuery collection
	 * @public
	 * @name jQuery#selectText
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/selectText
	 */
	var fnSelectText = function selectText(iStart, iEnd) {
		var oDomRef = this.get(0);

		try {
			// In Chrome 58 and above selection start is set to selection end when the first parameter of a setSelectionRange call is negative.
			if (typeof (oDomRef.selectionStart) === "number") {
				oDomRef.setSelectionRange(iStart > 0 ? iStart : 0, iEnd);
			}
		} catch (e) {
			// note: some browsers fail to read the "selectionStart" and "selectionEnd" properties from HTMLInputElement, e.g.: The input element's type "number" does not support selection.
		}

		return this;
	};

	jQuery.fn.selectText = fnSelectText;

	return jQuery;

});


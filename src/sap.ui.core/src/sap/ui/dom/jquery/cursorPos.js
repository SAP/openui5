/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#cursorPos} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/cursorPos
	 * @public
	 * @since 1.58
	 */

	/**
	 * Sets or gets the position of the cursor in an element that supports cursor positioning.
	 *
	 * @param {int} iPos The cursor position to set (or no parameter to retrieve the cursor position)
	 * @return {int | jQuery} The cursor position (or the jQuery collection if the position has been set)
	 * @public
	 * @name jQuery#cursorPos
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/cursorPos
	 */
	var fnCursorPos = function cursorPos(iPos) {
		var len = arguments.length,
			sTagName,
			sType;

		sTagName = this.prop("tagName");
		sType = this.prop("type");

		if ( this.length === 1 && ((sTagName == "INPUT" && (sType == "text" || sType == "password" || sType == "search"))
				|| sTagName == "TEXTAREA" )) {

			var oDomRef = this.get(0);

			if (len > 0) { // SET

				if (typeof (oDomRef.selectionStart) == "number") {
					oDomRef.focus();
					oDomRef.selectionStart = iPos;
					oDomRef.selectionEnd = iPos;
				}

				return this;
				// end of SET

			} else { // GET
				if (typeof (oDomRef.selectionStart) == "number") {
					return oDomRef.selectionStart;
				}
				return -1;
			} // end of GET
		} else {
			// shouldn't really happen, but to be safe...
			return this;
		}
	};

	jQuery.fn.cursorPos = fnCursorPos;

	return jQuery;

});


/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function(jQuery) {
	"use strict";

	/**
	 * Checks whether an Element is invisible for the end user.
	 *
	 * This is a combination of jQuery's :hidden selector (but with a slightly
	 * different semantic, see below) and a check for CSS visibility 'hidden'.
	 *
	 * Since jQuery 2.x, inline elements, such as span, might be considered 'visible'
	 * although they have zero dimensions (for example, an empty span). In jQuery 1.x, such
	 * elements had been treated as 'hidden'.
	 *
	 * As some UI5 controls rely on the old behavior, this method restores it.
	 *
	 * @param {Element} oElem Element to check the dimensions for
	 * @returns {boolean} Whether the Element either has only zero dimensions or has visibility:hidden (CSS)
	 * @alias module:sap/ui/dom/isHidden
	 * @since 1.72
	 * @private
	 * @ui5-restricted
	 */
	function isHidden(oElem) {
		return (oElem.offsetWidth <= 0 && oElem.offsetHeight <= 0) || jQuery.css(oElem, 'visibility') === 'hidden';
	}

	return isHidden;

});


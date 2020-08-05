/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * Returns whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>.
	 *
	 * This is a browser-independent version of the <code>.contains</code> method of Internet Explorer.
	 * For compatibility reasons it returns <code>true</code> if <code>oDomRefContainer</code> and
	 * <code>oDomRefChild</code> are equal.
	 *
	 * This method intentionally does not operate on the jQuery object, as the original <code>jQuery.contains()</code>
	 * method also does not do so.
	 *
	 * @function
	 * @since 1.58
	 * @param {Element} oDomRefContainer The container element
	 * @param {Element} oDomRefChild The child element (must not be a text node, must be an element)
	 * @return {boolean} Whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>
	 * @public
	 * @alias module:sap/ui/dom/containsOrEquals
	 */
	var fnContainsOrEquals = function(oDomRefContainer, oDomRefChild) {
		if (oDomRefChild && oDomRefContainer && oDomRefChild != document && oDomRefChild != window) {
			return (oDomRefContainer === oDomRefChild) || jQuery.contains(oDomRefContainer, oDomRefChild);
		}
		return false;
	};
	return fnContainsOrEquals;

});
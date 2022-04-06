/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Returns whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>.
	 *
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
			return oDomRefContainer.contains(oDomRefChild); //native a.contains(b) also returns true if a === b
		}
		return false;
	};
	return fnContainsOrEquals;

});

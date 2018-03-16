/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Calls focus() on the given DOM element.
	 *
	 * @function
	 * @param {Element} oDomRef The DOM element to focus (or null - in this case the method does nothing)
	 * @return {boolean} Whether the focus() command was executed without an error
	 * @private
	 * @exports sap/ui/dom/focus
	 */
	var fnFocus = function focus(oDomRef) {
		if (!oDomRef) {
			return;
		}
		oDomRef.focus();
		return true;
	};

	return fnFocus;

});


/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/**
	 * Returns <code>true</code> if the first element has a set tabindex.
	 *
	 * @param {object} oElem The element to check
	 * @return {boolean} If the first element has a set tabindex
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/hasTabIndex
	 */
	var fnHasTabIndex = function(oElem) {

		var iTabIndex = jQuery.prop(oElem, "tabIndex");

		// compensate for 'specialties' in the implementation of jQuery.prop:
		// - it returns undefined for text, comment and attribute nodes
		// - when calculating an implicit tabindex for focusable/clickable elements, it ignores the 'disabled' attribute
		return iTabIndex != null && iTabIndex >= 0 &&
			( !jQuery.attr(oElem, "disabled") || jQuery.attr(oElem, "tabindex") );

	};

	jQuery.fn.hasTabIndex = function() {
		return fnHasTabIndex(this.get(0));
	};

	return jQuery;

});


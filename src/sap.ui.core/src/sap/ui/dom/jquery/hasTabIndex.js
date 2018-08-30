/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#hasTabIndex} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/hasTabIndex
	 * @public
	 * @since 1.58
	 */

	/**
	 * Returns <code>true</code> if the first element has a set tabindex.
	 *
	 * @return {boolean} If the first element has a set tabindex
	 * @public
	 * @name jQuery#hasTabIndex
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/hasTabIndex
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


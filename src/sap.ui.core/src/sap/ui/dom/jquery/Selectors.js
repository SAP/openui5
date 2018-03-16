/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	// Using "Object.getOwnPropertyDescriptor" to not trigger the "getter" - see jquery.sap.stubs
	function getValue(oTarget, sProperty) {
		var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
		return descriptor && descriptor.value;
	}

	/*!
	 * The following functions are taken from jQuery UI 1.8.17 but modified
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI
	 */
	function visible( element ) {
		// check if one of the parents (until it's position parent) is invisible
		// prevent that elements in static area are always checked as invisible

		// list all items until the offsetParent item (with jQuery >1.6 you can use parentsUntil)
		var oOffsetParent = jQuery(element).offsetParent();
		var bOffsetParentFound = false;
		var $refs = jQuery(element).parents().filter(function() {
			if (this === oOffsetParent) {
				bOffsetParentFound = true;
			}
			return bOffsetParentFound;
		});

		// check for at least one item to be visible
		return !jQuery(element).add($refs).filter(function() {
			return jQuery.css( this, "visibility" ) === "hidden" || jQuery.expr.filters.hidden( this );
		}).length;
	}


	function focusable( element, isTabIndexNotNaN ) {
		var nodeName = element.nodeName.toLowerCase();
		if ( nodeName === "area" ) {
			var map = element.parentNode,
				mapName = map.name,
				img;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = jQuery( "img[usemap='#" + mapName + "']" )[0];
			return !!img && visible( img );
		}
		/*eslint-disable no-nested-ternary */
		return ( /input|select|textarea|button|object/.test( nodeName )
				? !element.disabled
				: nodeName == "a"
					? element.href || isTabIndexNotNaN
					: isTabIndexNotNaN)
			// the element and all of its ancestors must be visible
			&& visible( element );
		/*eslint-enable no-nested-ternary */
	}


	if (!getValue(jQuery.expr[":"], "focusable")) {
		/*!
		 * The following function is taken from jQuery UI 1.8.17
		 *
		 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 * http://jquery.org/license
		 *
		 * http://docs.jquery.com/UI
		 *
		 * But since visible is modified, focusable is different too the jQuery UI version too.
		 */

		/*
		 * This defines the jQuery ":focusable" selector; it is also defined in jQuery UI. If already present, nothing is
		 * done here, so we will not overwrite any previous implementation.
		 * If jQuery UI is loaded later on, this implementation here will be overwritten by that one, which is fine,
		 * as it is semantically the same thing and intended to do exactly the same.
		 */
		jQuery.expr[ ":" ].focusable = function( element ) {
			return focusable( element, !isNaN( jQuery.attr( element, "tabindex" ) ) );
		};
	}

	if (!getValue(jQuery.expr[":"], "sapTabbable")) {
		/*!
		 * The following function is taken from
		 * jQuery UI Core 1.11.1
		 * http://jqueryui.com
		 *
		 * Copyright 2014 jQuery Foundation and other contributors
		 * Released under the MIT license.
		 * http://jquery.org/license
		 *
		 * http://api.jqueryui.com/category/ui-core/
		 */

		/*
		 * This defines the jQuery ":tabbable" selector; it is also defined in jQuery UI. If already present, nothing is
		 * done here, so we will not overwrite any previous implementation.
		 * If jQuery UI is loaded later on, this implementation here will be overwritten by that one, which is fine,
		 * as it is semantically the same thing and intended to do exactly the same.
		 */
		jQuery.expr[ ":" ].sapTabbable = function( element ) {
			var tabIndex = jQuery.attr( element, "tabindex" ),
				isTabIndexNaN = isNaN( tabIndex );
			return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
		};
	}

	if (!getValue(jQuery.expr[":"], "sapFocusable")) {
		/*!
		 * Do not use jQuery UI focusable because this might be overwritten if jQuery UI is loaded
		 */

		/*
		 * This defines the jQuery ":sapFocusable" selector; If already present, nothing is
		 * done here, so we will not overwrite any previous implementation.
		 * If jQuery UI is loaded later on, this implementation here will NOT be overwritten by.
		 */
		jQuery.expr[ ":" ].sapFocusable = function( element ) {
			return focusable( element, !isNaN( jQuery.attr( element, "tabindex" ) ) );
		};
	}

	return jQuery;
});

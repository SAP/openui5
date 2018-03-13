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

	if (!getValue(jQuery.fn, "zIndex")) {
		/*
		 * Get the z-index for an element.
		 *
		 * @function
		 * @param {Integer} zIndex The z-index to set
		 * @returns {number} The z-index
		 * @exports sap/ui/dom/jquery/zIndex
		 * @private
		 */
		var fnzIndex = function( zIndex ) {
			if ( zIndex !== undefined ) {
				return this.css( "zIndex", zIndex );
			}

			if ( this.length ) {
				var elem = jQuery( this[ 0 ] ), position, value;
				while ( elem.length && elem[ 0 ] !== document ) {
					// Ignore z-index if position is set to a value where z-index is ignored by the browser
					// This makes behavior of this function consistent across browsers
					// WebKit always returns auto if the element is positioned
					position = elem.css( "position" );
					if ( position === "absolute" || position === "relative" || position === "fixed" ) {
						// IE returns 0 when zIndex is not specified
						// other browsers return a string
						// we ignore the case of nested elements with an explicit value of 0
						// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
						value = parseInt( elem.css( "zIndex" ), 10 );
						if ( !isNaN( value ) && value !== 0 ) {
							return value;
						}
					}
					elem = elem.parent();
				}
			}

			return 0;
		};
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
		 * @deprecated since 1.48 use {@link sap/ui/dom/jquery/zIndex} instead
		 */
		jQuery.fn.zIndex = fnzIndex;
	}

	return jQuery;
});


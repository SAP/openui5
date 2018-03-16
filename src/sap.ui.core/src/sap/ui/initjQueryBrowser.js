/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {

	"use strict";

	return function() {
		// TODO move to a separate module? Only adds 385 bytes (compressed), but...
		if ( !jQuery.browser ) {
			// re-introduce the jQuery.browser support if missing (jQuery-1.9ff)
			jQuery.browser = (function( ua ) {

				var rwebkit = /(webkit)[ \/]([\w.]+)/,
					ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
					rmsie = /(msie) ([\w.]+)/,
					rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
					ua = ua.toLowerCase(),
					match = rwebkit.exec( ua ) ||
						ropera.exec( ua ) ||
						rmsie.exec( ua ) ||
						ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
						[],
					browser = {};

				if ( match[1] ) {
					browser[ match[1] ] = true;
					browser.version = match[2] || "0";
					if ( browser.webkit ) {
						browser.safari = true;
					}
				}

				return browser;

			}(window.navigator.userAgent));
		}
	};

});
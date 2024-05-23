/*!
 * jQuery UI Effects Fade 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fade-effect/
 *
 * Depends:
 *	jquery.ui.effect.js
 */
// ##### BEGIN: MODIFIED BY SAP
sap.ui.define(["sap/ui/thirdparty/jquery"], (jQuery) => {
	// ##### END: MODIFIED BY SAP
	(function( $, undefined ) {

	$.effects.effect.fade = function( o, done ) {
		var el = $( this ),
			mode = $.effects.setMode( el, o.mode || "toggle" );

		el.animate({
			opacity: mode
		}, {
			queue: false,
			duration: o.duration,
			easing: o.easing,
			complete: done
		});
	};

	})( jQuery );
	// ##### BEGIN: MODIFIED BY SAP
	return jQuery;
});
// ##### END: MODIFIED BY SAP
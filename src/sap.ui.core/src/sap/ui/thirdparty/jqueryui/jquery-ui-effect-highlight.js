/*!
 * jQuery UI Effects Highlight 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/highlight-effect/
 *
 * Depends:
 *	jquery.ui.effect.js
 */
// ##### BEGIN: MODIFIED BY SAP
sap.ui.define(["sap/ui/thirdparty/jquery"], (jQuery) => {
	// ##### END: MODIFIED BY SAP
	(function( $, undefined ) {

	$.effects.effect.highlight = function( o, done ) {
		var elem = $( this ),
			props = [ "backgroundImage", "backgroundColor", "opacity" ],
			mode = $.effects.setMode( elem, o.mode || "show" ),
			animation = {
				backgroundColor: elem.css( "backgroundColor" )
			};

		if (mode === "hide") {
			animation.opacity = 0;
		}

		$.effects.save( elem, props );

		elem
			.show()
			.css({
				backgroundImage: "none",
				backgroundColor: o.color || "#ffff99"
			})
			.animate( animation, {
				queue: false,
				duration: o.duration,
				easing: o.easing,
				complete: function() {
					if ( mode === "hide" ) {
						elem.hide();
					}
					$.effects.restore( elem, props );
					done();
				}
			});
	};

	})(jQuery);
	// ##### BEGIN: MODIFIED BY SAP
	return jQuery;
});
// ##### END: MODIFIED BY SAP
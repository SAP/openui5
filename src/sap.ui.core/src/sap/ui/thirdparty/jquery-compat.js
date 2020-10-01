/*!
 * jQuery Migrate - v3.3.1 - 2020-06-25T01:07Z
 * Copyright OpenJS Foundation and other contributors
 */
( function( factory ) {
	"use strict";
	// ##### BEGIN: MODIFIED BY SAP
	//if ( typeof define === "function" && define.amd ) {
	//
	//	// AMD. Register as an anonymous module.
	//	define( [ "jquery" ], function ( jQuery ) {
	//		return factory( jQuery, window );
	//	} );
	//} else if ( typeof module === "object" && module.exports ) {
	//
	//	// Node/CommonJS
	//	// eslint-disable-next-line no-undef
	//	module.exports = factory( require( "jquery" ), window );
	//} else {
	// Browser globals
	var oBootstrapScript = document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]');
	var oCfg = window['sap-ui-config'] || {};

	// Before the compat layer is applied, the following conditions are checked. If one of them is
	// matched, the application of the compat layer is excluded.
	// 1. check for URL parameter
	// 2. check for the attribute marker in the bootstrap
	// 3. check in the global configuration object
	if (/sap-ui-excludeJQueryCompat=(true|x)/.test(location.search)
		|| (oBootstrapScript && oBootstrapScript.getAttribute("data-sap-ui-excludejquerycompat") === "true")
		|| oCfg["excludejquerycompat"] === true || oCfg["excludeJQueryCompat"] === true) {
		return;
	}

	//Introduce namespace if it does not yet exist
	if (typeof window.sap !== "object" && typeof window.sap !== "function") {
		window.sap = {};
	}
	if (typeof window.sap.ui !== "object") {
		window.sap.ui = {};
	}

	// expose factory so the jQuery version delivered with UI5 can apply it later
	sap.ui._jQuery3Compat = {
		_factory: factory
	};

	// jQuery might be present already: apply factory directly
	if (window.jQuery) {
		factory( jQuery, window );
	}

	// }
	// ##### END: MODIFIED BY SAP
} )( function( jQuery, window ) {
"use strict";

jQuery.migrateVersion = "3.3.1";

// Returns 0 if v1 == v2, -1 if v1 < v2, 1 if v1 > v2
function compareVersions( v1, v2 ) {
	var i,
		rVersionParts = /^(\d+)\.(\d+)\.(\d+)/,
		v1p = rVersionParts.exec( v1 ) || [ ],
		v2p = rVersionParts.exec( v2 ) || [ ];

	for ( i = 1; i <= 3; i++ ) {
		if ( +v1p[ i ] > +v2p[ i ] ) {
			return 1;
		}
		if ( +v1p[ i ] < +v2p[ i ] ) {
			return -1;
		}
	}
	return 0;
}

function jQueryVersionSince( version ) {
	return compareVersions( jQuery.fn.jquery, version ) >= 0;
}


// ##### BEGIN: MODIFIED BY SAP
// Check the jquery version. If it's different than 3.5.1 but stays in the same major version 3.x.x, a warning is
// logged and the compatibility layer is still applied. If it has a different major version as 3.x.x, an error is
// logged and the application of the layer is skipped.
/* eslint-disable no-console */
if (jQueryVersionSince("3.0.0") && !jQueryVersionSince("4.0.0")) {
	if (jQuery.fn.jquery !== "3.5.1" && console) {
		console.warn("The current jQuery version " + jQuery.fn.jquery + " is different than the version 3.5.1 that is used for testing jquery-compat.js. jquery-compat.js is applied but it may not work properly.");
	}
} else {
	if (console) {
		console.error("The current jQuery version " + jQuery.fn.jquery + " differs at the major version than the version 3.5.1 that is used for testing jquery-compat.js. jquery-compat.js shouldn't be applied in this case!");
	}
	// skip the appliation of jquery compatibility layer
	return;
}
/* eslint-enable no-console */
// ##### END: MODIFIED BY SAP

var warnedAbout = {};

// By default each warning is only reported once.
// ##### BEGIN: MODIFIED BY SAP
// UI5 needs to report every warning occurance
jQuery.migrateDeduplicateWarnings = false;
// ##### END: MODIFIED BY SAP

// List of warnings already given; public read only
jQuery.migrateWarnings = [];
// ##### BEGIN: MODIFIED BY SAP
	/* eslint-disable no-console */
function migrateWarn( msg ) {
	var ui5logger;
	// delete the substring "removed" from the message because UI5 restores the removed
	// property or function and it's only deprecated
	msg = msg.replace(" and removed", "");

	if ( !jQuery.migrateDeduplicateWarnings || !warnedAbout[ msg ] ) {
		// we check for the availability of the UI5 logger, so we can use it's support rule functionality
		// the ui5logger has a different API than the window.console
		ui5logger = (sap && sap.ui && sap.ui.require) ? sap.ui.require("sap/base/Log") : false;

		warnedAbout[ msg ] = true;
		jQuery.migrateWarnings.push( msg );
		// we use the correct logger for each scenario, either:
		// [1] UI5 Logger available, or [2] jQuery + Compat-Layer standalone
		if (!jQuery.migrateMute) {
			msg = "JQMIGRATE: " + msg;
			if (ui5logger) { // [1]
				if (jQuery.migrateTrace) {
					ui5logger.setLevel(5);
				}
				ui5logger[jQuery.migrateTrace ? "trace" : "warning"](
					msg,
					// info for compat-deprecation support rule
					"jQueryThreeDeprecation",
					null,
					function() {
						return {
							type: "jQueryThreeDeprecation",
							name: "jquery-compat"
						};
					}
				);
			} else if ( console && console.warn ) { // [2]
				console.warn( msg );
				if ( jQuery.migrateTrace && console.trace ) {
					console.trace();
				}
			}
		}
	}
}

// expose warning function so we can use it from within jQuery to log UI5 migration warnings
sap.ui._jQuery3Compat._migrateWarn = migrateWarn;
/* eslint-enable no-console */
// ##### END: MODIFIED BY SAP

function migrateWarnProp( obj, prop, value, msg ) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			migrateWarn( msg );
			return value;
		},
		set: function( newValue ) {
			migrateWarn( msg );
			value = newValue;
		}
	} );
}

function migrateWarnFunc( obj, prop, newFunc, msg ) {
	obj[ prop ] = function() {
		migrateWarn( msg );
		return newFunc.apply( this, arguments );
	};
}

	// ##### BEGIN: MODIFIED BY SAP
var class2type = {},
	oldInit = jQuery.fn.init,

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
/**
 * jQuery Breaking change Table Row 9
 *
 * Restore the deleted jQuery.fn.context property
 *
 * The "context" property is set with the following logic:
 * * When the given selector is a DOM node, it's set with the DOM node
 * * When the given selector is a string but doesn't represents a DOM node, it's set with "document"
 * * All other cases, it's undefined
 *
 */
jQuery.fn.init = function( arg1 ) {
	var args = Array.prototype.slice.call( arguments );

	if ( typeof arg1 === "string" && arg1 === "#" ) {

		// JQuery( "#" ) is a bogus ID selector, but it returned an empty set before jQuery 3.0
		migrateWarn( "jQuery( '#' ) is not a valid selector" );
		args[ 0 ] = [];
	}

	var oRes = oldInit.apply( this, args );
	if ( args[ 0 ] ) {
		if ( args[ 0 ].nodeType ) { // selector is DOM Element
			oRes.context = args[ 0 ];
		} else if ( typeof args[ 0 ] === "string"
			&& !( args[ 0 ][ 0 ] === "<" &&
				args[ 0 ][ args[ 0 ].length - 1 ] === ">" &&
				args[ 0 ].length >= 3)) { // if the selector is a string and doesn't represents any DOM element
			oRes.context = window.document;
			}
		}
		return oRes;
// ##### END: MODIFIED BY SAP
};
jQuery.fn.init.prototype = jQuery.fn;


// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery Breaking Change Table Row 4
 *
 * Restore the deleted jQuery.fn.size() function by assigning it with jQuery.fn.length
 */
// ##### END: MODIFIED BY SAP
// The number of elements contained in the matched element set
migrateWarnFunc( jQuery.fn, "size", function() {
	return this.length;
},
"jQuery.fn.size() is deprecated and removed; use the .length property" );

migrateWarnFunc( jQuery, "parseJSON", function() {
	return JSON.parse.apply( null, arguments );
},
"jQuery.parseJSON is deprecated; use JSON.parse" );

migrateWarnFunc( jQuery, "holdReady", jQuery.holdReady,
	"jQuery.holdReady is deprecated" );

migrateWarnFunc( jQuery, "unique", jQuery.uniqueSort,
	"jQuery.unique is deprecated; use jQuery.uniqueSort" );

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos,
	"jQuery.expr.filters is deprecated; use jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos,
	"jQuery.expr[':'] is deprecated; use jQuery.expr.pseudos" );

// Prior to jQuery 3.1.1 there were internal refs so we don't warn there
if ( jQueryVersionSince( "3.1.1" ) ) {
	migrateWarnFunc( jQuery, "trim", function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},
	"jQuery.trim is deprecated; use String.prototype.trim" );
}

// Prior to jQuery 3.2 there were internal refs so we don't warn there
if ( jQueryVersionSince( "3.2.0" ) ) {
	migrateWarnFunc( jQuery, "nodeName", function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},
	"jQuery.nodeName is deprecated" );
}

if ( jQueryVersionSince( "3.3.0" ) ) {

	migrateWarnFunc( jQuery, "isNumeric", function( obj ) {

			// As of jQuery 3.0, isNumeric is limited to
			// strings and numbers (primitives or objects)
			// that can be coerced to finite numbers (gh-2662)
			var type = typeof obj;
			return ( type === "number" || type === "string" ) &&

				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, e.g. hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN( obj - parseFloat( obj ) );
		},
		"jQuery.isNumeric() is deprecated"
	);

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".
		split( " " ),
	function( _, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	migrateWarnFunc( jQuery, "type", function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ Object.prototype.toString.call( obj ) ] || "object" :
			typeof obj;
	},
	"jQuery.type is deprecated" );

	migrateWarnFunc( jQuery, "isFunction",
		function( obj ) {
			return typeof obj === "function";
		},
		"jQuery.isFunction() is deprecated" );

	migrateWarnFunc( jQuery, "isWindow",
		function( obj ) {
			return obj != null && obj === obj.window;
		},
		"jQuery.isWindow() is deprecated"
	);

	migrateWarnFunc( jQuery, "isArray", Array.isArray,
		"jQuery.isArray is deprecated; use Array.isArray"
	);
}

// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

var oldAjax = jQuery.ajax;

jQuery.ajax = function( ) {
	var jQXHR = oldAjax.apply( this, arguments );

	// Be sure we got a jQXHR (e.g., not sync)
	if ( jQXHR.promise ) {
		migrateWarnFunc( jQXHR, "success", jQXHR.done,
			"jQXHR.success is deprecated and removed" );
		migrateWarnFunc( jQXHR, "error", jQXHR.fail,
			"jQXHR.error is deprecated and removed" );
		migrateWarnFunc( jQXHR, "complete", jQXHR.always,
			"jQXHR.complete is deprecated and removed" );
	}

	return jQXHR;
};

}

var oldRemoveAttr = jQuery.fn.removeAttr,
	oldToggleClass = jQuery.fn.toggleClass,
	rmatchNonSpace = /\S+/g;

jQuery.fn.removeAttr = function( name ) {
	var self = this;

	jQuery.each( name.match( rmatchNonSpace ), function( _i, attr ) {
		if ( jQuery.expr.match.bool.test( attr ) ) {
			migrateWarn( "jQuery.fn.removeAttr no longer sets boolean properties: " + attr );
			self.prop( attr, false );
		}
	} );

	return oldRemoveAttr.apply( this, arguments );
};

jQuery.fn.toggleClass = function( state ) {

	// Only deprecating no-args or single boolean arg
	if ( state !== undefined && typeof state !== "boolean" ) {
		return oldToggleClass.apply( this, arguments );
	}

	migrateWarn( "jQuery.fn.toggleClass( boolean ) is deprecated" );

	// Toggle entire class name of each element
	return this.each( function() {
		var className = this.getAttribute && this.getAttribute( "class" ) || "";

		if ( className ) {
			jQuery.data( this, "__className__", className );
		}

		// If the element has a class name or if we're passed `false`,
		// then remove the whole classname (if there was one, the above saved it).
		// Otherwise bring back whatever was previously saved (if anything),
		// falling back to the empty string if nothing was stored.
		if ( this.setAttribute ) {
			this.setAttribute( "class",
				className || state === false ?
				"" :
				jQuery.data( this, "__className__" ) || ""
			);
		}
	} );
};

function camelCase( string ) {
	return string.replace( /-([a-z])/g, function( _, letter ) {
		return letter.toUpperCase();
	} );
}

var oldFnCss,
	ralphaStart = /^[a-z]/,

	// The regex visualized:
	//
	//                         /----------\
	//                        |            |    /-------\
	//                        |  / Top  \  |   |         |
	//         /--- Border ---+-| Right  |-+---+- Width -+---\
	//        |                 | Bottom |                    |
	//        |                  \ Left /                     |
	//        |                                               |
	//        |                              /----------\     |
	//        |          /-------------\    |            |    |- END
	//        |         |               |   |  / Top  \  |    |
	//        |         |  / Margin  \  |   | | Right  | |    |
	//        |---------+-|           |-+---+-| Bottom |-+----|
	//        |            \ Padding /         \ Left /       |
	// BEGIN -|                                               |
	//        |                /---------\                    |
	//        |               |           |                   |
	//        |               |  / Min \  |    / Width  \     |
	//         \--------------+-|       |-+---|          |---/
	//                           \ Max /       \ Height /
	rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;


// ##### BEGIN: MODIFIED BY SAP
/* global Proxy, Reflect */
// ##### END: MODIFIED BY SAP
if ( typeof Proxy !== "undefined" ) {
	jQuery.cssProps = new Proxy( jQuery.cssProps || {}, {
		set: function() {
			// ##### BEGIN: MODIFIED BY SAP
			// removed 'JQMIGRATE' string part
			migrateWarn( "jQuery.cssProps is deprecated" );
			// ##### END: MODIFIED BY SAP
			return Reflect.set.apply( this, arguments );
		}
		} );
	}

function isAutoPx( prop ) {

	// The first test is used to ensure that:
	// 1. The prop starts with a lowercase letter (as we uppercase it for the second regex).
	// 2. The prop is not empty.
	return ralphaStart.test( prop ) &&
		rautoPx.test( prop[ 0 ].toUpperCase() + prop.slice( 1 ) );
}

oldFnCss = jQuery.fn.css;

jQuery.fn.css = function( name, value ) {
	var camelName,
		origThis = this;
	if ( name && typeof name === "object" && !Array.isArray( name ) ) {
		jQuery.each( name, function( n, v ) {
			jQuery.fn.css.call( origThis, n, v );
		} );
	}
	if ( typeof value === "number" ) {
		camelName = camelCase( name );
		if ( !isAutoPx( camelName ) && !jQuery.cssNumber[ camelName ] ) {
			migrateWarn( "Number-typed values are deprecated for jQuery.fn.css( \"" +
				name + "\", value )" );
		}
	}

	return oldFnCss.apply( this, arguments );
};

// Support jQuery slim which excludes the effects module
if ( jQuery.fx ) {


var intervalValue, intervalMsg;
intervalValue = jQuery.fx.interval || 13;
intervalMsg = "jQuery.fx.interval is deprecated";

// Support: IE9, Android <=4.4
// Avoid false positives on browsers that lack rAF
// Don't warn if document is hidden, jQuery uses setTimeout (#292)
if ( window.requestAnimationFrame ) {
	Object.defineProperty( jQuery.fx, "interval", {
		configurable: true,
		enumerable: true,
		get: function() {
			if ( !window.document.hidden ) {
				migrateWarn( intervalMsg );
			}
			return intervalValue;
		},
		set: function( newValue ) {
			migrateWarn( intervalMsg );
			intervalValue = newValue;
		}
	} );
}

}

var oldLoad = jQuery.fn.load,
	oldEventAdd = jQuery.event.add,
	originalFix = jQuery.event.fix;

// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery Breaking Change Table Row 15
 *
 * Restore the deleted jQuery.event.props and jQuery.event.fixHooks properties
 */
// ##### END: MODIFIED BY SAP
jQuery.event.props = [];
jQuery.event.fixHooks = {};

migrateWarnProp( jQuery.event.props, "concat", jQuery.event.props.concat,
	"jQuery.event.props.concat() is deprecated and removed" );

jQuery.event.fix = function( originalEvent ) {
	var event,
		type = originalEvent.type,
		fixHook = this.fixHooks[ type ],
		props = jQuery.event.props;

	if ( props.length ) {
		migrateWarn( "jQuery.event.props are deprecated and removed: " + props.join() );
		while ( props.length ) {
			jQuery.event.addProp( props.pop() );
		}
	}

	if ( fixHook && !fixHook._migrated_ ) {
		fixHook._migrated_ = true;
		migrateWarn( "jQuery.event.fixHooks are deprecated and removed: " + type );
		if ( ( props = fixHook.props ) && props.length ) {
			while ( props.length ) {
				jQuery.event.addProp( props.pop() );
			}
		}
	}

	event = originalFix.call( this, originalEvent );

	return fixHook && fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
};

jQuery.event.add = function( elem, types ) {

	// This misses the multiple-types case but that seems awfully rare
	if ( elem === window && types === "load" && window.document.readyState === "complete" ) {
		migrateWarn( "jQuery(window).on('load'...) called after load event occurred" );
	}
	return oldEventAdd.apply( this, arguments );
};

jQuery.each( [ "load", "unload", "error" ], function( _, name ) {

	jQuery.fn[ name ] = function() {
		var args = Array.prototype.slice.call( arguments, 0 );

		// If this is an ajax load() the first arg should be the string URL;
		// technically this could also be the "Anything" arg of the event .load()
		// which just goes to show why this dumb signature has been deprecated!
		// jQuery custom builds that exclude the Ajax module justifiably die here.
		if ( name === "load" && typeof args[ 0 ] === "string" ) {
			return oldLoad.apply( this, args );
		}

		migrateWarn( "jQuery.fn." + name + "() is deprecated" );

		args.splice( 0, 0, name );
		if ( arguments.length ) {
			return this.on.apply( this, args );
		}

		// Use .triggerHandler here because:
		// - load and unload events don't need to bubble, only applied to window or image
		// - error event should not bubble to window, although it does pre-1.7
		// See http://bugs.jquery.com/ticket/11820
		this.triggerHandler.apply( this, args );
		return this;
	};

} );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		migrateWarn( "jQuery.fn." + name + "() event shorthand is deprecated" );
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

// Trigger "ready" event only once, on document ready
jQuery( function() {
	jQuery( window.document ).triggerHandler( "ready" );
} );

jQuery.event.special.ready = {
	setup: function() {
		if ( this === window.document ) {
			migrateWarn( "'ready' event is deprecated" );
		}
	}
};

jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		migrateWarn( "jQuery.fn.bind() is deprecated" );
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		migrateWarn( "jQuery.fn.unbind() is deprecated" );
		return this.off( types, null, fn );
	},
	delegate: function( selector, types, data, fn ) {
		migrateWarn( "jQuery.fn.delegate() is deprecated" );
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		migrateWarn( "jQuery.fn.undelegate() is deprecated" );
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},
	hover: function( fnOver, fnOut ) {
		migrateWarn( "jQuery.fn.hover() is deprecated" );
		return this.on( "mouseenter", fnOver ).on( "mouseleave", fnOut || fnOver );
	}
} );


// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery Breaking Change Table Row 14
 *
 * Restore the old behavior of jQuery.fn.offset that it doesn't throw an error when the jQuery object
 * doesn't contain any valid DOM element.
 */
// ##### END: MODIFIED BY SAP
var oldOffset = jQuery.fn.offset;

jQuery.fn.offset = function() {
	var elem = this[ 0 ];

	if ( elem && ( !elem.nodeType || !elem.getBoundingClientRect ) ) {
		migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
		return arguments.length ? this : undefined;
	}

	return oldOffset.apply( this, arguments );
};

// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery Breaking Change Table Row 13
 *
 * Restore the deleted jQuery.fn.andSelf() function by assigning it with jQuery.fn.addBack()
 */
// ##### END: MODIFIED BY SAP
var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;

jQuery.fn.andSelf = function() {
	migrateWarn( "jQuery.fn.andSelf() is deprecated and removed, use jQuery.fn.addBack()" );
	return oldSelf.apply( this, arguments );
};
// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery.Deferred
 *  - add migration warning to "pipe" method
 *  - patch "then" with "pipe" to restore the sync resolve of the given function to the method
 *  - don't patch "catch" because it's a new method since jQuery 3
 */
// ##### END: MODIFIED BY SAP
var oldDeferred = jQuery.Deferred,
	tuples = [

		// Action, add listener, callbacks, .then handlers, final state
		[ "resolve", "done", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "resolved" ],
		[ "reject", "fail", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "rejected" ],
		[ "notify", "progress", jQuery.Callbacks( "memory" ),
			jQuery.Callbacks( "memory" ) ]
	];

jQuery.Deferred = function( func ) {
	var deferred = oldDeferred(),
		promise = deferred.promise();

	// ##### BEGIN: MODIFIED BY SAP
	// Add the possibility to give the third parameter with a boolean value to indicates whether the warning
	// should be suppressed because the .then method calls the .pipe method internally which shouldn't cause
	// any warning to be logged.
	deferred.pipe = promise.pipe = function( /* fnDone, fnFail, fnProgress/bSuppressWarning */ ) {
		var fns = arguments;
		if (typeof arguments[2] !== "boolean" || !arguments[2]) {
			migrateWarn( "deferred.pipe() is deprecated" );
		}
	// ##### END: MODIFIED BY SAP
		return jQuery.Deferred( function( newDefer ) {
			jQuery.each( tuples, function( i, tuple ) {
				var fn = typeof fns[ i ] === "function" && fns[ i ];

				// Deferred.done(function() { bind to newDefer or newDefer.resolve })
				// deferred.fail(function() { bind to newDefer or newDefer.reject })
				// deferred.progress(function() { bind to newDefer or newDefer.notify })
				deferred[ tuple[ 1 ] ]( function() {
					var returned = fn && fn.apply( this, arguments );
					if ( returned && typeof returned.promise === "function" ) {
						returned.promise()
							.done( newDefer.resolve )
							.fail( newDefer.reject )
							.progress( newDefer.notify );
					} else {
						newDefer[ tuple[ 0 ] + "With" ](
							this === promise ? newDefer.promise() : this,
							fn ? [ returned ] : arguments
						);
					}
				} );
			} );
			fns = null;
		} ).promise();

	};

	// ##### BEGIN: MODIFIED BY SAP
	/**
	 * jQuery Breaking Change Table Row 7 and 8
	 *
	 * Call the functions that are given to "then" synchronously and provide them with a "this" context
	 * pointing to the "promise" object under the jQuery.Deferred instance.
	 *
	 */
	// patch the "then" method with "pipe" to restore the sync resolve of "then"
	deferred.then = promise.then = function() {
		// The "pipe" function accepts a third parameter which isn't supported by the "then" method.
		// Therefore only the first two parameters are forwarded to the pipe function.
		return deferred.pipe(arguments[0], arguments[1], true /* suppress warning log */);
	};
	// patch the following function with a "this" context of the promise from the deferred object
	deferred.notify = function() {
		deferred.notifyWith(this === deferred ? promise : this, arguments);
		return this;
	};
	deferred.resolve = function() {
		deferred.resolveWith(this === deferred ? promise : this, arguments);
		return this;
	};
	deferred.reject = function() {
		deferred.rejectWith(this === deferred ? promise : this, arguments);
		return this;
	};
	// ##### END: MODIFIED BY SAP
	if ( func ) {
		func.call( deferred, deferred );
	}

	return deferred;
};

// Preserve handler of uncaught exceptions in promise chains
jQuery.Deferred.exceptionHook = oldDeferred.exceptionHook;

// ##### BEGIN: MODIFIED BY SAP
/**
 * jQuery Breaking Change Table Row 1 and 2
 *
 * Patch the following functions:
 *
 *  - jQuery.fn.innerHeight
 *  - jQuery.fn.height
 *  - jQuery.fn.outerHeight
 *  - jQuery.fn.innerWidth
 *  - jQuery.fn.width
 *  - jQuery.fn.outerWidth
 *
 *  to
 *
 *  - Valid jQuery element set:
 *     - When the function is called as a getter (without parameter given): return integer instead of float
 *     - When the function is called as a setter: the return value isn't adapted
 *  - Empty jQuery element set:
 *     - When the function is called as a getter (without parameter given): return null instead of undefined
 *     - When the function is called as a setter: return 'this' (the empty jQuery object)
 *
 */
var mOrigMethods = {},
	aMethods = ["innerHeight", "height", "outerHeight", "innerWidth", "width", "outerWidth"];
aMethods.forEach(function(sName) {
	mOrigMethods[sName] = jQuery.fn[sName];
	jQuery.fn[sName] = function() {
		var vRes = mOrigMethods[sName].apply(this, arguments);

		// return null instead of undefined for empty element sets
		if (vRes === undefined && this.length === 0) {
			return null;
		} else {
			// Round the pixel value
			if (typeof vRes === "number") {
				vRes = Math.round(vRes);
			}
			return vRes;
		}
	};
});
// ##### END: MODIFIED BY SAP
} );

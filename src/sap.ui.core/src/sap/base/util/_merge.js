/*!
 * ${copyright}
 */
sap.ui.define(["./isPlainObject"], function(isPlainObject) {
	"use strict";

	var oToken = Object.create(null);

	/**
	 * Performs object extension by merging source objects into a target object.
	 *
	 * @example
	 * var oMerged = _merge(true, false, {}, {prop1:1}, {prop2:2});
	 *
	 * @function
	 * @since 1.71
	 * @private
	 * @alias module:sap/base/util/_merge
	 * @param {boolean} deep Shallow copy or deep merge
	 * @param {boolean} skipUndefined Whether <code>undefined</code> values will be skipped, otherwise <code>undefined</code> values will overwrite existing values
	 * @param {object} target The object that will receive new properties
	 * @param {...object} [source] One or more objects which get merged into the target object
	 * @return {object} the target object which is the result of the merge
	 */
	var fnMerge = function() {
		/*
		 * The code in this function is taken from jQuery 2.2.3 "jQuery.extend" and got modified.
		 *
		 * jQuery JavaScript Library v2.2.3
		 * http://jquery.com/
		 *
		 * Copyright jQuery Foundation and other contributors
		 * Released under the MIT license
		 * http://jquery.org/license
		 */
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[2] || {},
			i = 3,
			length = arguments.length,
			deep = arguments[0] || false,
			skipToken = arguments[1] ? undefined : oToken;

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && typeof target !== "function") {
			target = {};
		}

		for ( ; i < length; i++ ) {
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					// Prevent Object.prototype pollution for $.extend( true, ... )
					// For further information, please visit https://github.com/jquery/jquery/pull/4333
					if ( name === "__proto__" || target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray( src ) ? src : [];

						} else {
							clone = src && isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = fnMerge( deep, arguments[1], clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== skipToken ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};
	return fnMerge;
});
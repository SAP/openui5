/*!
 * ${copyright}
 */
sap.ui.define(["./isPlainObject"], function(isPlainObject) {
	"use strict";

	/**
	 * Performs object extension by merging source objects into a target object. Copies are always deep.
	 *
	 * If during merging a key in the target object exists it is overwritten with the source object's value.
	 * Usage is the same as jQuery.extend(true, ...), but Arguments that are null or undefined are NOT ignored.
	 *
	 * For shallow copies, you may use <code>Object.assign</code> (polyfilled).
	 * @example
	 * var oMerged = merge({}, {prop1:1}, {prop2:2});
	 *
	 * @function
	 * @since 1.58
	 * @public
	 * @alias module:sap/base/util/merge
	 * @param {Object} target The object that will receive new properties
	 * @param {...Object} [source] One or more objects which get merged into the target object
	 * @returns {Object} the target object which is the result of the merge
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
			target = arguments[0] || {},
			i = 1,
			length = arguments.length;

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && typeof target !== "function") {
			target = {};
		}

		for (; i < length; i++) {

			options = arguments[i];

			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) )) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = fnMerge(clone, copy);

				} else {
					target[name] = copy;
				}
			}
		}

		// Return the modified object
		return target;
	};
	return fnMerge;
});
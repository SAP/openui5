/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["./isPlainObject"], function(isPlainObject) {
	"use strict";

	// @evo-todo create different APIs for deep and shallow extend, make shallow extend simpler

	/**
	 * Performs object extension by merging source objects into a target object. Supports deep and shallow copies.
	 *
	 * When during merging a key in the target object exists it is overwritten with the source object's value.
	 * Usage is the same as jQuery.extend, but Arguments that are null or undefined are NOT ignored.
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/extend
	 * @param {boolean} [deep=false] first argument, which performs:
	 *      a deep copy if <code>true</code>
	 *      a shallow copy if <code>false</code>
	 *      a shallow copy if left out
	 * @param {Object} target The object that will recieve new properties
	 * @param {Object|Object[]} [source] One or more objects which get merged into the target object
	 * @returns {Object} the target object which is the result of the merge
	 * @example
	 * deep:    var oMerged = extend(true, {}, {prop1:1}, {prop2:2});
	 * shallow: var oMerged = extend(false, {}, {prop1:1}, {prop2:2});
	 *          var oMerged = extend({}, {prop1:1}, {prop2:2});
	 */
	var fnExtend = function() {
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;

			// skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

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
				if (deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) )) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = fnExtend(deep, clone, copy);

				} else {
					target[name] = copy;
				}
			}
		}

		// Return the modified object
		return target;
	};
	return fnExtend;
});
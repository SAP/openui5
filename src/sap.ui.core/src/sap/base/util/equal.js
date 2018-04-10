/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global Node */

//@evo-todo check isEqualNode dependency: not yet available...
//@evo-todo dependency to global name 'Node' contradicts sap/base package

sap.ui.define([], function() {
	"use strict";

	/**
	 * Compares the two given values for equality, especially takes care not to compare
	 * arrays and objects by reference, but compares their content.
	 * Note: function does not work with comparing XML objects
	 *
	 * @function
	 * @param {any} a A value of any type
	 * @param {any} b A value of any type
	 * @param {int} [maxDepth=10] Maximum recursion depth
	 * @param {boolean} [contains] Whether all existing properties in a are equal as in b
	 * @exports sap/base/util/equal
	 * @return {boolean} Whether a and b are equal
	 * @private
	 */
	var fnEqual = function(a, b, maxDepth, contains, depth) {
		// Optional parameter normalization
		if (typeof maxDepth == "boolean") {
			contains = maxDepth;
			maxDepth = undefined;
		}
		if (!depth) {
			depth = 0;
		}
		if (!maxDepth) {
			maxDepth = 10;
		}
		if (depth > maxDepth) {
			return false;
		}
		if (a === b) {
			return true;
		}

		// Number.isNaN is not supported by IE11, so we need to fall back on the verbose implementation
		var bIsReallyNaN = (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b));
		if (bIsReallyNaN) {
			return true;
		}

		if (Array.isArray(a) && Array.isArray(b)) {
			if (!contains && a.length !== b.length) {
				return false;
			}
			if (a.length > b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
						return false;
				}
			}
			return true;
		}
		if (typeof a == "object" && typeof b == "object") {
			if (!a || !b) {
				return false;
			}
			if (a.constructor !== b.constructor) {
				return false;
			}
			if (!contains && Object.keys(a).length !== Object.keys(b).length) {
				return false;
			}
			if (a instanceof Node) {
				return a.isEqualNode(b);
			}
			if (a instanceof Date) {
				return a.valueOf() === b.valueOf();
			}
			for (var i in a) {
				if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	return fnEqual;
});

/*!
 * ${copyright}
 */
/*global Node */

//@evo-todo check isEqualNode dependency: not yet available...
//@evo-todo dependency to global name 'Node' contradicts sap/base package

sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	/**
	 * Compares the two given values for equality, especially by comparing the content.
	 *
	 * <b>Note:</b> Function does not work with comparing XML objects.
	 *
	 * @function
	 * @since 1.58
	 * @param {any} a A value of any type
	 * @param {any} b A value of any type
	 * @param {int} [maxDepth=10] Maximum recursion depth
	 * @param {boolean} [contains] Whether all existing properties in a are equal as in b
	 * @alias module:sap/base/util/deepEqual
	 * @return {boolean} Whether a and b are equal
	 * @public
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
			Log.warning("deepEqual comparison exceeded maximum recursion depth of " + maxDepth + ". Treating values as unequal");
			return false;
		}

		if (a === b || Number.isNaN(a) && Number.isNaN(b)) {
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

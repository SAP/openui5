/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/util/isWindow"], function(isWindow) {
	"use strict";

	/**
	 * Checks whether the object is a plain object (created using "{}" or "new Object").
	 *
	 * @function
	 * @private
	 * @exports sap/base/util/isPlainObject
	 * @param {Object} obj the object which is checked
	 * @returns {boolean} whether or not the object is a plain object (created using "{}" or "new Object").
	 */
	var fnIsPlainObject = function(obj) {
		var key,
			hasOwn = ({}).hasOwnProperty;

		// @evo-todo reimplement:
		//    isPlainObject(obj) { return obj != null && Object.getPrototypeOf(obj) === Object.prototype; }
		//    maybe allow prototyoe null as well


		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if (typeof obj !== "object" || obj.nodeType || isWindow(obj)) {
			return false;
		}

		// Not own constructor property must be Object
		if (obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype || {}, "isPrototypeOf")) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own
		/*eslint-disable no-empty*/
		for (key in obj) {
		}
		/*eslint-enable no-empty*/

		return key === undefined || hasOwn.call(obj, key);
	};
	return fnIsPlainObject;
});
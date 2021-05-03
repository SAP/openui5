/*!
 * ${copyright}
 */
sap.ui.define(["./isPlainObject"], function(isPlainObject) {
	"use strict";

	/**
	 * Creates a deep clone of the source value.
	 *
	 * Only arrays, JavaScript Date objects and objects that pass the {@link module:sap/base/util/isPlainObject isPlainObject}
	 * check will be cloned. For other object types, a <code>TypeError</code> will be thrown as there's no standard way
	 * to clone them. Primitive values (boolean, number, string) as well as <code>null</code> and <code>undefined</code>
	 * will be copied, they have value semantics anyhow.
	 *
	 * <code>deepClone</code> is designed to match the semantics of {@link module:sap/base/util/deepEqual deepEqual}.
	 * Any deeply cloned object should be deep-equal to the source. However, not every object that can be handled
	 * by <code>deepEqual</code> can also be deeply cloned (e.g. <code>deepClone</code> fails on non-plain objects).
	 *
	 * To limit the time needed for a deep clone and to avoid endless recursion in case of cyclic structures, the
	 * recursion depth is limited by the parameter <code>maxDepth</code>, which defaults to 10. When the recursion
	 * depth exceeds the given limit, a <code>TypeError</code> is thrown.
	 *
	 * Note that object identities are not honored by the clone operation. If the original source contained multiple
	 * references to the same plain object instance, the clone will contain a different clone for each reference.
	 *
	 * @example <caption>Simple operation</caption>
	 * var oSource = { a: 1, b: { x: "test", y : 5.0 }, c: new Date(), d: null };
	 * var oClone = deepClone(oValue);
	 *
	 * deepEqual(oClone, oSource); // true
	 * oClone !== oSource; // true
	 * oClone.b !== oSource.b; // true
	 * oClone.c !== oSource.c; // true
	 *
	 * @example <caption>Object Identities</caption>
	 * var oCommon = { me: "unique" };
	 * var oValue = { a: oCommon, b: oCommon };
	 * var oClone = deepClone(oValue);
	 *
	 * deepEqual(oClone, oSource); // true
	 * oSource.a === oSource.b; // true
	 * oClone.a === oClone.b; // false
	 * deepEqual(oClone.a, oClone.b); // true
	 *
	 * @since 1.63
	 * @public
	 * @alias module:sap/base/util/deepClone
	 * @param {any} src Source value that shall be cloned
	 * @param {int} [maxDepth=10] Maximum recursion depth for the clone operation, deeper structures will throw an error
	 * @returns {any} A clone of the source value
	 * @throws {TypeError} When a non-plain object is encountered or when the max structure depth is exceeded
	 */
	var fnDeepClone = function(src, maxDepth) {
		if (!maxDepth) {
			maxDepth = 10;
		}
		return clone(src, 0, maxDepth);
	};

	function clone(src, depth, maxDepth) {
		// avoid endless recursion due to cyclic structures
		if (depth > maxDepth) {
			throw new TypeError("The structure depth of the source exceeds the maximum depth (" + maxDepth + ")");
		}

		if (src == null) {
			return src;
		} else if (src instanceof Date) {
			// clone date object using #getTime(). Officially the date constructor does not support parameter Date.
			return new Date(src.getTime());
		} else if (Array.isArray(src)) {
			return cloneArray(src, depth, maxDepth);
		} else if (typeof src === "object") {
			return cloneObject(src, depth, maxDepth);
		} else {
			return src;
		}
	}

	function cloneArray(src, depth, maxDepth) {
		var aClone = [];
		for (var i = 0; i < src.length; i++) {
			aClone.push(clone(src[i], depth + 1, maxDepth));
		}

		return aClone;
	}

	function cloneObject(src, depth, maxDepth) {
		if (!isPlainObject(src)) {
			throw new TypeError("Cloning is only supported for plain objects");
		}

		var oClone = {};

		for (var key in src) {
			if (key === "__proto__") {
				continue;
			}
			oClone[key] = clone(src[key], depth + 1, maxDepth);
		}

		return oClone;
	}

	return fnDeepClone;
});

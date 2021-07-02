/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";
	/**
	 * Validates if the given object is empty, that is that it has no enumerable properties.
	 *
	 * Note that <code>null</code> and <code>undefined</code> comply with this definition of 'empty'.
	 * The behavior for non-object values is undefined and might change in future.
	 *
	 * @example
	 * sap.ui.require(["sap/base/util/isEmptyObject"], function(isEmptyObject){
	 *      isEmptyObject({}); // true
	 *      isEmptyObject({test: '123'}); // false
	 *      isEmptyObject(null); // true
	 *      isEmptyObject(undefined); // true
	 * });
	 *
	 * @function
	 * @since 1.65
	 * @public
	 * @name module:sap/base/util/isEmptyObject
	 * @param {Object} obj the object which is checked
	 * @returns {boolean} whether or not the given object is empty
	 */
	var fnIsEmptyObject = function isEmptyObject(obj) {
		// eslint-disable-next-line no-unreachable-loop
		for (var sName in obj) {
			return false;
		}
		return true;
	};

	return fnIsEmptyObject;
});

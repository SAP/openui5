/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Iterates over elements of the given object or array.
	 *
	 * Numeric indexes are only used for instances of <code>Array</code>.
	 * For all other objects, including those with a numeric
	 * <code>length</code> property, the properties are iterated by name.
	 *
	 * When <code>fnCallback</code> returns <code>false</code>, then the iteration stops (break).
	 *
	 * @example
	 * sap.ui.require(["sap/base/util/each"], function(each){
	 *   // array
	 *   each(["1", "8", "7"], function(iIndex, sString) {
	 *      console.log("position: " + iIndex + ", value: " + sString);
	 *   });
	 *
	 *   // console result:
	 *   // position: 0, value: 1
	 *   // position: 1, value: 8
	 *   // position: 2, value: 7
	 *
	 *   // object
	 *   each({name: "me", age: 32}, function(sKey, oValue) {
	 *      console.log("key: " + sKey + ", value: " + oValue);
	 *   });
	 *
	 *   // console result:
	 *   // key: name, value: me
	 *   // key: age, value: 32
	 *
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @param {object|any[]} oObject object or array to enumerate the properties of
	 * @param {function} fnCallback function to call for each property name
	 * @alias module:sap/base/util/each
	 * @return {object|any[]} the given <code>oObject</code>
	 * @public
	 */
	var fnEach = function(oObject, fnCallback) {
		var isArray = Array.isArray(oObject),
			length, i;

		if ( isArray ) {
			for (i = 0, length = oObject.length; i < length; i++) {
				if ( fnCallback.call(oObject[i], i, oObject[i]) === false ) {
					break;
				}
			}
		} else {
			for ( i in oObject ) {
				if ( fnCallback.call(oObject[i], i, oObject[i] ) === false ) {
					break;
				}
			}
		}

		return oObject;
	};

	return fnEach;
});

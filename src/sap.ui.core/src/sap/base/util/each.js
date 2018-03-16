/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Iterates over elements of the given object or array.
	 *
	 * Works similar to <code>jQuery.each</code>, but a numeric index is only used for
	 * instances of <code>Array</code>. For all other objects, including those with a numeric
	 * <code>length</code> property, the properties are iterated by name.
	 *
	 * The contract for the <code>fnCallback</code> is the same as for <code>jQuery.each</code>,
	 * when it returns <code>false</code>, then the iteration stops (break).
	 *
	 * @function
	 * @param {object|any[]} oObject object or array to enumerate the properties of
	 * @param {function} fnCallback function to call for each property name
	 * @exports sap/base/util/each
	 * @return {object|any[]} the given <code>oObject</code>
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

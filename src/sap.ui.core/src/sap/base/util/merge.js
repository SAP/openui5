/*!
 * ${copyright}
 */
sap.ui.define(["./_merge"], function(_merge) {
	"use strict";

	/**
	 * Performs object extension by merging source objects into a target object. Copies are always deep.
	 *
	 * If during merging a key in the target object exists it is overwritten with the source object's value.
	 * Usage is the same as <code>jQuery.extend(true, ...)</code>, but values that are <code>undefined</code>
	 * are NOT ignored.
	 *
	 * For shallow copies, you may use <code>Object.assign</code>, but note that <code>Object.assign</code> only
	 * copies enumerable and own properties and doesn't copy properties on the prototype and non-enumerable properties.
	 *
	 * @example
	 * var oResult = merge({}, {
	 *   prop1: {
	 *     prop1a: "1a"
	 *   }
	 * }, {
	 *   prop2: {
	 *     prop2a: "2a"
	 *   }
	 * }, {
	 *   prop1: {
	 *      prop1b: "1b"
	 *   }
	 * }, {
	 *   prop2: undefined
	 * });
	 *
	 * console.log(oResult);
	 * {
	 *   "prop1": {
	 *     "prop1a": "1a",
	 *     "prop1b": "1b"
	 *   },
	 *   "prop2": undefined
	 * }
	 *
	 * @function
	 * @since 1.58
	 * @public
	 * @alias module:sap/base/util/merge
	 * @param {object} target The object that will receive new properties
	 * @param {...object} [source] One or more objects which get merged into the target object
	 * @return {object} the target object which is the result of the merge
	 *
	 */
	var fnMerge = function() {
		var args = [true, false];
		args.push.apply(args, arguments);
		return _merge.apply(null, args);
	};

	return fnMerge;
});
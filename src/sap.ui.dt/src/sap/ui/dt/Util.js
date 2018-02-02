/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global'
], function(
	jQuery
) {
	"use strict";

	/**
	 * Class for Utils.
	 *
	 * @class
	 * Utilities for sap.ui.dt library
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.54
	 * @alias sap.ui.dt.DOMUtil
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Util = {};
	var S_LIBRARY_NAME = 'sap.ui.dt';

	/**
	 * Wraps specified error into an Error object
	 * @param {string|Error} - Accepts error string or Error object
	 * @return {Error} - An Error object with error message inside
	 */
	Util.wrapError = function (vError) {
		var oError = vError instanceof Error && vError || new Error();

		if (typeof vError === 'string') {
			oError.message = vError;
		}

		return oError;
	};

	/**
	 * Checks whether specified Error object belongs to the sap.ui.dt library
	 * @param {Error} oError - Standard browser Error object
	 * @return {boolean} - true if specified error doesn't belong to the library
	 */
	Util.isForeignError = function (oError) {
		if (oError instanceof Error) {
			return oError.name.indexOf(S_LIBRARY_NAME) === -1;
		} else {
			throw Util.createError('Util#isForeignError', 'Wrong parameter specified');
		}
	};

	/**
	 * Error objects factory.
	 *
	 * Usage:
	 * Util.createError(
	 *     "DesignTime#createOverlay",
	 *     "can't create overlay without element"
	 * );
	 * Will create Error object with properties:
	 * {
	 *    name: "Error in sap.ui.dt.DesignTime#createOverlay",
	 *    message: "can't create overlay without element"
	 * }
	 *
	 * @param {string} sLocation - Should indicate file name followed by function name separated by "#", e.g. "DesignTime#createOverlay"
	 * @param {string} sMessage - Any text message describing the error
	 * @return {Error} - An Error object
	 */
	Util.createError = function (sLocation, sMessage) {
		var oError = new Error();
		var sLocationFull = S_LIBRARY_NAME + (sLocation ? '.' + sLocation : '');
		oError.name = 'Error in ' + sLocationFull;
		oError.message = sMessage;

		return oError;
	};

	/**
	 * Casts an Error object into printable string
	 * @param {string|Error} vError - Can be a string OR a standard Error object
	 * @return {string} - Printable string
	 */
	Util.errorToString = function (vError) {
		if (typeof vError === 'string') {
			return vError;
		} else if (vError instanceof Error) {
			var sError = vError.toString();
			if (vError.stack) {
				sError += '\n' + vError.stack.replace(sError, '').trim();
			}
			return sError;
		} else {
			throw Util.createError('Util#errorToString', 'Wrong parameter specified');
		}
	};

	/**
	 * Checks whether an error belongs to the library and, if not, adds necessary payload in order to identify
	 * the original problem closer to the place where it's happened.
	 * @param {string|Error} vError - Can be a string or an Error object. String will be wrapped into Error object via Util.wrapError()
	 * @param {string} sLocation - Should indicate file name followed by function name separated by "#", e.g. "DesignTime#createOverlay"
	 * @param {string} sMessage - Any text message describing the error
	 * @return {Error} - always an Error object with adjusted error message if necessary
	 */
	Util.propagateError = function (vError, sLocation, sMessage) {
		var oError = Util.wrapError(vError);

		// Adding payload only if it wasn't added before explicitly.
		if (Util.isForeignError(oError)) {
			var sLocationFull = S_LIBRARY_NAME + '.' + sLocation;
			oError.name = 'Error in ' + sLocationFull;
			oError.message = Util.printf('{0}. Original error: {1}', sMessage, oError.message || '¯\\_(ツ)_/¯');
		}

		return oError;
	};

	/**
	 * FIXME: Replace with template literals when it's available
	 * Replaces placeholders in the string with specified values. Usage:
	 * Util.printf('Hello, {0}! The {1} is blue!', 'world', 'sky')
	 * => 'Hello, world! The sky is blue!'
	 *
	 * @param sString - Template string with placeholders {0}, {1}, ...
	 * @param {...*} var_args - Values for placeholders
	 * @return {string} - Concatenated string
	 */
	Util.printf = function(sString) {
		var aArgs = Array.prototype.slice.call(arguments, 1);
		return sString.replace(/{(\d+)}/g, function(sMatch, iIndex) {
			return typeof aArgs[iIndex] !== 'undefined'
				? aArgs[iIndex]
				: sMatch;
		});
	};

	/**
	 * Creates a curried function
	 *
	 * Usage:
	 * var fnSum = function (a, b, c) {
	 *     return a + b + c;
	 * };
	 * var fnCurriedSum = Util.curry(fnSum);
	 * fnCurriedSum(1)(2)(3)
	 * => 6
	 *
	 * @param {function} fnOriginal - Original function
	 * @return {function} - Curried function
	 */
	Util.curry = function(fnOriginal) {
		var iArity = fnOriginal.length;

		var fnResolver = function () {
			var aArguments = Array.prototype.slice.call(arguments);
			if (aArguments.length >= iArity) {
				return fnOriginal.apply(this, aArguments);
			} else {
				return function () {
					return fnResolver.apply(this, aArguments.concat(Array.prototype.slice.call(arguments)));
				};
			}
		};

		return fnResolver;
	};

	/**
	 * Gets values of specified object
	 * @param {object} mObject - Any plain JavaScript object
	 * @return {array.<*>} - An array of values of specified object
	 */
	Util.objectValues = function (mObject) {
		return jQuery.map(mObject, function(vValue) {
			return vValue;
		});
	};

	/**
	 * Calculates intersection of two given arrays
	 * @param {array} aArray1 - First array
	 * @param {array} aArray2 - Second array
	 * @return {array} - Always returns a new array with intersected elements
	 */
	Util.intersection = function (aArray1, aArray2) {
		return aArray1.filter(function (vValue) {
			return aArray2.indexOf(vValue) > -1;
		});
	};

	/**
	 * Checks if specified value is an integer
	 * @param {*} vValue - Any value
	 * @return {boolean} - true if specified value is an integer
	 */
	Util.isInteger = function (vValue) {
		return jQuery.isNumeric(vValue) && Math.ceil(vValue) === vValue;
	};

	/**
	 * Wraps specified value into an array if it's not an array already
	 * @param {*} vValue - can be an any value
	 * @return [*] - an array of value
	 */
	Util.castArray = function(vValue) {
		var aResult = [];
		if (vValue) {
			if (!Array.isArray(vValue)){
				aResult.push(vValue);
			} else {
				aResult = vValue;
			}
		}
		return aResult;
	};

	return Util;
}, true);

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/base/util/includes",
	"sap/base/util/isPlainObject",
	"sap/ui/dt/DesignTimeStatus"
], function(
	jQuery,
	Device,
	ManagedObject,
	includes,
	isPlainObject,
	DesignTimeStatus
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
	 * @param {string|Error} vError - Accepts error string or Error object
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
	 * @param {string} sLibraryName - Library name which is considered as "home" library
	 * @return {boolean} - true if specified error doesn't belong to the library
	 */
	Util.isForeignError = function (oError, sLibraryName) {
		if (oError instanceof Error) {
			return oError.name.indexOf(sLibraryName || S_LIBRARY_NAME) === -1;
		}
		throw Util.createError('Util#isForeignError', 'Wrong parameter specified');
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
	 * @param {string} sLibraryName - Library name to which created error belong
	 * @return {Error} - An Error object
	 */
	Util.createError = function (sLocation, sMessage, sLibraryName) {
		var oError = new Error();
		var sLocationFull = (sLibraryName || S_LIBRARY_NAME) + (sLocation ? '.' + sLocation : '');
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
		}
		throw Util.createError('Util#errorToString', 'Wrong parameter specified');
	};

	/**
	 * Checks whether an error belongs to the library and, if not, adds necessary payload in order to identify
	 * the original problem closer to the place where it's happened.
	 * @param {string|Error} vError - Can be a string or an Error object. String will be wrapped into Error object via Util.wrapError()
	 * @param {string} sLocation - Should indicate file name followed by function name separated by "#", e.g. "DesignTime#createOverlay"
	 * @param {string} sMessage - Any text message describing the error
	 * @param {string} sLibraryName - Library name to which created error belong
	 * @return {Error} - always an Error object with adjusted error message if necessary
	 */
	Util.propagateError = function (vError, sLocation, sMessage, sLibraryName) {
		var oError = Util.wrapError(vError);

		// Adding payload only if it wasn't added before explicitly.
		if (Util.isForeignError(oError, sLibraryName)) {
			var sLocationFull = (sLibraryName || S_LIBRARY_NAME) + '.' + sLocation;
			var sOriginalMessage = [
				oError.name,
				oError.message
			].join(" - ");
			oError.name = 'Error in ' + sLocationFull;
			oError.message = Util.printf('{0}. Original error: {1}', sMessage, sOriginalMessage || '¯\\_(ツ)_/¯');
		}

		return oError;
	};

	/**
	 * Gets object type which is useful for error reporting
	 *
	 * Usage examples:
	 * Util.getObjectType("foo") -> 'string'
	 * Util.getObjectType(new sap.ui.base.ManagedObject()) -> 'sap.ui.base.ManagedObject (id = "__object1")'
	 *
	 * @param {*} vObject - Object to get type of
	 * @returns {string}
	 */
	Util.getObjectType = function (vObject) {
		return (
			(
				vObject instanceof ManagedObject
				&& Util.printf('{0} (id = "{1}")', vObject.getMetadata().getName(), vObject.getId())
			) // e.g. -> 'sap.ui.base.ManagedObject (id = "__object1")'
			|| typeof vObject // e.g. -> 'string'
		);
	};

	/**
	 * FIXME: Replace with template literals when it's available
	 * Replaces placeholders in the string with specified values. Usage:
	 * Util.printf('Hello, {0}! The {1} is blue!', 'world', 'sky')
	 * => 'Hello, world! The sky is blue!'
	 *
	 * @param {string} sString - Template string with placeholders {0}, {1}, ...
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
	 * @return {Array.<*>} - an array of value
	 */
	Util.castArray = function(vValue) {
		var aResult = [];
		if (vValue) {
			if (!Array.isArray(vValue)) {
				aResult.push(vValue);
			} else {
				aResult = vValue;
			}
		}
		return aResult;
	};

	/**
	 * Wraps function handler into a Promise object
	 * @param {Function} fnHandler - Function to be wrapped
	 * @return {Function} - function which returns Promise object and call original function inside
	 */
	Util.wrapIntoPromise = function (fnHandler) {
		if (!jQuery.isFunction(fnHandler)) {
			throw Util.createError(
				"Util#wrapIntoPromise",
				Util.printf("Invalid argument specified. Function is expected, but '{0}' is given", typeof fnHandler),
				"sap.ui.dt"
			);
		}
		return function () {
			var aArguments = Array.prototype.slice.call(arguments);
			return Promise.resolve().then(function () {
				return fnHandler.apply(null, aArguments);
			});
		};
	};

	/**
	 * Webkit can be safari or chrome mobile
	 * @return {Boolean} Returns true if the device browser uses webkit
	 */
	Util.isWebkit = function() {
		return Device.browser.webkit && (Device.browser.safari || Device.browser.chrome && Device.browser.mobile);
	};

	/**
	 * Checks if the passed designTime instance's status is syncing.
	 * Returns a promise resolving to the return value of the passed function, when the passed designTime instances's status changes to synced.
	 *
	 * @param {sap.ui.dt.DesignTime} oDtInstance designTime instance
	 * @param {function} fnOriginal function for which value needs to be returned
	 * @returns {Promise} Returns a Promise.resolve() to the passed function's return value or a Promise.reject() when designTime fails to sync
	 */
	Util.waitForSynced = function(oDtInstance, fnOriginal) {
		return function () {
			fnOriginal = fnOriginal || function () {};
			var aArguments = arguments;
			return new Promise(function (fnResolve, fnReject) {
				if (oDtInstance.getStatus() === DesignTimeStatus.SYNCING) {
					oDtInstance.attachEventOnce("synced", function () {
						fnResolve(fnOriginal.apply(null, aArguments));
					});
					oDtInstance.attachEventOnce("syncFailed", fnReject);
				} else {
					fnResolve(fnOriginal.apply(null, aArguments));
				}
			});
		};
	};

	return Util;
}, true);
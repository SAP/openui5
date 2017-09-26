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

	Util.wrapError = function (vError) {
		var oError = vError instanceof Error && vError || new Error();

		if (typeof vError === 'string') {
			oError.message = vError;
		}

		return oError;
	};

	Util.isForeignError = function (oError) {
		return oError.name.indexOf(S_LIBRARY_NAME) === -1;
	};

	Util.printf = function(sString) {
		var aArgs = Array.prototype.slice.call(arguments, 1);
		return sString.replace(/{(\d+)}/g, function(sMatch, iIndex) {
			return typeof aArgs[iIndex] !== 'undefined'
				? aArgs[iIndex]
				: sMatch;
		});
	};

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

	Util.objectValues = function (mObject) {
		return jQuery.map(mObject, function(vValue) {
			return vValue;
		});
	};

	Util.intersection = function (aArray1, aArray2) {
		return aArray1.filter(function (vValue) {
			return aArray2.indexOf(vValue) > -1;
		});
	};

	Util.isInteger = function (vValue) {
		return jQuery.isNumeric(vValue) && Math.ceil(vValue) === vValue;
	};

	return Util;
});

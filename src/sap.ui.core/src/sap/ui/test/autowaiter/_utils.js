/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global"
], function ($) {
	"use strict";

	function resolveStackTrace() {
		var oError = new Error();
		var sStack;
		if (oError.stack) {
			sStack = oError.stack;
		}
		// in IE the stack is not yet available on error construction
		try {
			throw oError;
		} catch (err) {
			sStack = err.stack;
		}
		return sStack.replace(/^Error\s/, "");
	}

	function functionToString(fn) {
		return fn.toString().replace(/\"/g, '\'');
	}

	function argumentsToString(oArgs) {
		try {
			return Array.prototype.map.call(oArgs, argToString).join("; ");
		} catch (e) {
			// IE 11 TypeError workaround: some objects cannot be safely stringified
			return "'" + oArgs + "'";
		}
		function argToString(arg) {
			if ($.isFunction(arg)) {
				return "'" + functionToString(arg) + "'";
			}
			if ($.isArray(arg)) {
				var aValues = Array.prototype.map.call(arg, argToString);
				return "[" + aValues.join(", ") + "]";
			}
			if ($.isPlainObject(arg)) {
				return JSON.stringify(arg);
			}
			return "'" + arg.toString() + "'";
		}
	}

	return {
		resolveStackTrace: resolveStackTrace,
		functionToString: functionToString,
		argumentsToString: argumentsToString
	};

}, true);

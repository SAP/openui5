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
		function argToString(arg) {
			if ($.isFunction(arg)) {
				return "'" + functionToString(arg) + "'";
			}
			if ($.isArray(arg)) {
				var aValues = arg.map(argToString);
				return "[" + aValues.join(", ") + "]";
			}
			if ($.isPlainObject(arg)) {
				var aValues = Object.keys(arg).map(function (key) {
					return key + ': ' + argToString(arg[key]);
				});
				return "{" + aValues.join(", ") + "}";
			}
			return "'" + arg + "'";
		}
		return Array.prototype.map.call(oArgs, argToString).join("; ");
	}

	return {
		resolveStackTrace: resolveStackTrace,
		functionToString: functionToString,
		argumentsToString: argumentsToString
	};

}, true);

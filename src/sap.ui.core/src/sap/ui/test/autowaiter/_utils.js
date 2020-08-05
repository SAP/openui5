/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/URI',
	"sap/ui/thirdparty/jquery"
], function(URI, jQueryDOM) {
	"use strict";

	function resolveStackTrace() {
		var oError = new Error();
		var sStack = "No stack trace available";
		var oUriParams = new URI().search(true);
		var bForceResolveStackTrace = ["false", undefined].indexOf(oUriParams.opaFrameIEStackTrace) < 0;

		if (oError.stack) {
			sStack = oError.stack;
		} else if (bForceResolveStackTrace) {
			// in IE11 the stack is not yet available on error construction
			// error throwing is too expensive in IE11 so skip it
			// unless explicitly requested with opaFrameIEStackTrace URI parameter
			try {
				throw oError;
			} catch (err) {
				sStack = err.stack;
			}
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
			if (jQueryDOM.isFunction(arg)) {
				return "'" + functionToString(arg) + "'";
			}
			if (jQueryDOM.isArray(arg)) {
				var aValues = Array.prototype.map.call(arg, argToString);
				return "[" + aValues.join(", ") + "]";
			}
			if (jQueryDOM.isPlainObject(arg)) {
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
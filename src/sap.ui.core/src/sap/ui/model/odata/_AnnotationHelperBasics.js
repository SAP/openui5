/*!
 * ${copyright}
 */

// Provides basic internal functions for sap.ui.model.odata.AnnotationHelper
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/BindingParser'
], function(jQuery, BindingParser) {
	'use strict';

	var rBadChars = /[\\\{\}:]/, // @see sap.ui.base.BindingParser: rObject, rBindingChars
		Basics,
		mUi5TypeForEdmType = {
			"Edm.Boolean" : "sap.ui.model.odata.type.Boolean",
			"Edm.Byte" : "sap.ui.model.odata.type.Byte",
			"Edm.DateTime" : "sap.ui.model.odata.type.DateTime",
			"Edm.DateTimeOffset" : "sap.ui.model.odata.type.DateTimeOffset",
			"Edm.Decimal" : "sap.ui.model.odata.type.Decimal",
			"Edm.Double" : "sap.ui.model.odata.type.Double",
			"Edm.Float" : "sap.ui.model.odata.type.Single",
			"Edm.Guid" : "sap.ui.model.odata.type.Guid",
			"Edm.Int16" : "sap.ui.model.odata.type.Int16",
			"Edm.Int32" : "sap.ui.model.odata.type.Int32",
			"Edm.Int64" : "sap.ui.model.odata.type.Int64",
			"Edm.SByte" : "sap.ui.model.odata.type.SByte",
			"Edm.Single" : "sap.ui.model.odata.type.Single",
			"Edm.String" : "sap.ui.model.odata.type.String",
			"Edm.Time" : "sap.ui.model.odata.type.Time"
		};

	Basics = {
		/**
		 * Descends the path/value pair to the given property or array index. Logs an error and
		 * throws an error if the result is not of the expected type.
		 *
		 * @param {object} oPathValue
		 *   a path/value pair
		 * @param {string} oPathValue.path
		 *   the meta model path to start at
		 * @param {object|any[]} oPathValue.value
		 *   the value at this path
		 * @param {string|number} vProperty
		 *   the property name or array index
		 * @param {string} [sExpectedType]
		 *   the expected type (tested w/ typeof) or the special value "array" for an array;
		 *   if <code>undefined</code> the result is not checked
		 * @returns {object}
		 *   the meta model path and its value after descending
		 * @throws {SyntaxError}
		 *   if the result is not of the expected type
		 */
		descend: function (oPathValue, vProperty, sExpectedType) {
			Basics.expectType(oPathValue, typeof vProperty === "number" ? "array" : "object");
			oPathValue = {
				path: oPathValue.path + "/" + vProperty,
				value: oPathValue.value[vProperty]
			};
			if (sExpectedType) {
				Basics.expectType(oPathValue, sExpectedType);
			}
			return oPathValue;
		},

		/**
		 * Logs the error message for the given path and throws a SyntaxError.
		 * @param {object} oPathValue
		 *   a path/value pair
		 * @param {string} sMessage
		 *   the message to log
		 */
		error: function (oPathValue, sMessage) {
			sMessage = oPathValue.path + ": " + sMessage;
			jQuery.sap.log.error(sMessage, Basics.toErrorString(oPathValue.value),
					"sap.ui.model.odata.AnnotationHelper");
			throw new SyntaxError(sMessage);
		},

		/**
		 * Logs an error and throws an error if the value is not of the expected type.
		 *
		 * @param {object} oPathValue
		 *   a path/value pair
		 * @param {string} oPathValue.path
		 *   the meta model path to start at
		 * @param {any} oPathValue.value
		 *   the value at this path
		 * @param {string} sExpectedType
		 *   the expected type (tested w/ typeof) or the special value "array" for an array
		 * @throws {SyntaxError}
		 *   if the result is not of the expected type
		 */
		expectType: function (oPathValue, sExpectedType) {
			var bError,
				vValue = oPathValue.value;

			if (sExpectedType === "array") {
				bError = !Array.isArray(vValue);
			} else {
				bError = typeof vValue !== sExpectedType
					|| vValue === null
					|| Array.isArray(vValue);
			}
			if (bError) {
				Basics.error(oPathValue, "Expected " + sExpectedType);
			}
		},

		/**
		 * Fetches the given property or array element at the path/value pair. Logs an error and
		 * throws an error if the property value is not of the expected type.
		 *
		 * @param {object} oPathValue
		 *   a path/value pair
		 * @param {string} oPathValue.path
		 *   the meta model path to start at
		 * @param {any} oPathValue.value
		 *   the value at this path
		 * @param {string|number} vProperty
		 *   the property name or array index
		 * @param {string} sExpectedType
		 *   the expected type (tested w/ typeof) or the special value "array" for an array
		 * @returns {any}
		 *   the property value
		 * @throws {SyntaxError}
		 *   if the result is not of the expected type
		 */
		property: function (oPathValue, vProperty, sExpectedType) {
			return Basics.descend(oPathValue, vProperty, sExpectedType).value;
		},

		/**
		 * Converts the result's value to a string.
		 *
		 * @param {object} oResult
		 *   an object with the following properties:
		 *   result: "constant", "binding", "composite" or "expression"
		 *   value: the value to write into the resulting string depending on result:
		 *     when "constant": {any} the constant value w/o escaping
		 *     when "binding": {string} the binding path
		 *     when "expression": {string} a binding expression not wrapped (no "{=" and "}")
		 *     when "composite": a composite binding string
		 *   type: an EDM data type (like "Edm.String")
		 *   constraints: {object} optional type constraints when result is "binding"
		 * @param {boolean} bExpression
		 *   if true the value is to be embedded into a binding expression, otherwise in a
		 *   composite binding
		 * @param {boolean} [bWithType=false]
		 *  if <code>true</code> and <code>oResult.result</code> is "binding" and
		 *  <code>bExpression</code> is <code>false</code>, type and constraint information is
		 *  written to the resulting binding string
		 * @returns {string}
		 *   the resulting string to embed into an composite binding or a binding expression
		 */
		resultToString: function (oResult, bExpression, bWithType) {
			var vValue = oResult.value;

			function binding(bAddType) {
				var sConstraints, sResult;

				bAddType = bAddType && !oResult.ignoreTypeInPath;
				if (rBadChars.test(vValue) || bAddType) {
					sResult = "{path:" + Basics.toJSON(vValue);
					if (bAddType && oResult.type) {
						sResult += ",type:'" + mUi5TypeForEdmType[oResult.type] + "'";
						sConstraints = Basics.toJSON(oResult.constraints);
						if (sConstraints && sConstraints !== "{}") {
							sResult += ",constraints:" + sConstraints;
						}
					}
					return sResult + "}";
				}
				return "{" + vValue + "}";
			}

			switch (oResult.result) {
			case "binding":
				return bExpression ?  "$" + binding(false) : binding(bWithType);
			case "composite":
				if (bExpression) {
					throw new Error(
						"Trying to embed a composite binding into an expression binding");
				}
				return vValue;
			case "constant":
				if (oResult.type === "edm:Null") {
					return bExpression ? "null" : null;
				}
				return bExpression ? Basics.toJSON(vValue)
						: BindingParser.complexParser.escape(vValue);
			case "expression":
				return bExpression ? vValue : "{=" + vValue + "}";
			// no default
			}
		},

		/**
		 * Stringifies the value for usage in an error message. Special handling for functions and
		 * object trees with circular references.
		 *
		 * @param {any} vValue the value
		 * @returns {string} the stringified value
		 */
		toErrorString: function (vValue) {
			var sJSON;

			if (typeof vValue !== "function") {
				try {
					sJSON = Basics.toJSON(vValue);
					// undefined --> undefined
					// null, NaN, Infinity --> "null"
					// all are correctly handled by String
					if (sJSON !== undefined && sJSON !== "null") {
						return sJSON;
					}
				} catch (e) {
					// "converting circular structure to JSON"
				}
			}
			return String(vValue);
		},

		/**
		 * Converts the value to a JSON string. Prefers the single quote over the double quote.
		 * This suits better for usage in an XML attribute.
		 *
		 * @param {any} vValue the value
		 * @returns {string} the stringified value
		 */
		toJSON: function (vValue) {
			var sStringified,
				bEscaped = false,
				sResult = "",
				i, c;

			sStringified = JSON.stringify(vValue);
			if (sStringified === undefined) {
				return undefined;
			}
			for (i = 0; i < sStringified.length; i += 1) {
				switch (c = sStringified.charAt(i)) {
					case "'": // a single quote must be escaped (can only occur in a string)
						sResult += "\\'";
						break;
					case '"':
						if (bEscaped) { // a double quote needs no escaping (only in a string)
							sResult += c;
							bEscaped = false;
						} else { // string begin or end with single quotes
							sResult += "'";
						}
						break;
					case "\\":
						if (bEscaped) { // an escaped backslash
							sResult += "\\\\";
						}
						bEscaped = !bEscaped;
						break;
					default:
						if (bEscaped) {
							sResult += "\\";
							bEscaped = false;
						}
						sResult += c;
				}
			}
			return sResult;
		}
	};

	return Basics;

}, /* bExport= */ false);

/*!
 * ${copyright}
 */

// Provides basic internal functions for sap.ui.model.odata.AnnotationHelper
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/BindingParser",
	"sap/ui/performance/Measurement",
	"sap/ui/thirdparty/jquery"
], function (Log, BindingParser, Measurement, jQuery) {
	'use strict';

	var sAnnotationHelper = "sap.ui.model.odata.AnnotationHelper",
		rBadChars = /[\\\{\}:]/, // @see sap.ui.base.BindingParser: rObject, rBindingChars
		Basics,
		// path to entity set ("/dataServices/schema/<i>/entityContainer/<j>/entitySet/<k>")
		rEntitySetPath
			= /^(\/dataServices\/schema\/\d+\/entityContainer\/\d+\/entitySet\/\d+)(?:\/|$)/,
		aPerformanceCategories = [sAnnotationHelper],
		sPerformanceFollowPath = sAnnotationHelper + "/followPath",
		// path to complex or entity type ("/dataServices/schema/<i>/complexType/<j>" or
		// "/dataServices/schema/<i>/entityType/<j>")
		rTypePath = /^(\/dataServices\/schema\/\d+\/(?:complex|entity)Type\/\d+)(?:\/|$)/,
		mUi5TypeForEdmType = {
			"Edm.Boolean" : "sap.ui.model.odata.type.Boolean",
			"Edm.Byte" : "sap.ui.model.odata.type.Byte",
			"Edm.Date" : "sap.ui.model.odata.type.Date",
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
			"Edm.Stream" : "sap.ui.model.odata.type.Stream",
			"Edm.Time" : "sap.ui.model.odata.type.Time",
			"Edm.TimeOfDay" : "sap.ui.model.odata.type.TimeOfDay"
		};

	Basics = {
		/**
		 * Descends the path/value pair to the given property or array index. Logs an error and
		 * throws an error if the result is not of the expected type.
		 *
		 * @param {object} oPathValue
		 *   a path/value pair which may contain additional arbitrary properties
		 * @param {string} oPathValue.path
		 *   the meta model path to start at
		 * @param {object|any[]} oPathValue.value
		 *   the value at this path
		 * @param {string|number} vProperty
		 *   the property name or array index
		 * @param {boolean|string} [vExpectedType]
		 *   the expected type (tested w/ typeof) or the special value "array" for an array;
		 *   if <code>undefined</code> the result is not checked; <code>true</code> means that no
		 *   check happens, but the result carries the <code>asExpression : true</code> flag.
		 * @returns {object}
		 *   the path/value pair after descending with all original additional properties
		 * @throws {SyntaxError}
		 *   if the result is not of the expected type
		 */
		descend : function (oPathValue, vProperty, vExpectedType) {
			var oTarget = jQuery.extend({}, oPathValue);

			Basics.expectType(oPathValue, typeof vProperty === "number" ? "array" : "object");
			oTarget.path = oPathValue.path + "/" + vProperty;
			oTarget.value = oPathValue.value[vProperty];
			if (vExpectedType === true) {
				oTarget.asExpression = true;
			} else if (vExpectedType) {
				Basics.expectType(oTarget, vExpectedType);
			}
			return oTarget;
		},

		/**
		 * Logs the error message for the given path and throws a SyntaxError.
		 * @param {object} oPathValue
		 *   a path/value pair
		 * @param {string} sMessage
		 *   the message to log
		 * @param {string} [sComponent="sap.ui.model.odata.AnnotationHelper"]
		 *   Name of the component that produced the log entry
		 */
		error : function (oPathValue, sMessage, sComponent) {
			sMessage = oPathValue.path + ": " + sMessage;
			Log.error(sMessage, Basics.toErrorString(oPathValue.value),
				sComponent || sAnnotationHelper);
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
		expectType : function (oPathValue, sExpectedType) {
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
		 * Follows the dynamic "14.5.12 Expression edm:Path" (or variant thereof) contained within
		 * the given raw value, starting the absolute path identified by the given interface, and
		 * returns the resulting absolute path as well as some other aspects about the path.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call; the path must be within
		 *   a complex or entity type!
		 * @param {object} oRawValue
		 *   the raw value from the meta model, e.g. <code>{AnnotationPath :
		 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address"}</code> or <code>
		 *   {AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"}</code>;
		 *   embedded within an entity set or entity type
		 * @returns {object}
		 *   - {object} [associationSetEnd=undefined]
		 *   association set end corresponding to the last navigation property
		 *   - {boolean} [navigationAfterMultiple=false]
		 *   if the navigation path has an association end with multiplicity "*" which is not
		 *   the last one
		 *   - {boolean} [isMultiple=false]
		 *   whether the navigation path ends with an association end with multiplicity "*"
		 *   - {string[]} [navigationProperties=[]]
		 *   all navigation property names
		 *   - {string} [resolvedPath=undefined]
		 *   the resulting absolute path
		 *
		 * @see sap.ui.model.odata.AnnotationHelper.getNavigationPath
		 * @see sap.ui.model.odata.AnnotationHelper.gotoEntitySet
		 * @see sap.ui.model.odata.AnnotationHelper.isMultiple
		 * @see sap.ui.model.odata.AnnotationHelper.resolvePath
		 */
		followPath : function (oInterface, oRawValue) {
			var oAssociationEnd,
				sPath,
				sContextPath,
				iIndexOfAt,
				oModel = oInterface.getModel(),
				aParts,
				oResult = {
					associationSetEnd : undefined,
					navigationAfterMultiple : false,
					isMultiple : false,
					navigationProperties : [],
					resolvedPath : undefined
				},
				sSegment,
				oType;

			Measurement.average(sPerformanceFollowPath, "", aPerformanceCategories);
			sPath = Basics.getPath(oRawValue);
			sContextPath = sPath !== undefined && Basics.getStartingPoint(oInterface, sPath);
			if (!sContextPath) {
				Measurement.end(sPerformanceFollowPath);
				return undefined;
			}
			aParts = sPath.split("/");

			while (sPath && aParts.length && sContextPath) {
				sSegment = aParts[0];
				iIndexOfAt = sSegment.indexOf("@");
				if (iIndexOfAt === 0) {
					// term cast
					sContextPath += "/" + sSegment.slice(1);
					aParts.shift();
					continue;
//				} else if (iIndexOfAt > 0) { // annotation of a navigation property
//					sSegment = sSegment.slice(0, iIndexOfAt);
				}

				oType = oModel.getObject(sContextPath);
				oAssociationEnd = oModel.getODataAssociationEnd(oType, sSegment);
				if (oAssociationEnd) {
					// navigation property
					oResult.associationSetEnd
						= oModel.getODataAssociationSetEnd(oType, sSegment);
					oResult.navigationProperties.push(sSegment);
					if (oResult.isMultiple) {
						oResult.navigationAfterMultiple = true;
					}
					oResult.isMultiple = oAssociationEnd.multiplicity === "*";
					sContextPath = oModel.getODataEntityType(oAssociationEnd.type, true);
					aParts.shift();
					continue;
				}

				// structural properties or some unsupported case
				sContextPath = oModel.getODataProperty(oType, aParts, true);
			}

			oResult.resolvedPath = sContextPath;
			Measurement.end(sPerformanceFollowPath);
			return oResult;
		},

		/**
		 * Returns the dynamic "14.5.12 Expression edm:Path" (or variant thereof) contained within
		 * the given raw value.
		 *
		 * @param {object} oRawValue
		 *   the raw value from the meta model, e.g. <code>{AnnotationPath :
		 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address"}</code> or <code>
		 *   {AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"}</code>
		 * @returns {string}
		 *   the path or <code>undefined</code> in case the raw value is not supported
		 */
		getPath : function (oRawValue) {
			if (oRawValue) {
				if (oRawValue.hasOwnProperty("AnnotationPath")) {
					return oRawValue.AnnotationPath;
				}
				if (oRawValue.hasOwnProperty("Path")) {
					return oRawValue.Path;
				}
				if (oRawValue.hasOwnProperty("PropertyPath")) {
					return oRawValue.PropertyPath;
				}
				if (oRawValue.hasOwnProperty("NavigationPropertyPath")) {
					return oRawValue.NavigationPropertyPath;
				}
			}
			// Note: we cannot return undefined above!
			return undefined; // some unsupported case
		},

		/**
		 * Returns the starting point for the given dynamic "14.5.12 Expression edm:Path" (or
		 * variant thereof).
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call; the path must be within
		 *   a complex or entity type!
		 * @param {string} sPath
		 *   the path (just to see if it's empty)
		 * @returns {string}
		 *   the meta model path to use as a starting point for following the given path
		 */
		getStartingPoint : function (oInterface, sPath) {
			var oEntity,
				aMatches = rTypePath.exec(oInterface.getPath()),
				oModel;

			if (aMatches) {
				return aMatches[1]; // start at complex or entity type
			}

			aMatches = rEntitySetPath.exec(oInterface.getPath());
			if (aMatches) {
				if (!sPath) {
					return aMatches[1]; // start at entity set
				}

				// go from entity set to entity type
				oModel = oInterface.getModel();
				oEntity = oModel.getObject(aMatches[1]);
				return oModel.getODataEntityType(oEntity.entityType, true);
			}

			return undefined; // some unsupported case
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
		property : function (oPathValue, vProperty, sExpectedType) {
			return Basics.descend(oPathValue, vProperty, sExpectedType).value;
		},

		/**
		 * Converts the result's value to a string.
		 *
		 * @param {object} oResult
		 *   an object with the following properties:
		 *   result: "constant", "binding", "composite" or "expression"
		 *   value: {any} the value to write into the resulting string depending on result:
		 *     when "constant": the constant value as a string (from the annotation)
		 *     when "binding": the binding path
		 *     when "expression": a binding expression not wrapped (no "{=" and "}")
		 *     when "composite": a composite binding string
		 *   type: an EDM data type (like "Edm.String")
		 *   constraints: {object} optional type constraints when result is "binding"
		 * @param {boolean} bExpression
		 *   if true the value is to be embedded into a binding expression, otherwise in a
		 *   composite binding
		 * @param {boolean} [bWithType=false]
		 *  if <code>true</code>, <code>oResult.result</code> is "binding" and
		 *  <code>oResult.type</code> maps to a UI5 type then type and constraint information is
		 *  written to the resulting binding string
		 * @returns {string}
		 *   the resulting string to embed into a composite binding or a binding expression
		 */
		resultToString : function (oResult, bExpression, bWithType) {
			var vValue = oResult.value;

			function binding(bAddType) {
				var sConstraints, sFormatOptions, sResult, sType = mUi5TypeForEdmType[oResult.type];

				bAddType = bAddType && !oResult.ignoreTypeInPath && sType;
				if (bAddType || rBadChars.test(vValue)) {
					sResult = "{path:" + Basics.toJSON(vValue);
					if (bAddType) {
						sResult += ",type:'" + sType + "'";
						sConstraints = Basics.toJSON(oResult.constraints);
						if (sConstraints && sConstraints !== "{}") {
							sResult += ",constraints:" + sConstraints;
						}
						sFormatOptions = Basics.toJSON(oResult.formatOptions);
						if (sFormatOptions && sFormatOptions !== "{}") {
							sResult += ",formatOptions:" + sFormatOptions;
						}
					}
					return sResult + "}";
				}
				return "{" + vValue + "}";
			}

			function constant(oResult) {
				switch (oResult.type) {
					case "Edm.Boolean":
					case "Edm.Double":
					case "Edm.Int32":
						return String(oResult.value);
					default:
						return Basics.toJSON(oResult.value);
				}
			}

			switch (oResult.result) {
			case "binding":
				return (bExpression ?  "$" : "") + binding(bWithType);

			case "composite":
				if (bExpression) {
					throw new Error(
						"Trying to embed a composite binding into an expression binding");
				}
				return vValue; // Note: it's already a composite binding string

			case "constant":
				if (oResult.type === "edm:Null") {
					return bExpression ? "null" : null;
				}
				if (bExpression) {
					return constant(oResult);
				}
				return typeof vValue === "string"
					? BindingParser.complexParser.escape(vValue)
					: String(vValue);

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
		toErrorString : function (vValue) {
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
		toJSON : function (vValue) {
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
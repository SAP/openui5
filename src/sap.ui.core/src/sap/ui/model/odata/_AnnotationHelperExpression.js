/*!
 * ${copyright}
 */

// This module provides internal functions for dynamic expressions in OData V4 annotations. It is a
// helper module for sap.ui.model.odata.AnnotationHelper.
sap.ui.define([
	'jquery.sap.global', './_AnnotationHelperBasics', 'sap/ui/base/BindingParser'
], function(jQuery, Basics, BindingParser) {
	'use strict';

	// see http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/abnf/odata-abnf-construction-rules.txt
	var sDateValue = "[-]?\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
		sDecimalValue = "[-+]?\\d+(?:\\.\\d+)?",
		sTimeOfDayValue = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d{1,12})?)?",
		mEdmType2RegExp = {
			Bool : /^true$|^false$/i,
			// Note: 'NaN' and 'INF' are case sensitive, "e" is not!
			Float : new RegExp("^" + sDecimalValue + "(?:[eE][-+]?\\d+)?$|^NaN$|^-INF$|^INF$"),
			Date : new RegExp("^" + sDateValue + "$"),
			DateTimeOffset: new RegExp("^" + sDateValue + "T" + sTimeOfDayValue
				+ "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i"),
			Decimal : new RegExp("^" + sDecimalValue + "$"),
			Guid : /^[A-F0-9]{8}-(?:[A-F0-9]{4}-){3}[A-F0-9]{12}$/i,
			Int : /^[-+]?\d{1,19}$/,
			TimeOfDay : new RegExp("^" + sTimeOfDayValue + "$")
		},
		// path to entity type ("/dataServices/schema/<i>/entityType/<j>")
		rEntityTypePath = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/,
		Expression,
		mOperators = {
			And: "&&",
			Eq: "===",
			Ge: ">=",
			Gt: ">",
			Le: "<=",
			Lt: "<",
			Ne: "!==",
			Not: "!",
			Or: "||"
		},
		mType2Type = { // mapping of constant "edm:*" type to dynamic "Edm.*" type
			Bool : "Edm.Boolean",
			Float : "Edm.Double",
			Date : "Edm.Date",
			DateTimeOffset :"Edm.DateTimeOffset",
			Decimal : "Edm.Decimal",
			Guid : "Edm.Guid",
			Int : "Edm.Int64",
			String : "Edm.String",
			TimeOfDay : "Edm.TimeOfDay"
		};

	/**
	 * This object contains helper functions to process an expression in OData V4 annotations.
	 *
	 * All functions return a result object with the following properties:
	 * <ul>
	 *  <li><code>result</code>: "binding", "composite", "constant" or "expression"
	 *  <li><code>value</code>: depending on result:
	 *   <ul>
	 *    <li>when "binding": {string} the binding path
	 *    <li>when "composite": {string} the binding string incl. the curly braces
	 *    <li>when "constant": {any} the constant value (not escaped if string)
	 *    <li>when "expression": {string} the expression unwrapped (no "{=" and "}")
	 *   </ul>
	 *  <li><code>type</code>:  the EDM data type (like "Edm.String") if it could be determined
	 *  <li><code>constraints</code>: {object} type constraints if result is "binding"
	 * </ul>
	 */
	Expression = {
		/**
		 * Handling of "14.5.3 Expression edm:Apply".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the apply
		 * @param {boolean} bExpression
		 *   if <code>true</code> an embedded concat must use expression binding
		 * @returns {object}
		 *   the result object
		 */
		apply: function (oInterface, oPathValue, bExpression) {
			var oName = Basics.descend(oPathValue, "Name", "string"),
				oParameters = Basics.descend(oPathValue, "Parameters");

			switch (oName.value) {
				case "odata.concat": // 14.5.3.1.1 Function odata.concat
					return Expression.concat(oInterface, oParameters, bExpression);
				case "odata.fillUriTemplate": // 14.5.3.1.2 Function odata.fillUriTemplate
					return Expression.fillUriTemplate(oInterface, oParameters);
				case "odata.uriEncode": // 14.5.3.1.3 Function odata.uriEncode
					return Expression.uriEncode(oInterface, oParameters);
				default:
					Basics.error(oName, "unknown function: " + oName.value);
			}
		},

		/**
		 * Handling of "14.5.3.1.1 Function odata.concat".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameters array
		 * @param {boolean} bExpression
		 *   if <code>true</code> concat must use expression binding
		 * @returns {object}
		 *   the result object
		 */
		concat: function (oInterface, oPathValue, bExpression) {
			var aParts = [],
				oResult,
				aResults = [];

			// needed so that we can safely call the forEach
			Basics.expectType(oPathValue, "array");
			oPathValue.value.forEach(function (oUnused, i) {
				// an embedded concat must use expression binding
				oResult = Expression.parameter(oInterface, oPathValue, i);
				// if any parameter is type expression, the concat must become expression, too
				bExpression = bExpression || oResult.result === "expression";
				aResults.push(oResult);
			});
			// convert the results to strings after we know whether the result is expression
			aResults.forEach(function (oResult) {
				if (bExpression) {
					// the expression might have a lower operator precedence than '+'
					Expression.wrapExpression(oResult);
				}
				aParts.push(Basics.resultToString(oResult, bExpression, true));
			});
			oResult = bExpression
				? {result: "expression", value: aParts.join("+")}
				: {result: "composite", value: aParts.join("")};
			oResult.type = "Edm.String";
			return oResult;
		},

		/**
		 * Handling of "14.5.6 Expression edm:If".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameters array. The first parameter element is the
		 *   conditional expression and must evaluate to a Edm.Boolean. The second and third child
		 *   elements are the expressions, which are evaluated conditionally.
		 * @returns {object}
		 *   the result object
		 */
		conditional: function (oInterface, oPathValue) {
			var oCondition = Expression.parameter(oInterface, oPathValue, 0, "Edm.Boolean"),
				oThen = Expression.parameter(oInterface, oPathValue, 1),
				oElse = Expression.parameter(oInterface, oPathValue, 2);

			if (oThen.type !== oElse.type) {
				Basics.error(oPathValue,
					"Expected same type for second and third parameter, types are '" + oThen.type
					+ "' and '" + oElse.type + "'");
			}
			return {
				result: "expression",
				type: oThen.type,
				value: Basics.resultToString(Expression.wrapExpression(oCondition), true)
					+ "?" + Basics.resultToString(Expression.wrapExpression(oThen), true)
					+ ":" + Basics.resultToString(Expression.wrapExpression(oElse), true)
			};
		},

		/**
		 * Handling of "14.4 Constant Expressions", i.e.
		 * <ul>
		 *   <li>"14.4.2 Expression edm:Bool",</li>
		 *   <li>"14.4.3 Expression edm:Date",</li>
		 *   <li>"14.4.4 Expression edm:DateTimeOffset",</li>
		 *   <li>"14.4.5 Expression edm:Decimal",</li>
		 *   <li>"14.4.8 Expression edm:Float",</li>
		 *   <li>"14.4.9 Expression edm:Guid",</li>
		 *   <li>"14.4.10 Expression edm:Int",</li>
		 *   <li>"14.4.11 Expression edm:String",</li>
		 *   <li>"14.4.12 Expression edm:TimeOfDay".</li>
		 * </ul>
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the constant
		 * @param {string} sEdmType
		 *   the "edm:*" type of the constant, e.g. "Bool" or "Int"
		 * @returns {object}
		 *   the result object
		 */
		constant: function (oInterface, oPathValue, sEdmType) {
			var sValue = oPathValue.value;

			Basics.expectType(oPathValue, "string");

			if (sEdmType === "String") {
				if (oInterface.getSetting && oInterface.getSetting("bindTexts")) {
					// We want a model binding to the path in the metamodel (which is
					// oPathValue.path)
					// "/##" is prepended because it leads from model to metamodel
					return {
						result : "binding",
						// No type; it would become part of the output
						value : "/##" + oPathValue.path
					};
				}
			} else if (!mEdmType2RegExp[sEdmType].test(sValue)) {
				Basics.error(oPathValue,
					"Expected " + sEdmType + " value but instead saw '" + sValue + "'");
			}

			return {
				result : "constant",
				type : mType2Type[sEdmType],
				value : sValue
			};
		},

		/**
		 * Calculates an expression.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameters array
		 * @param {string} oPathValue.path
		 * 	 the metamodel path to start at
		 * @param {any} oPathValue.value
		 *   the value at this path
		 * @param {boolean} bExpression
		 *   if <code>true</code> an embedded concat must use expression binding
		 * @returns {object}
		 *   the result object
		 */
		expression: function (oInterface, oPathValue, bExpression) {
			var oRawValue = oPathValue.value,
				oSubPathValue,
				sType;

			Basics.expectType(oPathValue, "object");

			if (oRawValue.hasOwnProperty("Type")) {
				sType = Basics.property(oPathValue, "Type", "string");
				oSubPathValue = Basics.descend(oPathValue, "Value");
			} else {
				["And", "Apply", "Bool", "Date", "DateTimeOffset", "Decimal", "Float", "Eq", "Ge",
					"Gt", "Guid", "If", "Int", "Le", "Lt", "Ne", "Not", "Or", "Path", "String",
					"TimeOfDay"
				].forEach(function (sProperty) {
					if (oRawValue.hasOwnProperty(sProperty)) {
						sType = sProperty;
						oSubPathValue = Basics.descend(oPathValue, sProperty);
					}
				});
			}

			switch (sType) {
				case "Apply": // 14.5.3 Expression edm:Apply
					return Expression.apply(oInterface, oSubPathValue, bExpression);
				case "If": // 14.5.6 Expression edm:If
					return Expression.conditional(oInterface, oSubPathValue);
				case "Path": // 14.5.12 Expression edm:Path
					return Expression.path(oInterface, oSubPathValue);
				case "Bool": // 14.4.2 Expression edm:Bool
				case "Date": // 14.4.3 Expression edm:Date
				case "DateTimeOffset": // 14.4.4 Expression edm:DateTimeOffset
				case "Decimal": // 14.4.5 Expression edm:Decimal
				case "Float": // 14.4.8 Expression edm:Float
				case "Guid": // 14.4.9 Expression edm:Guid
				case "Int": // 14.4.10 Expression edm:Int
				case "String": // 14.4.11 Expression edm:String
				case "TimeOfDay": // 14.4.12 Expression edm:TimeOfDay
					return Expression.constant(oInterface, oSubPathValue, sType);
				case "And":
				case "Eq":
				case "Ge":
				case "Gt":
				case "Le":
				case "Lt":
				case "Ne":
				case "Or":
					// 14.5.1 Comparison and Logical Operators
					return Expression.operator(oInterface, oSubPathValue, sType);
				case "Not":
					// 14.5.1 Comparison and Logical Operators
					return Expression.not(oInterface, oSubPathValue);
				default:
					Basics.error(oPathValue, "Unsupported OData expression");
			}
		},

		/**
		 * Calculates an expression. Ensures that errors that are thrown via {#error} while
		 * processing are handled accordingly.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oRawValue
		 *   the raw value from the meta model
		 * @param {boolean} bWithType
		 *   if <code>true</code>, embedded bindings contain type information
		 * @returns {string}
		 *   the expression value or "Unsupported: oRawValue" in case of an error.
		 */
		getExpression: function (oInterface, oRawValue, bWithType) {
			var oResult;

			try {
				oResult = Expression.expression(oInterface, {
					path: oInterface.getPath(),
					value: oRawValue
				}, /*bExpression*/false);
				return Basics.resultToString(oResult, false, bWithType);
			} catch (e) {
				if (e instanceof SyntaxError) {
					return "Unsupported: "
						+ BindingParser.complexParser.escape(Basics.toErrorString(oRawValue));
				}
				throw e;
			}
		},

		/**
		 * Handling of "14.5.3.1.2 Function odata.fillUriTemplate".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameters array
		 * @returns {object}
		 *   the result object
		 */
		fillUriTemplate: function (oInterface, oPathValue) {
			var i,
				sName,
				aParts = [],
				sPrefix = "",
				oParameter,
				aParameters = oPathValue.value,
				oResult,
				oTemplate = Expression.parameter(oInterface, oPathValue, 0, "Edm.String");

			aParts.push('odata.fillUriTemplate(', Basics.resultToString(oTemplate, true), ',{');
			for (i = 1; i < aParameters.length; i += 1) {
				oParameter = Basics.descend(oPathValue, i, "object");
				sName = Basics.property(oParameter, "Name", "string");
				oResult = Expression.expression(oInterface, Basics.descend(oParameter, "Value"),
					/*bExpression*/true);
				aParts.push(sPrefix, Basics.toJSON(sName), ":",
					Basics.resultToString(oResult, true));
				sPrefix = ",";
			}
			aParts.push("})");
			return {
				result: "expression",
				value: aParts.join(""),
				type: "Edm.String"
			};
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators": <code>edm:Not</code>.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameter
		 * @returns {object}
		 *   the result object
		 */
		not: function (oInterface, oPathValue, sType) {
			var oParameter = Expression.expression(oInterface, oPathValue, true);

			return {
				result: "expression",
				value: "!" + Basics.resultToString(Expression.wrapExpression(oParameter), true),
				type: "Edm.Boolean"
			};
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators" except <code>edm:Not</code>.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameter array
		 * @param {string} sType
		 *   the operator as text (like "And" or "Or")
		 * @returns {object}
		 *   the result object
		 */
		operator: function (oInterface, oPathValue, sType) {
			var sExpectedEdmType = sType == "And" || sType == "Or" ? "Edm.Boolean" : undefined,
				oResult0 = Expression.parameter(oInterface, oPathValue, 0,  sExpectedEdmType),
				oResult1 = Expression.parameter(oInterface, oPathValue, 1, sExpectedEdmType);

			if (oResult0.type !== oResult1.type) {
				Basics.error(oPathValue,
					"Expected two parameters of the same type but instead saw " + oResult0.type
					+ " and " + oResult1.type);
			}
			return {
				result: "expression",
				value: Basics.resultToString(Expression.wrapExpression(oResult0), true)
					+ mOperators[sType]
					+ Basics.resultToString(Expression.wrapExpression(oResult1), true),
				type: "Edm.Boolean"
			};
		},

		/**
		 * Evaluates a parameter and ensures that the result is of the given EDM type.
		 *
		 * The function calls <code>expression</code> with <code>bExpression=true</code>. This will
		 * cause any embedded <code>odata.concat</code> to generate an expression binding. This
		 * should be correct in any case because only a standalone <code>concat</code> may generate
		 * a composite binding.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameter array
		 * @param {int} iIndex
		 *   the parameter index
		 * @param {string} [sEdmType]
		 *   the expected EDM type or <code>undefined</code> if any type is allowed
		 * @returns {object}
		 *   the result object
		 */
		parameter: function (oInterface, oPathValue, iIndex, sEdmType) {
			var oParameter = Basics.descend(oPathValue, iIndex),
				oResult = Expression.expression(oInterface, oParameter, /*bExpression*/true);

			if (sEdmType && sEdmType !== oResult.type) {
				Basics.error(oParameter,
					"Expected " + sEdmType + " but instead saw " + oResult.type);
			}
			return oResult;
		},

		/**
		 * Handling of "14.5.12 Expression edm:Path".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the edm:Path
		 * @returns {object}
		 *   the result object
		 */
		path: function (oInterface, oPathValue) {
			var sBindingPath = oPathValue.value,
				oConstraints = {},
				oEntityType,
				oModel = oInterface.getModel(),
				aMatches = rEntityTypePath.exec(oPathValue.path),
				aParts,
				oProperty,
				oResult = {result: "binding", value: sBindingPath};

			Basics.expectType(oPathValue, "string");

			if (aMatches) {
				// go up to "/dataServices/schema/<i>/entityType/<j>/"
				oEntityType = oModel.getProperty(aMatches[1]);

				// determine the property given by sBindingPath
				aParts = sBindingPath.split('/');
				oProperty = oModel.getODataProperty(oEntityType, aParts);

				if (oProperty && !aParts.length) {
					oResult.type = oProperty.type;
					switch (oProperty.type) {
					case "Edm.DateTime":
						oConstraints.displayFormat = oProperty["sap:display-format"];
						break;
					case "Edm.Decimal":
						oConstraints.precision = oProperty.precision;
						oConstraints.scale = oProperty.scale;
						break;
					case "Edm.String":
						oConstraints.maxLength = oProperty.maxLength;
						break;
					// no default
					}
					if (oProperty.nullable === "false") {
						oConstraints.nullable = oProperty.nullable;
					}
					oResult.constraints = oConstraints;
				}

				if (!oResult.type) {
					jQuery.sap.log.warning("Could not determine type for property '" + sBindingPath
						+ "' of entity type '" + oEntityType.name + "'", null,
						"sap.ui.model.odata.AnnotationHelper");
				}
			}

			return oResult;
		},

		/**
		 * Handling of "14.5.3.1.3 Function odata.uriEncode".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the parameters array
		 * @returns {object}
		 *   the result object
		 */
		uriEncode: function (oInterface, oPathValue) {
			var oResult = Expression.parameter(oInterface, oPathValue, 0);

			return {
				result: "expression",
				value: 'odata.uriEncode(' + Basics.resultToString(oResult, true) + ","
					+ Basics.toJSON(oResult.type) + ")",
				type: "Edm.String"
			};
		},

		/**
		 * Wraps the result's value with "()" in case it is an expression because the result will be
		 * become a parameter of an infix operator and we have to ensure that the operator precedence
		 * remains correct.
		 *
		 * @param {object} oResult
		 *   a result object
		 * @returns {object}
		 *   the given result object (for chaining)
		 */
		wrapExpression: function (oResult) {
			if (oResult.result === "expression") {
				oResult.value = "(" + oResult.value + ")";
			}
			return oResult;
		}
	};

	return Expression;

}, /* bExport= */ false);

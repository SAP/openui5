/*!
 * ${copyright}
 */

// This module provides internal functions for dynamic expressions in OData V4 annotations. It is a
// helper module for sap.ui.model.odata.v4.AnnotationHelper.
sap.ui.define([
	'jquery.sap.global', '../_AnnotationHelperBasics', 'sap/ui/base/BindingParser',
	'sap/ui/base/ManagedObject'
], function(jQuery, Basics, BindingParser, ManagedObject) {
	'use strict';

	// see http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/abnf/odata-abnf-construction-rules.txt
	var sAnnotationHelper = "sap.ui.model.odata.v4.AnnotationHelper",
		aPerformanceCategories = [sAnnotationHelper],
		sPerformanceGetExpression = sAnnotationHelper + "/getExpression",
		Expression,
		// a simple binding (see sap.ui.base.BindingParser.simpleParser) to "@i18n" model
		// w/o bad chars (see _AnnotationHelperBasics: rBadChars) inside path!
		rI18n = /^\{@i18n>[^\\\{\}:]+\}$/,
		mOData2JSOperators = { // mapping of OData operator to JavaScript operator
			And : "&&",
			Eq : "===",
			Ge : ">=",
			Gt : ">",
			Le : "<=",
			Lt : "<",
			Ne : "!==",
			Not : "!",
			Or : "||"
		},
		// whether warning for missing complex binding parser has already been logged
		bSimpleParserWarningLogged = false,
		// mapping of EDM type to a type category (lower case = JavaScript primitive type)
		mType2Category = {
			"Edm.Boolean" : "boolean",
			"Edm.Byte" : "number",
			"Edm.Date" : "Date",
			"Edm.DateTimeOffset" : "DateTimeOffset",
			"Edm.Decimal" : "Decimal",
			"Edm.Double" : "number",
			"Edm.Guid" : "string",
			"Edm.Int16" : "number",
			"Edm.Int32" : "number",
			"Edm.Int64" : "Decimal",
			"Edm.SByte" : "number",
			"Edm.Single" : "number",
			"Edm.String" : "string",
			"Edm.TimeOfDay" : "TimeOfDay"
		},
		mType2Type = { // mapping of constant "edm:*" type to dynamic "Edm.*" type
			Bool : "Edm.Boolean",
			Float : "Edm.Double",
			Date : "Edm.Date",
			DateTimeOffset :"Edm.DateTimeOffset",
			Decimal : "Edm.Decimal",
			Guid : "Edm.Guid",
			Int : "Edm.Int64",
			Int32 : "Edm.Int32",
			String : "Edm.String",
			TimeOfDay : "Edm.TimeOfDay"
		},
		mTypeCategoryNeedsCompare = {
			"boolean" : false,
			"Date" : false,
			"DateTimeOffset" : true,
			"Decimal" : true,
			"number" : false,
			"string" : false,
			"TimeOfDay" : false
		};

	/*
	 * Logs the given error message for the given path and throws a SyntaxError.
	 *
	 * @param {object} oPathValue
	 * @param {string} sMessage
	 * @throws {SyntaxError}
	 */
	function error(oPathValue, sMessage) {
		Basics.error(oPathValue, sMessage, sAnnotationHelper);
	}

	/**
	 * This object contains helper functions to process an expression in OData V4 annotations.
	 *
	 * The handler functions corresponding to nodes of an annotation expression all use
	 * a parameter <code>oPathValue</code>. This parameter contains the following properties:
	 * <ul>
	 *  <li><code>asExpression</code>: {boolean} parser state: if this property is
	 *    <code>true</code>, an embedded <code>concat</code> must be rendered as an expression
	 *    binding and not a composite binding.
	 *  <li><code>path</code>: {string} the path in the metamodel that leads to the value
	 *  <li><code>value</code>: {any} the value of the (sub) expression from the metamodel
	 * </ul>
	 *
	 * Unless specified otherwise all functions return a result object with the following
	 * properties:
	 * <ul>
	 *  <li><code>result</code>: "binding", "composite", "constant" or "expression"
	 *  <li><code>value</code>: depending on <code>result</code>:
	 *   <ul>
	 *    <li>when "binding": {string} the binding path
	 *    <li>when "composite": {string} the binding string incl. the curly braces
	 *    <li>when "constant": {any} the constant value (not escaped if string)
	 *    <li>when "expression": {string} the expression unwrapped (no "{=" and "}")
	 *   </ul>
	 *  <li><code>type</code>:  the EDM data type (like "Edm.String") if it could be determined
	 * </ul>
	 */
	Expression = {
		/**
		 * Adjusts the second operand so that both have the same category, if possible.
		 *
		 * @param {object} oOperand1
		 *   the operand 1 (as a result object with category)
		 * @param {object} oOperand2
		 *   the operand 2 (as a result object with category) - may be modified
		 */
		adjustOperands : function (oOperand1, oOperand2) {
			if (oOperand1.result !== "constant" && oOperand1.category === "number"
					&& oOperand2.result === "constant" && oOperand2.type === "Edm.Int64") {
				// adjust an integer constant of type "Edm.Int64" to the number
				oOperand2.category = "number";
			}
			if (oOperand1.result !== "constant" && oOperand1.category === "Decimal"
				&& oOperand2.result === "constant" && oOperand2.type === "Edm.Int32") {
				// adjust an integer constant of type "Edm.Int32" to the decimal
				oOperand2.category = "Decimal";
				oOperand2.type = oOperand1.type;
			}
		},

		/**
		 * Handling of "14.5.3 Expression edm:Apply".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the apply (see Expression object)
		 * @param {object} oParameters
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		apply : function (oPathValue, oParameters) {
			var oFunction = Basics.descend(oPathValue, "$Function", "string");

			switch (oFunction.value) {
				case "odata.concat": // 14.5.3.1.1 Function odata.concat
					return Expression.concat(oParameters);
				case "odata.fillUriTemplate": // 14.5.3.1.2 Function odata.fillUriTemplate
					return Expression.fillUriTemplate(oParameters);
				case "odata.uriEncode": // 14.5.3.1.3 Function odata.uriEncode
					return Expression.uriEncode(oParameters);
				default:
					error(oFunction, "unknown function: " + oFunction.value);
			}
		},

		/**
		 * Handling of "14.5.3.1.1 Function odata.concat".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		concat : function (oPathValue) {
			var bExpression = oPathValue.asExpression,
				aParts = [],
				oResult,
				aResults = [];

			// needed so that we can safely call the forEach
			Basics.expectType(oPathValue, "array");
			oPathValue.value.forEach(function (oUnused, i) {
				// an embedded concat must use expression binding
				oResult = Expression.parameter(oPathValue, i);
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
				if (oResult.type !== 'edm:Null') {
					// ignore null (otherwise the string 'null' would appear in expressions)
					aParts.push(Basics.resultToString(oResult, bExpression));
				}
			});
			oResult = bExpression
				? {result : "expression", value : aParts.join("+")}
				: {result : "composite", value : aParts.join("")};
			oResult.type = "Edm.String";
			return oResult;
		},

		/**
		 * Handling of "14.5.6 Expression edm:If".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object).
		 *   The first parameter element is the conditional expression and must evaluate to an
		 *   Edm.Boolean. The second and third child elements are the expressions, which are
		 *   evaluated conditionally.
		 * @returns {object}
		 *   the result object
		 */
		conditional : function (oPathValue) {
			var oCondition = Expression.parameter(oPathValue, 0, "Edm.Boolean"),
				oThen = Expression.parameter(oPathValue, 1),
				oElse = Expression.parameter(oPathValue, 2),
				sType = oThen.type;

			if (oThen.type === "edm:Null") {
				sType = oElse.type;
			} else if (oElse.type !== "edm:Null" && oThen.type !== oElse.type) {
				error(oPathValue, "Expected same type for second and third parameter, types are '"
					+ oThen.type + "' and '" + oElse.type + "'");
			}
			return {
				result : "expression",
				type : sType,
				value : Basics.resultToString(Expression.wrapExpression(oCondition), true)
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
		 * @param {object} oPathValue
		 *   path and value information pointing to the constant (see Expression object)
		 * @param {string} sEdmType
		 *   the "edm:*" type of the constant, e.g. "Bool" or "Int" (incl. "Int32")
		 * @returns {object}
		 *   the result object
		 */
		constant : function (oPathValue, sEdmType) {
			var vValue = oPathValue.value;

			if (sEdmType === "String") {
				if (rI18n.test(vValue)) { // a simple binding to "@i18n" model
					return {
						ignoreTypeInPath : true,
						result : "binding",
						type : "Edm.String",
						value : vValue.slice(1, -1) // cut off "{" and "}"
					};
				}
			}

			return {
				result : "constant",
				type : mType2Type[sEdmType],
				value : vValue
			};
		},

		/**
		 * Calculates an expression.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the expression (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		expression : function (oPathValue) {
			var oRawValue = oPathValue.value,
				oSubPathValue = oPathValue,
				sType;

			if (oRawValue === null) {
				sType = "Null";
			} else if (typeof oRawValue === "boolean") {
				sType = "Bool";
			} else if (typeof oRawValue === "number") {
				sType = isFinite(oRawValue) && Math.floor(oRawValue) === oRawValue
					? "Int32"
					: "Float";
			} else if (typeof oRawValue === "string") {
				sType = "String";
			} else {
				Basics.expectType(oPathValue, "object");

				["$And", "$Apply", "$Date", "$DateTimeOffset", "$Decimal", "$Float", "$Eq",
					"$Ge", "$Gt", "$Guid", "$If", "$Int", "$Le", "$Lt", "$Ne", "$Not", "$Null",
					"$Or", "$Path", "$PropertyPath", "$TimeOfDay"
				].forEach(function (sProperty) {
					if (oRawValue.hasOwnProperty(sProperty)) {
						sType = sProperty.slice(1);
						oSubPathValue = Basics.descend(oPathValue, sProperty);
					}
				});
			}

			switch (sType) {
				case "Apply": // 14.5.3 Expression edm:Apply
					return Expression.apply(oPathValue, oSubPathValue);

				case "If": // 14.5.6 Expression edm:If
					return Expression.conditional(oSubPathValue);

				case "Path": // 14.5.12 Expression edm:Path
				case "PropertyPath": // 14.5.13 Expression edm:PropertyPath
					return Expression.path(oSubPathValue);

				case "Date": // 14.4.3 Expression edm:Date
				case "DateTimeOffset": // 14.4.4 Expression edm:DateTimeOffset
				case "Decimal": // 14.4.5 Expression edm:Decimal
				case "Guid": // 14.4.9 Expression edm:Guid
				case "Int": // 14.4.10 Expression edm:Int
				case "String": // 14.4.11 Expression edm:String
				case "TimeOfDay": // 14.4.12 Expression edm:TimeOfDay
					Basics.expectType(oSubPathValue, "string");
					// fall through
				case "Bool": // 14.4.2 Expression edm:Bool
				case "Float": // 14.4.8 Expression edm:Float
				case "Int32": // 14.4.10 Expression edm:Int
					return Expression.constant(oSubPathValue, sType);

				case "And":
				case "Eq":
				case "Ge":
				case "Gt":
				case "Le":
				case "Lt":
				case "Ne":
				case "Or":
					// 14.5.1 Comparison and Logical Operators
					return Expression.operator(oSubPathValue, sType);

				case "Not":
					// 14.5.1 Comparison and Logical Operators
					return Expression.not(oSubPathValue);

				case "Null":
					// 14.5.10 Expression edm:Null
					return {
						result : "constant",
						type : "edm:Null",
						value : null
					};

				default:
					error(oPathValue, "Unsupported OData expression");
			}
		},

		/**
		 * Formats the result to be an operand for a logical or comparison operator. Handles
		 * constants accordingly.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (for a possible error
		 *   message, see above)
		 * @param {number} iIndex
		 *   the parameter index (for a possible error message)
		 * @param {object} oResult
	 	 *   a result object with category
		 * @param {boolean} bWrapExpression
		 *   if true, wrap an expression in <code>oResult</code> with "()"
		 * @returns {string}
		 *   the formatted result
		 */
		formatOperand : function (oPathValue, iIndex, oResult, bWrapExpression) {
			if (oResult.result === "constant") {
				switch (oResult.category) {
					case "boolean":
					case "number":
						return String(oResult.value);
					// no default
				}
			}
			if (bWrapExpression) {
				Expression.wrapExpression(oResult);
			}
			return Basics.resultToString(oResult, true);
		},

		/**
		 * Calculates an expression. Ensures that errors that are thrown via {#error} while
		 * processing are handled accordingly.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the expression (see Expression object)
		 * @returns {string}
		 *   the expression value or "Unsupported: oRawValue" in case of an error or
		 *   <code>undefined</code> in case the raw value is undefined.
		 */
		getExpression : function (oPathValue) {
			var oResult;

			if (oPathValue.value === undefined) {
				return undefined;
			}

			jQuery.sap.measure.average(sPerformanceGetExpression, "", aPerformanceCategories);

			if (!bSimpleParserWarningLogged
					&& ManagedObject.bindingParser === BindingParser.simpleParser) {
				jQuery.sap.log.warning("Complex binding syntax not active", null,
					sAnnotationHelper);
				bSimpleParserWarningLogged = true;
			}

			try {
				oResult = Expression.expression(oPathValue);
				jQuery.sap.measure.end(sPerformanceGetExpression);
				return Basics.resultToString(oResult, false);
			} catch (e) {
				jQuery.sap.measure.end(sPerformanceGetExpression);
				if (e instanceof SyntaxError) {
					return "Unsupported: " + BindingParser.complexParser.escape(
						Basics.toErrorString(oPathValue.value));
				}
				throw e;
			}
		},

		/**
		 * Handling of "14.5.3.1.2 Function odata.fillUriTemplate".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		fillUriTemplate : function (oPathValue) {
			var i,
				sName,
				aParts = [],
				sPrefix = "",
				oParameter,
				aParameters = oPathValue.value,
				oResult,
				oTemplate = Expression.parameter(oPathValue, 0, "Edm.String");

			aParts.push('odata.fillUriTemplate(', Basics.resultToString(oTemplate, true), ',{');
			for (i = 1; i < aParameters.length; i += 1) {
				oParameter = Basics.descend(oPathValue, i, "object");
				sName = Basics.property(oParameter, "$Name", "string");
				oResult = Expression.expression(
					Basics.descend(oParameter, "$LabeledElement", true/*"as expression"*/));
				aParts.push(sPrefix, Basics.toJSON(sName), ":",
					Basics.resultToString(oResult, true));
				sPrefix = ",";
			}
			aParts.push("})");
			return {
				result : "expression",
				type : "Edm.String",
				value : aParts.join("")
			};
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators": <code>edm:Not</code>.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		not : function (oPathValue) {
			var oParameter;

			// Note: it is safe to modify the caller's object here
			oPathValue.asExpression = true;
			oParameter = Expression.expression(oPathValue);
			return {
				result : "expression",
				type : "Edm.Boolean",
				value : "!" + Basics.resultToString(Expression.wrapExpression(oParameter), true)
			};
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators" except <code>edm:Not</code>.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @param {string} sType
		 *   the operator as text (like "And" or "Or")
		 * @returns {object}
		 *   the result object
		 */
		operator : function (oPathValue, sType) {
			var sExpectedEdmType = sType === "And" || sType === "Or" ? "Edm.Boolean" : undefined,
				bNeedsCompare,
				oParameter0 = Expression.parameter(oPathValue, 0, sExpectedEdmType),
				oParameter1 = Expression.parameter(oPathValue, 1, sExpectedEdmType),
				sSpecialType = "",
				sValue0,
				sValue1;

			if (oParameter0.type !== "edm:Null" && oParameter1.type !== "edm:Null") {
				oParameter0.category = mType2Category[oParameter0.type];
				oParameter1.category = mType2Category[oParameter1.type];
				Expression.adjustOperands(oParameter0, oParameter1);
				Expression.adjustOperands(oParameter1, oParameter0);

				if (oParameter0.category !== oParameter1.category) {
					error(oPathValue, "Expected two comparable parameters but instead saw "
						+ oParameter0.type + " and " + oParameter1.type);
				}
				switch (oParameter0.category) {
					case "Decimal":
						sSpecialType = ",'Decimal'";
						break;
					case "DateTimeOffset":
						sSpecialType = ",'DateTime'";
						break;
					// no default
				}
				bNeedsCompare = mTypeCategoryNeedsCompare[oParameter0.category];
			}
			sValue0 = Expression.formatOperand(oPathValue, 0, oParameter0, !bNeedsCompare);
			sValue1 = Expression.formatOperand(oPathValue, 1, oParameter1, !bNeedsCompare);
			return {
				result : "expression",
				type : "Edm.Boolean",
				value : bNeedsCompare
					? "odata.compare(" + sValue0 + "," + sValue1 + sSpecialType + ")"
						+ mOData2JSOperators[sType] + "0"
					: sValue0 + mOData2JSOperators[sType] + sValue1
			};
		},

		/**
		 * Evaluates a parameter and ensures that the result is of the given EDM type.
		 *
		 * The function calls <code>expression</code> with <code>asExpression : true</code>. This
		 * will cause any embedded <code>odata.concat</code> to generate an expression binding. This
		 * should be correct in any case because only a standalone <code>concat</code> may generate
		 * a composite binding.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @param {number} iIndex
		 *   the parameter index
		 * @param {string} [sEdmType]
		 *   the expected EDM type or <code>undefined</code> if any type is allowed
		 * @returns {object}
		 *   the result object
		 */
		parameter : function (oPathValue, iIndex, sEdmType) {
			var oParameter = Basics.descend(oPathValue, iIndex, true/*"as expression"*/),
				oResult = Expression.expression(oParameter);

			if (sEdmType && sEdmType !== oResult.type) {
				error(oParameter, "Expected " + sEdmType + " but instead saw " + oResult.type);
			}
			return oResult;
		},

		/**
		 * Handling of "14.5.12 Expression edm:Path" and "14.5.13 Expression edm:PropertyPath".
		 *
		 * @param {object} oPathValue
		 *   model(!), path and value information pointing to the path (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		path : function (oPathValue) {
			Basics.expectType(oPathValue, "string");

			return {
					result : "binding",
					type : oPathValue.model.getProperty(oPathValue.path + "/$Type"),
					value : oPathValue.value
				};
		},

		/**
		 * Handling of "14.5.3.1.3 Function odata.uriEncode".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {object}
		 *   the result object
		 */
		uriEncode : function (oPathValue) {
			var oResult = Expression.parameter(oPathValue, 0);

			return {
					result : "expression",
					type : "Edm.String",
					value : oResult.type === "Edm.String"
						// Note: odata.uriEncode() is V2, but safe for Edm.String!
						? 'odata.uriEncode(' + Basics.resultToString(oResult, true) + ","
							+ Basics.toJSON(oResult.type) + ")"
						// Note: see _Helper.formatLiteral()
						: 'String(' + Basics.resultToString(oResult, true) + ")"
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
		wrapExpression : function (oResult) {
			if (oResult.result === "expression") {
				oResult.value = "(" + oResult.value + ")";
			}
			return oResult;
		}
	};

	return Expression;

}, /* bExport= */ false);

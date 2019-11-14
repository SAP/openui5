/*!
 * ${copyright}
 */

// This module provides internal functions for dynamic expressions in OData V4 annotations. It is a
// helper module for sap.ui.model.odata.v4.AnnotationHelper.
sap.ui.define([
	"../_AnnotationHelperBasics",
	"sap/base/Log",
	"sap/ui/base/BindingParser",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/performance/Measurement"
], function (Basics, Log, BindingParser, ManagedObject, SyncPromise, Measurement) {
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
	 * Logs the given error message for the given path and returns a sync promise that rejects with
	 * a SyntaxError.
	 *
	 * @param {object} oPathValue
	 * @param {string} sMessage
	 * @returns {sap.ui.base.SyncPromise}
	 */
	function asyncError(oPathValue, sMessage) {
		return SyncPromise.resolve().then(function () {
			error(oPathValue, sMessage);
		});
	}

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
	 *  <li><code>complexBinding</code>: {boolean} parser state: if this property is
	 *    <code>true</code>, bindings shall have type and constraints information
	 *  <li><code>ignoreAsPrefix</code>: {string} an optional prefix to be ignored in a path
	 *    expression (for example, binding parameter name)
	 *  <li><code>model</code>: {sap.ui.model.odata.v4.ODataMetaModel} the metamodel
	 *  <li><code>path</code>: {string} the path in the metamodel that leads to the value
	 *  <li><code>prefix</code>: {string} used in a path expression as a prefix for the
	 *    value; is either an empty string or a path ending with a "/"
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
	 *  <li><code>constraints</code>: {object} type constraints if result is "binding"
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
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
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
					return asyncError(oFunction, "unknown function: " + oFunction.value);
			}
		},

		/**
		 * Handling of "14.5.3.1.1 Function odata.concat".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		concat : function (oPathValue) {
			var aPromises;

			// needed so that we can safely call the forEach
			Basics.expectType(oPathValue, "array");
			aPromises = oPathValue.value.map(function (oUnused, i) {
				// an embedded concat must use expression binding
				return Expression.parameter(oPathValue, i);
			});

			return SyncPromise.all(aPromises).then(function (aParameters) {
				var bExpression,
					aParts,
					oResult;

				bExpression = oPathValue.asExpression || aParameters.some(function (oParameter) {
					// if any parameter is type expression, the concat must become expression, too
					return oParameter.result === "expression";
				});
				// convert the results to strings after we know whether the result is expression
				aParts = aParameters.filter(function (oParameter) {
					// ignore null (otherwise the string 'null' would appear in expressions)
					return oParameter.type !== 'edm:Null';
				}).map(function (oParameter) {
					if (bExpression) {
						// the expression might have a lower operator precedence than '+'
						Expression.wrapExpression(oParameter);
					}

					return Basics.resultToString(oParameter, bExpression,
						oPathValue.complexBinding);
				});
				oResult = bExpression
					? {result : "expression", value : aParts.join("+")}
					: {result : "composite", value : aParts.join("")};
				oResult.type = "Edm.String";

				return oResult;
			});
		},

		/**
		 * Handling of "14.5.6 Expression edm:If".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object).
		 *   The first parameter element is the conditional expression and must evaluate to an
		 *   Edm.Boolean. The second and third child elements are the expressions, which are
		 *   evaluated conditionally.
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		conditional : function (oPathValue) {
			var bComplexBinding = oPathValue.complexBinding,
				oPathValueForCondition = bComplexBinding
					? Object.assign({}, oPathValue, {complexBinding : false})
					: oPathValue;

			/*
			 * Returns the string representation of the given parameter value.
			 * @param {object} oParameterValue the parameter value
			 * @param {boolean} bComplex whether the result is a complex binding or a simple binding
			 */
			function toString(oParameterValue, bComplex) {
				return Basics.resultToString(Expression.wrapExpression(oParameterValue), true,
					bComplex);
			}

			return SyncPromise.all([
				Expression.parameter(oPathValueForCondition, 0, "Edm.Boolean"),
				Expression.parameter(oPathValue, 1),
				Expression.parameter(oPathValue, 2)
			]).then(function (aResults) {
				var oCondition = aResults[0],
					oThen = aResults[1],
					oElse = aResults[2],
					sType = oThen.type;

				if (oThen.type === "edm:Null") {
					sType = oElse.type;
				} else if (oElse.type !== "edm:Null" && oThen.type !== oElse.type) {
					error(oPathValue,
						"Expected same type for second and third parameter, types are '"
						+ oThen.type + "' and '" + oElse.type + "'");
				}
				return {
					result : "expression",
					type : sType,
					value : toString(oCondition, false)
						+ "?" + toString(oThen, bComplexBinding)
						+ ":" + toString(oElse, bComplexBinding)
				};
			});
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
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
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
					"$Ge", "$Gt", "$Guid", "$If", "$Int", "$Le", "$Lt", "$Name", "$Ne", "$Not",
					"$Null", "$Or", "$Path", "$PropertyPath", "$TimeOfDay", "$LabeledElement"
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

				case "Name": // 12.4.1 Attribute Name
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
					return SyncPromise.resolve(Expression.constant(oSubPathValue, sType));

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

				case "Not": // 14.5.1 Comparison and Logical Operators
					return Expression.not(oSubPathValue);

				case "Null": // 14.5.10 Expression edm:Null
					return SyncPromise.resolve({
						result : "constant",
						type : "edm:Null",
						value : null
					});

				// case "LabeledElement": 14.5.8 Expression edm:LabeledElement
				default:
					return asyncError(oPathValue, "Unsupported OData expression");
			}
		},

		/**
		 * Fetch the result object for a currency or a unit.
		 * If <code>oPathValue.path</code> references a property which has an
		 * <code>Org.OData.Measures.V1.ISOCurrency</code> annotation, a composite result object for
		 * a <code>sap.ui.model.odata.type.Currency</code> type with the currency, the currency code
		 * and the currency customizing as parts is returned.
		 * If <code>oPathValue.path</code> references a property which has an
		 * <code>Org.OData.Measures.V1.Unit</code> annotation, a composite result object for a
		 * <code>sap.ui.model.odata.type.Unit</code> type with the measures, the unit and the unit
		 * customizing as parts is returned.
		 *
		 * @param {object} oPathValue
		 *   model, path (and value) information pointing to the path (see Expression object)
		 * @param {string} sValue
		 *   use this value instead of <code>oPathValue.value</code>!
		 * @param {string} sType
		 *   the type of the property referenced by <code>oPathValue.path</code>
		 * @param {object} mConstraints
		 *   the type constraints for the property referenced by <code>oPathValue.path</code>
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with a result object for the currency or unit, or is
		 *   rejected with an error; <code>undefined</code> if there are no unit and currency
		 *   annotations for the property referenced by <code>oPathValue.path</code>
		 */
		fetchCurrencyOrUnit : function (oPathValue, sValue, sType, mConstraints) {
			var sCompositeType = "sap.ui.model.odata.type.Unit",
				sComputedAnnotation = "@@requestUnitsOfMeasure",
				oModel = oPathValue.model,
				sPath = oPathValue.path + "@Org.OData.Measures.V1.Unit/$Path",
				sTargetPath = oModel.getObject(sPath);

			function getBinding(mConstraints0, sType0, sPath0) {
				return Basics.resultToString({
						constraints : mConstraints0,
						result : "binding",
						type : sType0,
						value : oPathValue.prefix + sPath0
					}, false, true);
			}

			if (!sTargetPath) {
				sCompositeType = "sap.ui.model.odata.type.Currency";
				sComputedAnnotation = "@@requestCurrencyCodes";
				sPath = oPathValue.path + "@Org.OData.Measures.V1.ISOCurrency/$Path";
				sTargetPath = oModel.getObject(sPath);
			}
			if (!sTargetPath) {
				return undefined;
			}
			return oModel.fetchObject(sPath + "/$").then(function (oTarget) {
				return {
					result : "composite",
					type : sCompositeType,
					value : (mType2Category[sType] === "number"
							? "{formatOptions:{parseAsString:false},"
							: "{")
						+ "mode:'TwoWay',parts:["
						+ getBinding(mConstraints, sType, sValue)
						+ ","
						+ getBinding(oModel.getConstraints(oTarget, sPath), oTarget.$Type,
							sTargetPath)
						+ ",{mode:'OneTime',path:'/##" + sComputedAnnotation + "',targetType:'any'}"
						+ "],type:'" + sCompositeType + "'}"
				};
			});
		},

		/**
		 * Handling of "14.5.3.1.2 Function odata.fillUriTemplate".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		fillUriTemplate : function (oPathValue) {
			var i,
				aParameters = [],
				aPromises;

			// Note: it is safe to modify the caller's object here
			oPathValue.complexBinding = false;

			aPromises = [Expression.parameter(oPathValue, 0, "Edm.String")];

			for (i = 1; i < oPathValue.value.length; i += 1) {
				aParameters[i] = Basics.descend(oPathValue, i, "object");
				aPromises.push(Expression.expression(
					Basics.descend(aParameters[i], "$LabeledElement", true/*"as expression"*/)));
			}

			return SyncPromise.all(aPromises).then(function (aResults) {
				var sName,
					aParts = [],
					sPrefix = "";

				aParts.push('odata.fillUriTemplate(',
					Basics.resultToString(aResults[0], true, false),
					',{');
				for (i = 1; i < oPathValue.value.length; i += 1) {
					sName = Basics.property(aParameters[i], "$Name", "string");
					aParts.push(sPrefix, Basics.toJSON(sName), ":",
						Basics.resultToString(aResults[i], true, false));
					sPrefix = ",";
				}
				aParts.push("})");
				return {
					result : "expression",
					type : "Edm.String",
					value : aParts.join("")
				};
			});
		},

		/**
		 * Formats the result to be an operand for a logical or comparison operator. Handles
		 * constants accordingly.
		 *
		 * @param {object} oResult
		 *   a result object with category
		 * @param {boolean} bWrapExpression
		 *   if true, wrap an expression in <code>oResult</code> with "()"
		 * @returns {string}
		 *   the formatted result
		 */
		formatOperand : function (oResult, bWrapExpression) {
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
			return Basics.resultToString(oResult, true, false);
		},

		/**
		 * Calculates an expression. Ensures that errors that are thrown while processing are
		 * handled accordingly.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the expression (see Expression object)
		 * @returns {Promise|string}
		 *   the expression value or "Unsupported: oRawValue" in case of an error or
		 *   <code>undefined</code> in case the raw value is undefined; may instead return a
		 *   <code>Promise</code> resolving with that result.
		 */
		getExpression : function (oPathValue) {
			if (oPathValue.value === undefined) {
				return undefined;
			}

			Measurement.average(sPerformanceGetExpression, "", aPerformanceCategories);

			if (!bSimpleParserWarningLogged
					&& ManagedObject.bindingParser === BindingParser.simpleParser) {
				Log.warning("Complex binding syntax not active", null, sAnnotationHelper);
				bSimpleParserWarningLogged = true;
			}

			return Expression.expression(oPathValue).then(function (oResult) {
				return Basics.resultToString(oResult, false, oPathValue.complexBinding);
			}, function (e) {
				if (e instanceof SyntaxError) {
					return "Unsupported: " + BindingParser.complexParser.escape(
						Basics.toErrorString(oPathValue.value));
				}
				throw e;
			}).finally(function () {
				Measurement.end(sPerformanceGetExpression);
			}).unwrap();
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators": <code>edm:Not</code>.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter (see Expression object)
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		not : function (oPathValue) {
			// Note: it is safe to modify the caller's object here
			oPathValue.asExpression = true;
			oPathValue.complexBinding = false;

			return Expression.expression(oPathValue).then(function (oParameter) {
				return {
					result : "expression",
					type : "Edm.Boolean",
					value : "!"
						+ Basics.resultToString(Expression.wrapExpression(oParameter), true, false)
				};
			});
		},

		/**
		 * Handling of "14.5.1 Comparison and Logical Operators" except <code>edm:Not</code>.
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @param {string} sType
		 *   the operator as text (like "And" or "Or")
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		operator : function (oPathValue, sType) {
			var sExpectedEdmType = sType === "And" || sType === "Or" ? "Edm.Boolean" : undefined;

			// Note: it is safe to modify the caller's object here
			oPathValue.complexBinding = false;

			return SyncPromise.all([
				Expression.parameter(oPathValue, 0, sExpectedEdmType),
				Expression.parameter(oPathValue, 1, sExpectedEdmType)
			]).then(function (aResults) {
				var bNeedsCompare,
					oParameter0 = aResults[0],
					oParameter1 = aResults[1],
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
				sValue0 = Expression.formatOperand(oParameter0, !bNeedsCompare);
				sValue1 = Expression.formatOperand(oParameter1, !bNeedsCompare);
				return {
					result : "expression",
					type : "Edm.Boolean",
					value : bNeedsCompare
						? "odata.compare(" + sValue0 + "," + sValue1 + sSpecialType + ")"
							+ mOData2JSOperators[sType] + "0"
						: sValue0 + mOData2JSOperators[sType] + sValue1
				};
			});
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
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		parameter : function (oPathValue, iIndex, sEdmType) {
			var oParameter = Basics.descend(oPathValue, iIndex, true/*"as expression"*/);

			return Expression.expression(oParameter).then(function (oResult) {
				if (sEdmType && sEdmType !== oResult.type) {
					error(oParameter, "Expected " + sEdmType + " but instead saw " + oResult.type);
				}
				return oResult;
			});
		},

		/**
		 * Handling of "14.5.12 Expression edm:Path" and "14.5.13 Expression edm:PropertyPath".
		 * If <code>oPathValue.path</code> references a property which has an
		 * <code>Org.OData.Measures.V1.ISOCurrency</code> annotation, a composite result object for
		 * a <code>sap.ui.model.odata.type.Currency</code> type with the currency, the currency code
		 * and the currency customizing as parts is returned.
		 * If <code>oPathValue.path</code> references a property which has an
		 * <code>Org.OData.Measures.V1.Unit</code> annotation, a composite result object for a
		 * <code>sap.ui.model.odata.type.Unit</code> type with the measures, the unit and the unit
		 * customizing as parts is returned.
		 *
		 * @param {object} oPathValue
		 *   model, path and value information pointing to the path (see Expression object)
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		path : function (oPathValue) {
			var sIgnoreAsPrefix = oPathValue.ignoreAsPrefix,
				oModel = oPathValue.model,
				oPromise,
				sValue = oPathValue.value;

			if (sIgnoreAsPrefix && sValue.startsWith(sIgnoreAsPrefix)) {
				sValue = sValue.slice(sIgnoreAsPrefix.length);
			}

			Basics.expectType(oPathValue, "string");
			oPromise = oModel.fetchObject(oPathValue.path + "/$");
			if (oPromise.isPending() && !oPathValue.$$valueAsPromise) {
				oPromise.caught();
				oPromise = SyncPromise.resolve();
			}

			return oPromise.then(function (oProperty) {
				var mConstraints,
					oCurrencyOrUnitPromise,
					sType = oProperty && oProperty.$Type;

				if (oProperty && oPathValue.complexBinding) {
					mConstraints = oModel.getConstraints(oProperty, oPathValue.path);
					oCurrencyOrUnitPromise
						= Expression.fetchCurrencyOrUnit(oPathValue, sValue, sType, mConstraints);
				}
				return oCurrencyOrUnitPromise || {
					constraints : mConstraints,
					formatOptions : sType === "Edm.String"
						? {parseKeepsEmptyString : true}
						: undefined,
					result : "binding",
					type : sType,
					value : oPathValue.prefix + sValue
				};
			});
		},

		/**
		 * Handling of "14.5.3.1.3 Function odata.uriEncode".
		 *
		 * @param {object} oPathValue
		 *   path and value information pointing to the parameter array (see Expression object)
		 * @returns {sap.ui.base.SyncPromise}
		 *   a sync promise which resolves with the result object or is rejected with an error
		 */
		uriEncode : function (oPathValue) {
			return Expression.parameter(oPathValue, 0).then(function (oResult) {
				return {
					result : "expression",
					type : "Edm.String",
					value : oResult.type === "Edm.String"
						// Note: odata.uriEncode() is V2, but safe for Edm.String!
						? 'odata.uriEncode(' + Basics.resultToString(oResult, true, false) + ","
							+ Basics.toJSON(oResult.type) + ")"
						// Note: see _Helper.formatLiteral()
						: 'String(' + Basics.resultToString(oResult, true, false) + ")"
				};
			});
		},

		/**
		 * Wraps the result's value with "()" in case it is an expression because the result will be
		 * become a parameter of an infix operator and we have to ensure that the operator
		 * precedence remains correct.
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
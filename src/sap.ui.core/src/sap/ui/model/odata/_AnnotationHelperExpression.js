/*!
 * ${copyright}
 */

// This module provides internal functions for dynamic expressions in OData V4 annotations. It is a
// helper module for sap.ui.model.odata.AnnotationHelper.
sap.ui.define([
	'jquery.sap.global', './_AnnotationHelperBasics'
], function(jQuery, Basics) {
	'use strict';

	var // path to entity type ("/dataServices/schema/<i>/entityType/<j>")
		rEntityTypePath = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/,
		Expression;

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
				oResult = Expression.expression(oInterface, Basics.descend(oPathValue, i),
					/*bExpression*/true);
				// if any parameter is type expression, the concat must become expression, too
				bExpression = bExpression || oResult.result === "expression";
				aResults.push(oResult);
			});
			// convert the results to strings after we know whether the result is expression
			aResults.forEach(function (oResult) {
				var sValue = Basics.resultToString(oResult, bExpression, true);
				if (bExpression && oResult.result === "expression") {
					// the expression might have a lower operator precedence than '+'
					sValue = "(" + sValue + ")";
				}
				aParts.push(sValue);
			});
			oResult = bExpression
				? {result: "expression", value: aParts.join("+")}
				: {result: "composite", value: aParts.join("")};
			oResult.type = "Edm.String";
			return oResult;
		},

		/**
		 * Handling of "14.4.11 Expression edm:String".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oPathValue
		 *   a path/value pair pointing to the constant
		 * @returns {object}
		 *   the result object
		 */
		constant: function (oInterface, oPathValue) {
			var oResult;

			Basics.expectType(oPathValue, "string");
			if (oInterface.getSetting && oInterface.getSetting("bindTexts")) {
				// We want a model binding to the path in the metamodel (which is oPathValue.path)
				// "/##" is prepended because it leads from model to metamodel
				oResult = {
					result: "binding",
					value: "/##" + oPathValue.path
				};
				// No type; it would become part of the output
			} else {
				oResult = {
					result: "constant",
					value: oPathValue.value,
					type: "Edm.String"
				};
			}
			return oResult;
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
				["Apply", "Path", "String"].forEach(function (sProperty) {
					if (oRawValue.hasOwnProperty(sProperty)) {
						sType = sProperty;
						oSubPathValue = Basics.descend(oPathValue, sProperty);
					}
				});
			}

			switch (sType) {
				case "Apply": // 14.5.3 Expression edm:Apply
					return Expression.apply(oInterface, oSubPathValue, bExpression);
				case "Path": // 14.5.12 Expression edm:Path
					return Expression.path(oInterface, oSubPathValue);
				case "String": // 14.4.11 Expression edm:String
					return Expression.constant(oInterface, oSubPathValue);
				default:
					Basics.error(oPathValue, "Expected 'Apply', 'Path' or 'String'");
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
				oPathValueTemplate = Basics.descend(oPathValue, 0),
				oResult,
				oTemplate = Expression.expression(oInterface, oPathValueTemplate,
					/*bExpression*/true);

			if (oTemplate.type !== "Edm.String") {
				Basics.error(oPathValueTemplate,
					"fillUriTemplate: Expected Edm.String but instead saw " + oTemplate.type);
			}
			aParts.push('odata.fillUriTemplate(', Basics.resultToString(oTemplate, true), ',{');
			for (i = 1; i < aParameters.length; i += 1) {
				oParameter = Basics.descend(oPathValue, i, "object");
				sName = Basics.property(oParameter, "Name", "string");
				oResult = Expression.expression(oInterface, Basics.descend(oParameter, "Value"),
					/*bExpression*/true);
				aParts.push(sPrefix, Basics.toJavaScript(sName), ":",
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
			var oResult = Expression.expression(oInterface, Basics.descend(oPathValue, 0),
					/*bExpression*/true);
			return {
				result: "expression",
				value: 'odata.uriEncode(' + Basics.resultToString(oResult, true) + ","
					+ Basics.toJavaScript(oResult.type) + ")",
				type: "Edm.String"
			};
		}
	};

	return Expression;

}, /* bExport= */ false);
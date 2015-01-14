/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * The parser to parse expressions in bindings.
	 *
	 * @alias sap.ui.base.ExpressionParser
	 * @private
	 */
	return {
		/**
		 * Parses a string <code>sInput</code> with an expression based on the syntax sketched
		 * below.
		 *
		 * If a start index <code>iIndex</code> for parsing is provided, the input string is parsed
		 * starting from <code>iIndex</code>.
		 *
		 * If <code>iIndex</code> is undefined the complete string is parsed; in this case
		 * a <code>SyntaxError</code> is thrown if it does not comply to the expression syntax.
		 *
		 * The expression syntax is a subset of JavaScript expression syntax with the
		 * enhancement that the only "variable" parts in an expression are bindings enclosed in
		 * curly braces.
		 * TODO Details: literals, operators, functions, ...; error handling
		 *
		 * @param {function} fnResolveBinding - The function to resolve embedded bindings
		 * @param {string} sInput - The string to be parsed
		 * @param {number} [iIndex] - The index to start parsing
		 * @returns {object} The parse result as object containing the following properties:<br/>
		 *   <code>result</code> An object with the properties <code>formatter</code> which is
		 *        the formatter function to evaluate the expression taking the parts contained in
		 *        the expression as parameters and <code>parts</code> which is the array of parts
		 *        contained in the expression string.<br/>
		 *   <code>at</code> The index of the first character after the expression in
		 *     <code>sInput</code>
		 */
		parse: function (fnResolveBinding, sInput, iIndex) {
			//TODO real parser implementation missing; just few cases implemented to test BindingParser integration

			if (sInput === "{=sap.ui.core.sample.ViewTemplate.scenario.FieldHelper.getAnnotation({meta>Value}, 'sap:semantics') === 'email'}") {
				return {
					result: {
						formatter: function(oPart0) {
							return sap.ui.core.sample.ViewTemplate.scenario.FieldHelper.getAnnotation.call(this, oPart0, 'sap:semantics') === 'email';
						},
						parts: [fnResolveBinding(sInput, sInput.indexOf("{meta>Value}")).result]
					},
					at: sInput.length - 1
				};
			}
			if (sInput === "{=sap.ui.core.sample.ViewTemplate.scenario.FieldHelper.getAnnotation({meta>Value}, 'sap:semantics') === 'tel'}") {
				return {
					result: {
						formatter: function(oPart0) {
							return sap.ui.core.sample.ViewTemplate.scenario.FieldHelper.getAnnotation.call(this, oPart0, 'sap:semantics') === 'tel';
						},
						parts: [fnResolveBinding(sInput, sInput.indexOf("{meta>Value}")).result]
					},
					at: sInput.length - 1
				};
			}
			//TODO console error
			throw new Error("Unsupported expression string: " + sInput);
		}
	};
}, /* bExport= */ true);


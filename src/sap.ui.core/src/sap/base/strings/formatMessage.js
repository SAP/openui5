/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/assert"], function(assert) {
	"use strict";

	/**
	 * Pattern to analyze MessageFormat strings.
	 *
	 * Group 1: captures doubled single quotes within the string
	 * Group 2: captures quoted fragments within the string.
	 *            Note that java.util.MessageFormat silently forgives a missing single quote at
	 *            the end of a pattern. This special case is handled by the RegEx as well.
	 * Group 3: captures placeholders
	 *            Checks only for numerical argument index, any remainder is ignored up to the next
	 *            closing curly brace. Nested placeholders are not accepted!
	 * Group 4: captures any remaining curly braces and indicates syntax errors
	 *
	 *                    [-1] [----- quoted string -----] [------ placeholder ------] [--]
	 * @private
	 */
	var rMessageFormat = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;

	/**
	 * Creates a string from a pattern by replacing placeholders with concrete values.
	 *
	 * The syntax of the pattern is inspired by (but not fully equivalent to) the
	 * java.util.MessageFormat.
	 *
	 * Placeholders have the form <code>{ integer }</code>, where any occurrence of
	 * <code>{0}</code> is replaced by the value with index 0 in <code>aValues</code>,
	 * <code>{1}</code> by the value with index 1 in <code>aValues</code> etc.
	 *
	 * To avoid interpretation of curly braces as placeholders, any non-placeholder fragment
	 * of the pattern can be enclosed in single quotes. The surrounding single quotes will be
	 * omitted from the result. Single quotes that are not meant to escape a fragment and
	 * that should appear in the result, need to be doubled. In the result, only a single
	 * single quote will occur.
	 *
	 * Example Pattern Strings:
	 * <pre>
	 *   formatMessage("Say {0}",     ["Hello"]) -> "Say Hello"    // normal use case
	 *   formatMessage("Say '{0}'",   ["Hello"]) -> "Say {0}"      // escaped placeholder
	 *   formatMessage("Say ''{0}''", ["Hello"]) -> "Say 'Hello'"  // doubled single quote
	 *   formatMessage("Say '{0}'''", ["Hello"]) -> "Say {0}'"     // doubled single quote in quoted fragment
	 * </pre>
	 *
	 * In contrast to java.util.MessageFormat, format types or format styles are not supported.
	 * Everything after the argument index and up to the first closing curly brace is ignored.
	 * Nested placeholders (as supported by java.lang.MessageFormat for the format type choice)
	 * are not ignored but reported as a parse error.
	 *
	 * This method throws an Error when the pattern syntax is not fulfilled (e.g. unbalanced curly
	 * braces, nested placeholders or a non-numerical argument index).
	 *
	 * This method can also be used as a formatter within a binding. The first part of a composite binding
	 * will be used as pattern, the following parts as aValues. If there is only one value and this
	 * value is an array it will be handled like the default described above.
	 *
	 * @function
	 * @exports sap/base/strings/formatMessage
	 * @param {string} sPattern A pattern string in the described syntax
	 * @param {any[]} [aValues=[]] The values to be used instead of the placeholders.
	 * @returns {string} The formatted result string
	 * @SecPassthrough {*|return}
	 * @private
	 */
	var fnFormatMessage = function(sPattern, aValues) {
		assert(typeof sPattern === "string" || sPattern instanceof String, "pattern must be string");
		if (arguments.length > 2 || (aValues != null && !Array.isArray(aValues))) {
			aValues = Array.prototype.slice.call(arguments, 1);
		}
		aValues = aValues || [];
		return sPattern.replace(rMessageFormat, function($0, $1, $2, $3, offset) {
			if ($1) {
				// a doubled single quote in a normal string fragment
				//   --> emit a single quote
				return "'";
			} else if ($2) {
				// a quoted sequence of chars, potentially containing doubled single quotes again
				//   --> emit with doubled single quotes replaced by a single quote
				return $2.replace(/''/g, "'");
			} else if ($3) {
				// a welformed curly brace
				//   --> emit the argument but ignore other parameters
				return String(aValues[parseInt($3, 10)]);
			}
			// e.g. malformed curly braces
			//   --> throw Error
			throw new Error("formatMessage: pattern syntax error at pos. " + offset);
		});
	};
	return fnFormatMessage;

});



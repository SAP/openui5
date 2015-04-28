/*!
 * ${copyright}
 */

// Provides static class sap.ui.base.BindingParser
sap.ui.define(['jquery.sap.global', './ExpressionParser', 'jquery.sap.script'],
	function(jQuery, ExpressionParser/* , jQuerySap */) {
	"use strict";

	/**
	 * Regular expression to check for a (new) object literal
	 */
	var rObject = /^\{\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/;
	
	/**
	 * Regular expression to split the binding string into hard coded string fragments and embedded bindings.
	 * 
	 * Also handles escaping of '{' and '}'.
	 */
	var rFragments = /(\\[\\\{\}])|(\{)/g;

	/**
	 * Regular expression to escape potential binding chars
	 */
	var rBindingChars = /([\\\{\}])/g;

	/**
	 * A simple "formatter" function which just returns its first argument.
	 *
	 * @param {object} o
	 *   its first argument
	 * @returns {object}
	 *   its first argument
	 */
	function firstArgument(o) {
		return o;
	}

	/**
	 * Helper to create a formatter function. Only used to reduce the closure size of the formatter
	 *
	 * @param {number[]|string[]} aFragments
	 *   array of fragments, either a literal text or the index of the binding's part
	 * @param {function[]} [aFormatters]
	 *   optional array of formatter functions for each index in <code>aFragments</code>
	 * @returns {function}
	 *   a formatter function
	 */
	function makeFormatter(aFragments, aFormatters) {
		var fnFormatter = function() {
			var aResult = [],
				l = aFragments.length,
				i;
			
			for (i = 0; i < l; i++) {
				if ( typeof aFragments[i] === "number" ) {
					// a numerical fragment references the part with the same number 
					if (aFormatters) {
						aResult.push(aFormatters[aFragments[i]].apply(this, arguments));
					} else {
						aResult.push(arguments[aFragments[i]]);
					}
				} else {
					// anything else is a string fragment 
					aResult.push(aFragments[i]);
				}
			}
			return aResult.join('');
		};
		fnFormatter.textFragments = aFragments;
		return fnFormatter;
	}

	/**
	 * Creates a binding info object with the given path. 
	 * 
	 * If the path contains a model specifier (prefix separated with a '>'),
	 * the <code>model</code> property is set as well and the prefix is 
	 * removed from the path. 
	 *
	 * @param {string} sPath
	 *   the given path
	 * @returns {object}
	 *   a binding info object
	 */
	function makeSimpleBindingInfo(sPath) {
		var iPos = sPath.indexOf(">"),
			oBindingInfo = { path : sPath };
		
		if ( iPos > 0 ) {
			oBindingInfo.model = sPath.slice(0,iPos);
			oBindingInfo.path = sPath.slice(iPos + 1);
		}
		
		return oBindingInfo;
	}

	/**
	 * Merges the given binding info object's parts, which may have parts themselves, into a flat
	 * list of parts, taking care of existing formatter functions and fragments.
	 *
	 * @param {object} oBindingInfo
	 *   a binding info object
	 * @param {number[]|string[]} aFragments
	 *   array of fragments, either a literal text or the index of the binding's part
	 */
	function mergeParts(oBindingInfo, aFragments) {
		var aFormatters = [],
			aParts = [];

		oBindingInfo.parts.forEach(function (oEmbeddedBinding) {
			var iEnd,
				fnFormatter = oEmbeddedBinding.formatter || firstArgument,
				iStart = aParts.length;

			if (oEmbeddedBinding.parts) {
				aParts = aParts.concat(oEmbeddedBinding.parts);
			} else {
				aParts.push(oEmbeddedBinding);
			}
			iEnd = aParts.length;

			aFormatters.push(function () {
				// each formatter needs to operate on its own slice of the overall arguments
				return fnFormatter.apply(this,
					Array.prototype.slice.call(arguments, iStart, iEnd));
			});
		});

		oBindingInfo.parts = aParts;
		oBindingInfo.formatter = makeFormatter(aFragments, aFormatters);
	}

	/**
	 * @static
	 * @namespace
	 * @alias sap.ui.base.BindingParser
	 */
	var BindingParser = {};
	
	BindingParser._keepBindingStrings = false;
	
	BindingParser.simpleParser = function(sString, oContext) {

		if ( jQuery.sap.startsWith(sString, "{") && jQuery.sap.endsWith(sString, "}") ) {
			return makeSimpleBindingInfo(sString.slice(1, -1));
		}
	
	};
	
	BindingParser.simpleParser.escape = function(sValue) {
		// there was no escaping defined for the simple parser
		return sValue;
	};
	
	/*
	 * @param {boolean} [bTolerateFunctionsNotFound=false]
	 *   if true, function names which cannot be resolved to a reference are reported via the
	 *   string array <code>functionsNotFound</code> of the result object; else they are logged
	 *   as errors
	 */
	BindingParser.complexParser = function(sString, oContext, bUnescape, bTolerateFunctionsNotFound) {
		var parseObject = jQuery.sap.parseJS,
			oBindingInfo = {parts:[]},
			aFragments = [],
			aFunctionsNotFound,
			// whether oBindingInfo.parts contains s.th. more complicated than an expression binding
			bMoreThanExpression,
			// whether oBindingInfo.parts contains s.th. other than just simple binding infos
			bNotJustSimple,
			bUnescaped,
			p = 0,
			m,
			oEmbeddedBinding;

		function resolveRef(o,sProp) {
			if ( typeof o[sProp] === "string" ) {
				var sName = o[sProp];
				if ( jQuery.sap.startsWith(o[sProp], ".") ) {
					o[sProp] = jQuery.proxy(jQuery.sap.getObject(o[sProp].slice(1), undefined, oContext), oContext);
				} else {
					o[sProp] = jQuery.sap.getObject(o[sProp]);
				}
				if (typeof (o[sProp]) !== "function") {
					if (bTolerateFunctionsNotFound) {
						aFunctionsNotFound = aFunctionsNotFound || [];
						aFunctionsNotFound.push(sName);
					} else {
						jQuery.sap.log.error(sProp + " function " + sName + " not found!");
					}
				}
			}
		}

		function resolveType(o,sProp) {
			var FNType;
			if ( typeof o[sProp] === "string" ) {
				if ( jQuery.sap.startsWith(o[sProp], ".") ) {
					FNType = jQuery.sap.getObject(o[sProp].slice(1), undefined, oContext);
				} else {
					FNType = jQuery.sap.getObject(o[sProp]);
				}
				// TODO find another solution for the type parameters?
				if (typeof FNType === "function") {
					o[sProp] = new FNType(o.formatOptions, o.constraints);
				} else {
					o[sProp] = FNType;
				}
				delete o.formatOptions;
				delete o.constraints;
			}
		}

		function resolveEvents(o,sProp) {
			if (!(jQuery.isPlainObject(o[sProp]))) {
				return;
			}
			jQuery.each(o[sProp], function(sName, oObject) {
				resolveRef(o[sProp], sName);
			});
		}

		function resolveObject(o,sProp, sParentProp) {
			var FNType;
			if (!(typeof o[sProp] === "object" || jQuery.isArray(o[sProp]))) {
				return;
			}
			if (jQuery.isArray(o[sProp])) {
				jQuery.each(o[sProp], function(iIndex, oObject) {
					resolveObject(o[sProp], iIndex, sProp);
				});
			} else {
				if (sProp === "filters" || sParentProp === "filters") {
					FNType = jQuery.sap.getObject("sap.ui.model.Filter");
				} else if (sProp === "sorter" || sParentProp === "sorter") {
					FNType = jQuery.sap.getObject("sap.ui.model.Sorter");
					resolveRef(o[sProp], "group");
				}
				if (FNType) {
					o[sProp] = new FNType(o[sProp]);
				}
			}
		}

		/**
		 * Determines the binding info for the given string sInput starting at the given iStart and
		 * returns an object with the corresponding binding info as <code>result</code> and the
		 * position where to continue parsing as <code>at</code> property.
		 *
		 * @param {string} sInput The input string from which to resolve an embedded binding
		 * @param {number} iStart The start index for binding resolution in the input string
		 * @returns {object} An object with the following properties:
		 *   result: The binding info for the embedded binding
		 *   at: The position after the last character for the embedded binding in the input string
		 */
		function resolveEmbeddedBinding(sInput, iStart) {
			var oParseResult,
				iEnd,
				sName;
			// an embedded binding: check for a property name that would indicate a complex object
			if ( rObject.test(sInput.slice(iStart)) ) {
				oParseResult = parseObject(sInput, iStart);
				resolveType(oParseResult.result,'type');
				resolveObject(oParseResult.result,'filters');
				resolveObject(oParseResult.result,'sorter');
				resolveEvents(oParseResult.result,'events');
				resolveRef(oParseResult.result,'formatter');
				resolveRef(oParseResult.result,'factory'); // list binding
				resolveRef(oParseResult.result,'groupHeaderFactory');
				bNotJustSimple = true;
				for (sName in oParseResult.result) {
					if (sName !== "formatter" && sName !== "parts") {
						bMoreThanExpression = true;
						break;
					}
				}
				return oParseResult;
			}
			// otherwise it must be a simple binding (path only)
			iEnd = sInput.indexOf('}', iStart);
			if ( iEnd < iStart ) {
				throw new SyntaxError("no closing braces found in '" + sInput + "' after pos:" + iStart);
			}
			return {
				result: makeSimpleBindingInfo(sInput.slice(iStart + 1, iEnd)),
				at: iEnd + 1
			};
		}

		rFragments.lastIndex = 0; //previous parse call may have thrown an Error: reset lastIndex
		while ( (m = rFragments.exec(sString)) !== null ) {
			
			// check for a skipped literal string fragment  
			if ( p < m.index ) {
				aFragments.push(sString.slice(p, m.index));
			}
			
			// handle the different kinds of matches
			if ( m[1] ) {
				
				// an escaped opening bracket, closing bracket or backslash
				aFragments.push(m[1].slice(1));
				bUnescaped = true;
				
			} else {
				aFragments.push(oBindingInfo.parts.length);
				if (sString.charAt(m.index + 1) === "=") { //expression
					oEmbeddedBinding = ExpressionParser.parse(resolveEmbeddedBinding, sString,
						m.index + 2);
					if (sString.charAt(oEmbeddedBinding.at) !== "}") {
						throw new SyntaxError("Expected '}' and instead saw '"
							+ sString.charAt(oEmbeddedBinding.at)
							+ "' in expression binding "
							+ sString
							+ " at position "
							+ oEmbeddedBinding.at);
					}
					oEmbeddedBinding.at += 1;
					if (oEmbeddedBinding.result) {
						bNotJustSimple = true;
					} else {
						aFragments[aFragments.length - 1] = String(oEmbeddedBinding.constant);
						bUnescaped = true;
					}
				} else {
					oEmbeddedBinding = resolveEmbeddedBinding(sString, m.index);
				}
				if (oEmbeddedBinding.result) {
					oBindingInfo.parts.push(oEmbeddedBinding.result);
				}
				rFragments.lastIndex = oEmbeddedBinding.at;
			}
			
			// remember where we are
			p = rFragments.lastIndex;
		}
		
		// check for a trailing literal string fragment  
		if ( p < sString.length ) {
			aFragments.push(sString.slice(p));
		}

		// only if a part has been found we can return a binding info
		if (oBindingInfo.parts.length > 0) {
			// Note: aFragments.length >= 1
			if ( aFragments.length === 1 /* implies: && typeof aFragments[0] === "number" */ ) {
				// special case: a single binding only
				oBindingInfo = oBindingInfo.parts[0];
			} else if (bNotJustSimple && !bMoreThanExpression) {
				mergeParts(oBindingInfo, aFragments);
			} else { //TODO bNotJustSimple && bMoreThanExpression --> error in ManagedObject!
				// create the formatter function from the fragments
				oBindingInfo.formatter = makeFormatter(aFragments);
			}
			if (BindingParser._keepBindingStrings) {
				oBindingInfo.bindingString = sString;
			}
			if (aFunctionsNotFound) {
				oBindingInfo.functionsNotFound = aFunctionsNotFound;
			}
			return oBindingInfo;
		} else if ( bUnescape && bUnescaped ) {
			return aFragments.join('');
		}
		
	};

	BindingParser.complexParser.escape = function(sValue) {
		return sValue.replace(rBindingChars, "\\$1");
	};
	
	return BindingParser;

}, /* bExport= */ true);

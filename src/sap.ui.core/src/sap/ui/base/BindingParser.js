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
	 * Helper to create a formatter function. Only used to reduce the closure size of the formatter
	 */
	function makeFormatter(aFragments) {
		var fnFormatter = function(aValues) {
			var aResult = [],
				l = aFragments.length,
				i;
			
			for (i = 0; i < l; i++) {
				if ( typeof aFragments[i] === "number" ) {
					// a numerical fragment references the part with the same number 
					aResult.push(arguments[aFragments[i]]);
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
	
	BindingParser.complexParser = function(sString, oContext, bUnescape) {
		var parseObject = jQuery.sap.parseJS,
			oBindingInfo = {parts:[]},
			aFragments = [],
			bUnescaped,
			p = 0,
			m,
			oEmbeddedBinding,
			bContainsExpression;

		function resolveRef(o,sProp) {
			if ( typeof o[sProp] === "string" ) {
				var sName = o[sProp];
				if ( jQuery.sap.startsWith(o[sProp], ".") ) {
					o[sProp] = jQuery.proxy(jQuery.sap.getObject(o[sProp].slice(1), undefined, oContext), oContext);
				} else {
					o[sProp] = jQuery.sap.getObject(o[sProp]);
				}
				if (typeof (o[sProp]) !== "function") {
					jQuery.sap.log.error(sProp + " function " + sName + " not found!");
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
				iEnd;
			// an embedded binding: check for a property name that would indicate a complex object
			if ( rObject.test(sInput.slice(iStart)) ) {
				oParseResult = parseObject(sInput, iStart);
				resolveType(oParseResult.result,'type');
				resolveObject(oParseResult.result,'filters');
				resolveObject(oParseResult.result,'sorter');
				resolveRef(oParseResult.result,'formatter');
				resolveRef(oParseResult.result,'factory'); // list binding
				resolveRef(oParseResult.result,'groupHeaderFactory');
				return oParseResult;
			}
			// otherwise it must be a simple binding (path only)
			// TODO find closing brace via regex as well?
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
					bContainsExpression = true;
				} else {
					oEmbeddedBinding = resolveEmbeddedBinding(sString, m.index);
				}
				oBindingInfo.parts.push(oEmbeddedBinding.result);
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
			if ( aFragments.length === 1 /* implies: && typeof aFragments[0] === "number" */ ) {
				// special case: a single binding only
				oBindingInfo = oBindingInfo.parts[0];
			} else /* if ( aFragments.length > 1 ) */ {
				if (bContainsExpression) {
					throw new SyntaxError("Expression not allowed in composite binding: "
						+ sString);
				}
				// create the formatter function from the fragments
				oBindingInfo.formatter = makeFormatter(aFragments);
			}
			if (BindingParser._keepBindingStrings) {
				oBindingInfo.bindingString = sString;
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

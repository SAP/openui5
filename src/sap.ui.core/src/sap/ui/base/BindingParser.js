/*!
 * ${copyright}
 */

// Provides static class sap.ui.base.BindingParser
sap.ui.define([
	'./ExpressionParser',
	'sap/ui/model/BindingMode',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	"sap/base/future",
	"sap/base/util/JSTokenizer",
	"sap/base/util/resolveReference"
], function(
	ExpressionParser,
	BindingMode,
	Filter,
	Sorter,
	future,
	JSTokenizer,
	resolveReference
) {
	"use strict";

	/**
	 * @static
	 * @namespace
	 * @alias sap.ui.base.BindingParser
	 */
	var BindingParser = {
			_keepBindingStrings : false
		};

	/**
	 * Regular expression to check for a (new) object literal.
	 */
	var rObject = /^\{\s*('|"|)[a-zA-Z$_][a-zA-Z0-9$_]*\1\s*:/;

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
	 * Creates a composite formatter which calls <code>fnRootFormatter</code> on the results of the
	 * given formatters, which in turn are called on the original arguments.
	 *
	 * @param {function[]} aFormatters
	 *   list of leaf-level formatters
	 * @param {function} [fnRootFormatter]
	 *   root level formatter; default: <code>Array.prototype.join(., " ")</code>
	 * @return {function}
	 *   a composite formatter
	 */
	function composeFormatters(aFormatters, fnRootFormatter) {
		var bRequiresIContext = aFormatters.some(function (fnFormatter) {
				return fnFormatter.requiresIContext; // Note: it's either true or missing here
			});

		function formatter(oInterface) {
			var i,
				n = aFormatters.length,
				aArguments = arguments,
				aResults = new Array(n);

			for (i = 0; i < n; i += 1) {
				if (aFormatters[i].requiresIContext) {
					aArguments = arguments;
				} else if (bRequiresIContext) { // drop oInterface
					aArguments = Array.prototype.slice.call(arguments, 1);
				}
				aResults[i] = aFormatters[i].apply(this, aArguments);
			}

			if (fnRootFormatter) {
				return fnRootFormatter.apply(this, aResults);
			}
			// @see sap.ui.model.CompositeBinding#getExternalValue
			// "default: multiple values are joined together as space separated list if no
			//  formatter or type specified"
			return n > 1 ? aResults.join(" ") : aResults[0];
		}

		if (bRequiresIContext) {
			formatter.requiresIContext = true;
		}
		// @see sap.ui.base.ManagedObject#_bindProperty
		formatter.textFragments = fnRootFormatter && fnRootFormatter.textFragments
			|| "sap.ui.base.BindingParser: composeFormatters";
		return formatter;
	}

	/**
	 * Helper to create a formatter function. Only used to reduce the closure size of the formatter
	 *
	 * @param {number[]|string[]} aFragments
	 *   array of fragments, either a literal text or the index of the binding's part
	 * @returns {function}
	 *   a formatter function
	 */
	function makeFormatter(aFragments) {
		var fnFormatter = function() {
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
	 *
	 * @param {string} sPath
	 *   the given path
	 * @param {object} [oEnv]
	 *   the "environment"
	 * @returns {object}
	 *   a binding info object
	 */
	function makeSimpleBindingInfo(sPath, oEnv) {
		var iPos = sPath.indexOf(">"),
			oBindingInfo = { path : sPath };

		if ( iPos > 0 ) {
			oBindingInfo.model = sPath.slice(0,iPos);
			oBindingInfo.path = sPath.slice(iPos + 1);
		}
		if (oEnv?.mLocals && oBindingInfo.path.includes("@@")) {
			oBindingInfo.parameters = {scope : oEnv.mLocals};
		}

		return oBindingInfo;
	}


	/**
	 * Delegates to <code>BindingParser.mergeParts</code>, but stifles any errors.
	 *
	 * @param {object} oBindingInfo
	 *   a binding info object
	 * @param {string} [sBinding]
	 *   the original binding string as a detail for error logs
	 */
	function mergeParts(oBindingInfo, sBinding) {
		try {
			BindingParser.mergeParts(oBindingInfo);
		} catch (e) {
			future.errorThrows("Cannot merge parts: " + e.message, sBinding,
				"sap.ui.base.BindingParser");
			// rely on error in ManagedObject
		}
	}

	// A qualified name, followed by a .bind(id) call
	// 1st capturing group matches the qualified name w/o .bind() call
	// 2nd capturing group matches the .bind() argument
	const rFormatterBind = /(^(?:[$_\p{ID_Start}][$_\p{ID_Continue}]*\.)*[\p{ID_Start}][$_\p{ID_Continue}]*)\.bind\(([$_\p{ID_Start}][$_\p{ID_Continue}]*)\)$/u;

	function resolveBindingInfo(oEnv, oBindingInfo) {
		var mVariables = Object.assign({".": oEnv.oContext}, oEnv.mLocals);

		/*
		 * Resolves a function name to a function.
		 *
		 * Names can consist of multiple segments, separated by dots.
		 *
		 * If the name starts with a dot ('.'), lookup happens within the given context only;
		 * otherwise it will first happen within the given context (only if
		 * <code>bPreferContext</code> is set) and then use <code>mLocals</code> to resolve
		 * the function and finally fall back to the global context (window).
		 *
		 * @param {object} o Object from which the property should be read and resolved
		 * @param {string} sProp name of the property to resolve
		 */
		function resolveRef(o,sProp) {
			if ( typeof o[sProp] === "string" ) {
				let sName = o[sProp];
				let bSkipBindContext = false;
				let aMatch = [], mBindableValues = {};

				// check for .bind()-syntax
				if (sProp == "formatter" && sName.includes(".bind(")) {
					aMatch = sName.match(rFormatterBind);

					if (!aMatch) {
						throw new Error(`Error in formatter '${sName}': Either syntax error in the usage of '.bind(...)' or wrong number of arguments given. Only one argument is allowed when using '.bind()'.`);
					}
					if (aMatch[2].startsWith("$") && !Object.hasOwn(oEnv.mAdditionalBindableValues, aMatch[2])) {
						throw new Error(`Error in formatter '${sName}': The argument '${aMatch[2]}' used in the '.bind()' call starts with '$', which is only allowed for framework-reserved variables. Please rename the variable so that it doesn't start with '$'.`);
					}

					bSkipBindContext = true;
					mBindableValues = Object.assign(mBindableValues, oEnv.mLocals, oEnv.mAdditionalBindableValues);

					// only pass function name to resolveReference
					sName = aMatch[1];
				}

				o[sProp] = resolveReference(sName, mVariables, {
					preferDotContext: oEnv.bPreferContext,
					bindContext: !bSkipBindContext,
					bindDotContext: !oEnv.bStaticContext
				});

				if (typeof (o[sProp]) !== "function") {
					if (oEnv.bTolerateFunctionsNotFound) {
						oEnv.aFunctionsNotFound = oEnv.aFunctionsNotFound || [];
						oEnv.aFunctionsNotFound.push(sName);
					} else {
						future.errorThrows(sProp + " function " + sName + " not found!");
					}
				}

				if (bSkipBindContext) {
					if (!Object.hasOwn(mBindableValues, aMatch[2])) {
						throw new Error(`Error in formatter '${sName}': Unknown argument '${aMatch[2]}' passed to '.bind()' call.`);
					}
					o[sProp] = mBindableValues[aMatch[2]] !== null ? o[sProp].bind(mBindableValues[aMatch[2]]) : o[sProp];
				}
			}
		}

		/*
		 * Resolves a data type name and configuration either to a type constructor or to a type instance.
		 *
		 * The name is resolved locally (against oEnv.oContext) if it starts with a '.', otherwise against
		 * the oEnv.mLocals and if it's still not resolved, against the global context (window).
		 *
		 * The resolution is done in place. If the name resolves to a function, it is assumed to be the
		 * constructor of a data type. A new instance will be created, using the values of the
		 * properties 'constraints' and 'formatOptions' as parameters of the constructor.
		 * Both properties will be removed from <code>o</code>.
		 *
		 * @param {object} o Object from which a property should be read and resolved
		 */
		function resolveType(o) {
			var FNType;
			var sType = o.type;
			if (typeof sType === "string" ) {
				FNType = resolveReference(sType, mVariables, {
					bindContext: false,
					// only when types aren't expected to be loaded asynchronously, we try to use a
					// probing-require to fetch it in case it can't be resolved with 'mVariables'
					useProbingRequire: !oEnv.aTypePromises
				});

				var fnInstantiateType = function(TypeClass) {
					if (typeof TypeClass === "function") {
						o.type = new TypeClass(o.formatOptions, o.constraints);
					} else {
						o.type = TypeClass;
					}

					if (!o.type) {
						future.errorThrows("Failed to resolve type '" + sType + "'. Maybe not loaded or a typo?");
					}

					// TODO why are formatOptions and constraints also removed for an already instantiated type?
					// TODO why is a value of type object not validated (instanceof Type)
					delete o.formatOptions;
					delete o.constraints;
				};

				if (oEnv.aTypePromises) {
					var pType;

					// FNType is either:
					//    a) a function
					//       * a lazy-stub
					//       * a regular constructor function
					//    b) an object that must implement Type interface (we take this "as-is")
					//    c) undefined, we try to interpret the original string as a module name then
					if (typeof FNType === "function" && !FNType._sapUiLazyLoader ||
						FNType && typeof FNType === "object") {
						pType = Promise.resolve(fnInstantiateType(FNType));
					} else {
						// load type asynchronously
						pType = new Promise(function(fnResolve, fnReject) {
							sap.ui.require([sType.replace(/\./g, "/")], fnResolve, fnReject);
						}).catch(function(oError){
							// [Compatibility]: We must not throw an error during type creation (except constructor failures!).
							//                  We catch any require() rejection and log the error.
							future.errorThrows(oError);
						}).then(fnInstantiateType);
					}

					oEnv.aTypePromises.push(pType);
				} else {
					fnInstantiateType(FNType);
				}
			}
		}

		/*
		 * Resolves a map of event listeners, keyed by the event name.
		 *
		 * Each listener can be the name of a single function that will be resolved
		 * in the given context (oEnv).
		 */
		function resolveEvents(oEvents) {
			if ( oEvents != null && typeof oEvents === 'object' ) {
				for ( var sName in oEvents ) {
					resolveRef(oEvents, sName);
				}
			}
		}

		/*
		 * Converts filter definitions to sap.ui.model.Filter instances.
		 *
		 * The value of the given property can either be a single filter definition object
		 * which will be fed into the constructor of sap.ui.model.Filter.
		 * Or it can be an array of such objects.
		 *
		 * If any of the filter definition objects contains a property named 'filters',
		 * that property will be resolved as filters recursively.
		 *
		 * A property 'test' will be resolved as function in the given context.
		 */
		function resolveFilters(o, sProp) {
			var v = o[sProp];

			if ( Array.isArray(v) ) {
				v.forEach(function(oObject, iIndex) {
					resolveFilters(v, iIndex);
				});
				return;
			}

			if ( v && typeof v === 'object' ) {
				resolveRef(v, 'test');
				resolveFilters(v, 'filters');
				resolveFilters(v, 'condition');
				o[sProp] = new Filter(v);
			}
		}

		/*
		 * Converts sorter definitions to sap.ui.model.Sorter instances.
		 *
		 * The value of the given property can either be a single sorter definition object
		 * which then will be fed into the constructor of sap.ui.model.Sorter, or it can
		 * be an array of such objects.
		 *
		 * Properties 'group' and 'comparator' in any of the sorter definitions
		 * will be resolved as functions in the given context (oEnv).
		 */
		function resolveSorters(o, sProp) {
			var v = o[sProp];

			if ( Array.isArray(v) ) {
				v.forEach(function(oObject, iIndex) {
					resolveSorters(v, iIndex);
				});
				return;
			}

			if ( v && typeof v === 'object' ) {
				resolveRef(v, "group");
				resolveRef(v, "comparator");
				o[sProp] = new Sorter(v);
			}
		}

		if ( typeof oBindingInfo === 'object' ) {
			// Note: this resolves deeply nested bindings although CompositeBinding doesn't support them
			if ( Array.isArray(oBindingInfo.parts) ) {
				oBindingInfo.parts.forEach(function(oPart) {
					resolveBindingInfo(oEnv, oPart);
				});
			}
			resolveType(oBindingInfo);
			resolveFilters(oBindingInfo,'filters');
			resolveSorters(oBindingInfo,'sorter');
			resolveEvents(oBindingInfo.events);
			resolveRef(oBindingInfo,'formatter');
			resolveRef(oBindingInfo,'factory'); // list binding
			resolveRef(oBindingInfo,'groupHeaderFactory'); // list binding
			if (oEnv.mLocals && oBindingInfo.path?.includes("@@")
					&& oBindingInfo.parameters?.scope === undefined) {
				oBindingInfo.parameters ??= {};
				oBindingInfo.parameters.scope = oEnv.mLocals;
			}
		}

		return oBindingInfo;
	}

	/**
	 * Determines the binding info for the given string sInput starting at the given iStart and
	 * returns an object with the corresponding binding info as <code>result</code> and the
	 * position where to continue parsing as <code>at</code> property.
	 *
	 * @param {object} oEnv
	 *   the "environment"
	 * @param {object} oEnv.oContext
	 *   the context object from complexBinding (read-only)
	 * @param {boolean} oEnv.bTolerateFunctionsNotFound
	 *   if <code>true</code>, unknown functions are gathered in aFunctionsNotFound, otherwise an
	 *   error is logged (read-only)
	 * @param {string[]} oEnv.aFunctionsNotFound
	 *   a list of functions that could not be found if oEnv.bTolerateFunctionsNotFound is true
	 *   (append only)
	 * @param {string} sInput
	 *   The input string from which to resolve an embedded binding
	 * @param {int} iStart
	 *   The start index for binding resolution in the input string
	 * @returns {object}
	 *   An object with the following properties:
	 *   result: The binding info for the embedded binding
	 *   at: The position after the last character for the embedded binding in the input string
	 */
	function resolveEmbeddedBinding(oEnv, sInput, iStart) {
		var parseObject = JSTokenizer.parseJS,
			oParseResult,
			iEnd;

		// an embedded binding: check for a property name that would indicate a complex object
		if ( rObject.test(sInput.slice(iStart)) ) {
			oParseResult = parseObject(sInput, iStart);
			resolveBindingInfo(oEnv, oParseResult.result);
			return oParseResult;
		}
		// otherwise it must be a simple binding (path only)
		iEnd = sInput.indexOf('}', iStart);
		if ( iEnd < iStart ) {
			throw new SyntaxError("no closing braces found in '" + sInput + "' after pos:" + iStart);
		}
		return {
			result: makeSimpleBindingInfo(sInput.slice(iStart + 1, iEnd), oEnv),
			at: iEnd + 1
		};
	}

	BindingParser.simpleParser = function(sString) {
		// The simpleParser only needs the first string argument and additionally in the async case the 7th one.
		// see "BindingParser.complexParser" for the other arguments
		var bResolveTypesAsync = arguments[7];

		var oBindingInfo;
		if ( sString.startsWith("{") && sString.endsWith("}") ) {
			oBindingInfo = makeSimpleBindingInfo(sString.slice(1, -1));
		}

		if (bResolveTypesAsync) {
			return {
				bindingInfo: oBindingInfo,
				resolved: Promise.resolve()
			};
		}

		return oBindingInfo;
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
	 * @param {boolean} [bStaticContext=false]
	 *   If true, relative function names found via <code>oContext</code> will not be treated as
	 *   instance methods of the context, but as static methods.
	 * @param {boolean} [bPreferContext=false]
	 *   if true, names without an initial dot are searched in the given context first and then
	 *   globally
	 * @param {object} [mLocals]
	 *   variables allowed in the expression as map of variable name to its value
	 * @param {boolean} [bResolveTypesAsync]
	 *   whether the Type classes should be resolved asynchronously.
	 *   The parsing result is enriched with an additional Promise capturing all transitive Type loading.
	 */
	BindingParser.complexParser = function(sString, oContext, bUnescape,
			bTolerateFunctionsNotFound, bStaticContext, bPreferContext, mLocals, bResolveTypesAsync, mAdditionalBindableValues) {
		var b2ndLevelMergedNeeded = false, // whether some 2nd level parts again have parts
			oBindingInfo = {parts:[]},
			bMergeNeeded = false, // whether some top-level parts again have parts
			oEnv = {
				oContext: oContext,
				mLocals: mLocals,
				aFunctionsNotFound: undefined, // lazy creation
				bPreferContext : bPreferContext,
				bStaticContext: bStaticContext,
				bTolerateFunctionsNotFound: bTolerateFunctionsNotFound,
				aTypePromises: bResolveTypesAsync ? [] : undefined,
				mAdditionalBindableValues: mAdditionalBindableValues
			},
			aFragments = [],
			bUnescaped,
			p = 0,
			m,
			oEmbeddedBinding;

		/**
		 * Parses an expression. Sets the flags accordingly.
		 *
		 * @param {string} sInput The input string to parse from
		 * @param {int} iStart The start index
		 * @param {sap.ui.model.BindingMode} oBindingMode the binding mode
		 * @returns {object} a result object with the binding in <code>result</code> and the index
		 * after the last character belonging to the expression in <code>at</code>
		 * @throws SyntaxError if the expression string is invalid
		 */
		function expression(sInput, iStart, oBindingMode) {
			var oBinding = ExpressionParser.parse(resolveEmbeddedBinding.bind(null, oEnv), sString,
					iStart, null, mLocals || (bStaticContext ? oContext : null));

			/**
			 * Recursively sets the mode <code>oBindingMode</code> on the given binding (or its
			 * parts).
			 *
			 * @param {object} oBinding
			 *   a binding which may be composite
			 * @param {int} [iIndex]
			 *   index provided by <code>forEach</code>
			 */
			function setMode(oBinding, iIndex) {
				if (oBinding.parts) {
					oBinding.parts.forEach(function (vPart, i) {
						if (typeof vPart === "string") {
							vPart = oBinding.parts[i] = {path : vPart};
						}
						setMode(vPart, i);
					});
					b2ndLevelMergedNeeded = b2ndLevelMergedNeeded || iIndex !== undefined;
				} else {
					oBinding.mode = oBindingMode;
				}
			}

			if (sInput.charAt(oBinding.at) !== "}") {
				throw new SyntaxError("Expected '}' and instead saw '"
					+ sInput.charAt(oBinding.at)
					+ "' in expression binding "
					+ sInput
					+ " at position "
					+ oBinding.at);
			}
			oBinding.at += 1;
			if (oBinding.result) {
				setMode(oBinding.result);
			} else {
				aFragments[aFragments.length - 1] = String(oBinding.constant);
				bUnescaped = true;
			}
			return oBinding;
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
				if (sString.indexOf(":=", m.index) === m.index + 1) {
					oEmbeddedBinding = expression(sString, m.index + 3, BindingMode.OneTime);
				} else if (sString.charAt(m.index + 1) === "=") { //expression
					oEmbeddedBinding = expression(sString, m.index + 2, BindingMode.OneWay);
				} else {
					oEmbeddedBinding = resolveEmbeddedBinding(oEnv, sString, m.index);
				}
				if (oEmbeddedBinding.result) {
					oBindingInfo.parts.push(oEmbeddedBinding.result);
					bMergeNeeded = bMergeNeeded || "parts" in oEmbeddedBinding.result;
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
				bMergeNeeded = b2ndLevelMergedNeeded;
			} else {
				// create the formatter function from the fragments
				oBindingInfo.formatter = makeFormatter(aFragments);
			}
			if (bMergeNeeded) {
				mergeParts(oBindingInfo, sString);
			}
			if (BindingParser._keepBindingStrings) {
				oBindingInfo.bindingString = sString;
			}
			if (oEnv.aFunctionsNotFound) {
				oBindingInfo.functionsNotFound = oEnv.aFunctionsNotFound;
			}

			if (bResolveTypesAsync) {
				// parse result contains additionally a Promise with all asynchronously loaded types
				return {
					bindingInfo: oBindingInfo,
					resolved: Promise.all(oEnv.aTypePromises),
					wait : oEnv.aTypePromises.length > 0
				};
			}

			return oBindingInfo;
		} else if ( bUnescape && bUnescaped ) {
			var sResult = aFragments.join('');
			if (bResolveTypesAsync) {
				return {
					bindingInfo: sResult,
					resolved: Promise.resolve()
				};
			}
			return sResult;
		}

	};

	BindingParser.complexParser.escape = function(sValue) {
		return sValue.replace(rBindingChars, "\\$1");
	};

	/**
	 * Merges the given binding info object's parts, which may have parts themselves, into a flat
	 * list of parts, taking care of existing formatter functions. If the given binding info does
	 * not have a root formatter, <code>Array.prototype.join(., " ")</code> is used instead.
	 * Parts which are not binding info objects are also supported; they are removed from the
	 * "parts" array and taken care of by the new root-level formatter function, which feeds them
	 * into the old formatter function at the right place.
	 *
	 * Note: Truly hierarchical composite bindings are not yet supported. This method deals with a
	 * special case of a two-level hierarchy which can be turned into a one-level hierarchy. The
	 * precondition is that the parts which have parts themselves are not too complex, i.e. must
	 * have no other properties than "formatter" and "parts". A missing formatter on that level
	 * is replaced with the default <code>Array.prototype.join(., " ")</code>.
	 *
	 * @param {object} oBindingInfo
	 *   a binding info object with a possibly empty array of parts and a new formatter function
	 * @throws {Error}
	 *   in case precondition is not met
	 * @private
	 */
	BindingParser.mergeParts = function (oBindingInfo) {
		var aFormatters = [],
			aParts = [];

		oBindingInfo.parts.forEach(function (vEmbeddedBinding) {
			var iEnd,
				fnFormatter = function () {
					return vEmbeddedBinding; // just return constant value
				},
				sName,
				iStart = aParts.length;

			/*
			 * Selects the overall argument corresponding to the current part.
			 *
			 * @returns {any}
			 *   the argument at index <code>iStart</code>
			 */
			function select() {
				return arguments[iStart];
			}

			// @see sap.ui.base.ManagedObject#extractBindingInfo
			if (vEmbeddedBinding && typeof vEmbeddedBinding === "object") {
				if (vEmbeddedBinding.parts) {
					for (sName in vEmbeddedBinding) {
						if (sName !== "formatter" && sName !== "parts") {
							throw new Error("Unsupported property: " + sName);
						}
					}

					aParts = aParts.concat(vEmbeddedBinding.parts);
					iEnd = aParts.length;
					if (vEmbeddedBinding.formatter) {
						if (vEmbeddedBinding.formatter.requiresIContext === true) {
							fnFormatter = function (oInterface) {
								// old formatter needs to operate on its own slice of overall args
								var aArguments
									= Array.prototype.slice.call(arguments, iStart + 1, iEnd + 1);

								aArguments.unshift(oInterface._slice(iStart, iEnd));

								return vEmbeddedBinding.formatter.apply(this, aArguments);
							};
							fnFormatter.requiresIContext = true;
						} else {
							fnFormatter = function () {
								// old formatter needs to operate on its own slice of overall args
								return vEmbeddedBinding.formatter.apply(this,
									Array.prototype.slice.call(arguments, iStart, iEnd));
							};
						}
					} else if (iEnd - iStart > 1) {
						fnFormatter = function () {
							// @see sap.ui.model.CompositeBinding#getExternalValue
							// "default: multiple values are joined together as space separated
							//  list if no formatter or type specified"
							return Array.prototype.slice.call(arguments, iStart, iEnd).join(" ");
						};
					} else {
						fnFormatter = select;
					}
				} else if ("path" in vEmbeddedBinding) {
					aParts.push(vEmbeddedBinding);
					fnFormatter = select;
				}
			}
			aFormatters.push(fnFormatter);
		});

		oBindingInfo.parts = aParts;
		oBindingInfo.formatter = composeFormatters(aFormatters, oBindingInfo.formatter);
	};

	/**
	 * Parses a string <code>sInput</code> with an expression. The input string is parsed starting
	 * at the index <code>iStart</code> and the return value contains the index after the last
	 * character belonging to the expression.
	 *
	 * @param {string} sInput
	 *   the string to be parsed
	 * @param {int} iStart
	 *   the index to start parsing
	 * @param {object} [oEnv]
	 *   the "environment" (see resolveEmbeddedBinding function for details)
	 * @param {object} [mLocals]
	 *   variables allowed in the expression as map of variable name to value
	 * @returns {object}
	 *   the parse result with the following properties
	 *   <ul>
	 *    <li><code>result</code>: the binding info as an object with the properties
	 *     <code>formatter</code> (the formatter function to evaluate the expression) and
	 *     <code>parts</code> (an array of the referenced bindings)</li>
	 *    <li><code>at</code>: the index of the first character after the expression in
	 *     <code>sInput</code></li>
	 *   </ul>
	 * @throws SyntaxError
	 *   If the expression string is invalid or unsupported. The at property of
	 *   the error contains the position where parsing failed.
	 * @private
	 */
	BindingParser.parseExpression = function (sInput, iStart, oEnv, mLocals) {
		oEnv = oEnv || {};

		if (mLocals) {
			oEnv.mLocals = mLocals;
		}

		return ExpressionParser.parse(resolveEmbeddedBinding.bind(null, oEnv), sInput, iStart, mLocals);
	};

	return BindingParser;

});

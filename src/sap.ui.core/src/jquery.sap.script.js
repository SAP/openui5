/*!
 * ${copyright}
 */

// Provides miscellaneous utility functions that might be useful for any script
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Some private variable used for creation of (pseudo-)unique ids.
	 * @type int
	 * @private
	 */
	var iIdCounter = 0;

	/**
	 * Creates and returns a pseudo-unique id.
	 *
	 * No means for detection of overlap with already present or future UIDs.
	 *
	 * @return {string} A pseudo-unique id.
	 * @public
	 */
	jQuery.sap.uid = function uid() {
		return "id-" + new Date().valueOf() + "-" + iIdCounter++;
	};

	/**
	 * This function generates a hash-code from a string
	 * @param {string} sString The string to generate the hash-code from
	 * @return {int} The generated hash-code
	 * @since 1.39
	 * @private
	 */
	jQuery.sap.hashCode = function(sString) {
		var i = sString.length, iHash = 0;

		while (i--) {
			iHash = (iHash << 5) - iHash + sString.charCodeAt(i);
			iHash = iHash & iHash; // convert to 32 bit
		}

		return iHash;
	};

	/**
	 * Calls a method after a given delay and returns an id for this timer
	 *
	 * @param {int} iDelay Delay time in milliseconds
	 * @param {object} oObject Object from which the method should be called
	 * @param {string|object} method function pointer or name of the method
	 * @param {array} [aParameters] Method parameters
	 * @return {string} Id which can be used to cancel the timer with clearDelayedCall
	 * @public
	 */
	jQuery.sap.delayedCall = function delayedCall(iDelay, oObject, method, aParameters) {
		return setTimeout(function(){
			if (jQuery.type(method) == "string") {
				method = oObject[method];
			}
			method.apply(oObject, aParameters || []);
		}, iDelay);
	};

	/**
	 * Stops the delayed call.
	 *
	 * The function given when calling delayedCall is not called anymore.
	 *
	 * @param {string} sDelayedCallId The id returned, when calling delayedCall
	 * @public
	 */
	jQuery.sap.clearDelayedCall = function clearDelayedCall(sDelayedCallId) {
		clearTimeout(sDelayedCallId);
		return this;
	};

	/**
	 * Calls a method after a given interval and returns an id for this interval.
	 *
	 * @param {int} iInterval Interval time in milliseconds
	 * @param {object} oObject Object from which the method should be called
	 * @param {string|object} method function pointer or name of the method
	 * @param {array} [aParameters] Method parameters
	 * @return {string} Id which can be used to cancel the interval with clearIntervalCall
	 * @public
	 */
	jQuery.sap.intervalCall = function intervalCall(iInterval, oObject, method, aParameters) {
		return setInterval(function(){
			if (jQuery.type(method) == "string") {
				method = oObject[method];
			}
			method.apply(oObject, aParameters || []);
		}, iInterval);
	};

	/**
	 * Stops the interval call.
	 *
	 * The function given when calling intervalCall is not called anymore.
	 *
	 * @param {string} sIntervalCallId The id returned, when calling intervalCall
	 * @public
	 */
	jQuery.sap.clearIntervalCall = function clearIntervalCall(sIntervalCallId) {
		clearInterval(sIntervalCallId);
		return this;
	};

	// Javadoc for private inner class "UriParams" - this list of comments is intentional!
	/**
	 * @interface	Encapsulates all URI parameters of the current windows location (URL).
	 *
	 * Use {@link jQuery.sap.getUriParameters} to create an instance of jQuery.sap.util.UriParameters.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 0.9.0
	 * @name jQuery.sap.util.UriParameters
	 * @public
	 */
	/**
	 * Returns the value(s) of the URI parameter with the given name sName.
	 *
	 * If the boolean parameter bAll is <code>true</code>, an array of string values of all
	 * occurrences of the URI parameter with the given name is returned. This array is empty
	 * if the URI parameter is not contained in the windows URL.
	 *
	 * If the boolean parameter bAll is <code>false</code> or is not specified, the value of the first
	 * occurrence of the URI parameter with the given name is returned. Might be <code>null</code>
	 * if the URI parameter is not contained in the windows URL.
	 *
	 * @param {string} sName The name of the URI parameter.
	 * @param {boolean} [bAll=false] Optional, specifies whether all or only the first parameter value should be returned.
	 * @return {string|array} The value(s) of the URI parameter with the given name
	 * @SecSource {return|XSS} Return value contains URL parameters
	 *
	 * @function
	 * @name jQuery.sap.util.UriParameters.prototype.get
	 */

	/*
	 * Implements jQuery.sap.util.UriParameters
	 */
	var UriParams = function(sUri) {
		this.mParams = {};
		var sQueryString = sUri || window.location.href;
		if ( sQueryString.indexOf('#') >= 0 ) {
			sQueryString = sQueryString.slice(0, sQueryString.indexOf('#'));
		}
		if (sQueryString.indexOf("?") >= 0) {
			sQueryString = sQueryString.slice(sQueryString.indexOf("?") + 1);
			var aParameters = sQueryString.split("&"),
				mParameters = {},
				aParameter,
				sName,
				sValue;
			for (var i = 0; i < aParameters.length; i++) {
				aParameter = aParameters[i].split("=");
				sName = decodeURIComponent(aParameter[0]);
				sValue = aParameter.length > 1 ? decodeURIComponent(aParameter[1].replace(/\+/g,' ')) : "";
				if (sName) {
					if (!Object.prototype.hasOwnProperty.call(mParameters, sName)) {
						mParameters[sName] = [];
					}
					mParameters[sName].push(sValue);
				}
			}
			this.mParams = mParameters;
		}
	};

	UriParams.prototype = {};

	/*
	 * Implements jQuery.sap.util.UriParameters.prototype.get
	 */
	UriParams.prototype.get = function(sName, bAll) {
		var aValues = Object.prototype.hasOwnProperty.call(this.mParams, sName) ? this.mParams[sName] : [];
		return bAll === true ? aValues : (aValues[0] || null);
	};

	/**
	 * Creates and returns a new instance of {@link jQuery.sap.util.UriParameters}.
	 *
	 * Example for reading a single URI parameter (or the value of the first
	 * occurrence of the URI parameter):
	 * <pre>
	 *	var sValue = jQuery.sap.getUriParameters().get("myUriParam");
	 * </pre>
	 *
	 * Example for reading the values of the first of the URI parameter
	 * (with multiple occurrences):
	 * <pre>
	 *	var aValues = jQuery.sap.getUriParameters().get("myUriParam", true);
	 *	for(i in aValues){
	 *	var sValue = aValues[i];
	 *	}
	 * </pre>
	 *
	 * @public
	 * @param {string} sUri Uri to determine the parameters for
	 * @return {jQuery.sap.util.UriParameters} A new URI parameters instance
	 */
	jQuery.sap.getUriParameters = function getUriParameters(sUri) {
		return new UriParams(sUri);
	};

	/**
	 * Sorts the given array in-place and removes any duplicates (identified by "===").
	 *
	 * Use <code>jQuery.unique()</code> for arrays of DOMElements.
	 *
	 * @param {Array} a An Array of any type
	 * @return {Array} Same array as given (for chaining)
	 * @public
	 */
	jQuery.sap.unique = function(a) {
		jQuery.sap.assert(a instanceof Array, "unique: a must be an array");
		var l = a.length;
		if ( l > 1 ) {
			a.sort();
			var j = 0;
			for (var i = 1; i < l; i++) {
				// invariant: i is the entry to check, j is the last unique entry known so far
				if ( a[i] !== a[j] ) {
					a[++j] = a[i];
				}
			}
			// cut off the rest - if any
			if ( ++j < l ) {
				a.splice(j, l - j);
			}
		}
		return a;
	};

	/**
	 * Compares the two given values for equality, especially takes care not to compare
	 * arrays and objects by reference, but compares their content.
	 * Note: function does not work with comparing XML objects
	 *
	 * @param {any} a A value of any type
	 * @param {any} b A value of any type
	 * @param {int} [maxDepth=10] Maximum recursion depth
	 * @param {boolean} [contains] Whether all existing properties in a are equal as in b
	 *
	 * @return {boolean} Whether a and b are equal
	 * @public
	 */
	jQuery.sap.equal = function(a, b, maxDepth, contains, depth) {
		// Optional parameter normalization
		if (typeof maxDepth == "boolean") {
			contains = maxDepth;
			maxDepth = undefined;
		}
		if (!depth) {
			depth = 0;
		}
		if (!maxDepth) {
			maxDepth = 10;
		}
		if (depth > maxDepth) {
			return false;
		}
		if (a === b) {
			return true;
		}
		if (Array.isArray(a) && Array.isArray(b)) {
			if (!contains && a.length !== b.length) {
				return false;
			}
			if (a.length > b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				if (!jQuery.sap.equal(a[i], b[i], maxDepth, contains, depth + 1)) {
						return false;
				}
			}
			return true;
		}
		if (typeof a == "object" && typeof b == "object") {
			if (!a || !b) {
				return false;
			}
			if (a.constructor !== b.constructor) {
				return false;
			}
			if (!contains && Object.keys(a).length !== Object.keys(b).length) {
				return false;
			}
			if (a.nodeName && b.nodeName && a.namespaceURI && b.namespaceURI) {
				return a.isEqualNode(b);
			}
			if (a instanceof Date) {
				return a.valueOf() === b.valueOf();
			}
			for (var i in a) {
				if (!jQuery.sap.equal(a[i], b[i], maxDepth, contains, depth + 1)) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	/**
	 * Iterates over elements of the given object or array.
	 *
	 * Works similar to <code>jQuery.each</code>, but a numeric index is only used for
	 * instances of <code>Array</code>. For all other objects, including those with a numeric
	 * <code>length</code> property, the properties are iterated by name.
	 *
	 * The contract for the <code>fnCallback</code> is the same as for <code>jQuery.each</code>,
	 * when it returns <code>false</code>, then the iteration stops (break).
	 *
	 * @param {object|any[]} oObject object or array to enumerate the properties of
	 * @param {function} fnCallback function to call for each property name
	 * @return {object|any[]} the given <code>oObject</code>
	 * @since 1.11
	 */
	jQuery.sap.each = function(oObject, fnCallback) {
		var isArray = Array.isArray(oObject),
			length, i;

		if ( isArray ) {
			for (i = 0, length = oObject.length; i < length; i++) {
				if ( fnCallback.call(oObject[i], i, oObject[i]) === false ) {
					break;
				}
			}
		} else {
			for ( i in oObject ) {
				if ( fnCallback.call(oObject[i], i, oObject[i] ) === false ) {
					break;
				}
			}
		}

		return oObject;
	};

	/**
	 * Substitute for <code>for(n in o)</code> loops which used to fix the 'Don'tEnum' bug of IE8.
	 * As IE8 is not supported anymore this function is just a wrapper around the native for-in loop.
	 *
	 * Iterates over all enumerable properties of the given object and calls the
	 * given callback function for each of them. The assumed signature of the
	 * callback function is
	 *
	 *	 fnCallback(name, value)
	 *
	 * where name is the name of the property and value is its value.
	 *
	 * @param {object} oObject object to enumerate the properties of
	 * @param {function} fnCallback function to call for each property name
	 * @function
	 * @deprecated Since version 1.48.0. IE8 is not supported anymore, thus no special handling is required. Use native for-in loop instead.
	 * @since 1.7.1
	 */
	jQuery.sap.forIn = function(oObject, fnCallback) {
		for (var n in oObject) {
			if ( fnCallback(n, oObject[n]) === false ) {
				return;
			}
		}
	};

	/**
	 * Calculate delta of old list and new list.
	 *
	 * This function implements the algorithm described in "A Technique for Isolating Differences Between Files"
	 * (Commun. ACM, April 1978, Volume 21, Number 4, Pages 264-268).
	 *
	 * Items in the arrays are not compared directly. Instead, a substitute symbol is determined for each item
	 * by applying the provided function <code>fnSymbol</code> to it. Items with strictly equal symbols are
	 * assumed to represent the same logical item:
	 * <pre>
	 *   fnSymbol(a) === fnSymbol(b)   <=>   a 'is logically the same as' b
	 * </pre>
	 * As an additional constraint, casting the symbols to string should not modify the comparison result.
	 * If this second constraint is not met, this method might report more diffs than necessary.
	 *
	 * If no symbol function is provided, a default implementation is used which applies <code>JSON.stringify</code>
	 * to non-string items and reduces the strings to a hash code. It is not guaranteed that this default
	 * implementation fulfills the above constraint in all cases, but it is a compromise between implementation
	 * effort, generality and performance. If items are known to be non-stringifiable (e.g. because they may
	 * contain cyclic references) or when hash collisions are likely, an own <code>fnSymbol</code> function
	 * must be provided.
	 *
	 * The result of the diff is a sequence of update operations, each consisting of a <code>type</code>
	 * (either <code>"insert"</code> or <code>"delete"</code>) and an <code>index</code>.
	 * By applying the operations one after the other to the old array, it can be transformed to an
	 * array whose items are equal to the new array.
	 *
	 * Sample implementation of the update
	 * <pre>
	 *
	 *  function update(aOldArray, aNewArray) {
	 *
	 *    // calculate the diff
	 *    var aDiff = jQuery.sap.arraySymbolDiff(aOldArray, aNewArray, __provide_your_symbol_function_here__);
	 *
	 *    // apply update operations
	 *    aDiff.forEach( function(op) {
	 *
	 *      // invariant: aOldArray and aNewArray now are equal up to (excluding) op.index
	 *
	 *      switch ( op.type ) {
	 *      case 'insert':
	 *        // new array contains a new (or otherwise unmapped) item, add it here
	 *        aOldArray.splice(op.index, 0, aNewArray[op.index]);
	 *        break;
	 *      case 'delete':
	 *        // an item is no longer part of the array (or has been moved to another position), remove it
	 *        aOldArray.splice(op.index, 1);
	 *        break;
	 *      default:
	 *        throw new Error('unexpected diff operation type');
	 *      }
	 *
	 *    });
	 *  }
	 *
	 * </pre>
	 *
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnSymbol] Function to calculate substitute symbols for array items
	 * @return {Array.<{type:string,index:int}>} List of update operations
	 * @public
	 */
	jQuery.sap.arraySymbolDiff = function(aOld, aNew, fnSymbol){
		var mSymbols = {},
			aOldRefs = [],
			aNewRefs = [],
			iOldLine,
			vSymbol, oSymbol,
			iOld = 0,
			iNew = 0,
			iOldRefLine,
			iNewRefLine,
			iOldDistance,
			iNewDistance,
			aDiff = [];

		// If arrays are equal, don't try to diff them
		if (aOld === aNew || jQuery.sap.equal(aOld, aNew)) {
			return aDiff;
		}

		// If no symbol function is provided, we stringify, if it is not type string, and create a hash from it
		fnSymbol = fnSymbol || function(vValue) {
			if (typeof vValue !== "string") {
				vValue = JSON.stringify(vValue) || "";
			}
			return jQuery.sap.hashCode(vValue);
		};

		// Pass 1
		for (var i = 0; i < aNew.length; i++) {
			vSymbol = fnSymbol(aNew[i]);
			oSymbol = mSymbols[vSymbol];
			if (!oSymbol) {
				oSymbol = mSymbols[vSymbol] = {
					iNewCount: 0,
					iOldCount: 0
				};
			}
			oSymbol.iNewCount++;
			aNewRefs[i] = {
				symbol: oSymbol
			};
		}

		// Pass 2
		for (var i = 0; i < aOld.length; i++) {
			vSymbol = fnSymbol(aOld[i]);
			oSymbol = mSymbols[vSymbol];
			if (!oSymbol) {
				oSymbol = mSymbols[vSymbol] = {
					iNewCount: 0,
					iOldCount: 0
				};
			}
			oSymbol.iOldCount++;
			oSymbol.iOldLine = i;
			aOldRefs[i] = {
				symbol: oSymbol
			};
		}

		// Pass 3
		for (var i = 0; i < aNewRefs.length; i++) {
			oSymbol = aNewRefs[i].symbol;
			if (oSymbol.iNewCount === 1 && oSymbol.iOldCount === 1) {
				aNewRefs[i].line = oSymbol.iOldLine;
				aOldRefs[oSymbol.iOldLine].line = i;
			}
		}

		// Pass 4
		for (var i = 0; i < aNewRefs.length - 1; i++) {
			iOldLine = aNewRefs[i].line;
			if (iOldLine !== undefined && iOldLine < aOldRefs.length - 1) {
				if (aOldRefs[iOldLine + 1].symbol === aNewRefs[i + 1].symbol) {
					aOldRefs[iOldLine + 1].line = i + 1;
					aNewRefs[i + 1].line = iOldLine + 1;
				}
			}
		}

		// Pass 5
		for (var i = aNewRefs.length - 1; i > 0; i--) {
			iOldLine = aNewRefs[i].line;
			if (iOldLine !== undefined && iOldLine > 0) {
				if (aOldRefs[iOldLine - 1].symbol === aNewRefs[i - 1].symbol) {
					aOldRefs[iOldLine - 1].line = i - 1;
					aNewRefs[i - 1].line = iOldLine - 1;
				}
			}
		}

		// Create diff
		while (iOld < aOld.length || iNew < aNew.length) {
			iNewRefLine = aOldRefs[iOld] && aOldRefs[iOld].line;
			iOldRefLine = aNewRefs[iNew] && aNewRefs[iNew].line;
			if (iOld < aOld.length && (iNewRefLine === undefined || iNewRefLine < iNew)) {
				aDiff.push({
					index: iNew,
					type: "delete"
				});
				iOld++;
			} else if (iNew < aNew.length && (iOldRefLine === undefined || iOldRefLine < iOld)) {
				aDiff.push({
					index: iNew,
					type: "insert"
				});
				iNew++;
			} else if (iNew === iNewRefLine) {
				iNew++;
				iOld++;
			} else {
				iNewDistance = iNewRefLine - iNew;
				iOldDistance = iOldRefLine - iOld;
				if (iNewDistance <= iOldDistance) {
					aDiff.push({
						index: iNew,
						type: "insert"
					});
					iNew++;
				} else {
					aDiff.push({
						index: iNew,
						type: "delete"
					});
					iOld++;
				}
			}
		}

		return aDiff;
	};

	/**
	 * Calculate delta of old list and new list.
	 *
	 * This partly implements the algorithm described in "A Technique for Isolating Differences Between Files"
	 * but instead of working with hashes, it does compare each entry of the old list with each entry of the new
	 * list, which causes terrible performane on large datasets.
	 *
	 * @deprecated As of 1.38, use {@link jQuery.sap.arraySymbolDiff} instead if applicable
	 * @public
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnCompare] Function to compare list entries
	 * @param {boolean} [bUniqueEntries] Whether entries are unique, so no duplicate entries exist
	 * @return {Array} List of changes
	 */
	jQuery.sap.arrayDiff = function(aOld, aNew, fnCompare, bUniqueEntries){
		fnCompare = fnCompare || function(vValue1, vValue2) {
			return jQuery.sap.equal(vValue1, vValue2);
		};

		var aOldRefs = [];
		var aNewRefs = [];

		//Find references
		var aMatches = [];
		for (var i = 0; i < aNew.length; i++) {
			var oNewEntry = aNew[i];
			var iFound = 0;
			var iTempJ;
			// if entries are unique, first check for whether same index is same entry
			// and stop searching as soon the first matching entry is found
			if (bUniqueEntries && fnCompare(aOld[i], oNewEntry)) {
				iFound = 1;
				iTempJ = i;
			} else {
				for (var j = 0; j < aOld.length; j++) {
					if (fnCompare(aOld[j], oNewEntry)) {
						iFound++;
						iTempJ = j;
						if (bUniqueEntries || iFound > 1) {
							break;
						}
					}
				}
			}
			if (iFound == 1) {
				var oMatchDetails = {
					oldIndex: iTempJ,
					newIndex: i
				};
				if (aMatches[iTempJ]) {
					delete aOldRefs[iTempJ];
					delete aNewRefs[aMatches[iTempJ].newIndex];
				} else {
					aNewRefs[i] = {
						data: aNew[i],
						row: iTempJ
					};
					aOldRefs[iTempJ] = {
						data: aOld[iTempJ],
						row: i
					};
					aMatches[iTempJ] = oMatchDetails;
				}
			}
		}

		//Pass 4: Find adjacent matches in ascending order
		for (var i = 0; i < aNew.length - 1; i++) {
			if (aNewRefs[i] &&
				!aNewRefs[i + 1] &&
				aNewRefs[i].row + 1 < aOld.length &&
				!aOldRefs[aNewRefs[i].row + 1] &&
				fnCompare(aOld[ aNewRefs[i].row + 1 ], aNew[i + 1])) {

				aNewRefs[i + 1] = {
					data: aNew[i + 1],
					row: aNewRefs[i].row + 1
				};
				aOldRefs[aNewRefs[i].row + 1] = {
					data: aOldRefs[aNewRefs[i].row + 1],
					row: i + 1
				};

			}
		}

		//Pass 5: Find adjacent matches in descending order
		for (var i = aNew.length - 1; i > 0; i--) {
			if (aNewRefs[i] &&
				!aNewRefs[i - 1] &&
				aNewRefs[i].row > 0 &&
				!aOldRefs[aNewRefs[i].row - 1] &&
				fnCompare(aOld[aNewRefs[i].row - 1], aNew[i - 1])) {

				aNewRefs[i - 1] = {
					data: aNew[i - 1],
					row: aNewRefs[i].row - 1
				};
				aOldRefs[aNewRefs[i].row - 1] = {
					data: aOldRefs[aNewRefs[i].row - 1],
					row: i - 1
				};

			}
		}

		//Pass 6: Generate diff data
		var aDiff = [];

		if (aNew.length == 0) {
			//New list is empty, all items were deleted
			for (var i = 0; i < aOld.length; i++) {
				aDiff.push({
					index: 0,
					type: 'delete'
				});
			}
		} else {
			var iNewListIndex = 0;
			if (!aOldRefs[0]) {
				//Detect all deletions at the beginning of the old list
				for (var i = 0; i < aOld.length && !aOldRefs[i]; i++) {
					aDiff.push({
						index: 0,
						type: 'delete'
					});
					iNewListIndex = i + 1;
				}
			}

			for (var i = 0; i < aNew.length; i++) {
				if (!aNewRefs[i] || aNewRefs[i].row > iNewListIndex) {
					//Entry doesn't exist in old list = insert
					aDiff.push({
						index: i,
						type: 'insert'
					});
				} else {
					iNewListIndex = aNewRefs[i].row + 1;
					for (var j = aNewRefs[i].row + 1; j < aOld.length && (!aOldRefs[j] || aOldRefs[j].row < i); j++) {
						aDiff.push({
							index: i + 1,
							type: 'delete'
						});
						iNewListIndex = j + 1;
					}
				}
			}
		}

		return aDiff;
	};

	/**
	 * A factory returning a tokenizer object for JS values.
	 * Contains functions to consume tokens on an input string.
	 * @private
	 * @returns {object} - the tokenizer
	 */
	jQuery.sap._createJSTokenizer = function() {
		var at, // The index of the current character
			ch, // The current character
			escapee = {
				'"': '"',
				'\'': '\'',
				'\\': '\\',
				'/': '/',
				b: '\b',
				f: '\f',
				n: '\n',
				r: '\r',
				t: '\t'
			},
			text,

			error = function(m) {

				// Call error when something is wrong.
				throw {
					name: 'SyntaxError',
					message: m,
					at: at,
					text: text
				};
			},

			next = function(c) {

				// If a c parameter is provided, verify that it matches the current character.
				if (c && c !== ch) {
					error("Expected '" + c + "' instead of '" + ch + "'");
				}

				// Get the next character. When there are no more characters,
				// return the empty string.
				ch = text.charAt(at);
				at += 1;
				return ch;
			},

			number = function() {

				// Parse a number value.
				var number, string = '';

				if (ch === '-') {
					string = '-';
					next('-');
				}
				while (ch >= '0' && ch <= '9') {
					string += ch;
					next();
				}
				if (ch === '.') {
					string += '.';
					while (next() && ch >= '0' && ch <= '9') {
						string += ch;
					}
				}
				if (ch === 'e' || ch === 'E') {
					string += ch;
					next();
					if (ch === '-' || ch === '+') {
						string += ch;
						next();
					}
					while (ch >= '0' && ch <= '9') {
						string += ch;
						next();
					}
				}
				number = +string;
				if (!isFinite(number)) {
					error("Bad number");
				} else {
					return number;
				}
			},

			string = function() {

				// Parse a string value.
				var hex, i, string = '', quote,
					uffff;

				// When parsing for string values, we must look for " and \ characters.
				if (ch === '"' || ch === '\'') {
					quote = ch;
					while (next()) {
						if (ch === quote) {
							next();
							return string;
						}
						if (ch === '\\') {
							next();
							if (ch === 'u') {
								uffff = 0;
								for (i = 0; i < 4; i += 1) {
									hex = parseInt(next(), 16);
									if (!isFinite(hex)) {
										break;
									}
									uffff = uffff * 16 + hex;
								}
								string += String.fromCharCode(uffff);
							} else if (typeof escapee[ch] === 'string') {
								string += escapee[ch];
							} else {
								break;
							}
						} else {
							string += ch;
						}
					}
				}
				error("Bad string");
			},

			name = function() {

				// Parse a name value.
				var name = '',
					allowed = function(ch) {
						return ch === "_" || ch === "$" ||
							(ch >= "0" && ch <= "9") ||
							(ch >= "a" && ch <= "z") ||
							(ch >= "A" && ch <= "Z");
					};

				if (allowed(ch)) {
					name += ch;
				} else {
					error("Bad name");
				}

				while (next()) {
					if (ch === ' ') {
						next();
						return name;
					}
					if (ch === ':') {
						return name;
					}
					if (allowed(ch)) {
						name += ch;
					} else {
						error("Bad name");
					}
				}
				error("Bad name");
			},

			white = function() {

				// Skip whitespace.
				while (ch && ch <= ' ') {
					next();
				}
			},

			word = function() {

				// true, false, or null.
				switch (ch) {
				case 't':
					next('t');
					next('r');
					next('u');
					next('e');
					return true;
				case 'f':
					next('f');
					next('a');
					next('l');
					next('s');
					next('e');
					return false;
				case 'n':
					next('n');
					next('u');
					next('l');
					next('l');
					return null;
				}
				error("Unexpected '" + ch + "'");
			},

			value, // Place holder for the value function.
			array = function() {

				// Parse an array value.
				var array = [];

				if (ch === '[') {
					next('[');
					white();
					if (ch === ']') {
						next(']');
						return array; // empty array
					}
					while (ch) {
						array.push(value());
						white();
						if (ch === ']') {
							next(']');
							return array;
						}
						next(',');
						white();
					}
				}
				error("Bad array");
			},

			object = function() {

				// Parse an object value.
				var key, object = {};

				if (ch === '{') {
					next('{');
					white();
					if (ch === '}') {
						next('}');
						return object; // empty object
					}
					while (ch) {
						if (ch >= "0" && ch <= "9") {
							key = number();
						} else if (ch === '"' || ch === '\'') {
							key = string();
						} else {
							key = name();
						}
						white();
						next(':');
						if (Object.hasOwnProperty.call(object, key)) {
							error('Duplicate key "' + key + '"');
						}
						object[key] = value();
						white();
						if (ch === '}') {
							next('}');
							return object;
						}
						next(',');
						white();
					}
				}
				error("Bad object");
			};

		value = function() {

			// Parse a JS value. It could be an object, an array, a string, a number,
			// or a word.
			white();
			switch (ch) {
			case '{':
				return object();
			case '[':
				return array();
			case '"':
			case '\'':
				return string();
			case '-':
				return number();
			default:
				return ch >= '0' && ch <= '9' ? number() : word();
			}
		};

		// Return the parse function. It will have access to all of the above
		// functions and variables.
		function parseJS(source, start) {
			var result;

			text = source;
			at = start || 0;
			ch = ' ';
			result = value();

			if ( isNaN(start) ) {
				white();
				if (ch) {
					error("Syntax error");
				}
				return result;
			} else {
				return { result : result, at : at - 1 };
			}

		}

		return {
			array: array,
			error: error,
			/**
			 * Returns the index of the current character.
			 * @returns {number} The current character's index.
			 */
			getIndex: function() {
				return at - 1;
			},
			getCh: function() {
				return ch;
			},
			init: function(source, iIndex) {
				text = source;
				at = iIndex || 0;
				ch = ' ';
			},
			name: name,
			next: next,
			number: number,
			parseJS: parseJS,
			/**
			 * Advances the index in the text to <code>iIndex</code>. Fails if the new index
			 * is smaller than the previous index.
			 *
			 * @param {number} iIndex - the new index
			 */
			setIndex: function(iIndex) {
				if (iIndex < at - 1) {
					throw new Error("Must not set index " + iIndex
						+ " before previous index " + (at - 1));
				}
				at = iIndex;
				next();
			},
			string: string,
			value: value,
			white: white,
			word: word
		};
	};

	/**
	 * Parse simple JS objects.
	 *
	 * A parser for JS object literals. This is different from a JSON parser, as it does not have
	 * the JSON specification as a format description, but a subset of the JavaScript language.
	 * The main difference is, that keys in objects do not need to be quoted and strings can also
	 * be defined using apostrophes instead of quotation marks.
	 *
	 * The parser does not support functions, but only boolean, number, string, object and array.
	 *
	 * @param {string} The string containing the JS objects
	 * @throws an error, if the string does not contain a valid JS object
	 * @returns {object} the JS object
	 *
	 * @since 1.11
	 */
	jQuery.sap.parseJS = jQuery.sap._createJSTokenizer().parseJS;

	/**
	 * Merge the contents of two or more objects together into the first object.
	 * Usage is the same as jQuery.extend, but Arguments that are null or undefined are NOT ignored.
	 *
	 * @since 1.26
	 */
	jQuery.sap.extend = function() {
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}

		for ( ; i < length; i++ ) {

			options = arguments[ i ];

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = Array.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.sap.extend( deep, clone, copy );

				} else {
					target[ name ] = copy;
				}
			}
		}

		// Return the modified object
		return target;
	};

	return jQuery;

});

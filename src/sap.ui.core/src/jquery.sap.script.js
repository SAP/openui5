/*!
 * ${copyright}
 */

// Provides miscellaneous utility functions that might be useful for any script
sap.ui.define([
	'jquery.sap.global',
	'sap/base/util/uid',
	'sap/base/strings/hash',
	'sap/base/util/array/uniqueSort',
	'sap/base/util/deepEqual',
	'sap/base/util/each',
	'sap/base/util/array/diff',
	'sap/base/util/JSTokenizer',
	'sap/base/util/merge',
	'sap/base/util/UriParameters'
], function(jQuery, uid, hash, uniqueSort, deepEqual, each, diff, JSTokenizer, merge, UriParameters) {
	"use strict";

	/**
	 * Creates and returns a pseudo-unique id.
	 *
	 * No means for detection of overlap with already present or future UIDs.
	 *
	 * @return {string} A pseudo-unique id.
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/uid} instead
	 */
	jQuery.sap.uid = uid;

	/**
	 * This function generates a hash-code from a string
	 * @param {string} sString The string to generate the hash-code from
	 * @return {int} The generated hash-code
	 * @since 1.39
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/strings/hash} instead
	 */
	jQuery.sap.hashCode = hash;


	/**
	 * Sorts the given array in-place and removes any duplicates (identified by "===").
	 *
	 * Use <code>jQuery.uniqueSort()</code> for arrays of DOMElements.
	 *
	 * @param {Array} a An Array of any type
	 * @return {Array} Same array as given (for chaining)
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/array/uniqueSort} instead
	 */
	jQuery.sap.unique = uniqueSort;

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
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/deepEqual} instead
	 */
	jQuery.sap.equal = deepEqual;

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
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/each} instead
	 */
	jQuery.sap.each = each;

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
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/array/diff} instead
	 */
	jQuery.sap.arraySymbolDiff = diff;


	/**
	 * A factory returning a tokenizer object for JS values.
	 * Contains functions to consume tokens on an input string.
	 * @function
	 * @private
	 * @returns {object} - the tokenizer
	 * @deprecated since 1.58 use {@link module:sap/base/util/JSTokenizer} instead
	 */
	jQuery.sap._createJSTokenizer = function() {
		return new JSTokenizer();
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
	 * @function
	 * @param {string} The string containing the JS objects
	 * @throws an error, if the string does not contain a valid JS object
	 * @returns {object} the JS object
	 *
	 * @private
	 * @since 1.11
	 * @deprecated since 1.58 use {@link module:sap/base/util/JSTokenizer.parseJS} instead
	 */
	jQuery.sap.parseJS = JSTokenizer.parseJS;

	/**
	 * Merge the contents of two or more objects together into the first object.
	 * Usage is the same as jQuery.extend, but Arguments that are null or undefined are NOT ignored.
	 *
	 * @deprecated since 1.58. For shallow extend use <code>Object.assign</code> (polyfilled), for deep extend use <code>sap/base/util/merge</code>.
	 * @function
	 * @since 1.26
	 * @private
	 */
	jQuery.sap.extend = function () {
		var args = arguments,
			deep = false;

		// Check whether the first argument is the deep-flag
		if (typeof arguments[0] === "boolean") {
			deep = arguments[0];

			// skip the first argument while creating a shallow copy of arguments
			args = Array.prototype.slice.call(arguments, 1);
		}

		if (deep) {
			return merge.apply(this, args);
		} else {
			/*
			 * The code in this function is taken from jQuery 2.2.3 "jQuery.extend" and got modified.
			 *
			 * jQuery JavaScript Library v2.2.3
			 * http://jquery.com/
			 *
			 * Copyright jQuery Foundation and other contributors
			 * Released under the MIT license
			 * http://jquery.org/license
			 */
			var copy, name, options,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length;

			// Handle case when target is a string or something (possible in deep copy)
			if (typeof target !== "object" && typeof target !== "function") {
				target = {};
			}

			for (; i < length; i++) {

				options = arguments[i];

				// Extend the base object
				for (name in options) {
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					target[name] = copy;
				}
			}

			// Return the modified object
			return target;
		}
	};

	// Javadoc for private inner class "UriParams" - this list of comments is intentional!
	/**
	 * @interface Encapsulates all URI parameters of the current windows location (URL).
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
	 * @public
	 * @param {string} sUri The name of the URI parameter.
	 * @return {string|array} The value(s) of the URI parameter with the given name
	 * @SecSource {return|XSS} Return value contains URL parameters
	 * @function
	 * @name jQuery.sap.util.UriParameters.prototype.get
	 */

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
	 * @deprecated As of 1.68, use {@link module:sap/base/util/UriParameters.fromQuery UriParameters.fromQuery}
	 *    or {@link module:sap/base/util/UriParameters.fromURL UriParameters.fromURL} instead.
	 */
	jQuery.sap.getUriParameters = function getUriParameters(sUri) {
		return UriParameters.fromURL(sUri || window.location.href);
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
	 * @deprecated since 1.58 use native <code>setTimeout</code> instead
	 */
	jQuery.sap.delayedCall = function delayedCall(iDelay, oObject, method, aParameters) {
		return setTimeout(function(){
			if (typeof method === "string") {
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
	 * @deprecated since 1.58 use native <code>clearTimeout</code> instead
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
	 * @deprecated since 1.58 use native <code>setInterval</code> instead
	 */
	jQuery.sap.intervalCall = function intervalCall(iInterval, oObject, method, aParameters) {
		return setInterval(function(){
			if (typeof method === "string") {
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
	 * @deprecated since 1.58 use native <code>clearInterval</code> instead
	 */
	jQuery.sap.clearIntervalCall = function clearIntervalCall(sIntervalCallId) {
		clearInterval(sIntervalCallId);
		return this;
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
	 * @deprecated since 1.48.0 IE8 is not supported anymore, thus no special handling is required. Use native for-in loop instead.
	 * @since 1.7.1
	 */
	jQuery.sap.forIn = each;

	/**
	 * Calculate delta of old list and new list.
	 *
	 * This partly implements the algorithm described in "A Technique for Isolating Differences Between Files"
	 * but instead of working with hashes, it does compare each entry of the old list with each entry of the new
	 * list, which causes terrible performance on large datasets.
	 *
	 * @deprecated As of 1.38, use {@link module:sap/base/util/array/diff} instead if applicable
	 * @public
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnCompare] Function to compare list entries
	 * @param {boolean} [bUniqueEntries] Whether entries are unique, so no duplicate entries exist
	 * @return {Array} List of changes
	 */
	jQuery.sap.arrayDiff = function(aOld, aNew, fnCompare, bUniqueEntries){
		fnCompare = fnCompare || function(vValue1, vValue2) {
			return deepEqual(vValue1, vValue2);
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

	return jQuery;
});

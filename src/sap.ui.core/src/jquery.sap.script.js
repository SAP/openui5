/*!
 * ${copyright}
 */

// Provides miscellaneous utility functions that might be useful for any script
sap.ui.define([
	'jquery.sap.global',
	'sap/base/util/uid',
	'sap/base/util/hashCode',
	'sap/base/util/unique',
	'sap/base/util/equal',
	'sap/base/util/each',
	'sap/base/util/arraySymbolDiff',
	'sap/base/util/JSTokenizer',
	'sap/base/util/extend',
	'sap/base/util/UriParameters',
	'sap/base/util/arrayDiff'
], function(jQuery, uid, hashCode, unique, equal, each, arraySymbolDiff, JSTokenizer, extend, UriParameters, arrayDiff) {

	"use strict";

	/**
	 * Creates and returns a pseudo-unique id.
	 *
	 * No means for detection of overlap with already present or future UIDs.
	 *
	 * @return {string} A pseudo-unique id.
	 * @public
	 * @function
	 */
	jQuery.sap.uid = uid;

	/**
	 * This function generates a hash-code from a string
	 * @param {string} sString The string to generate the hash-code from
	 * @return {int} The generated hash-code
	 * @since 1.39
	 * @private
	 * @sap-restricted sap.ui.core
	 * @function
	 */
	jQuery.sap.hashCode = hashCode;


	/**
	 * Sorts the given array in-place and removes any duplicates (identified by "===").
	 *
	 * Use <code>jQuery.unique()</code> for arrays of DOMElements.
	 *
	 * @param {Array} a An Array of any type
	 * @return {Array} Same array as given (for chaining)
	 * @public
	 * @function
	 */
	jQuery.sap.unique = unique;

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
	 */
	jQuery.sap.equal = equal;

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
	 */
	jQuery.sap.arraySymbolDiff = arraySymbolDiff;


	/**
	 * A factory returning a tokenizer object for JS values.
	 * Contains functions to consume tokens on an input string.
	 * @function
	 * @private
	 * @returns {object} - the tokenizer
	 */
	jQuery.sap._createJSTokenizer = JSTokenizer;

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
	 */
	jQuery.sap.parseJS = JSTokenizer().parseJS;

	/**
	 * Merge the contents of two or more objects together into the first object.
	 * Usage is the same as jQuery.extend, but Arguments that are null or undefined are NOT ignored.
	 *
	 * @function
	 * @since 1.26
	 * @private
	 */
	jQuery.sap.extend = extend;

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
	 */
	jQuery.sap.getUriParameters = function getUriParameters(sUri) {
		sUri = sUri ? sUri : window.location.href;
		return new UriParameters(sUri);
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
	 * @deprecated As of 1.38, use {@link jQuery.sap.arraySymbolDiff} instead if applicable
	 * @public
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnCompare] Function to compare list entries
	 * @param {boolean} [bUniqueEntries] Whether entries are unique, so no duplicate entries exist
	 * @return {Array} List of changes
	 */
	jQuery.sap.arrayDiff = arrayDiff;

	return jQuery;
});

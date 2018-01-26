/** @license
 * String.prototype.startsWith <https://github.com/mathiasbynens/String.prototype.startsWith>
 * @author: Mathias Bynens | MIT License
 * @version: v0.2.0
 */
/** @license
 * String.prototype.endsWith <https://github.com/mathiasbynens/String.prototype.endsWith>
 * @author: Mathias Bynens | MIT License
 * @version: v0.2.0
 */
/** @license
 * String.prototype.includes <https://github.com/mathiasbynens/String.prototype.includes>
 * @author: Mathias Bynens | MIT License
 * @version: v1.0.0
 */
/** @license
 * String.prototype.repeat <https://github.com/mathiasbynens/String.prototype.repeat>
 * @author: Mathias Bynens | MIT License
 * @version: v1.0.0
 */
/** @license
 * String.prototype.padStart <https://github.com/uxitten/polyfill>
 * @author: Behnam Mohammadi | MIT License
 * @version: v1.0.0
 */
/** @license
 * String.prototype.padEnd <https://github.com/uxitten/polyfill>
 * @author: Behnam Mohammadi | MIT License
 * @version: v1.0.0
 */
/**
 * This module contains String polyfills in order to establish unified language features across environments
 */
(function() {
	"use strict";

	var toString = {}.toString;

	// String.prototype.startsWith polyfill
	if (!String.prototype.startsWith) {
		var startsWith = function(search) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			if (search && toString.call(search) == '[object RegExp]') {
				throw TypeError();
			}
			var stringLength = string.length;
			var searchString = String(search);
			var searchLength = searchString.length;
			var position = arguments.length > 1 ? arguments[1] : undefined;
			// `ToInteger`
			var pos = position ? Number(position) : 0;
			if (pos != pos) { // better `isNaN`
				pos = 0;
			}
			var start = Math.min(Math.max(pos, 0), stringLength);
			// Avoid the `indexOf` call if no match is possible
			if (searchLength + start > stringLength) {
				return false;
			}
			var index = -1;
			while (++index < searchLength) {
				if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
					return false;
				}
			}
			return true;
		};
		Object.defineProperty(String.prototype, 'startsWith', {
			'value': startsWith,
			'configurable': true,
			'writable': true
		});
	}

	// String.prototype.endsWith polyfill
	if (!String.prototype.endsWith) {
		var endsWith = function(search) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			if (search && toString.call(search) == '[object RegExp]') {
				throw TypeError();
			}
			var stringLength = string.length;
			var searchString = String(search);
			var searchLength = searchString.length;
			var pos = stringLength;
			if (arguments.length > 1) {
				var position = arguments[1];
				if (position !== undefined) {
					// `ToInteger`
					pos = position ? Number(position) : 0;
					if (pos != pos) { // better `isNaN`
						pos = 0;
					}
				}
			}
			var end = Math.min(Math.max(pos, 0), stringLength);
			var start = end - searchLength;
			if (start < 0) {
				return false;
			}
			var index = -1;
			while (++index < searchLength) {
				if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
					return false;
				}
			}
			return true;
		};
		Object.defineProperty(String.prototype, 'endsWith', {
			'value': endsWith,
			'configurable': true,
			'writable': true
		});
	}

	// String.prototype.includes polyfill
	if (!String.prototype.includes) {
		var indexOf = ''.indexOf;
		var includes = function(search) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			if (search && toString.call(search) == '[object RegExp]') {
				throw TypeError();
			}
			var stringLength = string.length;
			var searchString = String(search);
			var searchLength = searchString.length;
			var position = arguments.length > 1 ? arguments[1] : undefined;
			// `ToInteger`
			var pos = position ? Number(position) : 0;
			if (pos != pos) { // better `isNaN`
				pos = 0;
			}
			var start = Math.min(Math.max(pos, 0), stringLength);
			// Avoid the `indexOf` call if no match is possible
			if (searchLength + start > stringLength) {
				return false;
			}
			return indexOf.call(string, searchString, pos) != -1;
		};
		Object.defineProperty(String.prototype, 'includes', {
			'value': includes,
			'configurable': true,
			'writable': true
		});
	}

	// String.prototype.repeat polyfill
	if (!String.prototype.repeat) {
		var repeat = function(count) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			// `ToInteger`
			var n = count ? Number(count) : 0;
			if (n != n) { // better `isNaN`
				n = 0;
			}
			// Account for out-of-bounds indices
			if (n < 0 || n == Infinity) {
				throw RangeError();
			}
			var result = '';
			while (n) {
				if (n % 2 == 1) {
					result += string;
				}
				if (n > 1) {
					string += string;
				}
				n >>= 1;
			}
			return result;
		};
		Object.defineProperty(String.prototype, 'repeat', {
			'value': repeat,
			'configurable': true,
			'writable': true
		});
	}

	// String.prototype.padStart polyfill
	if (!String.prototype.padStart) {
		String.prototype.padStart = function padStart(targetLength,padString) {
			targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
			padString = String(padString || ' ');
			if (this.length > targetLength) {
				return String(this);
			}
			else {
				targetLength = targetLength - this.length;
				if (targetLength > padString.length) {
					padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
				}
				return padString.slice(0,targetLength) + String(this);
			}
		};
	}

	// String.prototype.padEnd polyfill
	if (!String.prototype.padEnd) {
		String.prototype.padEnd = function padEnd(targetLength,padString) {
			targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
			padString = String(padString || ' ');
			if (this.length > targetLength) {
				return String(this);
			}
			else {
				targetLength = targetLength - this.length;
				if (targetLength > padString.length) {
					padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
				}
				return String(this) + padString.slice(0,targetLength);
			}
		};
	}

}).call(this);
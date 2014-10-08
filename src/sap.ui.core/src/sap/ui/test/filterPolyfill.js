/*!
 * ${copyright}
 */

//IE8 support - polyfill for filter - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
/*eslint no-extend-native:0 */
if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun /*, this */) {
		"use strict";

		if (this == null) {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun != "function") {
			throw new TypeError();
		}

		var res = [];
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t)) {
					res.push(val);
				}
			}
		}

		return res;
	};
}

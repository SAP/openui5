/*!
 * ${copyright}
 */
/*global performance */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Returns a high resolution timestamp in microseconds.
	 * The timestamp is based on 01/01/1970 00:00:00 (UNIX epoch) as float with microsecond precision.
	 * The fractional part of the timestamp represents fractions of a millisecond.
	 * Converting to a <code>Date</code> is possible by using <code>require(["sap/base/util/now"], function(now){new Date(now());}</code>
	 *
	 * @function
	 * @since 1.58
	 * @public
	 * @alias module:sap/base/util/now
	 * @returns {float} timestamp in microseconds
	 */
	var fnNow = function now() {
		return performance.timeOrigin + performance.now();
	};

	return fnNow;
});

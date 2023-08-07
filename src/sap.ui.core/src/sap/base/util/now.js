/*!
 * ${copyright}
 */
/*global performance */
sap.ui.define([], function() {
	"use strict";

	// @evo-todo window.performance does not exist on node.js, but there is a module performance-now. Maybe use it

	/**
	 * Returns a high resolution timestamp in microseconds if supported by the environment, otherwise in milliseconds.
	 * The timestamp is based on 01/01/1970 00:00:00 (UNIX epoch) as float with microsecond precision or
	 * with millisecond precision, if high resolution timestamps are not available.
	 * The fractional part of the timestamp represents fractions of a millisecond.
	 * Converting to a <code>Date</code> is possible by using <code>require(["sap/base/util/now"], function(now){new Date(now());}</code>
	 *
	 * @function
	 * @since 1.58
	 * @public
	 * @alias module:sap/base/util/now
	 * @returns {float} timestamp in microseconds if supported by the environment otherwise in milliseconds
	 */
	var fnNow = !(performance && performance.now && performance.getEntriesByType && performance.getEntriesByType("navigation")[0])
		? Date.now
		: (function () {
			var oPerformanceTiming = performance.getEntriesByType("navigation")[0];
			var iNavigationStart = performance.timeOrigin + oPerformanceTiming.startTime;
			return function perfnow() {
				return iNavigationStart + performance.now();
			};
		}());
	return fnNow;
});
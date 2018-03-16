/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {

	"use strict";

	return {
		/**
		 * Sets the request buffer size for the measurement safely.
		 *
		 * @param {int} iSize size of the buffer
		 * @name setRequestBufferSize
		 * @function
		 * @private
		 */
		setRequestBufferSize : function(iSize) {
			if (!window.performance) {
				return;
			}
			if (window.performance.setResourceTimingBufferSize) {
				window.performance.setResourceTimingBufferSize(iSize);
			} else if (window.performance.webkitSetResourceTimingBufferSize) {
				window.performance.webkitSetResourceTimingBufferSize(iSize);
			}
		},

		/**
		 * Gets the current request timings array for type 'resource' safely.
		 *
		 * @return {object[]} array of performance timing objects
		 * @name getRequestTimings
		 * @function
		 * @private
		 */
		getRequestTimings : function() {
			if (window.performance && window.performance.getEntriesByType) {
				return window.performance.getEntriesByType("resource");
			}
			return [];
		},

		/**
		 * Clears all request timings safely.
		 *
		 * @name clearRequestTimings
		 * @function
		 * @private
		 */
		clearRequestTimings : function() {
			if (!window.performance) {
				return;
			}
			if (window.performance.clearResourceTimings) {
				window.performance.clearResourceTimings();
			} else if (window.performance.webkitClearResourceTimings){
				window.performance.webkitClearResourceTimings();
			}
		}
	};
});

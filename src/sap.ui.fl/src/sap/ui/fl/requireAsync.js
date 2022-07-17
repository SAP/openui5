/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Wraps the async sap.ui.require call into a Promise.
	 *
	 * @param {string} sModuleName Name of the required module
	 * @returns {Promise} Returns a promise.
	 *
	 * @experimental since 1.78
	 * @function
	 * @since 1.78
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/requireAsync
	 */
	return function(sModuleName) {
		//TODO: get rid of require async as soon as sap.ui.require has learned Promises as return value
		return new Promise(function(fnResolve, fnReject) {
			sap.ui.require([sModuleName], function(oModule) {
				fnResolve(oModule);
			},
			function(oError) {
				fnReject(oError);
			});
		});
	};
});

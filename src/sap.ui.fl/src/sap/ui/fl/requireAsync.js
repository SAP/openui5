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
	 * @function
	 * @since 1.78
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/requireAsync
	 */
	return function(sModuleName) {
		// shortcut needed because the requireAsync does a setTimeout if the module is already loaded
		// this setTimeout will affect our promise chains in a bad way
		var oAlreadyLoadedModule = sap.ui.require(sModuleName);
		if (oAlreadyLoadedModule) {
			return Promise.resolve(oAlreadyLoadedModule);
		}
		// TODO: get rid of require async as soon as sap.ui.require has learned Promises as return value
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

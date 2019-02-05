/*!
 * ${copyright}
 */
sap.ui.define(['./Service'], function (Service) {
	"use strict";

	/**
	 * @class Navigation
	 * Implements the abstract base class for a Navigation Service
	 * @experimental
	 * @sap-restricted sap.ushell
	 * @extends Service
	 */
	var Navigation = Service.extend();

	/**
	 * Expected by a consumer from the Navigation to navigate to a given <code>oContext</code>.
	 * @param {string|Object} oContext An object that gives the service information about the target.
	 * @param {Object} oContext.manifestParameters A map with all parameters from the manifest.
	 * @param {Object} oContext.parameters The event parameters.
	 * @param {Object} oContext.semanticObject The data object bound to the clicked element.
	 * @abstract
	 */
	Navigation.prototype.navigate = function (oContext) {};

	/**
	 * Expected by a consumer of a Navigation Service to check whether a given <code>oContext</code> is valid.
	 * @param {string|Object} oContext an object that gives the service information about the target.
	 * @returns {Promise} A promise that resolves with true if the navigation target can be resolved.
	 * @abstract
	 */
	Service.prototype.enabled = function (oContext) {
		return Promise.resolve(false);
	};

	return Navigation;
});
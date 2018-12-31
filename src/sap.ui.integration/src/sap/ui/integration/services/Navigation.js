/*!
 * ${copyright}
 */
sap.ui.define(['./Service'], function (Service) {
	"use strict";

	/**
	 * @class Navigation
	 * Implements the abstract base class for a Navigation Service
	 * @experimental
	 * @extends Service
	 */
	var Navigation = Service.extend();
	/**
	 * Expected by a consumer from the Navigation to check whether a given <code>oDataContext</code> is a valid navigation target.
	 * @param {string|object} oDataContext an object that gives the service information about the target. It is either a url string or a dataStructure
	 * @returns {Promise} A promise that resolves with true if navigation is possible or false.
	 * @abstract
	 */
	Navigation.prototype.enabled = function (oDataContext) {
		return Promise.resolve(false);
	};

	/**
	 * Expected by a consumer from the Navigation to navigate to a given <code>oDataContext</code>.
	 * @param {string|object} oDataContext an object that gives the service information about the target. It is either a url string or a dataStructure
	 * @returns {Promise} A promise that resolves with true if was successful.
	 * @abstract
	 */
	Navigation.prototype.navigate = function (oDataContext) {
	};

	return Navigation;
});
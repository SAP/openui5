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
	 * Expected by a consumer from the Navigation to navigate to a given <code>oDataContext</code>.
	 * @param {string|object} oDataContext an object that gives the service information about the target. It is either a url string or a dataStructure
	 * @abstract
	 */
	Navigation.prototype.navigate = function (oDataContext) {};

	return Navigation;
});
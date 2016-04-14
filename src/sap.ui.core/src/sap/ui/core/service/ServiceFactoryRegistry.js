/*!
 * ${copyright}
 */

// Provides class sap.ui.core.service.ServiceFactoryRegistry
sap.ui.define(['jquery.sap.global', './ServiceFactory'],
	function(jQuery, ServiceFactory) {
	"use strict";


	// map of service factories
	var mServiceFactories = Object.create(null);


	/**
	 * The service factory registry.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.service.ServiceFactoryRegistry
	 * @private
	 * @sap-restricted sap.ushell
	 * @since 1.37.0
	 */
	var ServiceFactoryRegistry = Object.create(null);


	/**
	 * Registers a service factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the service factory
	 * @param {sap.ui.core.service.ServiceFactory} oServiceFactory Service factory instance
	 * @return {sap.ui.core.service.ServiceFactoryRegistry} <code>this</code> to allow method chaining
	 * @static
	 * @private
	 * @sap-restricted sap.ushell
	 */
	ServiceFactoryRegistry.register = function(sServiceFactoryName, oServiceFactory) {

		jQuery.sap.assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");
		jQuery.sap.assert(oServiceFactory instanceof ServiceFactory, "oServiceFactory must be an instance of sap.ui.core.service.ServiceFactory");

		mServiceFactories[sServiceFactoryName] = oServiceFactory;

		return this;

	};


	/**
	 * Unregisters a service factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the service factory
	 * @return {sap.ui.core.service.ServiceFactoryRegistry} <code>this</code> to allow method chaining
	 * @static
	 * @private
	 * @sap-restricted sap.ushell
	 */
	ServiceFactoryRegistry.unregister = function(sServiceFactoryName) {

		jQuery.sap.assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");

		delete mServiceFactories[sServiceFactoryName];

		return this;

	};


	/**
	 * Returns the service factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the service factory
	 * @return {sap.ui.core.service.ServiceFactory} Service factory instance
	 * @static
	 * @private
	 * @sap-restricted sap.ushell
	 */
	ServiceFactoryRegistry.get = function(sServiceFactoryName) {
		return mServiceFactories[sServiceFactoryName];
	};


	return ServiceFactoryRegistry;


}, /* bExport= */ true);

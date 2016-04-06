/*!
 * ${copyright}
 */

// Provides class sap.ui.core.service.ServiceFactoryRegistry
sap.ui.define(['jquery.sap.global', './ServiceFactory'],
	function(jQuery, ServiceFactory) {
	"use strict";


	// map of service factories
	var mServiceFactories = {};


	/**
	 * The Service Factory Registry.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.service.ServiceFactoryRegistry
	 * @sap-restricted sap.ushell
	 * @private
	 * @since 1.37.0
	 */
	var ServiceFactoryRegistry = {};


	/**
	 * Registers a Service Factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the Service Factory
	 * @param {sap.ui.core.service.ServiceFactory} oServiceFactory A Service Factory instance
	 * @return {sap.ui.core.service.ServiceFactoryRegistry} Returns <code>this</code> to allow method chaining
	 * @sap-restricted sap.ushell
	 * @private
	 */
	ServiceFactoryRegistry.register = function(sServiceFactoryName, oServiceFactory) {

		jQuery.sap.assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");
		jQuery.sap.assert(oServiceFactory instanceof ServiceFactory, "oServiceFactory must be an instance of sap.ui.core.service.ServiceFactory");

		mServiceFactories[sServiceFactoryName] = oServiceFactory;

		return this;

	};


	/**
	 * Unregisters a Service Factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the Service Factory
	 * @return {sap.ui.core.service.ServiceFactoryRegistry} Returns <code>this</code> to allow method chaining
	 * @sap-restricted sap.ushell
	 * @private
	 */
	ServiceFactoryRegistry.unregister = function(sServiceFactoryName) {

		jQuery.sap.assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");

		delete mServiceFactories[sServiceFactoryName];

		return this;

	};


	/**
	 * Returns the Service Factory instance for the given name.
	 *
	 * @param {string} sServiceFactoryName Name of the Service Factory
	 * @return {sap.ui.core.service.ServiceFactory} A Service Factory instance
	 * @sap-restricted sap.ushell
	 * @private
	 */
	ServiceFactoryRegistry.get = function(sServiceFactoryName) {
		return mServiceFactories[sServiceFactoryName];
	};


	return ServiceFactoryRegistry;


}, /* bExport= */ true);

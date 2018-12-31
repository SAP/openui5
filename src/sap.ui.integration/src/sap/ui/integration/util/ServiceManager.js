/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/base/Log"
], function (
	EventProvider,
	Log
) {
	"use strict";

	var SUPPORTED_SERVICE_INTERFACES = {
		"sap.ui.integration.services.Navigation": { navigate: null, enabled: null }
	};

	/**
	 * Constructor for a new <code>ServiceManager</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Parses the manifest for a certain card and decides which services needs to be instantiated
	 * and handles their lifecycle.
	 * It also provides instances of the services by getService method.
	 *
	 * _mServiceFactoryReferences object format:
	 *
	 *	"services": {
	 *		"Navigation": {
	 *			"factoryName": "demoapp.demoappservices.SampleNavigationFactory"
	 *		},
	 *		"SomeOtherService": {
	 *			"factoryName": "demoapp.demoappservices.SomeOtherServiceFactory"
	 * 		}
	 *	}
	 *
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {Object} _mServiceFactoryReferences A map with service descriptions.
	 * @private
	 * @alias sap.ui.integration.util.ServiceManager
	 */
	var ServiceManager = EventProvider.extend("sap.ui.integration.util.ServiceManager", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (_mServiceFactoryReferences) {
			if (!_mServiceFactoryReferences) {
				throw new Error("Missing manifest services reference!");
			}
			this._mServiceFactoryReferences = _mServiceFactoryReferences;
			this._mServices = {};
			// Copy object with empty values
			Object.keys(SUPPORTED_SERVICE_INTERFACES).forEach(function (sKey) {
				this._mServices[sKey] = {};
			}, this);
		}
	});

	/**
	 * Registers a card service which can then be available by getService(sServiceName).
	 * @param {string} sName The name of the service.
	 * @param {Object} sInterface The interface of the service.
	 * @returns {Promise} A promise resolved when the service instance is ready.
	 */
	ServiceManager.prototype.registerService = function (sName, sInterface) {
		var oInterface = SUPPORTED_SERVICE_INTERFACES[sInterface];
		var oServiceRef = this._mServices[sInterface][sName];

		if (!oServiceRef) {
			oServiceRef = {};
			oServiceRef.promise = ServiceManager._getService(this, sName, this._mServiceFactoryReferences);
			oServiceRef.promise.then(function (oServiceInstance) {
				oServiceRef.interface = oInterface;
				oServiceRef.instance = oServiceInstance;

				oServiceInstance.registerDependency(oServiceRef.interface);

				return oServiceRef.interface.enabled().then(function (bEnabled) {
					oServiceRef.on = bEnabled;
				});
			}).catch(function (oError) {
				Log.error(oError.message);
			});

			this._mServices[sInterface][sName] = oServiceRef;

			return oServiceRef.promise;
		}

		return oServiceRef.promise;
	};

	/**
	 * Returns an instance of a service based on interface.
	 * If multiple services with the same interface are registered the first one will be used.
	 * @param {string} sServiceInterface The interface of the service to return an instance for.
	 * @param {string} [sServiceName] The name of the service inside sap.ui5/services. If not passed the first registered service will be returned.
	 * @returns {Promise} A promise resolved when the service instance is ready.
	 */
	ServiceManager.prototype.getService = function (sServiceInterface, sServiceName) {
		return new Promise(function (fnResolve, fnReject) {

			if (!sServiceInterface
				|| !this._mServices[sServiceInterface]
				|| !Object.keys(this._mServices[sServiceInterface])) {
				return Promise.reject(new Error("Invalid service"));
			}

			if (!sServiceName) {
				sServiceName = Object.keys(this._mServices[sServiceInterface])[0];
			}

			this._mServices[sServiceInterface][sServiceName].promise.then(function () {
				if (this._mServices[sServiceInterface][sServiceName].on) {
					fnResolve(this._mServices[sServiceInterface][sServiceName].interface);
				} else {
					fnResolve(false);
				}
			}.bind(this)).catch(fnReject);
		}.bind(this));
	};

	ServiceManager.prototype.destroy = function () {
		this._mServices = null;
	};

	// Copied from Component.js
	// Creates an instance of a service based on the manifest settings
	ServiceManager._getService = function (oInstance, sName, mServices) {
		return new Promise(function (fnResolve, fnReject) {
			var oServiceEntry,
				sFactory;
			if (oInstance.bIsDestroyed) {
				return Promise.reject(new Error("Service " + sName + " could not be loaded as the requestor " + oInstance.getMetadata().getName() + " was destroyed."));
			}
			if (!mServices) {
				return Promise.reject(new Error("No Services declared"));
			} else {
				oServiceEntry = mServices[sName];
			}
			if (!oServiceEntry || !oServiceEntry.factoryName) {
				return Promise.reject(new Error("No Service '" + sName + "' declared or factoryName missing"));
			} else {
				sFactory = oServiceEntry.factoryName;
			}
			sap.ui.require(["sap/ui/core/service/ServiceFactoryRegistry"], function (ServiceFactoryRegistry) {
				// lookup the factory in the registry
				var oServiceFactory = ServiceFactoryRegistry.get(sFactory);
				if (oServiceFactory) {
					// create a new Service instance with the current Component as context
					oServiceFactory.createInstance({
						scopeObject: oInstance,
						scopeType: "component",
						settings: oServiceEntry.settings || {}
					}).then(function (oServiceInstance) {
						if (oServiceInstance.getInterface) {
							fnResolve(oServiceInstance.getInterface());
						} else {
							fnResolve(oServiceInstance);
						}
					}).catch(fnReject);
				} else {
					// the service factory could not be found in the registry
					var oError = new Error("ServiceFactory '" + sFactory + "' for Service '" + sName + "' not found in ServiceFactoryRegistry");
					oError._optional = oServiceEntry.optional;
					fnReject(oError);
				}
			});
		});
	};

	return ServiceManager;
});

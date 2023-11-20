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

	/**
	 * Constructor for a new <code>ServiceManager</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Parses an object and decides which services needs to be instantiated
	 * and handles their lifecycle.
	 * It also provides instances of the services by getService method.
	 *
	 * mServiceFactoryReferences object format:
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
	 * @param {Object} mServiceFactoryReferences A map with service descriptions.
	 * @param {Object} oServiceContext A context to be used for newly created service instances.
	 * @private
	 * @alias sap.ui.integration.util.ServiceManager
	 */
	var ServiceManager = EventProvider.extend("sap.ui.integration.util.ServiceManager", {
		constructor: function (mServiceFactoryReferences, oServiceContext) {
			if (!mServiceFactoryReferences) {
				throw new Error("Missing manifest services reference!");
			}
			if (!oServiceContext) {
				throw new Error("Missing context object");
			}
			EventProvider.call(this);
			this._mServiceFactoryReferences = mServiceFactoryReferences;
			this._mServices = {};
			this._oServiceContext = oServiceContext;
			this._initAllServices();
		}
	});

	/**
	 * Initializes all services based on _mServiceFactoryReferences.
	 * @private
	 */
	ServiceManager.prototype._initAllServices = function () {
		for (var sServiceName in this._mServiceFactoryReferences) {
			this._initService(sServiceName);
		}
	};

	/**
	 * Initializes a service which can then be available by getService(sServiceName).
	 *
	 * @private
	 * @param {string} sName The name of the service or a service configuration object.
	 */
	ServiceManager.prototype._initService = function (sName) {
		var oServiceRef = this._mServices[sName] || {};

		oServiceRef.promise = ServiceManager._getService(this._oServiceContext, sName, this._mServiceFactoryReferences)
			.then(function (oServiceInstance) {
				oServiceRef.instance = oServiceInstance;
			}).catch(function (oError) {
				Log.error(oError.message);
			});

		this._mServices[sName] = oServiceRef;
	};

	/**
	 * Returns an instance of a service based on its name.
	 *
	 * @param {string} sServiceName The name of the service inside sap.ui5/services. If not passed the first registered service will be returned.
	 * @returns {Promise} A promise resolved when the service instance is ready.
	 */
	ServiceManager.prototype.getService = function (sServiceName) {
		var sErrorMessage = "Invalid service";
		return new Promise(function (fnResolve, fnReject) {

			if (!sServiceName
				|| !this._mServices[sServiceName]
				|| !Object.keys(this._mServices[sServiceName])) {
				fnReject(sErrorMessage);
				return;
			}

			this._mServices[sServiceName].promise.then(function () {
				if (this._mServices[sServiceName].instance) {
					fnResolve(this._mServices[sServiceName].instance);
				} else {
					fnReject(sErrorMessage);
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
				fnReject(new Error("Service " + sName + " could not be loaded as the requestor " + oInstance.getMetadata().getName() + " was destroyed."));
				return;
			}
			if (!mServices) {
				fnReject(new Error("No Services declared"));
				return;
			} else {
				oServiceEntry = mServices[sName];
			}
			if (!oServiceEntry || !oServiceEntry.factoryName) {
				fnReject(new Error("No Service '" + sName + "' declared or factoryName missing"));
				return;
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

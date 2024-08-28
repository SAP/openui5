/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/Util",
	"sap/ui/rta/service/index",
	"sap/ui/rta/util/ServiceEventBus"
], function(
	isPlainObject,
	ManagedObject,
	DtUtil,
	ServicesIndex,
	ServiceEventBus
) {
	"use strict";

	const SERVICE_STARTING = "SERVICE_STARTING";
	const SERVICE_STARTED = "SERVICE_STARTED";
	const SERVICE_FAILED = "SERVICE_FAILED";

	/**
	 * Constructor for a new sap.ui.rta.util.ServiceManager. Starts and manages rta specific services.
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.121
	 * @alias sap.ui.rta.util.ServiceManager
	 */
	const ServiceManager = ManagedObject.extend("sap.ui.rta.util.ServiceManager", {
		metadata: {
			properties: {
				/**
				 * Services that are started / in use
				 */
				services: {
					type: "any",
					defaultValue: {}
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.apply(this, aArgs);
		}
	});

	function resolveServiceLocation(sName) {
		if (ServicesIndex.hasOwnProperty(sName)) {
			return ServicesIndex[sName].replace(/\./g, "/");
		}
		return undefined;
	}

	async function stopServices() {
		const aPromises = [];
		Object.values(this.getServices()).forEach((oService) => {
			aPromises.push(oService.initPromise.then(() => {
				if (typeof oService.service.destroy === "function") {
					oService.service.destroy();
				}
			}));
		});
		await Promise.all(aPromises);
		this.setServices({});
	}

	ServiceManager.prototype.getServices = function() {
		// without this changing the property would also change the default Value
		return { ...this.getProperty("services") };
	};

	/**
	 * Starts and returns the service with the given name
	 *
	 * @param {string} sName - Service name
	 * @param {sap.ui.rta.RuntimeAuthoring} oRuntimeAuthoringInstance - Instance of RuntimeAuthoring
	 * @returns {Promise<object>} Resolves with the initialized service
	 */
	ServiceManager.prototype.startService = function(sName, oRuntimeAuthoringInstance) {
		const sServiceLocation = resolveServiceLocation(sName);
		const mServices = this.getServices();
		let mService;

		if (!sServiceLocation) {
			return Promise.reject(Error(`sap.ui.rta, ServiceManager#startService: Unknown service. Can't find any registered service by name '${sName}'`));
		}

		mService = mServices[sName];
		if (mService) {
			switch (mService.status) {
				case SERVICE_STARTED: {
					return Promise.resolve(mService.exports);
				}
				case SERVICE_STARTING: {
					return mService.initPromise;
				}
				case SERVICE_FAILED: {
					return mService.initPromise;
				}
				default: {
					return Promise.reject(Error(`sap.ui.rta, ServiceManager#startService: Unknown service status. Service name = '${sName}'`));
				}
			}
		} else {
			mService = {};
			mService.status = SERVICE_STARTING;
			mService.location = sServiceLocation;
			mService.initPromise = new Promise(function(fnResolve, fnReject) {
				sap.ui.require(
					[sServiceLocation],
					async function(fnServiceFactory) {
						try {
							mService.factory = fnServiceFactory;

							this._oServiceEventBus ||= new ServiceEventBus();

							const oService = await fnServiceFactory(
								oRuntimeAuthoringInstance,
								this._oServiceEventBus.publish.bind(this._oServiceEventBus, sName)
							);

							if (oRuntimeAuthoringInstance.bIsDestroyed) {
								throw Error(`sap.ui.rta, ServiceManager#startService: RuntimeAuthoring instance is destroyed while initializing the service '${sName}'`);
							}

							if (!isPlainObject(oService)) {
								throw Error(`sap.ui.rta, ServiceManager#startService: Invalid service format. Service should return simple javascript object after initialization. Service name = '${sName}'`);
							}

							mService.service = oService;
							mService.exports = {};

							// Expose events API if there is at least one event
							if (Array.isArray(oService.events) && oService.events.length > 0) {
								Object.assign(mService.exports, {
									attachEvent: this._oServiceEventBus.subscribe.bind(this._oServiceEventBus, sName),
									detachEvent: this._oServiceEventBus.unsubscribe.bind(this._oServiceEventBus, sName),
									attachEventOnce: this._oServiceEventBus.subscribeOnce.bind(this._oServiceEventBus, sName)
								});
							}

							// Expose methods/properties from exports object if any
							const mExports = oService.exports || {};
							Object.assign(
								mService.exports,
								Object.keys(mExports).reduce(function(mResult, sKey) {
									const vValue = mExports[sKey];
									mResult[sKey] = typeof vValue === "function"
										? DtUtil.waitForSynced(oRuntimeAuthoringInstance._oDesignTime, vValue)
										: vValue;
									return mResult;
								}, {})
							);

							mService.status = SERVICE_STARTED;
							fnResolve(Object.freeze(mService.exports));
						} catch (oError) {
							fnReject(oError);
						}
					}.bind(this),
					function(vError) {
						mService.status = SERVICE_FAILED;
						fnReject(vError);
					}
				);
			}.bind(this))
			.catch(function(vError) {
				mService.status = SERVICE_FAILED;
				return Promise.reject(vError);
			});
			mServices[sName] = mService;
			this.setServices(mServices);

			return mService.initPromise;
		}
	};

	ServiceManager.prototype.destroy = function() {
		stopServices.call(this);
		if (this._oServiceEventBus) {
			this._oServiceEventBus.destroy();
		}
	};

	return ServiceManager;
});

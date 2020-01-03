/*!
 * ${copyright}
 */

sap.ui.define([
	'./LRUPersistentCache',
	'./CacheManagerNOP',
	'sap/ui/Device',
	"sap/base/Log",
	"sap/ui/performance/Measurement",
	'sap/ui/performance/trace/Interaction'
],
	function(LRUPersistentCache, CacheManagerNOP, Device, Log, Measurement, Interaction) {
		"use strict";

		/**
		 * @classdesc
		 * This object provides persistent caching functionality.
		 * The component is both private and experimental. It is currently supported to a limited set of environments:
		 * <ul>
		 *  <li>Google Chrome(version >=49) for desktop</li>
		 *  <li>Internet Explorer(version >=11) for desktop.</li>
		 * </ul>
		 * For all other environments a dummy (NOP) implementation will be loaded (@see sap.ui.core.cache.CacheManagerNOP).
		 *
		 * This object is not meant for application developer's use, but for core UI5 framework purposes.
		 *
		 * The cache manager maps all entries to a single (current) UI5 version. If the cache is loaded
		 * with different UI5 version, all existing entries will be deleted.
		 *
		 * Example usage:
		 * <pre>
		 * sap.ui.define(['sap/ui/core/cache/CacheManager'],
		 *    function(oCacheManager) {
		 *       oCacheManager.get("myKey").then(function(value){
		 *           if (value) {
		 *               //process it
		 *           } else {
		 *               //obtain it and eventually store in the cache
		 *               var oEntry = new Equipment();
		 *               oCacheManager.set("myKey", oEntry);
		 *           }
		 *         });
		 *       }
		 *    });
		 * </pre>
		 * CacheManager can be configured to work in a certain way:
		 * <ul>
		 *     <li> {@link sap.ui.core.Configuration#setUI5CacheOn} and {@link sap.ui.core.Configuration#getUI5CacheOn}
		 *     allows for switching-off the implementation and replacing it with a dummy (NOP) one</li>
		 *     <li>{@link sap.ui.core.Configuration#getUI5CacheExcludedKeys} and {@link sap.ui.core.Configuration#setUI5CacheExcludedKeys}
		 *     allows a dummy implementation only for keys containing certain string.</li>
		 * </ul>
		 * @see sap.ui.core.Configuration
		 * @private
		 * @experimental
		 * @since 1.40.0
		 * @namespace
		 * @alias sap.ui.core.cache.CacheManager
		 */
		var CacheManager = {
			/**
			 * Reference to the current underlying implementation
			 * @private
			 */
			_instance: null,

			/**
			 * Obtains a concreate implementation according to set of rules.
			 * @returns {Promise}
			 * @private
			 */
			_getInstance: function () {
				var pInstanceCreation, oMsr = startMeasurements("_getInstance"),
					that = this;

				pInstanceCreation = new Promise(function (resolve, reject) {
					var oInstance;

					Log.debug("Cache Manager: Initialization...");
					if (!CacheManager._instance) {
						oInstance = that._findImplementation();

						Measurement.start(S_MSR_INIT_IMPLEMENTATION, "CM", S_MSR_CAT_CACHE_MANAGER);
						oInstance.init().then(resolveCacheManager, reject);
						Measurement.end(S_MSR_INIT_IMPLEMENTATION, "CM");
					} else {
						resolveCacheManager(CacheManager._instance);
					}
					function resolveCacheManager(instance) {
						CacheManager._instance = instance;
						oMsr.endAsync();
						Log.debug("Cache Manager initialized with implementation [" + CacheManager._instance.name + "], resolving _getInstance promise");
						resolve(instance);
					}
				});

				oMsr.endSync();
				return pInstanceCreation;
			},

			/**
			 * Determines which implementation should be used, based on a certain rules.
			 * @returns {Object} the implementation
			 * @private
			 */
			_findImplementation: function () {
				if (isSwitchedOn() && this._isSupportedEnvironment()) {
					return LRUPersistentCache;
				} else {
					Log.warning("UI5 Cache Manager is switched off");
					return CacheManagerNOP;
				}
			},

			/**
			 * Stores or updates value for given key.
			 * @param {string|number} key the key to associate the value with. Null is not accepted
			 * @param {*} value any value that match the structured clone algorithm. Undefined is not accepted.
			 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails.
			 * @public
			 */
			set: function (key, value) {
				var pSet, oMsr = startMeasurements("set", key);
				Log.debug("Cache Manager: Setting value of type[" + typeof value + "] with key [" + key + "]");

				pSet = this._callInstanceMethod("set", arguments).then(function callInstanceHandler() {
					Log.debug("Cache Manager: Setting key [" + key + "] completed successfully");
					oMsr.endAsync();
					//nothing to return, just logging.
				}, function (e) {
					Log.error("Cache Manager: Setting key [" + key + "] failed. Error:" + e);
					oMsr.endAsync();
					throw e;
				});
				oMsr.endSync();
				return pSet;
			},

			/**
			 * Retrieves a value for given key.
			 * @param key the key to retrieve a value for
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails. It resolves with a value that is either:
			 * <ul>
			 *  <li>undefined - the entry does not exist</li>
			 *  <li>any other - the entry exists and value contains the actually one</li>
			 * </ul>
			 * @public
			 */
			get: function (key) {
				var pGet,
					fnDone = Interaction.notifyAsyncStep(),
					oMsr = startMeasurements("get", key);

				Log.debug("Cache Manager: Getting key [" + key + "]");
				pGet = this._callInstanceMethod("get", arguments).then(function callInstanceHandler(v) {
					Log.debug("Cache Manager: Getting key [" + key + "] done");
					oMsr.endAsync();
					return v;
				}, function (e) {
					Log.debug("Cache Manager: Getting key [" + key + "] failed. Error: " + e);
					oMsr.endAsync();
					throw e;
				}).finally(fnDone);
				oMsr.endSync();
				return pGet;
			},

			/**
			 * Checks whether certain entry exists.
			 * @param {string|number} key the key to look for. Null is not accepted.
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails. It resolves with a boolean value of true - if an entry
			 * with the given key is found, false - otherwise
			 * @public
			 */
			has: function (key) {
				var pHas, oMsr = startMeasurements("has", key);
				Log.debug("Cache Manager: has key [" + key + "] called");

				pHas = this._callInstanceMethod("has", arguments).then(function callInstanceHandler(result) {
					oMsr.endAsync();
					Log.debug("Cache Manager: has key [" + key + "] returned " + result);
					return result;
				});
				oMsr.endSync();
				return pHas;
			},

			/**
			 * Deletes entry with given key.
			 * @param {string|number} key the key to delete an entry for. Null is not accepted.
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails.
			 * @public
			 */
			del: function (key) {
				var pDel, oMsr = startMeasurements("del", key);
				Log.debug("Cache Manager: del called.");

				pDel = this._callInstanceMethod("del", arguments).then(function callInstanceHandler() {
					Log.debug("Cache Manager: del completed successfully.");
					oMsr.endAsync();
					//nothing to return, just logging.
				}, function (e) {
					Log.debug("Cache Manager: del failed. Error: " + e);
					oMsr.endAsync();
					throw e;
				});
				oMsr.endSync();
				return pDel;
			},

			/**
			 * Clears all entries in the cache.
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails.
			 * @public
			 */
			reset: function () {
				var pReset, oMsr = startMeasurements("reset");
				Log.debug("Cache Manager: Reset called.");

				pReset = this._callInstanceMethod("reset", arguments).then(function callInstanceHandler() {
					Log.debug("Cache Manager: Reset completed successfully.");
					oMsr.endAsync();
					//nothing to return, just logging.
				}, function (e) {
					Log.debug("Cache Manager: Reset failed. Error: " + e);
					oMsr.endAsync();
					throw e;
				});
				oMsr.endSync();
				return pReset;
			},

			/**
			 * Shuts-down the Cache Manager (all next calls to it will return an immediately resolved dummy promise with value of <undefined>)
			 * Usages are meant for testing purposes. Make sure you switch it on so the rest still can use it.
			 * @see sap.ui.core.cache.CacheManager._switchOn
			 * @returns {*}
			 * @protected
			 */
			_switchOff: function () {
				var that = this;
				return Promise.resolve().then(function () {
					safeClearInstance(that);
					sap.ui.getCore().getConfiguration().setUI5CacheOn(false);
				});
			},

			/**
			 * Starts the Cache Manager (all next calls to it will work against real cache data)
			 * Usages are meant for testing purposes. If its already on, nothing will happen
			 * @returns {*}
			 * @protected
			 */
			_switchOn: function () {
				var that = this;
				return Promise.resolve().then(function () {
					var oCfg = sap.ui.getCore().getConfiguration();
					if (!oCfg.isUI5CacheOn()) {
						safeClearInstance(that);
						sap.ui.getCore().getConfiguration().setUI5CacheOn(true);
					}
					return Promise.resolve();
				});
			},
			/**
			 * Forwards method's call to the underlying implementation
			 * @param {string} sMethodName the name of the method to forward
			 * @param {any[]} aArgs array of arguments
			 * @returns {Promise}
			 * @private
			 */
			_callInstanceMethod: function (sMethodName, aArgs) {
				var pCallInstance, sMsrCallInstance = "[sync ] _callInstanceMethod";
				Measurement.start(sMsrCallInstance, "CM", S_MSR_CAT_CACHE_MANAGER);

				if (this._instance) {
					Log.debug("Cache Manager: calling instance...");
					return this._instance[sMethodName].apply(this._instance, aArgs);
				}
				Log.debug("Cache Manager: getting instance...");

				pCallInstance = this._getInstance().then(function instanceResolving(instance) {
					return instance[sMethodName].apply(instance, aArgs);
				});
				Measurement.end(sMsrCallInstance);

				return pCallInstance;
			},

			/**
			 * Checks whether the given environment is supported by the CacheManager.
			 * @returns {boolean|*} true if yes, false if not.
			 * @private
			 */
			_isSupportedEnvironment: function () {
				var aSupportedEnv = [];

				if (this._bSupportedEnvironment == undefined) {
					aSupportedEnv.push({
						system: Device.system.SYSTEMTYPE.DESKTOP,
						browserName: Device.browser.BROWSER.CHROME,
						browserVersion: 49
					});
					aSupportedEnv.push({
						system: Device.system.SYSTEMTYPE.DESKTOP,
						browserName: Device.browser.BROWSER.INTERNET_EXPLORER,
						browserVersion: 11
					});
					aSupportedEnv.push({
						system: Device.system.SYSTEMTYPE.DESKTOP,
						browserName: Device.browser.BROWSER.SAFARI,
						browserVersion: 13
					});
					aSupportedEnv.push({
						system: Device.system.SYSTEMTYPE.TABLET,
						browserName: Device.browser.BROWSER.SAFARI,
						browserVersion: 13
					});
					aSupportedEnv.push({
						system: Device.system.SYSTEMTYPE.PHONE,
						browserName: Device.browser.BROWSER.SAFARI,
						browserVersion: 13
					});
					this._bSupportedEnvironment = aSupportedEnv.some(function (oSuppportedEnv) {
						var bSupportedSystem = Device.system[oSuppportedEnv.system],
							bSupportedBrowserName = oSuppportedEnv.browserName === Device.browser.name,
							bSupportedBrowserVersion = Device.browser.version >= oSuppportedEnv.browserVersion;

						return bSupportedSystem && bSupportedBrowserName && bSupportedBrowserVersion && window.indexedDB;
					});
				}
				return this._bSupportedEnvironment;
			}
		};

		var S_MSR_CAT_CACHE_MANAGER = "CacheManager",
			S_MSR_INIT_IMPLEMENTATION = "[sync ] _initImplementation",
			iMsrCounter = 0;

		function isSwitchedOn() {
			return sap.ui.getCore().getConfiguration().isUI5CacheOn();
		}

		function safeClearInstance(cm) {
			if (cm._instance) {
				cm._instance._destroy();
				cm._instance = null;
			}
		}

		function startMeasurements(sOperation, key) {
			iMsrCounter++;
			var sMeasureAsync = "[async]  " + sOperation + "[" + key + "]- #" + (iMsrCounter),
				sMeasureSync = "[sync ]  " + sOperation + "[" + key + "]- #" + (iMsrCounter);

			Measurement.start(sMeasureAsync, "CM", [S_MSR_CAT_CACHE_MANAGER, sOperation]);
			Measurement.start(sMeasureSync, "CM", [S_MSR_CAT_CACHE_MANAGER, sOperation]);

			return {
				sMeasureAsync: sMeasureAsync,
				sMeasureSync: sMeasureSync,
				endAsync: function () {
					Measurement.end(this.sMeasureAsync);
				},
				endSync: function () {
					Measurement.end(this.sMeasureSync);
				}
			};
		}

		return CacheManager;
	});
/*!
 * ${copyright}
 */
sap.ui.define(
	["sap/ui/base/Object"],
	(BaseObject) => {
		"use strict";

		const _checkAndPrepareAdd = function(sName) {
			if (!sName) {
				throw new Error("PromiseCache: Please provide an identifier!");
			}
			if (this._oCache && this._oCache[sName]) {
				this.remove.call(this, sName);
			}
		};

		const _findKeyForPromise = function(oPromise) {
			if (typeof oPromise === "object" && this._oCache) {
				for (const sKey in this._oCache) {
					if (this._oCache[sKey].promise === oPromise) {
						return sKey;
					}
				}
			}
		};

		const _findConfigByKeyOrPromise = function(vPromise, bThrow) {
			const sKey = typeof vPromise === "string" ? vPromise : _findKeyForPromise.call(this, vPromise);
			const oConfig = sKey && this._oCache && this._oCache[sKey];

			if (bThrow && !oConfig) {
				throw new Error("PromiseCache: Promise not found!");
			}

			return oConfig;
		};

		/**
		 * @class
		 * Provides a caching mechanism for promises.
		 * This API features Promise cancellation: resolve or reject handlers won't be called after removal of the promise, cache destruction or manual cancellation.
		 * Destroying the cache will cancel all registered promises and delete references. Convenience methods for promise creation, wrapping and replacement are offered.
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @alias sap.ui.mdc.util.PromiseCache
		 * @since 1.85.0
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		const PromiseCache = BaseObject.extend("sap.ui.mdc.util.PromiseCache", /** @lends sap.ui.mdc.util.PromiseCache.prototype */ {
			/**
			 * Constructor.
			 */
			constructor: function() {
				this._oCache = {};
			},
			/**
			 * Adds a promise to the promise cache using a string identifier and a creation method or given <code>Promise</code>.
			 * Calling add using an already existing identifier will cancel and replace the existing promise.
			 *
			 * Note: All unsettled promises will be cancelled on removal or cache destruction
			 * A given creation method will receive the following arguments on execution:
			 * <ul>
			 * <li><code>oPromise</code> ­- The newly created Promise</li>
			 * <li><code>fnResolve</code> ­- Resolve method for the newly created Promise</li>
			 * <li><code>fnReject</code> ­- Reject method for the newly created Promise</li>
			 * <li><code>fnRemove</code> ­- Remove method for the newly created Promise</li>
			 * </ul>
			 *
			 * @protected
			 * @param {string} [sName] Promise identifier
			 * @param {function(Promise,function,function,function)|Promise} [fnCreate] creation method or pre-created promise
			 * @returns {Promise<*>} Returns the newly created <code>Promise</code>
			 */
			add: function(sName, fnCreate) {
				_checkAndPrepareAdd.call(this, sName);
				const oPromiseConfig = {};
				this._oCache[sName] = oPromiseConfig;

				oPromiseConfig.promise = new Promise((resolve, reject) => {
					oPromiseConfig.resolve = function(oResult) {
						if (!oPromiseConfig._isCanceled) {
							oPromiseConfig._isSettled = true;
							resolve(oResult);
						}
					};
					oPromiseConfig.reject = function(oErr) {
						if (!oPromiseConfig._isCanceled) {
							oPromiseConfig._isSettled = true;
							reject(oErr);
						}
					};
				});

				oPromiseConfig.promise.isSettled = function() {
					return !!oPromiseConfig._isSettled;
				};

				oPromiseConfig.promise.isPending = function() {
					return !oPromiseConfig._isSettled && !oPromiseConfig._isCanceled;
				};

				oPromiseConfig.promise.isCanceled = function() {
					return !!oPromiseConfig._isCanceled;
				};

				oPromiseConfig.promise.getInternalPromise = function() {
					return oPromiseConfig._promise;
				};

				if (fnCreate) {
					const bIsCreateFunction = typeof fnCreate === "function";
					const bIsCreatePromise = !bIsCreateFunction && typeof fnCreate.then === "function";

					if (!bIsCreateFunction && !bIsCreatePromise) {
						throw new Error("PromiseCache: fnCreate must be a promise or function");
					}

					const oCreateResult = bIsCreateFunction ? fnCreate() : fnCreate;
					const bIsCreateResultPromise = oCreateResult && typeof oCreateResult.then === "function";

					if (bIsCreateResultPromise) { // handle internal promise
						oPromiseConfig._promise = oCreateResult;
						oPromiseConfig._promise.then((vResult) => {
							if (!oPromiseConfig._isCanceled) {
								oPromiseConfig._isSettled = true;
								oPromiseConfig.resolve(vResult);
							}
							return vResult;
						}, (vErr) => {
							if (!oPromiseConfig._isCanceled) {
								oPromiseConfig._isSettled = true;
								oPromiseConfig.reject(vErr);
							}
						});
					} else { // handle non-promise results
						oPromiseConfig.resolve(oCreateResult);
					}
				}

				return this._oCache[sName].promise;
			},
			/**
			 * Cancels an unsettled promise from the promise cache.
			 * Calling cancel twice is a no-op.
			 *
			 * @protected
			 * @param {string|Promise} vPromise Promise or identifier
			 * @returns {Promise<*>} Returns the canceled <code>Promise</code>
			 */
			cancel: function(vPromise) {
				const oPromiseConfig = _findConfigByKeyOrPromise.call(this, vPromise, true);
				if (!oPromiseConfig._isSettled) {
					oPromiseConfig._isCanceled = true;
				}
				return oPromiseConfig.promise;
			},
			/**
			 * Retrieves an existing promise from the promise cache.
			 * Automatically creates and returns a new promise if <code>fnCreate</code> is given.
			 *
			 * A given creation method will receive the following arguments on execution:
			 * <ul>
			 * <li><code>oPromise</code> ­- The newly created Promise</li>
			 * <li><code>fnResolve</code> ­- Resolve method for the newly created Promise</li>
			 * <li><code>fnReject</code> ­- Reject method for the newly created Promise</li>
			 * <li><code>fnRemove</code> ­- Remove method for the newly created Promise</li>
			 * </ul>
			 *
			 * @protected
			 * @param {string} sName Promise identifier
			 * @param {function(Promise,function,function,function)|Promise<*>} [fnCreate] creation method or pre-created promise
			 * @returns {Promise} Returns the newly created <code>Promise</code>
			 */
			retrieve: function(sName, fnCreate) {
				const oPromiseConfig = this._oCache && this._oCache[sName];
				if (!oPromiseConfig && fnCreate) {
					return this.add(...[sName, fnCreate]);
				}
				return oPromiseConfig && oPromiseConfig.promise;
			},

			/**
			 * Retrieves multiple promises from the promise cache
			 * Will return all cached promises if no arguments are given
			 *
			 * @protected
			 * @param {...string} sName Promise identifier(s)
			 * @returns {Array} Returns the retrieved promises
			 */
			retrieveMany: function() {
				const aResults = [];
				const aKeys = arguments.length ?
					[].slice.call(arguments) :
					Object.keys(this._oCache);
				for (let i = 0; i < aKeys.length; i++) {
					aResults.push(this.retrieve(aKeys[i].toString()));
				}
				return aResults;
			},
			/**
			 * Removes an existing promise from the promise cache
			 *
			 * @protected
			 * @param {string|Promise<*>} vPromise Promise or identifier
			 */
			remove: function(vPromise) {
				const sKey = typeof vPromise === "string" ? vPromise : _findKeyForPromise.call(this, vPromise);
				const oConfig = sKey && this._oCache && this._oCache[sKey];
				if (oConfig) {
					oConfig._isCanceled = true;
					delete this._oCache[sKey];
				}
			},
			/**
			 * Resolves an existing promise from the promise cache
			 *
			 * @protected
			 * @param {string|Promise} vPromise Promise or identifier
			 * @param {string} [oValue] Promise result
			 * @returns {Promise<*>} Returns the resolved <code>Promise</code>
			 */
			resolve: function(vPromise, oValue) {
				const oConfig = _findConfigByKeyOrPromise.call(this, vPromise, true);
				oConfig.resolve(oValue);
				return oConfig.promise;
			},
			/**
			 * Rejects an existing promise from the promise cache
			 *
			 * @protected
			 * @param {string|Promise} vPromise Promise or identifier
			 * @param {string} [oValue] Promise error
			 * @returns {Promise<*>} Returns the rejected <code>Promise</code>
			 */
			reject: function(vPromise, oValue) {
				const oConfig = _findConfigByKeyOrPromise.call(this, vPromise, true);
				oConfig.reject(oValue);
				return oConfig.promise;
			},
			/**
			 * Provides cleanup functionality for the promise cache
			 *
			 * @protected
			 */
			clear: function() {
				Object.keys(this._oCache).forEach(
					(sKey) => {
						this.remove(sKey);
					}
				);
			},
			/**
			 * Provides cleanup functionality for the promise cache
			 *
			 * @protected
			 */
			destroy: function() {
				this.clear();
				this._oCache = null;
			}
		});
		return PromiseCache;
	}
);
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/base/ManagedObject"
], function(
	merge,
	ObjectPath,
	ManagedObject
) {
	"use strict";
	/**
	 * Base class for data selectors.
	 * The ID of the data selector should hint on the return type, i.e. plural for arrays and otherwise singular.
	 *
	 * @class Base class for data selectors
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.apply._internal.flexState.DataSelector
	 * @since 1.110
	 * @private
	 * @ui5-restricted
	 */
	// eslint-disable-next-line max-len
	var DataSelector = ManagedObject.extend("sap.ui.fl.apply._internal.flexState.DataSelector", /* @lends sap.ui.fl.apply._internal.flexState.DataSelector.prototype */ {
		metadata: {
			properties: {
				/**
				 * Parent selector for chaining DataSelectors.
				 * If a parent selector is provided, its <code>execute</code> function is
				 * called first with the parameters that were specified by the consumer
				 * The result is then passed to the <code>execute</code> function of the next
				 * selector as base data for further calculations
				 * See {@link sap.ui.fl.apply._internal.flexState.DataSelector}.
				 */
				parentDataSelector: {
					type: "object"
				},
				/**
				 * Temporary cache to store calculated values or, in case of parameterized selectors,
				 * key value pairs like <code>parentSelectorParameterValue: { parameterValue: { someKey: someValue } }</code>
				 */
				cachedResult: {
					type: "any"
				},
				/**
				 * If no parameter key is set, the data selector cache is not parameterized
				 */
				parameterKey: {
					type: "string"
				},
				/**
				 * Callback function which is executed once for every parameter after the selector is created.
				 */
				initFunction: {
					type: "function"
				},
				/**
				 * Callback function to build the derived state
				 * Must not return <code>null</code> or <code>undefined</code> to allow proper cache invalidation
				 */
				executeFunction: {
					type: "function"
				},
				/**
				 * List of callback functions which are notified in case of state changes
				 */
				updateListeners: {
					type: "function[]",
					defaultValue: []
				},
				/**
				 * Callback function to compare the current base data with the base data that was
				 * used to calculate the derived state
				 * Must return <code>true</code> if a recalculation is required
				 */
				checkInvalidation: {
					type: "function",
					defaultValue() {
						return true;
					}
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.apply(this, aArgs);
			this._mInitialized = {};
			if (this.getParameterKey()) {
				// If value is parameterized, create a map for easier access
				this.setCachedResult({});
			}
			// Attach to parent data selector updates
			var oParentDataSelector = this.getParentDataSelector();
			if (oParentDataSelector) {
				this.onParentSelectorUpdate = this.checkUpdate.bind(this);
				oParentDataSelector.addUpdateListener(this.onParentSelectorUpdate);
			}
		}
	});

	const sNoParameter = "DataSelector_no_parameter";

	// Returns a list of parameter values for all selectors in the chain
	// This list can be used to access nested caches in child selectors
	function getParameterChain(oLowestDataSelector, mParameters) {
		const aParameterList = [];

		function getParameterValue(oCurrentDataSelector) {
			const sParameterKey = oCurrentDataSelector.getParameterKey();
			if (!sParameterKey) {
				return sNoParameter;
			}
			return mParameters?.[sParameterKey];
		}

		let oCurrentDataSelector = oLowestDataSelector;
		do {
			const sParameterValue = getParameterValue(oCurrentDataSelector);
			// If no parameter value is provided for the last child selector in the chain
			// skip it, start with its parent and thus return the whole cache entry
			if (sParameterValue || oCurrentDataSelector !== oLowestDataSelector) {
				if (sParameterValue === undefined) {
					throw new Error(`Parameter '${oCurrentDataSelector.getParameterKey()}' is missing`);
				}
				aParameterList.unshift(sParameterValue);
			}

			oCurrentDataSelector = oCurrentDataSelector.getParentDataSelector();
		} while (oCurrentDataSelector);
		return aParameterList;
	}

	/**
	 * Registers a callback listener to get notified about changes to the state
	 * @param {function} fnListener - Callback function that is called in case of state updates
	 */
	DataSelector.prototype.addUpdateListener = function(fnListener) {
		var aCurrentListeners = this.getUpdateListeners();
		if (!aCurrentListeners.includes(fnListener)) {
			this.setUpdateListeners([].concat(aCurrentListeners, fnListener));
		}
	};

	/**
	 * Deregisters a state update callback listener
	 * @param {function} fnListener - Callback listener that should be removed
	 */
	DataSelector.prototype.removeUpdateListener = function(fnListener) {
		var aCurrentListeners = this.getUpdateListeners();
		this.setUpdateListeners(aCurrentListeners.filter(function(fnListenerToCheck) {
			return fnListenerToCheck !== fnListener;
		}));
	};

	DataSelector.prototype.exit = function() {
		var oParentDataSelector = this.getParentDataSelector();
		if (oParentDataSelector) {
			oParentDataSelector.removeUpdateListener(this.onParentSelectorUpdate);
		}
	};

	DataSelector.prototype._getParameterizedCachedResult = function(mParameters) {
		const aParameterValues = getParameterChain(this, mParameters);
		if (aParameterValues.length === 0) {
			return this.getCachedResult();
		}
		return ObjectPath.get(aParameterValues, this.getCachedResult());
	};

	DataSelector.prototype._setParameterizedCachedResult = function(mParameters, vValue) {
		const aParameterValues = getParameterChain(this, mParameters);
		const mNewData = {};
		if (aParameterValues.length === 0) {
			Object.assign(mNewData, vValue);
		} else {
			ObjectPath.set(aParameterValues, vValue, mNewData);
		}
		return this.setCachedResult(merge(
			{},
			this.getCachedResult(),
			mNewData
		));
	};

	// Clears the affected cache section and updates
	// dependent selectors accordingly
	// It might be required to fully clear all dependent selectors
	// as well in the future
	DataSelector.prototype._clearCache = function(mParameters, aUpdateInfo) {
		const aUpdatedParameterMaps = [];

		const sParameterKey = this.getParameterKey();
		if (!sParameterKey) {
			// Cache is not parameterized, clear it completly
			this.setCachedResult(null);
			aUpdatedParameterMaps.push(mParameters);
		} else if (Object.keys(mParameters || {}).includes(sParameterKey)) {
			// Clear cache for a specific parameter
			if (this._getParameterizedCachedResult(mParameters) !== undefined) {
				this._setParameterizedCachedResult(mParameters, null);
				aUpdatedParameterMaps.push(mParameters);
			}
		} else {
			// Fully clear all parameters
			// Since its own parameter is missing, cached result is the map of all
			// parameter keys and their cache values
			const mCurrentCache = this._getParameterizedCachedResult(mParameters);
			Object.keys(mCurrentCache || {}).forEach((sCacheKey) => {
				aUpdatedParameterMaps.push({
					...mParameters,
					[sParameterKey]: sCacheKey
				});
			});
			this.setCachedResult({});
		}

		this.getUpdateListeners().forEach(function(fnUpdateFunction) {
			aUpdatedParameterMaps.forEach((mUpdatedParameters) => {
				fnUpdateFunction(mUpdatedParameters, aUpdateInfo);
			});
		});
	};

	/**
	 * Clears the cached results and notifies update listeners.
	 *
	 * @param {object} [mParameters] - Parameter for which the cache should be cleared, if
	 * no parameter is provided, the whole cache is cleared
	 */
	DataSelector.prototype.clearCachedResult = function(mParameters) {
		this._clearCache(mParameters);
	};

	/**
	 * Getter that triggers the execution of the derived state calculation or returns
	 * the value from the cache.
	 * @param {object} mParameters - Map containing the parameters for all instances in the selector chain
	 * @returns {any} Derived state object
	 */
	DataSelector.prototype.get = function(mParameters) {
		var sParameterKey = this.getParameterKey();
		if (sParameterKey && !(mParameters || {})[sParameterKey]) {
			throw new Error(`Parameter '${sParameterKey}' is missing`);
		}
		var vResult = this._getParameterizedCachedResult(mParameters);
		// Check for undefined or null as indicators for an empty cache
		if (vResult !== null && vResult !== undefined) {
			return vResult;
		}
		var oParentDataSelector = this.getParentDataSelector();
		var oParentData = oParentDataSelector && oParentDataSelector.get(mParameters);

		var vParameterValue = (mParameters || {})[sParameterKey];
		if (!this._mInitialized[vParameterValue] && this.getInitFunction()) {
			this.getInitFunction()(
				oParentData,
				vParameterValue
			);
			this._mInitialized[vParameterValue] = true;
		}

		var vNewResult = this.getExecuteFunction()(
			oParentData,
			vParameterValue
		);
		this._setParameterizedCachedResult(mParameters, vNewResult);
		return vNewResult;
	};

	function checkInvalidation(fnCheckInvalidation, mParameters, aUpdateInfo) {
		if (aUpdateInfo) {
			return aUpdateInfo.some((oUpdateInfo) => fnCheckInvalidation(mParameters, oUpdateInfo));
		}
		return true;
	}

	/**
	 * Update Info Object containing information for the checkInvalidation function.
	 * @typedef {object} sap.ui.fl.apply._internal.flexState.dataSelector.UpdateInfo
	 * @property {string} [aUpdateInfo.type] - Type of the update done before
	 * @property {sap.ui.fl.apply._internal.flexObjects.FlexObject} [aUpdateInfo.updatedObject] - Update relevant object
	 */

	/**
	 * Invokes the cache invalidation check and resets the cache if necessary.
	 * For chained selectors, this function must always be called as low in the chain as possible,
	 * i.e. on the first selector where the updated data might show side effects.
	 *
	 * @param {object} [mParameters] - Map of selector specific parameters
	 * @param {sap.ui.fl.apply._internal.flexState.dataSelector.UpdateInfo[]} [aUpdateInfo] - List with update info objects
	 */
	DataSelector.prototype.checkUpdate = function(mParameters, aUpdateInfo) {
		const sParameterKey = this.getParameterKey();

		if (
			// If data selector is parameterized
			sParameterKey !== undefined
			// and no valid value for the parameter of the data selector was provided
			&& !Object.keys(mParameters || {}).includes(sParameterKey)
		) {
			const vCachedResult = this._getParameterizedCachedResult(mParameters);
			const aCacheKeys = Object.keys(vCachedResult && typeof vCachedResult === "object" ? vCachedResult : {});
			// Check invalidation of children for each possible parameter value
			aCacheKeys.forEach((sCacheKey) => {
				// Append the possible cache key part to pass down the selector chain
				const mInvalidationCheckParameters = {
					...mParameters,
					[sParameterKey]: sCacheKey
				};
				const bRequiresInvalidation = checkInvalidation(this.getCheckInvalidation(), mInvalidationCheckParameters, aUpdateInfo);
				if (bRequiresInvalidation) {
					// Clear the affected cache entry and continue checks in the child selectors
					this._clearCache(mInvalidationCheckParameters, aUpdateInfo);
				}
				return !bRequiresInvalidation;
			});
		} else {
			// Data selector is not parameterized or specific cache entry was selected
			const bRequiresInvalidation = checkInvalidation(this.getCheckInvalidation(), mParameters, aUpdateInfo);
			if (bRequiresInvalidation) {
				this._clearCache(mParameters, aUpdateInfo);
			}
		}
	};

	return DataSelector;
});

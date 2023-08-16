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
				 * Temporary cache to store calculated values or key value pairs
				 * in case of parameterized selectors
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

	function getAllParameterValues(oDataSelector, mParameters) {
		const aReturn = [];
		let oCurrentDataSelector = oDataSelector;
		do {
			aReturn.unshift(oCurrentDataSelector.getParameterKey() ? mParameters[oCurrentDataSelector.getParameterKey()] : sNoParameter);
			oCurrentDataSelector = oCurrentDataSelector.getParentDataSelector();
		} while (oCurrentDataSelector);
		return aReturn;
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
		const aParameterValues = getAllParameterValues(this, mParameters);
		return ObjectPath.get(aParameterValues, this.getCachedResult());
	};

	DataSelector.prototype._setParameterizedCachedResult = function(mParameters, vValue) {
		const aParameterValues = getAllParameterValues(this, mParameters);
		const mNewData = {};
		ObjectPath.set(aParameterValues, vValue, mNewData);
		return this.setCachedResult(merge(
			{},
			this.getCachedResult(),
			mNewData
		));
	};

	DataSelector.prototype._clearCache = function(mParameters) {
		if (mParameters) {
			this._setParameterizedCachedResult(mParameters, null);
		} else {
			// Clear full cache
			var bIsParameterized = !!this.getParameterKey();
			this.setCachedResult(bIsParameterized ? {} : null);
		}
	};

	/**
	 * Clears the cached results and notifies update listeners.
	 *
	 * @param {object} [mParameters] - Parameter for which the cache should be cleared, if
	 * no parameter is provided, the whole cache is cleared
	 */
	DataSelector.prototype.clearCachedResult = function(mParameters) {
		this._clearCache(mParameters);
		// TODO: For now recalculate the dependent selectors,
		// it might be required to fully clear all dependent selectors
		// as well in the future
		this.getUpdateListeners().forEach(function(fnUpdateFunction) {
			fnUpdateFunction();
		});
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
		// FIXME: Might lead to infinite loop if update always invalidates
		// this.getUpdateListeners().forEach(function(fnUpdateFunction) {
		// 	fnUpdateFunction();
		// });
		return vNewResult;
	};

	/**
	 * Invokes the cache invalidation check and resets the cache if necessary
	 * @param {object} mParameters - Map of selector specific parameters
	 */
	DataSelector.prototype.checkUpdate = function(mParameters) {
		if (this.getCheckInvalidation()(mParameters) === true) {
			this._clearCache(mParameters);
			this.getUpdateListeners().forEach(function(fnUpdateFunction) {
				fnUpdateFunction();
			});
		}
	};

	return DataSelector;
});

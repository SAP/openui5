/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/Utils"
], function(
	isEmptyObject,
	isPlainObject,
	FlexObject,
	States,
	Utils
) {
	"use strict";

	/**
	 * Base class for all UI Changes
	 *
	 * @class Flexibility class UIChange
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.UIChange
	 * @since 1.109
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var UIChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.UIChange", /* @lends sap.ui.fl.apply._internal.flexObjects.UIChange.prototype */ {
		metadata: {
			properties: {
				/**
				 * Reference to a control that this UIChange is bound to
				 */
				selector: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Additional references to controls that are needed for this UIChange to work properly
				 */
				dependentSelectors: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Describes the current state of the UIChange regarding the application and reversion of changes.
				 */
				applyState: {
					type: "string",
					defaultValue: States.ApplyState.NEW
				},

				/**
				 * Indicates if the UIChange should be skipped during XML preprocessing
				 */
				jsOnly: {
					type: "boolean"
				},

				/**
				 * ID of a variant, if the UIChange is part of a variant management control
				 */
				variantReference: {
					type: "string"
				},

				/**
				 * Whether the change is related to the standard variant, if variant dependent
				 */
				isChangeOnStandardVariant: {
					type: "boolean"
				},

				/**
				 * Indicates if the UIChange is saved to a variant
				 */
				savedToVariant: {
					type: "boolean"
				},

				// TODO: consolidate with other revert data properties
				/**
				 * Information with which the UIChange can be reverted
				 */
				revertData: {
					type: "any",
					defaultValue: null
				}
			},
			aggregations: {},
			associations: {},
			events: {}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			FlexObject.apply(this, aArgs);

			this._oChangeProcessingPromises = {};
			this.setInitialApplyState();
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	UIChange.getMappingInfo = function() {
		return {
			...FlexObject.getMappingInfo(),
			selector: "selector",
			dependentSelectors: "dependentSelector",
			jsOnly: "jsOnly",
			variantReference: "variantReference",
			isChangeOnStandardVariant: "isChangeOnStandardVariant"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	UIChange.prototype.getMappingInfo = function() {
		return UIChange.getMappingInfo();
	};

	UIChange.prototype.setQueuedForRevert = function() {
		if (this._aQueuedProcesses[this._aQueuedProcesses.length - 1] !== States.Operations.REVERT) {
			this._aQueuedProcesses.unshift(States.Operations.REVERT);
		}
	};

	UIChange.prototype.isQueuedForRevert = function() {
		return this._aQueuedProcesses.indexOf(States.Operations.REVERT) > -1;
	};

	UIChange.prototype.setQueuedForApply = function() {
		// Not optimized application code can result that the change applying is called twice
		// So check if there was already APPLY operation to prevent permanent waitForChangeApplied issue
		// Same applies for setQueuedForRevert
		if (this._aQueuedProcesses[this._aQueuedProcesses.length - 1] !== States.Operations.APPLY) {
			this._aQueuedProcesses.unshift(States.Operations.APPLY);
		}
	};

	UIChange.prototype.isQueuedForApply = function() {
		return this._aQueuedProcesses.indexOf(States.Operations.APPLY) > -1;
	};

	UIChange.prototype.setInitialApplyState = function() {
		this._aQueuedProcesses = [];
		delete this._ignoreOnce;
		this.setApplyState(States.ApplyState.INITIAL);
		this._oChangeProcessedPromise = {};
		this._oChangeProcessedPromise.promise = new Promise(function(resolve) {
			this._oChangeProcessedPromise.resolveFunction = {
				resolve
			};
		}.bind(this));
	};

	UIChange.prototype.isInInitialState = function() {
		return (this._aQueuedProcesses.length === 0) && (this.getApplyState() === States.ApplyState.INITIAL);
	};

	UIChange.prototype.isValidForDependencyMap = function() {
		// Change without id in selector should be skipped from adding dependencies process
		return !!this.getSelector().id;
	};

	UIChange.prototype.startApplying = function() {
		this.setApplyState(States.ApplyState.APPLYING);
	};

	// Deprecated, use markSuccessful or markFailed instead
	UIChange.prototype.markFinished = function(oResult, bApplySuccessful) {
		this._aQueuedProcesses.pop();
		this._resolveChangeProcessingPromiseWithError(States.Operations.APPLY, oResult);
		var sNewApplyState = bApplySuccessful !== false
			? States.ApplyState.APPLY_SUCCESSFUL
			: States.ApplyState.APPLY_FAILED;
		this.setApplyState(sNewApplyState);
	};

	UIChange.prototype.markSuccessful = function(oResult) {
		this.markFinished(oResult, true);
	};

	UIChange.prototype.markFailed = function(oResult) {
		this.markFinished(oResult, false);
	};

	UIChange.prototype.startReverting = function() {
		this.setApplyState(States.ApplyState.REVERTING);
	};

	UIChange.prototype.markRevertFinished = function(oResult) {
		this._aQueuedProcesses.pop();
		this._resolveChangeProcessingPromiseWithError(States.Operations.REVERT, oResult);
		this.setApplyState(States.ApplyState.REVERT_FINISHED);
	};

	UIChange.prototype.hasApplyProcessStarted = function() {
		return this.getApplyState() === States.ApplyState.APPLYING;
	};

	UIChange.prototype.isSuccessfullyApplied = function() {
		return this.getApplyState() === States.ApplyState.APPLY_SUCCESSFUL;
	};

	UIChange.prototype.hasApplyProcessFailed = function() {
		return this.getApplyState() === States.ApplyState.APPLY_FAILED;
	};

	UIChange.prototype.isApplyProcessFinished = function() {
		return this.isSuccessfullyApplied() || this.hasApplyProcessFailed();
	};

	UIChange.prototype.hasRevertProcessStarted = function() {
		return this.getApplyState() === States.ApplyState.REVERTING;
	};

	UIChange.prototype.isRevertProcessFinished = function() {
		return this.getApplyState() === States.ApplyState.REVERT_FINISHED;
	};

	UIChange.prototype.isCurrentProcessFinished = function() {
		return this._aQueuedProcesses.length === 0 && this.getApplyState() !== States.ApplyState.INITIAL;
	};

	/**
	 * Adds and returns a promise that resolves as soon as
	 * <code>resolveChangeProcessingPromise</code> or <code>resolveChangeProcessingPromiseWithError</code> is called.
	 * The promise will always resolve, either without a parameter or with an object and an <code>error</code> parameter inside.
	 * At any time, there is only one object for 'apply' or 'revert'. If this function is called multiple times for the same key,
	 * only the current promise will be returned.
	 *
	 * 	_oChangeProcessingPromises: {
	 * 		States.Operations.APPLY: {
	 * 			promise: <Promise>,
	 * 			resolveFunction: {}
	 * 		},
	 * 		States.Operations.REVERT: {
	 * 			promise: <Promise>,
	 * 			resolveFunction: {}
	 * 		}
	 * 	}
	 *
	 * @param {string} sKey - Current process, should be either <code>States.Operations.APPLY</code> or <code>States.Operations.REVERT</code>
	 * @returns {Promise} Promise
	 */
	UIChange.prototype.addChangeProcessingPromise = function(sKey) {
		if (!this._oChangeProcessingPromises[sKey]) {
			this._oChangeProcessingPromises[sKey] = {};
			this._oChangeProcessingPromises[sKey].promise = new Promise(function(resolve) {
				this._oChangeProcessingPromises[sKey].resolveFunction = {
					resolve
				};
			}.bind(this));
		}
		return this._oChangeProcessingPromises[sKey].promise;
	};

	/**
	 * Calls <code>addChangeProcessingPromise</code> for all currently queued processes.
	 *
	 * @returns {Promise[]} Array with all promises for every process
	 */
	UIChange.prototype.addChangeProcessingPromises = function() {
		var aReturn = [];
		if (this.getApplyState() === States.ApplyState.INITIAL && this._oChangeProcessedPromise) {
			aReturn.push(this._oChangeProcessedPromise.promise);
		}
		this._aQueuedProcesses.forEach(function(sProcess) {
			aReturn.push(this.addChangeProcessingPromise(sProcess));
		}, this);
		return aReturn;
	};

	UIChange.prototype.addPromiseForApplyProcessing = function() {
		return this.addChangeProcessingPromise(States.Operations.APPLY);
	};

	UIChange.prototype._resolveChangeProcessingPromiseWithError = function(sKey, oResult) {
		if (this._oChangeProcessingPromises[sKey]) {
			this._oChangeProcessingPromises[sKey].resolveFunction.resolve(oResult);
			delete this._oChangeProcessingPromises[sKey];
		}
		if (this._oChangeProcessedPromise) {
			this._oChangeProcessedPromise.resolveFunction.resolve(oResult);
			this._oChangeProcessedPromise = null;
		}
	};

	UIChange.prototype.hasRevertData = function() {
		return this.getRevertData() !== null;
	};

	UIChange.prototype.resetRevertData = function() {
		this.setRevertData(null);
	};

	UIChange.prototype.setDependentSelectors = function(mDependentSelectors) {
		this.setProperty("dependentSelectors", mDependentSelectors);
		delete this._aDependentSelectorList;
	};

	/**
	 * Adds the selector to the dependent selector list.
	 *
	 * @param {(string|sap.ui.core.Control|string[]|sap.ui.core.Control[])} vControl - SAPUI5 control, or ID string, or array of SAPUI5 controls, for which the selector should be determined
	 * @param {string} sAlias - Alias under which the dependent object is saved
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - Application component; only needed if <code>vControl</code> is a string or an XML node
	 * @param {object} [mAdditionalSelectorInformation] - Additional mapped data which is added to the selector
	 *
	 * @throws {Exception} oException If <code>sAlias</code> already exists
	 */
	UIChange.prototype.addDependentControl = function(vControl, sAlias, mPropertyBag, mAdditionalSelectorInformation) {
		if (!vControl) {
			throw new Error("Parameter vControl is mandatory");
		}
		if (!sAlias) {
			throw new Error("Parameter sAlias is mandatory");
		}
		if (!mPropertyBag || isEmptyObject(mPropertyBag)) {
			throw new Error("Parameter mPropertyBag is mandatory");
		}

		var oCurrentDependentSelectors = { ...this.getDependentSelectors() };

		if (oCurrentDependentSelectors[sAlias]) {
			throw new Error(`Alias '${sAlias}' already exists in the change.`);
		}

		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		if (Array.isArray(vControl)) {
			var aSelector = [];
			vControl.forEach(function(oControl) {
				aSelector.push(oModifier.getSelector(oControl, oAppComponent, mAdditionalSelectorInformation));
			});
			oCurrentDependentSelectors[sAlias] = aSelector;
		} else {
			oCurrentDependentSelectors[sAlias] = oModifier.getSelector(vControl, oAppComponent, mAdditionalSelectorInformation);
		}
		this.setDependentSelectors(oCurrentDependentSelectors);

		// remove dependency list so that it will be created again in method getDependentSelectorList
		delete this._aDependentSelectorList;
	};

	/**
	 * Returns the control or array of controls saved under the passed alias.
	 *
	 * @param {string} sAlias - Retrieves the selectors that have been saved under this alias
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component needed to retrieve the control from the selector
	 * @param {Node} mPropertyBag.view - For XML processing: XML node of the view
	 *
	 * @returns {array|object} Dependent selector list in <code>selectorPropertyName:selectorPropertyValue</code> format, or the selector saved under the alias
	 */
	UIChange.prototype.getDependentControl = function(sAlias, mPropertyBag) {
		var aDependentControls = [];
		if (!sAlias) {
			throw new Error("Parameter sAlias is mandatory");
		}
		if (!mPropertyBag) {
			throw new Error("Parameter mPropertyBag is mandatory");
		}

		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		var oDependentSelector = this.getDependentSelectors()[sAlias];
		if (Array.isArray(oDependentSelector)) {
			oDependentSelector.forEach(function(oSelector) {
				aDependentControls.push(oModifier.bySelector(oSelector, oAppComponent, mPropertyBag.view));
			});
			return aDependentControls;
		}

		return oModifier.bySelector(oDependentSelector, oAppComponent, mPropertyBag.view);
	};

	/**
	 * Returns all dependent selectors, including the selector from the selector of the change.
	 *
	 * @returns {array} Dependent selector list
	 */
	UIChange.prototype.getDependentSelectorList = function() {
		var aDependentSelectors = [this.getSelector()];

		if (!this._aDependentSelectorList) {
			// if there is an 'originalSelector' as dependent the change is made inside a template; this means that the
			// dependent selectors point to the specific clones of the template; those clones don't go through the
			// propagation listener and will never be cleaned up from the dependencies, thus blocking the JS Change Applying
			// therefore all the dependents have to be ignored and the dependents reset to the initial state (only selector)
			if (!this.getOriginalSelector()) {
				Object.entries(this.getDependentSelectors()).some(function(aProperties) {
					var vDependentSelector = aProperties[1];

					if (!Array.isArray(vDependentSelector)) {
						vDependentSelector = [vDependentSelector];
					}

					vDependentSelector.forEach(function(oCurrentSelector) {
						if (oCurrentSelector && Utils.indexOfObject(aDependentSelectors, oCurrentSelector) === -1) {
							aDependentSelectors.push(oCurrentSelector);
						}
					});
				});
			}
			this._aDependentSelectorList = aDependentSelectors;
		}

		return this._aDependentSelectorList;
	};

	/**
	 * Returns a list of selectors of the controls that the change depends on, excluding the selector of the change.
	 *
	 * @returns {array} List of selectors that the change depends on
	 */
	UIChange.prototype.getDependentControlSelectorList = function() {
		var aDependentSelectors = this.getDependentSelectorList().concat();

		if (aDependentSelectors.length > 0) {
			var oSelector = this.getSelector();
			var iIndex = Utils.indexOfObject(aDependentSelectors, oSelector);
			if (iIndex > -1) {
				aDependentSelectors.splice(iIndex, 1);
			}
		}

		return aDependentSelectors;
	};

	/**
	 * Returns the 'originalSelector' from the dependent selectors. This is only set in case of changes on a template.
	 *
	 * @returns {sap.ui.fl.selector} the original selector if available
	 */
	UIChange.prototype.getOriginalSelector = function() {
		return this.getDependentSelectors().originalSelector;
	};

	/**
	 * Sets the extension point information.
	 * @param {*} oExtensionPointInfo Extension point information
	 */
	UIChange.prototype.setExtensionPointInfo = function(oExtensionPointInfo) {
		this._oExtensionPointInfo = oExtensionPointInfo;
	};

	/**
	 * Gets the extension point information.
	 * @returns {*} Extension point information
	 */
	UIChange.prototype.getExtensionPointInfo = function() {
		if (isPlainObject(this._oExtensionPointInfo)) {
			return { ...this._oExtensionPointInfo };
		}
		return this._oExtensionPointInfo;
	};

	return UIChange;
});
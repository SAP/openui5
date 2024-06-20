/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	Layer,
	ChangePersistenceFactory,
	Versions,
	Reverter,
	URLHandler,
	States,
	FlexState,
	ControlVariantApplyAPI,
	JsControlTreeModifier
) {
	"use strict";

	function revertChangesAndUpdateVariantModel(oComponent, bSkipUrlUpdate, aChanges) {
		return Promise.resolve()
		.then(function() {
			if (aChanges.length !== 0) {
				// Always revert changes in reverse order
				aChanges.reverse();
				return Reverter.revertMultipleChanges(aChanges, {
					appComponent: oComponent,
					modifier: JsControlTreeModifier,
					reference: this._sComponentName
				});
			}
			return undefined;
		}.bind(this))
		.then(function() {
			if (oComponent) {
				var oModel = oComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
				if (oModel) {
					// Temporary fix, parameters generally should not be removed
					if (!bSkipUrlUpdate) {
						URLHandler.update({
							parameters: [],
							updateURL: true,
							updateHashEntry: true,
							model: oModel
						});
					}
				}
			}

			return aChanges;
		});
	}

	/**
	 * Retrieves changes (LabelChange, etc.) for an sap.ui.core.mvc.View and applies these changes
	 *
	 * @param {string} sComponentName - Component name the flexibility controller is responsible for
	 * @constructor
	 * @class
	 * @alias sap.ui.fl.FlexController
	 * @since 1.27.0
	 * @private
	 * @author SAP SE
	 * @version ${version}
	 */
	var FlexController = function(sComponentName) {
		this._oChangePersistence = undefined;
		this._sComponentName = sComponentName || "";
		if (this._sComponentName) {
			this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this._sComponentName);
		}
	};

	FlexController.prototype._removeOtherLayerChanges = function(oAppComponent, sLayer, bRemoveOtherLayerChanges) {
		if (bRemoveOtherLayerChanges && sLayer) {
			var aLayersToReset = Object.values(Layer).filter(function(sLayerToCheck) {
				return sLayerToCheck !== sLayer;
			});
			return this.removeDirtyChanges(aLayersToReset, oAppComponent, undefined, undefined, undefined, true);
		}
		return Promise.resolve();
	};

	/**
	 * Saves all changes of a persistence instance.
	 *
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @param {boolean} [bSkipUpdateCache=false] - Indicates the cache should not be updated
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @param {string} [sLayer] - Layer for which the changes should be saved
	 * @param {boolean} [bRemoveOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 * @param {boolean} [bCondenseAnyLayer] - This will enable condensing regardless of the current layer
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexController.prototype.saveAll = function(
		oAppComponent,
		bSkipUpdateCache,
		bDraft,
		sLayer,
		bRemoveOtherLayerChanges,
		bCondenseAnyLayer
	) {
		var sParentVersion;
		var aDraftFilenames;
		if (bDraft) {
			var oVersionModel = Versions.getVersionsModel({
				reference: this._sComponentName,
				layer: Layer.CUSTOMER // only the customer layer has draft active
			});
			sParentVersion = oVersionModel.getProperty("/persistedVersion");
			aDraftFilenames = oVersionModel.getProperty("/draftFilenames");
		}
		return this._removeOtherLayerChanges(oAppComponent, sLayer, bRemoveOtherLayerChanges)
		.then(this._oChangePersistence.saveDirtyChanges.bind(
			this._oChangePersistence,
			oAppComponent,
			bSkipUpdateCache,
			undefined,
			sParentVersion,
			aDraftFilenames,
			bCondenseAnyLayer,
			sLayer
		))
		.then(function(oResult) {
			if (oResult && bDraft) {
				var mPropertyBag = {
					reference: this._sComponentName,
					layer: Layer.CUSTOMER // only the customer layer has draft active
				};
				if (oResult.response && oResult.response.length > 0) {
					var aDraftFilenames = [];
					if (Array.isArray(oResult.response)) {
						oResult.response.forEach(function(change) {
							aDraftFilenames.push(change.fileName);
						});
					}
					mPropertyBag.draftFilenames = aDraftFilenames;
					Versions.onAllChangesSaved(mPropertyBag);
				} else {
					// need to update version model when condensing send post request with a delete change and afterwards call flex/data request with right version parameter
					return Versions.updateModelFromBackend(mPropertyBag);
				}
			}
			return oResult;
		}.bind(this));
	};

	/**
	 * Reset changes on the server
	 * If the reset is performed for an entire component, a browser reload is required.
	 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
	 *
	 * @param {string} sLayer - Layer for which changes shall be deleted
	 * @param {string} [sGenerator] - Generator of changes (optional)
	 * @param {sap.ui.core.Component} [oComponent] - Component instance (optional)
	 * @param {string[]} [aSelectorIds] - Selector IDs in local format (optional)
	 * @param {string[]} [aChangeTypes] - Types of changes (optional)
	 *
	 * @returns {Promise} Promise that resolves after the deletion took place
	 */
	FlexController.prototype.resetChanges = function(sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes) {
		return this._oChangePersistence.resetChanges(sLayer, sGenerator, aSelectorIds, aChangeTypes)
		.then(revertChangesAndUpdateVariantModel.bind(this, oComponent, undefined));
	};

	/**
	 * Removes unsaved changes and reverts these. If no control is provided, all dirty changes are removed.
	 *
	 * @param {string|string[]} vLayer - Layer or multiple layers for which changes shall be deleted
	 * @param {sap.ui.core.Component} oComponent - Component instance
	 * @param {sap.ui.core.Control} [oControl] - Control for which the changes should be removed
	 * @param {string} [sGenerator] - Generator of changes (optional)
	 * @param {string[]} [aChangeTypes] - Types of changes (optional)
	 * @param {boolean} [bSkipUrlUpdate] - Whether to skip soft reload during variant model update
	 *
	 * @returns {Promise} Promise that resolves after the deletion took place
	 */
	FlexController.prototype.removeDirtyChanges = function(vLayer, oComponent, oControl, sGenerator, aChangeTypes, bSkipUrlUpdate) {
		return this._oChangePersistence.removeDirtyChanges(vLayer, oComponent, oControl, sGenerator, aChangeTypes)
		.then(revertChangesAndUpdateVariantModel.bind(this, oComponent, bSkipUrlUpdate));
	};

	/**
	 * Saves changes sequentially on the associated change persistence instance;
	 * This API must be only used in scenarios without draft (like personalization).
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} [aDirtyChanges] - Dirty changes to be saved
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @returns {Promise<object>} Resolves when all changes have been saved with the backend response
	 * @public
	 */
	FlexController.prototype.saveSequenceOfDirtyChanges = async function(aDirtyChanges, oAppComponent) {
		// the same fallback is used in the ChangePersistence, but to update the state we need the changes also here
		const aChanges = aDirtyChanges || this._oChangePersistence.getDirtyChanges();
		const oResponse = await this._oChangePersistence.saveDirtyChanges(oAppComponent, false, aChanges);

		if (oResponse?.response?.length) {
			var aFilenames = oResponse.response.map((oChangeJson) => oChangeJson.fileName);
			aChanges.forEach(function(oDirtyChange) {
				if (aFilenames.includes(oDirtyChange.getId())) {
					oDirtyChange.setState(States.LifecycleState.PERSISTED);
				}
			});
			FlexState.getFlexObjectsDataSelector().checkUpdate({reference: this._sComponentName});
		}
		return oResponse;
	};

	return FlexController;
});

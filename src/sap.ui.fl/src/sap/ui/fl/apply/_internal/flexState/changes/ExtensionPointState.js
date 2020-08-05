/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/Log"
], function(
	ChangePersistenceFactory,
	Log
) {
	"use strict";

	/**
	 * Handler class to manipulate extension point changes.
	 * Extension point changes are extended by the extension point information that is required when the flex change is applied.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.ExtensionPointState
	 * @experimental Since 1.79
	 * @since 1.79
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var ExtensionPointState = {};

	function isChangeValidForExtensionPoint(oChangePersistence, mPropertyBag, oChange) {
		if (oChange.getSelector().name !== mPropertyBag.extensionPointName) {
			return false;
		}
		return oChangePersistence.changesHavingCorrectViewPrefix(mPropertyBag, oChange);
	}

	/**
	 * Gets the changes for the given extension point.
	 *
	 * @param {object} oChangePersistence - Change persistence to get changes from
	 * @param {object} mPropertyBag - Additional data that are needed to read the changes
	 * @param {string} mPropertyBag.viewId - ID of the view
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component for the extension point
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Responsible modifier
	 * @param {string} mPropertyBag.extensionPointName - Name of the extension point
	 * @returns {Promise} Promise that resolves with an array of changes
	 * @private
	 * @restricted sap.ui.fl.apply._internal.extensionPoint.Processor
	 */
	ExtensionPointState.getChangesForExtensionPoint = function(oChangePersistence, mPropertyBag) {
		if (!mPropertyBag.extensionPointName) {
			Log.error("Missing name from extension point info!");
			return Promise.resolve([]);
		}
		return oChangePersistence.getChangesForComponent()
			.then(function(aChanges) {
				return aChanges.filter(isChangeValidForExtensionPoint.bind(this, oChangePersistence, mPropertyBag));
			});
	};

	/**
	 * Enhances the extension point changes by extension point information and selector.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Manifest that belongs to current component
	 * @param {string} mPropertyBag.viewId - View ID
	 * @param {object} mPropertyBag.targetControl - Target control instance
	 * @param {object} mExtensionPointInfo - Map of extension point information
	 * @returns {Promise} Promise that resolves with enhanced extension point changes if available, or is rejected if an error occurs
	 *
	 * @private
	 * @ui5-restricted
	 */
	ExtensionPointState.enhanceExtensionPointChanges = function (mPropertyBag, mExtensionPointInfo) {
		mPropertyBag.extensionPointName = mExtensionPointInfo.name;
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mExtensionPointInfo.targetControl);
		return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, mPropertyBag)
			.then(function (aChanges) {
				aChanges.forEach(function (oChange) {
					//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
					if (oChange.isInInitialState()) {
						oChange.setExtensionPointInfo(mExtensionPointInfo);

						//Set correct selector from targetControl's ID
						var oSelector = oChange.getSelector();
						oSelector.id = mExtensionPointInfo.targetControl.getId();
						oSelector.idIsLocal = false;
						oChange.setSelector(oSelector);

						//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
						//Otherwise, update the selector of changes is enough, change map will be created later correctly
						if (oChangePersistence.isChangeMapCreated()) {
							oChangePersistence._addChangeAndUpdateDependencies(mPropertyBag.appComponent, oChange);
						}
					}
				});
				return aChanges;
			});
	};

	return ExtensionPointState;
}, true);
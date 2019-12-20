/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/transport/TransportSelection"
], function(
	DefaultVariant,
	StandardVariant,
	SmartVariantManagementApplyAPI,
	ChangePersistenceFactory,
	TransportSelection
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionalities for {@link sap.ui.comp.smartvariants.SmartVariantManagement}.
	 *
	 * @namespace sap.ui.fl.write.api.SmartVariantManagementWriteAPI
	 * @experimental
	 * @since 1.69.0
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	var SmartVariantManagementWriteAPI = /** @lends sap.ui.fl.write.api.SmartVariantManagementWriteAPI */{

		/**
		 * Adds a new change (could also be a variant) and returns the ID of the new change.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {object} mPropertyBag.changeSpecificData - Map of parameters, see below
		 * @param {string} mPropertyBag.changeSpecificData.type - Type (<code>filterVariant</code>, <code>tableVariant</code>, etc.)
		 * @param {string} mPropertyBag.changeSpecificData.ODataService - Name of the OData service --> can be null
		 * @param {object} mPropertyBag.changeSpecificData.texts - Map object with all referenced texts within the file; these texts will be connected to the translation process
		 * @param {object} mPropertyBag.changeSpecificData.content - Content of the new change
		 * @param {boolean} mPropertyBag.changeSpecificData.isVariant - Indicates if the change is a variant
		 * @param {string} [mPropertyBag.changeSpecificData.packageName] - Package name for the new entity; default is <code>$tmp</code>
		 * @param {boolean} mPropertyBag.changeSpecificData.isUserDependent - Indicates if a change is only valid for the current user
		 * @param {boolean} [mPropertyBag.changeSpecificData.id] - ID of the change; the ID has to be globally unique and should only be set in exceptional cases for example downport of variants
		 * @returns {string} ID of the newly created change
		 * @private
		 * @ui5-restricted
		 */
		add: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control);

			return oChangePersistence.addChangeForVariant(
				SmartVariantManagementApplyAPI._PERSISTENCY_KEY, sStableId, mPropertyBag.changeSpecificData
			);
		},

		/**
		 * Saves/flushes all current changes to the back end.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {Promise<object[]>} Promise that resolves with an array of responses or is rejected with the first error
		 * @private
		 * @ui5-restricted
		 */
		save: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control);

			return oChangePersistence.saveAllChangesForVariant(sStableId);
		},

		/**
		 * Sets the default variant for the current control synchronously.
		 * A new change object is created or an existing change is updated. This change object is kept in memory and can be flushed using save.
		 * WARNING: The consumer has to make sure that the changes have already been retrieved with <code>getChanges</code>.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {string} mPropertyBag.defaultVariantId - ID of the new default variant
		 * @returns {object} Default variant change
		 * @private
		 * @ui5-restricted
		 */
		setDefaultVariantId: function(mPropertyBag) {
			var mParameters;
			var oChange;
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control);
			var mSelector = {};

			mSelector[SmartVariantManagementApplyAPI._PERSISTENCY_KEY] = sStableId;

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control);

			mParameters = {
				defaultVariantId: mPropertyBag.defaultVariantId,
				reference: oChangePersistence.getComponentName(),
				selector: mSelector,
				validAppVersions: {
					creation: oChangePersistence._mComponent.appVersion,
					from: oChangePersistence._mComponent.appVersion
				}
			};

			var oChanges = SmartVariantManagementApplyAPI._getChangeMap(mPropertyBag.control);
			oChange = DefaultVariant.updateDefaultVariantId(oChanges, mPropertyBag.defaultVariantId);

			if (oChange) {
				return oChange;
			}

			oChange = DefaultVariant.createChangeObject(mParameters);
			var sChangeId = oChange.getId();
			oChanges[sChangeId] = oChange;
			return oChange;
		},

		/**
		 * Retrieves the <code>ExecuteOnSelect</code> for the standard variant for the current control synchronously.
		 * WARNING: Tthe consumer has to make sure that the changes have already been retrieved with <code>getChanges</code>.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {boolean} mPropertyBag.executeOnSelect - New <code>ExecuteOnSelect</code> flag for standard variant
		 * @private
		 * @ui5-restricted
		 * @returns {object} Default variant change
		 */
		setExecuteOnSelect: function(mPropertyBag) {
			var mParameters;
			var oChange;
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control);

			var mSelector = {};
			mSelector[SmartVariantManagementApplyAPI._PERSISTENCY_KEY] = sStableId;

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control);

			mParameters = {
				executeOnSelect: mPropertyBag.executeOnSelect,
				reference: oChangePersistence.getComponentName(),
				selector: mSelector
			};

			var oChanges = SmartVariantManagementApplyAPI._getChangeMap(mPropertyBag.control);
			oChange = StandardVariant.updateExecuteOnSelect(oChanges, mPropertyBag.executeOnSelect);

			if (oChange) {
				return oChange;
			}

			oChange = StandardVariant.createChangeObject(mParameters);
			var sChangeId = oChange.getId();
			oChanges[sChangeId] = oChange;
			return oChange;
		},

		/**
		 * Opens Transport Dialog for transport selection.
		 * @private
		 * @experimental
		 * @returns {sap.ui.fl.write._internal.transport.TransportSelection} TransportSelection dialog.
		 */
		_getTransportSelection: function() {
			return new TransportSelection();
		}
	};

	return SmartVariantManagementWriteAPI;
}, true);

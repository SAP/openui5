/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/transport/TransportSelection"
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
	 * @ui5-restricted sap.ui.comp
	 */
	var SmartVariantManagementWriteAPI = /** @lends sap.ui.fl.write.api.SmartVariantManagementWriteAPI */{

		/**
		 * Adds a new change (could also be a variant) and returns the ID of the new change.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {object} mPropertyBag.parameters - Map of parameters, see below
		 * @param {string} mPropertyBag.parameters.type - Type (<code>filterVariant</code>, <code>tableVariant</code>, etc.)
		 * @param {string} mPropertyBag.parameters.ODataService - Name of the OData service --> can be null
		 * @param {object} mPropertyBag.parameters.texts - Map object with all referenced texts within the file; these texts will be connected to the translation process
		 * @param {object} mPropertyBag.parameters.content - Content of the new change
		 * @param {boolean} mPropertyBag.parameters.isVariant - Indicates if the change is a variant
		 * @param {string} [mPropertyBag.parameters.packageName] - Package name for the new entity; default is <code>$tmp</code>
		 * @param {boolean} mPropertyBag.parameters.isUserDependent - Indicates if a change is only valid for the current user
		 * @param {boolean} [mPropertyBag.parameters.id] - ID of the change; the ID has to be globally unique and should only be set in exceptional cases for example downport of variants
		 * @returns {string} ID of the newly created change
		 * @ui5-restricted
		 */
		add: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || arguments[0]);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

			return oChangePersistence.addChangeForVariant(
				SmartVariantManagementApplyAPI._PERSISTENCY_KEY, sStableId, typeof arguments[1] === "object" ? arguments[1] : mPropertyBag.changeSpecificData
			);
		},

		/**
		 * Saves/flushes all current changes to the back end.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {Promise<object[]>} Promise that resolves with an array of responses or is rejected with the first error
		 * @ui5-restricted
		 */
		save: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || arguments[0]);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

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
		 * @ui5-restricted
		 */
		setDefaultVariantId: function(mPropertyBag) {
			var mParameters;
			var oChange;
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || arguments[0]);
			var mSelector = {};

			mSelector[SmartVariantManagementApplyAPI._PERSISTENCY_KEY] = sStableId;

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

			mParameters = {
				defaultVariantId: typeof arguments[1] === "string" ? arguments[1] : mPropertyBag.defaultVariantId,
				reference: oChangePersistence.getComponentName(),
				selector: mSelector,
				validAppVersions: {
					creation: oChangePersistence._mComponent.appVersion,
					from: oChangePersistence._mComponent.appVersion
				}
			};

			var oChanges = SmartVariantManagementApplyAPI._getChangeMap(mPropertyBag.control || arguments[0]);
			oChange = DefaultVariant.updateDefaultVariantId(oChanges, arguments[1] || mPropertyBag.defaultVariantId);

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
		 * @ui5-restricted
		 * @returns {object} Default variant change
		 */
		setExecuteOnSelect: function(mPropertyBag) {
			var mParameters;
			var oChange;
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || arguments[0]);

			var mSelector = {};
			mSelector[SmartVariantManagementApplyAPI._PERSISTENCY_KEY] = sStableId;

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

			mParameters = {
				executeOnSelect: typeof arguments[1] === "boolean" ? arguments[1] : mPropertyBag.executeOnSelect,
				reference: oChangePersistence.getComponentName(),
				selector: mSelector
			};

			var oChanges = SmartVariantManagementApplyAPI._getChangeMap(mPropertyBag.control || arguments[0]);
			oChange = StandardVariant.updateExecuteOnSelect(oChanges, arguments[1] || mPropertyBag.executeOnSelect);

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
		 * @returns {sap.ui.fl.transport.TransportSelection} TransportSelection dialog.
		 */
		_getTransportSelection: function() {
			return new TransportSelection();
		}
	};

	return SmartVariantManagementWriteAPI;
}, true);

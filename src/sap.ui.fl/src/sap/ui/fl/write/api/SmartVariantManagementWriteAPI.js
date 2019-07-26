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
	 * Provides an API to handle specific functionality for sap.ui.comp library.
	 *
	 * @experimental
	 * @namespace
	 * @name sap.ui.fl.write.api.SmartVariantManagementWriteAPI
	 * @author SAP SE
	 * @public
	 */
	var SmartVariantManagementWriteAPI = {

		/**
		 * Adds a new change (could be variant as well) and returns the id of the new change.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @param {object} mParameters map of parameters, see below
		 * @param {string} mParameters.type - type <filterVariant, tableVariant, etc>
		 * @param {string} mParameters.ODataService - name of the OData service --> can be null
		 * @param {object} mParameters.texts - map object with all referenced texts within the file these texts will be connected to the translation process
		 * @param {object} mParameters.content - content of the new change
		 * @param {boolean} mParameters.isVariant - indicates if the change is a variant
		 * @param {string} [mParameters.packageName] - package name for the new entity <default> is $tmp
		 * @param {boolean} mParameters.isUserDependent - indicates if a change is only valid for the current user
		 * @param {boolean} [mParameters.id] - id of the change. The id has to be globally unique and should only be set in exceptional cases for example downport of variants
		 * @returns {string} the ID of the newly created change
		 * @public
		 */
		add: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || [arguments[0]]);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

			return oChangePersistence.addChangeForVariant(
				SmartVariantManagementApplyAPI._PERSISTENCY_KEY, sStableId, typeof arguments[1] === "object" ? arguments[1] : mPropertyBag.changeSpecificData
			);
		},

		/**
		 * Saves/flushes all current changes to the back end.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {Promise} resolving with an array of responses or rejecting with the first error
		 * @public
		 */
		save: function(mPropertyBag) {
			var sStableId = SmartVariantManagementApplyAPI._getStableId(mPropertyBag.control || arguments[0]);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mPropertyBag.control || arguments[0]);

			return oChangePersistence.saveAllChangesForVariant(sStableId);
		},

		/**
		 * Sets the default variant for the current control synchronously.
		 * A new change object is created or an existing is updated. This change object is kept in memory and can be flushed using save.
		 * WARNING: It is the responsibility of the consumer to make sure, that the changes have already been retrieved with getChanges.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @param {string} sDefaultVariantId - the ID of the new default variant
		 * @returns {object} the default variant change
		 * @public
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
		 * Retrieves the execute on select for the standard variant for the current control synchronously.
		 * WARNING: It is the responsibility of the consumer to make sure, that the changes have already been retrieved with getChanges.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @param {boolean} bExecuteOnSelect - the new execute on select flag for standard variant
		 * @public
		 * @returns {object} the default variant change
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
		 * @returns {sap.ui.fl.transport.TransportSelection} TransportSelection dialog.
		 */
		_getTransportSelection: function() {
			return new TransportSelection();
		}
	};

	return SmartVariantManagementWriteAPI;
}, true);

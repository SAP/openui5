/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	CompVariantState,
	TransportSelection,
	Settings,
	ManifestUtils
) {
	"use strict";

	function getPersistencyKey(oControl) {
		return oControl && oControl.getPersistencyKey && oControl.getPersistencyKey();
	}

	function setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, fnFunction) {
		mPropertyBag.persistencyKey = getPersistencyKey(mPropertyBag.control);
		if (!mPropertyBag.reference) {
			mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		}
		return fnFunction(mPropertyBag);
	}

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
		 * @param {boolean} [mPropertyBag.changeSpecificData.id] - ID of the change; the ID has to be globally unique and should only be set in exceptional cases, for example downport of variants
		 * @returns {string} ID of the newly created change
		 * @private
		 * @ui5-restricted sap.ui.comp
		 */
		add: function(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.add)
				.then(function (oObject) {
					return oObject.getId();
				});
		},

		/**
		 * Adds a new variant and returns the ID of the new change.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object[]} mPropertyBag.changeSpecificData - Map of parameters, see below
		 * @param {sap.ui.fl.Layer} mPropertyBag.changeSpecificData.layer - Layer to which the variant should be written
		 * @param {string} mPropertyBag.changeSpecificData.type - Type (<code>filterVariant</code>, <code>tableVariant</code>, etc.)
		 * @param {object} mPropertyBag.changeSpecificData.texts - Map object with all referenced texts within the file; these texts will be connected to the translation process
		 * @param {object} mPropertyBag.changeSpecificData.content - Content of the new change
		 * @param {string} [mPropertyBag.changeSpecificData.ODataService] - Name of the OData service --> can be null
		 * @param {string} [mPropertyBag.changeSpecificData.id] - ID of the variant; the ID has to be globally unique and should only be set in exceptional cases for example downport of variants
		 * @returns {sap.ui.fl.apply._internal.flexObjects.Variant} Created variant object instance
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		addVariant: function (mPropertyBag) {
			mPropertyBag.fileType = "variant";
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.add);
		},

		/**
		 * Saves/flushes all current changes to the back end.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {Promise<object[]>} Promise that resolves with an array of responses or is rejected with the first error
		 * @private
		 * @ui5-restricted sap.ui.comp.smartvariant.SmartVariantManagement
		 */
		save: function(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.persist);
		},

		/**
		 * Sets the default variant for the current control synchronously.
		 * A new change object is created or an existing change is updated. This change object is kept in memory and can be flushed using save.
		 * WARNING: The consumer has to make sure that the changes have already been retrieved with <code>getChanges</code>.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {string} mPropertyBag.defaultVariantId - ID of the new default variant
		 * @param {string} [mPropertyBag.generator] - ID for the creating class / use case of the setDefault
		 * @param {string} [mPropertyBag.compositeCommand] - Name of the composite command triggering the setting of the default
		 * @returns {object} Default variant change
		 * @private
		 * @ui5-restricted
		 */
		setDefaultVariantId: function(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.setDefault);
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
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.setExecuteOnSelect);
		},

		/**
		 * Checks whether sharing of variants is enabled.
		 *
		 * @private
		 * @ui5-restricted
		 * @since 1.84.0
		 *
		 * @returns {Promise<boolean>} <code>true</code> if sharing of variants is enabled
		 */
		isVariantSharingEnabled: function() {
			return Settings.getInstance().then(function (oInstance) {
				return oInstance.isVariantSharingEnabled();
			});
		},

		/**
		 * Checks whether personalization of variants is enabled.
		 *
		 * @private
		 * @ui5-restricted
		 * @since 1.86.0
		 *
		 * @returns {Promise<boolean>}  <code>true</code> if personalization of variants is enabled
		 */
		isVariantPersonalizationEnabled: function() {
			return Settings.getInstance().then(function (oInstance) {
				return oInstance.isVariantPersonalizationEnabled();
			});
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

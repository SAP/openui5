/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings"
], function(
	CompVariantUtils,
	ManifestUtils,
	ContextBasedAdaptationsAPI,
	CompVariantState,
	TransportSelection,
	Settings
) {
	"use strict";

	function setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, fnFunction) {
		mPropertyBag.persistencyKey = CompVariantUtils.getPersistencyKey(mPropertyBag.control);
		mPropertyBag.reference ||= ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		return fnFunction(mPropertyBag);
	}

	function setAdaptationIdInPropertyBag(mPropertyBag) {
		var sLayer = mPropertyBag.layer || (mPropertyBag.changeSpecificData && mPropertyBag.changeSpecificData.layer);
		if (sLayer) {
			mPropertyBag.changeSpecificData ||= {};
			mPropertyBag.reference ||= ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
			var mContextBasedAdaptationBag = {
				layer: sLayer,
				control: mPropertyBag.control,
				reference: mPropertyBag.reference
			};
			if (ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag)) {
				mPropertyBag.changeSpecificData.adaptationId = ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
			}
		}
	}

	/**
	 * Provides an API to handle specific functionalities for {@link sap.ui.comp.smartvariants.SmartVariantManagement}.
	 *
	 * @namespace sap.ui.fl.write.api.SmartVariantManagementWriteAPI
	 * @since 1.69.0
	 * @private
	 * @ui5-restricted sap.ui.comp, sap.ui.rta
	 */
	var SmartVariantManagementWriteAPI = /** @lends sap.ui.fl.write.api.SmartVariantManagementWriteAPI */{
		/**
		 * Adds a new variant and returns it.
		 * Either the <code>mPropertyBag.changeSpecificData.layer</code> or the
		 * <code>mPropertyBag.changeSpecificData.isUserDependent</code> should be provided for a proper layer determination.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be added
		 * @param {object} mPropertyBag.changeSpecificData - Map of parameters, see below
		 * @param {sap.ui.fl.Layer} [mPropertyBag.changeSpecificData.layer] - Layer to which the variant should be written
		 * @param {boolean} [mPropertyBag.changeSpecificData.isUserDependent] - Flag if the variant is personalization only
		 * @param {string} [mPropertyBag.changeSpecificData.id] - ID that should be used for the variant
		 * @param {string} mPropertyBag.changeSpecificData.type - Type (<code>filterVariant</code>, <code>tableVariant</code>, etc.)
		 * @param {object} mPropertyBag.changeSpecificData.texts - Map object with all referenced texts within the file; these texts will be connected to the translation process
		 * @param {object} mPropertyBag.changeSpecificData.content - Content of the new change
		 * @param {object} [mPropertyBag.changeSpecificData.favorite] - Indicates if the change is added as favorite
		 * @param {object} [mPropertyBag.changeSpecificData.executeOnSelection] - Indicates if the <code>executeOnSelection</code> flag should be set
		 * @param {string} [mPropertyBag.changeSpecificData.ODataService] - Name of the OData service --> can be null
		 * @param {object} [mPropertyBag.changeSpecificData.contexts] - Map of contexts that restrict the visibility of the variant
		 * @param {string[]} [mPropertyBag.changeSpecificData.contexts.role] - List of roles which are allowed to see the variant
		 * @param {string} [mPropertyBag.command] - Name of the command creating the variant
		 * @param {boolean} [mPropertyBag.support] - Information for support analysis
		 * @returns {sap.ui.fl.apply._internal.flexObjects.Variant} Created variant object instance
		 * @private
		 * @ui5-restricted sap.ui.rta.command, sap.ui.comp.smartvariants.SmartVariantManagement
		 */
		addVariant(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.addVariant);
		},

		/**
		 * Updates a variant; this may result in an update of the variant or the creation of a change.
		 * Either the <code>mPropertyBag.layer</code> or the <code>mPropertyBag.isUserDependent</code> should be provided for a proper layer determination.
		 * In case updates for different layers are done, the update must be called for each layer separately.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {string} [mPropertyBag.packageName] - ID of the package in which the update should be transported - only valid for sap-ui-layer=VENDOR use case
		 * @param {string} [mPropertyBag.transportId] - ID of the transport in which the update should be assigned
		 * @param {object} [mPropertyBag.name] - Title of the variant
		 * @param {object} [mPropertyBag.content] - Content of the new change
		 * @param {object} [mPropertyBag.favorite] - Flag if the variant should be flagged as a favorite
		 * @param {boolean} [mPropertyBag.visible] - Flag if the variant should be set visible
		 * @param {object} [mPropertyBag.executeOnSelection] - Flag if the variant should be executed on selection
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the variant update takes place
		 * @param {object} [mPropertyBag.changeSpecificData] - Map of parameters, see below
		 * @param {boolean} [mPropertyBag.changeSpecificData.isUserDependent] - Flag if the variant is personalization only
		 * this either updates the variant from the layer or writes a change to that layer.
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command, sap.ui.comp.smartvariants.SmartVariantManagement
		 */
		updateVariant(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.updateVariant);
		},

		/**
		 * Updates content of a variant; this may result in an update of the variant or the creation of a change.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {object} mPropertyBag.content - New content of the variant
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the variant content update takes place
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		updateVariantContent(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			mPropertyBag.action = CompVariantState.updateActionType.UPDATE;
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.updateVariant);
		},

		/**
		 * Saves the current content of a variant; this does not trigger the back end call to persist the variant.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the save of variant content takes place
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		saveVariantContent(mPropertyBag) {
			mPropertyBag.action = CompVariantState.updateActionType.SAVE;
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.updateVariant);
		},

		/**
		 * Discards the variant content to the original or last saved content.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the save of variant content takes place
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The discarded variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		discardVariantContent(mPropertyBag) {
			mPropertyBag.action = CompVariantState.updateActionType.DISCARD;
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.discardVariantContent);
		},

		/**
		 * Updates the metadata of a variant; this may result in an update of the variant or the creation of a change.
		 * The metadata includes variant name and favorite, automatic apply on selection, default, contexts statuses.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {object} [mPropertyBag.name] - Title of the variant
		 * @param {object} [mPropertyBag.favorite] - Flag if the variant should be flagged as a favorite
		 * @param {object} [mPropertyBag.executeOnSelection] - Flag if the variant should be executed on selection
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the variant metadata update takes place
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		updateVariantMetadata(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			mPropertyBag.action = CompVariantState.updateActionType.UPDATE_METADATA;
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.updateVariant);
		},

		/**
		 * Removes a variant; this may result in an deletion of the variant or the creation of a change.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be removed
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer in which the variant removal takes place;
		 * this either removes the variant from the layer or writes a change to that layer.
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The removed variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		removeVariant(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.removeVariant);
		},

		/**
		 * Reverts the last operation done on a variant.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variants should be loaded
		 * @param {string} mPropertyBag.id - ID of the variant
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The reverted variant
		 * @private
		 * @ui5-restricted sap.ui.rta.command
		 */
		revert(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.revert);
		},

		/**
		 * Saves/flushes all current changes to the back end.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the flex objects should be saved
		 * @returns {Promise<object[]>} Promise that resolves with an array of responses or is rejected with the first error
		 * @private
		 * @ui5-restricted sap.ui.comp.smartvariant.SmartVariantManagement
		 */
		save(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.persist);
		},

		/**
		 * Sets the default variant for the current control synchronously.
		 * A new change object is created or an existing change is updated. This change object is kept in memory and can be flushed using save.
		 * WARNING: The consumer has to make sure that the changes have already been retrieved with <code>getChanges</code>.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which a variant should be set as 'Default'
		 * @param {string} mPropertyBag.defaultVariantId - ID of the new default variant
		 * @param {string} [mPropertyBag.generator] - ID for the creating class / use case of the setDefault
		 * @param {string} [mPropertyBag.compositeCommand] - Name of the composite command triggering the setting of the default
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer = Layer.USER] - Enables setDefault for the given layer
		 * @returns {object} Default variant change
		 * @private
		 * @ui5-restricted
		 */
		setDefaultVariantId(mPropertyBag) {
			setAdaptationIdInPropertyBag(mPropertyBag);
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.setDefault);
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
		isVariantSharingEnabled() {
			return Settings.getInstance().then(function(oInstance) {
				return oInstance.isVariantSharingEnabled();
			});
		},

		/**
		 * Checks whether personalization of variants is enabled.
		 *
		 * @private
		 * @ui5-restricted sap.ui.comp
		 * @since 1.86.0
		 *
		 * @returns {Promise<boolean>} <code>true</code> if personalization of variants is enabled
		 */
		isVariantPersonalizationEnabled() {
			return Settings.getInstance().then(function(oInstance) {
				return oInstance.isVariantPersonalizationEnabled();
			});
		},

		/**
		 * Checks whether adaptation at runtime or designtime should be enabled for comp variants
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 * @since 1.87.0
		 *
		 * @returns {Promise<boolean>} <code>true</code> if adaptation of variants is enabled
		 */
		isVariantAdaptationEnabled() {
			return Settings.getInstance().then(function(oInstance) {
				return oInstance.isVariantAdaptationEnabled();
			});
		},

		/**
		 * Overrides the standard variant and reapplies all changes.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variants should be loaded
		 * @param {boolean} mPropertyBag.executeOnSelection - Flag if 'apply automatically' should be set
		 */
		overrideStandardVariant(mPropertyBag) {
			setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.overrideStandardVariant);
		},

		/**
		 * Reverts the last setDefaultVariantId operation done on a variant management.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 			sap.ui.comp.smarttable.SmartTable|
		 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variants should be loaded
		 *
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The reverted variant
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 * @since 1.90.0
		 */
		revertSetDefaultVariantId(mPropertyBag) {
			return setReferenceAndPersistencyKeyInPropertyBagAndCallFunction(mPropertyBag, CompVariantState.revertSetDefaultVariantId);
		},

		/**
		 * Opens Transport Dialog for transport selection.
		 * @private
		 * @ui5-restricted sap.ui.comp
		 * @returns {sap.ui.fl.write._internal.transport.TransportSelection} TransportSelection dialog.
		 */
		_getTransportSelection() {
			function transportSelectionRequired() {
				var sLayer = new URLSearchParams(window.location.search).get("sap-ui-layer") || "";
				return !!sLayer;
			}

			var oTransportSelection = new TransportSelection();
			// A special edge case is the "Public" checkbox within the smart variant. There is no supported combination
			// of non-PUBLIC enabled back end and UI5 version. Therefore, only a layer parameter set in the url leads to a transport selection
			oTransportSelection.selectTransport = function(oObjectInfo, fOkay, fError, bCompactMode, oControl, sStyleClass) {
				if (!transportSelectionRequired()) {
					fOkay(oTransportSelection._createEventObject(oObjectInfo, {transportId: ""}));
					return;
				}
				TransportSelection.prototype.selectTransport.call(this, oObjectInfo, fOkay, fError, bCompactMode, oControl, sStyleClass);
			};

			return oTransportSelection;
		}
	};

	return SmartVariantManagementWriteAPI;
});

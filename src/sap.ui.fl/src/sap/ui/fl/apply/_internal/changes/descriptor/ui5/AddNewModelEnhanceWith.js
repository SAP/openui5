
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyUtil",
	"sap/base/util/ObjectPath"
], function(
	ApplyUtil,
	ObjectPath
) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_ui5_addNewModelEnhanceWith</code>.
	 * Adds a <code>settings/enhanceWith</code> node of an existing model with a path to an i18n properties file relative to the location of the manifest.
	 * Only works for referenced models of type <code>sap.ui.model.resource.ResourceModel</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.ui5.AddNewModelEnhanceWith
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var AddNewModelEnhanceWith = /** @lends sap.ui.fl.apply._internal.changes.descriptor.ui5.AddNewModelEnhanceWith */ {

		/**
		 * Method to apply the <code>appdescr_ui5_addNewModelEnhanceWith</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_ui5_addNewModelEnhanceWith</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.modelId - ID of existing model, referenced model must have type <code>sap.ui.model.resource.ResourceModel</code>
		 * @param {string} oChange.texts.i18n - Path to an i18n properties path relative to the location of the change
		 * @returns {object} Updated manifest with <code>sap.ui5/models</code> entity
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			var sModelId = oChange.getContent().modelId;
			var sI18N = ApplyUtil.formatBundleName(oManifest["sap.app"].id, oChange.getTexts().i18n);

			var oModel = oManifest["sap.ui5"].models[sModelId];
			if (oModel) {
				if (oModel.type && oModel.type === "sap.ui.model.resource.ResourceModel") {
					if (!(oModel.settings && oModel.settings.enhanceWith)) {
						ObjectPath.set("settings.enhanceWith", [], oModel);
					}
					var oEnhanceWith = oModel.settings.enhanceWith;
					oEnhanceWith.push({bundleName: sI18N});
				}
			}
			return oManifest;
		},
		skipPostprocessing: true

	};

	return AddNewModelEnhanceWith;
});

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
	 * Checks if condition is met to convert bundleUrl to bundleName, which is the case if
	 * no bundleName is present but an bundleUrl
	 * @param {object} oChangeContent - Details of the change
	 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_ui5_addNewModelEnhanceWith</code>
	 * @returns {boolean} - Indicator if bundleUrl can be converted to bundleName
	 */
	function hasBundleUrlAndNotBundleName(oChangeContent) {
		const sErrorMessage = "A schema violation has been identified. Either bundleName or bundleUrl property must be used.";
		if (oChangeContent.bundleUrl) {
			if (oChangeContent.bundleName) {
				throw Error(sErrorMessage);
			}
			return true;
		}
		return false;
	}

	/**
	 * Process terminologies to convert bundleUrl to bundleName
	 * @param {object} oChangeContent - Details of the change
	 * @param {string} sAppId - ID of the application
	 */
	function processTerminologies(oChangeContent, sAppId) {
		const aTermoinologiesKeys = Object.keys(oChangeContent.terminologies || {});
		if (aTermoinologiesKeys.length > 0) {
			aTermoinologiesKeys.forEach((sTerminology) => {
				const oTerminologyObject = oChangeContent.terminologies[sTerminology];
				if (hasBundleUrlAndNotBundleName(oTerminologyObject)) {
					oTerminologyObject.bundleName = ApplyUtil.formatBundleName(sAppId, oTerminologyObject.bundleUrl);
					delete oTerminologyObject.bundleUrl;
				}
			});
		}
	}
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
	const AddNewModelEnhanceWith = /** @lends sap.ui.fl.apply._internal.changes.descriptor.ui5.AddNewModelEnhanceWith */ {

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
			const oChangeContent = oChange.getContent();
			const sModelId = oChangeContent.modelId;
			const oModel = oManifest["sap.ui5"].models[sModelId];
			if (oModel) {
				if (oModel.type && oModel.type === "sap.ui.model.resource.ResourceModel") {
					if (!(oModel.settings && oModel.settings.enhanceWith)) {
						ObjectPath.set("settings.enhanceWith", [], oModel);
					}
					const sAppId = oManifest["sap.app"].id;
					const sI18n = oChange.getTexts()?.i18n;
					const oEnhanceWith = oModel.settings.enhanceWith;
					if (sI18n) {
						oEnhanceWith.push({bundleName: ApplyUtil.formatBundleName(sAppId, sI18n)});
						return oManifest;
					}
					if (hasBundleUrlAndNotBundleName(oChangeContent)) {
						oChangeContent.bundleName = ApplyUtil.formatBundleName(sAppId, oChangeContent.bundleUrl);
						delete oChangeContent.bundleUrl;
					}
					processTerminologies(oChangeContent, sAppId);
					delete oChangeContent.modelId;
					if (Object.keys(oChangeContent).length > 0) {
						oEnhanceWith.push(oChangeContent);
					}
				}
			}
			return oManifest;
		},
		skipPostprocessing: true

	};
	return AddNewModelEnhanceWith;
});
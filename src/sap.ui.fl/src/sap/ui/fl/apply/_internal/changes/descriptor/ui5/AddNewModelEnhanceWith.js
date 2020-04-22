
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
	 * Only works for inline descriptor changes.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ui5.AddNewModelEnhanceWith
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var AddNewModelEnhanceWith = {

		/**
		 * Adds an <code>settings/enhanceWith</code> node of an existing model with a path to an i18n properties file relative to the location of the manifest.
		 * Only works for referenced models of type <code>sap.ui.model.resource.ResourceModel</code>.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_ui5_addNewModelEnhanceWith</code>
		 * @returns {object} Updated manifest with model property
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
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
}, true);
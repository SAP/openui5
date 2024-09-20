
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/util/changePropertyValueByPath",
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	changePropertyValueByPath,
	DescriptorChangeCheck
) {
	"use strict";

	const SUPPORTED_OPERATIONS = ["UPDATE", "UPSERT", "DELETE", "INSERT"];
	const SUPPORTED_PROPERTIES = ["settings/*"];

	const SUPPORTED_TYPES = {
		settings: typeof {}
	};

	const RESOURCE_MODEL = "sap.ui.model.resource.ResourceModel";

	/**
	* Descriptor change merger for change type <code>appdescr_ui5_changeModel</code>.
	* Changes the settings object of the model by changing the manifest value <code>sap.ui5/models/modelId</code>.
	*
	* Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	*
	* @namespace
	* @alias sap.ui.fl.apply._internal.changes.descriptor.app.ChangeModel
	* @version ${version}
	* @private
	* @ui5-restricted sap.ui.fl.apply._internal
	*/
	const ChangeModel = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.ChangeModel */ {

		/**
		 * Applies the <code>appdescr_ui5_changeModel</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_ui5_changeModel</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.modelId - ID of <code>sap.ui5/models/modelId</code> that is being changed
		 * @param {object|array} oChange.content.entityPropertyChange - Entity property change or an array of multiple entity property changes
		 * @param {string} oChange.content.entityPropertyChange.propertyPath - Path to the property which should be changed. Supported properties: <code>settings</code>
		 * @param {string} oChange.content.entityPropertyChange.operation - Operation that is performed on the property defined under propertyPath. Possible values: <code>UPDATE</code> and <code>UPSERT</code>
		 * @param {string} oChange.content.entityPropertyChange.propertyValue - New value of the <code>model</code> property defined under propertyPath
		 * @returns {object} Updated manifest with changed <code>sap.ui5/models/model</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			const oModels = oManifest["sap.ui5"].models;
			const oChangeContent = oChange.getContent();
			DescriptorChangeCheck.checkEntityPropertyChange(oChangeContent, SUPPORTED_PROPERTIES, SUPPORTED_OPERATIONS, null, null, SUPPORTED_TYPES);
			if (oModels) {
				const oModel = oModels[oChangeContent.modelId];
				if (oModel) {
					if (oModel.type === RESOURCE_MODEL) {
						throw new Error(`Model '${oChangeContent.modelId}' is of type '${RESOURCE_MODEL}'. Changing models of type '${RESOURCE_MODEL}' are not supported.`);
					}
					changePropertyValueByPath(oChangeContent.entityPropertyChange, oModel);
				} else {
					throw new Error(`Nothing to update. Model with ID "${oChangeContent.modelId}" does not exist in the manifest.json.`);
				}
			} else {
				throw new Error("sap.ui5/models section have not been found in manifest.json.");
			}
			return oManifest;
		}
	};

	return ChangeModel;
});
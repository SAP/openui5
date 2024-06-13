
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	const SUPPORTED_STATUS = ["released", "deprecated", "obsolete"];

	/**
	 * Descriptor change merger for change type <code>appdescr_fiori_cloudDevAdaptationStatus</code>.
	 * Sets and overwrites string for <code>sap.fiori/cloudDevAdaptationStatus</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.fiori.SetCloudDevAdaptationStatus
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetCloudDevAdaptationStatus = /** @lends sap.ui.fl.apply._internal.changes.descriptor.fiori.SetCloudDevAdaptationStatus */ {
		/**
		 * Applies <code>appdescr_fiori_cloudDevAdaptationStatus</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_fiori_cloudDevAdaptationStatus</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.cloudDevAdaptationStatus - String status (only allowed values are 'released'|'deprecated'|'obsolete')
		 * @returns {object} Updated manifest with changed <code>appdescr_fiori_cloudDevAdaptationStatus</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			if (!oChange.getContent().hasOwnProperty("cloudDevAdaptationStatus")) {
				throw new Error("No cloudDevAdaptationStatus in change content provided");
			}

			if (typeof oChange.getContent().cloudDevAdaptationStatus !== "string") {
				throw new Error(`The current change value type of property cloudDevAdaptationStatus is '${typeof oChange.getContent().cloudDevAdaptationStatus}'. Only allowed type for poperty cloudDevAdaptationStatus is string`);
			}

			if (!SUPPORTED_STATUS.includes(oChange.getContent().cloudDevAdaptationStatus)) {
				throw new Error(`The current change value of property cloudDevAdaptationStatus is '${oChange.getContent().cloudDevAdaptationStatus}'. Supported values for property cloudDevAdaptationStatus are ${SUPPORTED_STATUS.join("|")}`);
			}

			ObjectPath.set(["sap.fiori", "cloudDevAdaptationStatus"], oChange.getContent().cloudDevAdaptationStatus, oManifest);
			return oManifest;
		}
	};
	return SetCloudDevAdaptationStatus;
});
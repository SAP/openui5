
/*!
 * ${copyright}
 */

sap.ui.define([

], function(

) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_app_setDescription</code>.
	 * Sets the description of the app by changing the manifest value <code>sap.app/description</code>.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.SetDescription
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const SetDescription = {

		/**
		 * Applies the <code>appdescr_app_setDescription</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @returns {object} Updated manifest with changed description used as a placeholder for postprocessing
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest) {
			oManifest["sap.app"].description = `{{${oManifest["sap.app"].id}_sap.app.description}}`;
			return oManifest;
		}

	};

	return SetDescription;
});
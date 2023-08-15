
/*!
 * ${copyright}
 */

sap.ui.define([

], function(

) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_app_setTitle</code>.
	 * Sets the title of the app by changing the manifest value <code>sap.app/title</code>.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.app.SetTitle
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetTitle = {

		/**
		 * Method to apply the <code>appdescr_app_setTitle</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @returns {object} Updated manifest with changed title used as a placeholder for postprocessing
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest) {
			oManifest["sap.app"].title = `{{${oManifest["sap.app"].id}_sap.app.title}}`;
			return oManifest;
		}

	};

	return SetTitle;
});
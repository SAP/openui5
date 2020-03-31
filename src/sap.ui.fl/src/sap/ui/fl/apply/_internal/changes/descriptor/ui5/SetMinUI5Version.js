
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/Version"
], function(
	Version
) {
	"use strict";


	/**
	 * Descriptor change merger for change type <code>appdescr_ui5_setMinUI5Version</code>.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ui5.SetMinUI5Version
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetMinUI5Version = {

		/**
		 * Sets minUI5Version to manifest node <code>sap.ui5/dependencies/minUI5Version</code>.
		 * Only updates minUI5Version if the new version is higher than the old version.
		 *
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_ui5_setMinUI5Version</code>
		 * @returns {object} Updated manifest with updated minUI5Version
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			//TODO: Should existens of minui5version be checked in manifest and change or is the check during deployment enough and I can expect minui5version to be set in both?
			var vCurrentVersion = new Version(oManifest["sap.ui5"].dependencies.minUI5Version);
			if (vCurrentVersion.compareTo(oChange.getContent().minUI5Version) <= 0) {
				oManifest["sap.ui5"].dependencies.minUI5Version = oChange.getContent().minUI5Version;
			}
			return oManifest;
		}


	};

	return SetMinUI5Version;
}, true);
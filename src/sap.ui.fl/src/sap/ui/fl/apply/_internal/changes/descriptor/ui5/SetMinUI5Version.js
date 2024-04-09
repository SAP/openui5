
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
	 * Sets minUI5Version to manifest node <code>sap.ui5/dependencies/minUI5Version</code>.
	 * Only updates minUI5Version if the new version is higher than the old version.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.ui5.SetMinUI5Version
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetMinUI5Version = /** @lends sap.ui.fl.apply._internal.changes.descriptor.ui5.SetMinUI5Version */ {

		/**
		 * Method to apply the <code>appdescr_ui5_setMinUI5Version</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_ui5_setMinUI5Version</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.minUI5Version - New minUI5Version
		 * @returns {object} Updated manifest with updated minUI5Version
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			// Rules:
			// Compare major versions with each other and set always highest version.
			// Major version which is only included in one (base app or change) will be dropped.
			// If no major version remains throw exception.
			// If result has more than one entry: Additionally check that for version major 1.x.x that minimum version is 1.120.0.
			// If result has only one value then reduce to type string.

			const changeMinUI5Version = oChange.getContent().minUI5Version;
			if (!oChange.getContent().hasOwnProperty("minUI5Version")) {
				throw new Error("No minUI5Version in change content provided");
			}

			var {minUI5Version: aMinUI5Version} = oManifest["sap.ui5"].dependencies;
			if (!aMinUI5Version) {
				throw new Error("sap.ui5/dependencies/minUI5Version missing in base manifest");
			}

			if (typeof aMinUI5Version === "string") {
				aMinUI5Version = [aMinUI5Version];
			}

			var vChangeVersion = new Version(changeMinUI5Version);
			// drop major versions which are only included in base app and not in change
			aMinUI5Version = aMinUI5Version.filter(function(item) {
				var vItemVersion = new Version(item);
				return vItemVersion.getMajor() === vChangeVersion.getMajor();
			});
			if (aMinUI5Version.length === 0) {
				throw new Error("Upgrade/Downgrade for different major version not possible");
			}

			var aNewMinUI5Version = aMinUI5Version;
			aNewMinUI5Version = aMinUI5Version.map(function(minUI5Version) {
				var vCurrentVersion = new Version(minUI5Version);
				if (vCurrentVersion.compareTo(vChangeVersion) <= 0 && vCurrentVersion.getMajor() === vChangeVersion.getMajor()) {
					return changeMinUI5Version;
				}
				return minUI5Version;
			});
			oManifest["sap.ui5"].dependencies.minUI5Version = aNewMinUI5Version.length === 1 ? aNewMinUI5Version[0] : aNewMinUI5Version;
			return oManifest;
		}

	};

	return SetMinUI5Version;
});
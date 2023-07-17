
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
	 * Merges already existing library.
	 * If a min version is specified by the existing or new dependency the highest version is taken over.
	 * Lazy is only true if existing and new dependency have specified this. Otherwise the result will not be lazy.
	 * Parameter lazy is false per default even if there is no lazy parameter set.
	 * This is important for staying compatible.
	 *
	 * @param {object} oManifestLib Library dependency for one specific library from manifest
	 * @param {object} oChangeLib Library dependency from change
	 * @returns {object} Merged library
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	function _mergeExistingLibrary(oManifestLib, oChangeLib) {
		var oUpdatedLibrary = {};
		if (oChangeLib.minVersion) {
			var vManifest = new Version(oManifestLib.minVersion);
			oUpdatedLibrary.minVersion = vManifest.compareTo(oChangeLib.minVersion) >= 0 ? oManifestLib.minVersion : oChangeLib.minVersion;
		}
		if (oChangeLib.lazy) {
			oUpdatedLibrary.lazy = oManifestLib.lazy === oChangeLib.lazy === true;
		}
		return oUpdatedLibrary;
	}

	/**
	 * Descriptor change merger for change type <code>appdescr_ui5_addLibraries</code>.
	 * Loops over one change which might contain several libraries.
	 * If one library already exists, merge it, else add new library to manifest.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.ui5.AddLibrary
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var AddLibrary = {

		/**
		 * Method to apply the <code>appdescr_ui5_addLibraries</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_ui5_addLibraries</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {object} oChange.content.libraries - Change content containing libraries names and minVersion
		 * @returns {object} Updated manifest with merged dependencies
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			// sap.ui5/dependencies node is mandatory in manifest
			if (!oManifest["sap.ui5"].dependencies.libs) {
				oManifest["sap.ui5"].dependencies.libs = {};
			}
			var oManifestLibs = oManifest["sap.ui5"].dependencies.libs;
			var oChangeLibs = oChange.getContent().libraries;

			Object.keys(oChangeLibs).forEach(function(sLibName) {
				if (oManifestLibs[sLibName]) {
					oManifestLibs[sLibName] = _mergeExistingLibrary(oManifestLibs[sLibName], oChangeLibs[sLibName]);
				} else {
					oManifestLibs[sLibName] = oChangeLibs[sLibName];
				}
			});
			return oManifest;
		}

	};

	return AddLibrary;
});
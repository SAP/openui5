
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_ui5_setFlexExtensionPointEnabled</code>.
	 * Sets and overwrites boolean flag for <code>sap.ui5/flexExtensionPointEnabled</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ui5.SetFlexExtensionPointEnabled
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetFlexExtensionPointEnabled = /** @lends sap.ui.fl.apply._internal.changes.descriptor.ui5.SetFlexExtensionPointEnabled */ {

		/**
		 * Method to apply the <code>appdescr_ui5_setFlexExtensionPointEnabled</code> change to the manifest.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_ui5_setFlexExtensionPointEnabled</code>
		 * @param {boolean} oChange.content.flexExtensionPointEnabled Boolean flag to enable extension point hook
		 * @returns {object} Updated manifest with changed <code>appdescr_ui5_setFlexExtensionPointEnabled</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			if (!oChange.getContent().flexExtensionPointEnabled) {
				throw new Error("No flexExtensionPointEnabled in change content provided");
			}
			ObjectPath.set(["sap.ui5", "flexExtensionPointEnabled"], oChange.getContent().flexExtensionPointEnabled, oManifest);
			return oManifest;
		}


	};

	return SetFlexExtensionPointEnabled;
});
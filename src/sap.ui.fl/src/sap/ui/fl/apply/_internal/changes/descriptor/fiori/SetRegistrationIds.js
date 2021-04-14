
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
	 * Descriptor change merger for change type <code>appdescr_fiori_setRegistrationIds</code>.
	 * Sets and overwrites new array for <code>sap.fiori/registrationIds</code>. Creates new <code>sap.fiori</code> node if necesssary.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.fiori.SetRegistrationIds
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetRegistrationIds = /** @lends sap.ui.fl.apply._internal.changes.descriptor.fiori.SetRegistrationIds */ {

		/**
		 * Method to apply the <code>appdescr_app_setRegistrationIds</code> change to the manifest.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_fiori_setRegistrationIds</code>
		 * @param {Arrayy} oChange.content.registrationIds Registration ID
		 * @returns {object} Updated manifest with changed registrationIds
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			ObjectPath.set(["sap.fiori", "registrationIds"], oChange.getContent().registrationIds, oManifest);
			return oManifest;
		}


	};

	return SetRegistrationIds;
});

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
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.fiori.SetRegistrationIds
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetRegistrationIds = {

		/**
		 * Sets and overwrites new array for sap.fiori/registrationIds. Creates new sap.fiori node if necesssary.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change with type <code>appdescr_fiori_setRegistrationIds</code>
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
}, true);
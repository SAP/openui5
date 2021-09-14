
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
	 * Descriptor change merger for change type <code>appdescr_fiori_setAbstract</code>.
	 * Sets and overwrites boolean flag (only to <code>false</code>) for <code>sap.fiori/abstract</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.fiori.SetAbstract
	 * @experimental
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var SetAbstract = /** @lends sap.ui.fl.apply._internal.changes.descriptor.fiori.SetAbstract */ {
		/**
		 * Method to apply the <code>appdescr_fiori_setAbstract</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {object} oChange - Change with type <code>appdescr_fiori_setAbstract</code>
		 * @param {boolean} oChange.content.abstract - Boolean flag (only allowed value is <code>false</code>)
		 * @returns {object} Updated manifest with changed <code>appdescr_fiori_setAbstract</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			if (!oChange.getContent().hasOwnProperty("abstract")) {
				throw new Error("No abstract in change content provided");
			}

			if (oChange.getContent().abstract !== false) {
				throw new Error("The current change value of property abstract is '" + oChange.getContent().abstract + "'. Only allowed value for property abstract is boolean 'false'");
			}

			ObjectPath.set(["sap.fiori", "abstract"], oChange.getContent().abstract, oManifest);
			return oManifest;
		}
	};
	return SetAbstract;
});
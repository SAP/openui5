
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	const regex = new RegExp("^([a-zA-Z0-9]{2,3})(-[a-zA-Z0-9]{1,6})*$");

	/**
	 * Descriptor change merger for change type <code>appdescr_app_setAch</code>.
	 * Sets and overwrites string for <code>sap.app/ach</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.app.SetAch
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const SetAch = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.SetAch */ {
		/**
		 * Applies <code>appdescr_app_setAch</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_setAch</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.ach - String ach (only allowed regex is ^([a-zA-Z0-9]{2,3})(-[a-zA-Z0-9]{1,6})*$)
		 * @returns {object} Updated manifest with changed <code>appdescr_app_setAch</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			if (!oChange.getContent().hasOwnProperty("ach")) {
				throw new Error("No 'Application Component Hierarchy' (ACH) in change content provided");
			}

			if (typeof oChange.getContent().ach !== "string") {
				throw new Error(`The current change value type of property ach is '${typeof oChange.getContent().ach}'. Only allowed type for poperty ach is string`);
			}

			if (!regex.test(oChange.getContent().ach)) {
				throw new Error(`The current change value of property ach is '${oChange.getContent().ach}'. Supported values for property ach is the regular expression ${regex}`);
			}

			ObjectPath.set(["sap.app", "ach"], oChange.getContent().ach, oManifest);
			return oManifest;
		}
	};
	return SetAch;
});

/*!
 * ${copyright}
 */

sap.ui.define([

], function(

) {
	"use strict";

	const regex = new RegExp("^[A-Z0-9_\\-\\/]+$");

	/**
	 * Descriptor change merger for change type <code>appdescr_app_addTechnicalAttributes</code>.
	 * Adds tags to sap.app/tags/technicalAttributes.
	 *
	 * Available only for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.app.AddTechnicalAttributes
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const AddTechnicalAttributes = {

		/**
		 * Applies the <code>appdescr_app_addTechnicalAttributes</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_addTechnicalAttributes</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {Array<string>} oChange.content.technicalAttributes - Array of technicalAttributes in <code>sap.app/tags/technicalAttributes</code> that is being changed
		 * @returns {object} Updated manifest with changed <code>sap.app/tags/technicalAttributes</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			oManifest["sap.app"] ||= {};
			oManifest["sap.app"].tags ||= {};
			const oTags = oManifest["sap.app"].tags;
			oTags.technicalAttributes ||= [];
			const aManifestTechnicalAttributes = oTags.technicalAttributes;

			const aTechnicalAttributes = oChange.getContent().technicalAttributes;
			if (!oChange.getContent().hasOwnProperty("technicalAttributes")) {
				throw new Error("Property 'technicalAttributes' in change content is not provided");
			}

			if (!Array.isArray(aTechnicalAttributes)) {
				throw new Error(`The property 'technicalAttributes' has type '${typeof aTechnicalAttributes}'. Only allowed types for property 'technicalAttributes' is 'array'`);
			}

			if (!aTechnicalAttributes.every((element) => typeof element === "string")) {
				throw new Error(`The array for the property 'technicalAttributes' does not only consist of strings. Only allowed values for the array is string`);
			}

			if (!aTechnicalAttributes.every((element) => regex.test(element))) {
				throw new Error(`The array contains disallowed values. Supported values for 'technicalAttributes' should adhere to the regular expression ${regex}`);
			}

			oTags.technicalAttributes = Array.from(new Set(aManifestTechnicalAttributes.concat(aTechnicalAttributes)));

			return oManifest;
		}

	};

	return AddTechnicalAttributes;
});
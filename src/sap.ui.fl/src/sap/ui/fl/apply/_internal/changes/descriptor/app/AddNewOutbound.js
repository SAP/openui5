
/*!
 * ${copyright}
*/

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	DescriptorChangeCheck
) {
	"use strict";

	const MANDATORY_PROPERTIES = ["semanticObject", "action"];
	const SUPPORTED_PROPERTIES = ["semanticObject", "action", "additionalParameters", "parameters"];
	const PROPERTIES_PATTERNS = {
		semanticObject: "^[\\w\\*]{0,30}$",
		action: "^[\\w\\*]{0,60}$",
		additionalParameters: "^(ignored|allowed|notallowed)$"
	};

	/**
	* Descriptor change merger for change type <code>appdescr_app_addNewOutbound</code>.
	* Adds a new outbound <code>sap.app/crossNavigation/outbounds</code> to the app.
	*
	* Available for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	*
	* @namespace
	* @alias sap.ui.fl.apply._internal.changes.descriptor.app.AddNewOutbound
	* @version ${version}
	* @private
	* @ui5-restricted sap.ui.fl.apply._internal
	*/
	const AddNewOutbound = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.AddNewOutbound */ {

		/**
		* Applies the <code>appdescr_app_addNewOutbound</code> change to the manifest.
		*
		* @param {object} oManifest - Original manifest
		* @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_addNewOutbound</code>
		* @param {object} oChange.content - Details of the change
		* @param {object} oChange.content.outbound - Outbound <code>content.outbound</code> that is being added
		* @returns {object} Updated manifest with new outbound <code>sap.app/crossNavigation/outbounds/<new_inbound_id></code>
		*
		* @private
		* @ui5-restricted sap.ui.fl.apply._internal
		*/
		applyChange(oManifest, oChange) {
			oManifest["sap.app"].crossNavigation ||= {};
			oManifest["sap.app"].crossNavigation.outbounds ||= {};

			const oChangeContent = oChange.getContent();
			const sOutboundId = DescriptorChangeCheck.getAndCheckInOrOutbound(oChangeContent, "outbound", MANDATORY_PROPERTIES, SUPPORTED_PROPERTIES, PROPERTIES_PATTERNS);
			const oOutboundInManifest = oManifest["sap.app"].crossNavigation.outbounds[sOutboundId];
			if (!oOutboundInManifest) {
				DescriptorChangeCheck.checkIdNamespaceCompliance(sOutboundId, oChange);
				oManifest["sap.app"].crossNavigation.outbounds[sOutboundId] = oChangeContent.outbound[sOutboundId];
			} else {
				throw new Error(`Outbound with ID "${sOutboundId}" already exist.`);
			}
			return oManifest;
		}
	};

	return AddNewOutbound;
});
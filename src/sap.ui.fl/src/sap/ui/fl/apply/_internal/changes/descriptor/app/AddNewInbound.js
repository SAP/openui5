
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
	const SUPPORTED_PROPERTIES = ["semanticObject", "action", "hideLauncher", "icon", "title", "shortTitle", "subTitle", "info", "indicatorDataSource", "deviceTypes", "displayMode", "signature"];

	const PROPERTIES_PATTERNS = {
		semanticObject: "^[\\w\\*]{0,30}$",
		action: "^[\\w\\*]{0,60}$"
	};

	/**
	* Descriptor change merger for change type <code>appdescr_app_addNewInbound</code>.
	* Adds a new inbound <code>sap.app/crossNavigation/inbounds</code> to the app.
	*
	* Available for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	*
	* @namespace
	* @alias sap.ui.fl.apply._internal.changes.descriptor.app.AddNewInbound
	* @version ${version}
	* @private
	* @ui5-restricted sap.ui.fl.apply._internal
	*/
	const AddNewInbound = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.AddNewInbound */ {

		/**
		* Method to apply the  <code>appdescr_app_addNewInbound</code> change to the manifest.
		*
		* @param {object} oManifest - Original manifest
		* @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_addNewInbound</code>
		* @param {object} oChange.content - Details of the change
		* @param {object} oChange.content.inbound - Inbound <code>content.inbound</code> that is being added
		* @returns {object} Updated manifest with new inbound <code>sap.app/crossNavigation/inbounds/<new_inbound_id></code>
		*
		* @private
		* @ui5-restricted sap.ui.fl.apply._internal
		*/
		applyChange(oManifest, oChange) {
			oManifest["sap.app"].crossNavigation ||= {};
			oManifest["sap.app"].crossNavigation.inbounds ||= {};

			const oChangeContent = oChange.getContent();
			const sInboundId = DescriptorChangeCheck.getAndCheckInOrOutbound(oChangeContent, "inbound", MANDATORY_PROPERTIES, SUPPORTED_PROPERTIES, PROPERTIES_PATTERNS);
			const oInboundInManifest = oManifest["sap.app"].crossNavigation.inbounds[sInboundId];
			if (!oInboundInManifest) {
				DescriptorChangeCheck.checkIdNamespaceCompliance(sInboundId, oChange);
				oManifest["sap.app"].crossNavigation.inbounds[sInboundId] = oChangeContent.inbound[sInboundId];
			} else {
				throw new Error(`Inbound with ID "${sInboundId}" already exist.`);
			}
			return oManifest;
		}
	};

	return AddNewInbound;
});
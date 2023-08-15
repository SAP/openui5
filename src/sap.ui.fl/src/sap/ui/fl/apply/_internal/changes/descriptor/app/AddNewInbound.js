
/*!
 * ${copyright}
*/

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	DescriptorChangeCheck
) {
	"use strict";

	function getAndCheckInboundId(oChangeContent) {
		var aInbounds = Object.keys(oChangeContent.inbound);
		if (aInbounds.length > 1) {
			throw new Error("It is not allowed to add more than one inbound");
		}
		if (aInbounds.length < 1) {
			throw new Error("Inbound does not exist");
		}
		if (aInbounds[0] === "") {
			throw new Error("The ID of your inbound is empty");
		}
		return aInbounds[aInbounds.length - 1];
	}

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
	var AddNewInbound = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.AddNewInbound */ {

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
		applyChange: function(oManifest, oChange) {
			if (!oManifest["sap.app"].crossNavigation) {
				oManifest["sap.app"].crossNavigation = {};
			}

			if (!oManifest["sap.app"].crossNavigation.inbounds) {
				oManifest["sap.app"].crossNavigation.inbounds = {};
			}

			var oChangeContent = oChange.getContent();
			var sInboundId = getAndCheckInboundId(oChangeContent);
			var oInboundInManifest = oManifest["sap.app"].crossNavigation.inbounds[sInboundId];
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
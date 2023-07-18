/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	function checkManifestPath(oManifest) {
		if (!oManifest["sap.app"].hasOwnProperty("crossNavigation")) {
			throw new Error("No sap.app/crossNavigation path exists in the manifest");
		}

		if (!oManifest["sap.app"].crossNavigation.hasOwnProperty("inbounds")) {
			throw new Error("No sap.app/crossNavigation/inbounds path exists in the manifest");
		}
	}

	function getAndCheckInboundId(oChangeContent) {
		var sInbounds = oChangeContent.inboundId;
		if (sInbounds === "") {
			throw new Error("The ID of your inbound is empty");
		}
		if (typeof sInbounds !== "string") {
			throw new Error("The type of your inbound ID must be string");
		}
		return sInbounds;
	}

	function merge(oManifest, sInboundId) {
		var oInbound = {};
		oInbound[sInboundId] = oManifest["sap.app"].crossNavigation.inbounds[sInboundId];
		oManifest["sap.app"].crossNavigation.inbounds = oInbound;
	}

	/**
     * Descriptor change merger for change type <code>appdescr_app_removeAllInboundsExceptOne</code>.
     * Removes all inbounds except one <code>sap.app/crossNavigation/inbounds</code>.
     *
     * Available for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
     *
     * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.app.RemoveAllInboundsExceptOne
     * @version ${version}
     * @private
     * @ui5-restricted sap.ui.fl.apply._internal
     */
	var RemoveAllInboundsExceptOne = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.RemoveAllInboundsExceptOne */ {

		/**
		 * Applies <code>appdescr_app_removeAllInboundsExceptOne</code> change to the manifest.
		 *
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_removeAllInboundsExceptOne</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {object} oChange.content.inboundId - Inbound ID <code>content.inboundId</code> that is to be preserved
		 * @returns {object} Manifest with all removed inbounds expect one <code>sap.app/crossNavigation/inbounds/<spared_inbound_id></code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			checkManifestPath(oManifest);
			var sInboundId = getAndCheckInboundId(oChange.getContent());
			if (oManifest["sap.app"].crossNavigation.inbounds[sInboundId]) {
				merge(oManifest, sInboundId);
			} else {
				throw new Error("No inbound exists with the ID \"" + sInboundId + "\" in sap.app/crossNavigation/inbounds");
			}
			return oManifest;
		}
	};

	return RemoveAllInboundsExceptOne;
});
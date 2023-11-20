/*!
 * ${copyright}
 */

sap.ui.define([

], function(

) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_ovp_removeCard</code>.
	 * Deletes the card by changing the manifest value <code>sap.ovp/cards</code>.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ovp.DeleteCard
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var DeleteCard = {

		/**
		 * Method to apply the <code>appdescr_ovp_removeCard</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change made by key user
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.cardID - ID of the card to be deleted
		 * @returns {object} Updated manifest
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			/* logic for changemerger */
			var oDeleteCard = oChange.getContent();
			var oOldCards = oManifest["sap.ovp"].cards;
			if (oDeleteCard.cardId in oOldCards) {
				delete oOldCards[oDeleteCard.cardId];
			} else {
				throw Error("The card to be deleted was not found");
			}
			return oManifest;
		}

	};

	return DeleteCard;
});

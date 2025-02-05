/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/integration/util/openCardDialog"
], (
	uid,
	openCardDialog
) => {
	"use strict";

	function _createManifest(oCard) {
		const oManifest = oCard.getManifestEntry("/");

		oManifest["sap.app"].id = oManifest["sap.app"].id + uid();

		oCard.getAggregation("_filterBar")?._getFilters().forEach((oFilter) => {
			oFilter.writeValueToConfiguration(oManifest["sap.card"].configuration.filters[oFilter.getKey()]);
		});

		return oManifest;
	}

	/**
	 * Opens the same card in a dialog with scrolling.
	 * @function
	 * @since 1.58
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @alias module:sap/base/util/merge
	 * @param {sap.ui.integration.widgets.Card} oCard The card to be opened.
	 * @returns {sap.m.Dialog} The opened dialog.
	 */
	function openCardShowMore(oCard) {
		return openCardDialog(
			oCard,
			{
				manifest: _createManifest(oCard),
				baseUrl: oCard.getBaseUrl(),
				showCloseButton: true
			}
		);
	}

	return openCardShowMore;
});
/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer", "../library"], function (BaseContentRenderer, library) {
	"use strict";

	/**
	 * TableContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var TableContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.TableContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	TableContentRenderer.getMinHeight = function (oConfiguration, oContent, oCard) {
		if (oContent._fMinHeight) {
			return oContent._fMinHeight + "px";
		}

		var iMinItems = oCard.getContentMinItems(oConfiguration);

		if (iMinItems == null) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iRowHeight = bIsCompact ? 2 : 2.75, // table row height in "rem"
			iTableHeaderHeight = bIsCompact ? 2 : 2.75; // table header height in "rem"

		return (iMinItems * iRowHeight + iTableHeaderHeight) + "rem";
	};

	TableContentRenderer.getItemMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration || !oConfiguration.row) {
			return 0;
		}

		var bIsCompact = this.isCompact(oContent);

		return bIsCompact ? 2 : 2.75;
	};

	return TableContentRenderer;
});

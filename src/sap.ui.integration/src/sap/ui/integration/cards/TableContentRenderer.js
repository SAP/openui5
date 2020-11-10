/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
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
	TableContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iCount = parseInt(oConfiguration.maxItems) || 0,
			iRowHeight = bIsCompact ? 2 : 2.75, // table row height in "rem"
			iTableHeaderHeight = bIsCompact ? 2 : 2.75; // table header height in "rem"

		return (iCount * iRowHeight + iTableHeaderHeight) + "rem";
	};

	return TableContentRenderer;
});

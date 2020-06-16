/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * ListContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ListContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.ListContentRenderer");

	/**
	 * @override
	 */
	ListContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		if (!oConfiguration.maxItems || !oConfiguration.item) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iCount = parseInt(oConfiguration.maxItems) || 0,
			oTemplate = oConfiguration.item,
			iItemHeight = bIsCompact ? 2 : 2.75; // list item height in "rem"

		if (oTemplate.description) {
			iItemHeight = 5; // list item height with description in "rem"
		}

		return (iCount * iItemHeight) + "rem";
	};

	return ListContentRenderer;
});

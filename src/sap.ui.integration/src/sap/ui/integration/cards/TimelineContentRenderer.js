/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * TimelineContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var TimelineContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.TimelineContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	TimelineContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		if (!oConfiguration.maxItems) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iCount = parseInt(oConfiguration.maxItems),
			iItemHeight = bIsCompact ? 4 : 5; // timeline item height in "rem"

		return (iCount * iItemHeight) + "rem";
	};

	return TimelineContentRenderer;
});

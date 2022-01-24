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
	TimelineContentRenderer.getMinHeight = function (oConfiguration, oContent, oCard) {
		var iMaxItems = oCard.getContentPageSize(oConfiguration);

		if (!iMaxItems) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iItemHeight = bIsCompact ? 4 : 5; // timeline item height in "rem"

		return (iMaxItems * iItemHeight) + "rem";
	};

	return TimelineContentRenderer;
});

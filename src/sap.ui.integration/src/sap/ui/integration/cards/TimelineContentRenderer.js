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

		var iItemHeight = this.getItemMinHeight(oConfiguration, oContent);

		return (iMaxItems * iItemHeight) + "rem";
	};

	TimelineContentRenderer.getItemMinHeight = function (oConfiguration, oControl) {
		if (!oConfiguration || !oConfiguration.item) {
			return 0;
		}

		return oConfiguration.item.ownerImage ? 7 : 5.625;
	};

	return TimelineContentRenderer;
});

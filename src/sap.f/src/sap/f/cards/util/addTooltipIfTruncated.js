/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	const oDelegate = {
		canSkipRendering: true,
		onmouseover: (oEvent) => {
			const oText = oEvent.srcControl;

			if (oText.getTooltip()) {
				// do not override if text already has a tooltip
				return;
			}

			const oTarget = oText.getDomRef("inner") || oText.getDomRef();

			if (!oTarget) {
				return;
			}

			if (oTarget.offsetWidth < oTarget.scrollWidth || oTarget.offsetHeight < oTarget.scrollHeight) {
				oTarget.title = oText.getText();
			} else {
				oTarget.title = "";
			}
		}
	};

	/**
	 * If the text is truncated - adds a tooltip.
	 * @private
	 * @ui5-restricted sap.f
	 * @param {sap.m.Text} oText The text control.
	 */
	function addTooltipIfTruncated(oText) {
		oText.addEventDelegate(oDelegate);
	}

	return addTooltipIfTruncated;
});

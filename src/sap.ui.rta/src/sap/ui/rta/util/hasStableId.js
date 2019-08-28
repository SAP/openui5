/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/dt/OverlayUtil"
], function (
	FlUtils,
	OverlayUtil
) {
	"use strict";

	function checkAggregationBindingTemplateID(oOverlay, vStableElement) {
		var mAggregationInfo = OverlayUtil.getAggregationInformation(oOverlay, oOverlay.getElement().sParentAggregationName);
		if (!mAggregationInfo.templateId) {
			return true;
		}

		return !FlUtils.checkControlId(mAggregationInfo.templateId, vStableElement.appComponent);
	}

	/**
	 * Checks whether an element for an overlay has a stable ID
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay to check
	 * @return {boolean} <code>true</code> when an element for specified overlay has a stable ID
	 */
	return function hasStableId(oElementOverlay) {
		if (!oElementOverlay || oElementOverlay._bIsBeingDestroyed) { // introduced in BCP#1970249189, TODO: check who and why call this function during the destruction
			return false;
		}

		if (typeof oElementOverlay.data("hasStableId") !== "boolean") {
			var aStableElements = oElementOverlay.getDesignTimeMetadata().getStableElements(oElementOverlay);
			var bUnstable = false;

			if (aStableElements.length > 0) {
				bUnstable = aStableElements.some(function(vStableElement) {
					var oControl = vStableElement.id || vStableElement;
					if (!FlUtils.checkControlId(oControl, vStableElement.appComponent)) {
						return checkAggregationBindingTemplateID(oElementOverlay, vStableElement);
					}
				});
			}

			oElementOverlay.data("hasStableId", !bUnstable);
		}

		return oElementOverlay.data("hasStableId");
	};
});
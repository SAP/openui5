/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/dt/ElementUtil",
	"sap/base/util/isPlainObject"
], function (
	FlUtils,
	ElementUtil,
	isPlainObject
) {
	"use strict";

	function isCloneFromAggregationBinding(oControl) {
		var sParentAggregationName = oControl.sParentAggregationName;
		var oParent = oControl.getParent();

		if (oParent && sParentAggregationName) {
			var oBindingInfo = oParent.getBindingInfo(sParentAggregationName);
			if (oBindingInfo) {
				if (
					oBindingInfo.template
					&& oControl instanceof oBindingInfo.template.getMetadata().getClass()
				) {
					return oBindingInfo.template;
				}

				return false;
			}
			return isCloneFromAggregationBinding(oParent);
		}
		return false;
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
				if (isCloneFromAggregationBinding(oElementOverlay.getElement())) {
					bUnstable = aStableElements.some(function (vStableElement) {
						var vControl;
						var oAppComponent;
						var bUnstable = false;

						if (isPlainObject(vStableElement)) {
							vControl = vStableElement.id;
							oAppComponent = vStableElement.appComponent;
						} else {
							vControl = vStableElement;
						}

						// 1. First we check control as is, as getStableElements() may already return a control from the template
						bUnstable = !FlUtils.checkControlId(vControl, oAppComponent);

						// 2. If it's unstable, we try to detect the corresponding control in the template manually
						if (bUnstable) {
							var oControl = ElementUtil.getElementInstance(vControl);
							if (ElementUtil.getElementInstance(vControl)) {
								var mLocationInTemplate = ElementUtil.getAggregationInformation(oControl);
								bUnstable = !FlUtils.checkControlId(ElementUtil.extractTemplateId(mLocationInTemplate), oAppComponent);
							}
						}

						return bUnstable;
					});
				} else {
					bUnstable = aStableElements.some(function(vStableElement) {
						var vControl = vStableElement.id || vStableElement;
						return !FlUtils.checkControlId(vControl, vStableElement.appComponent);
					});
				}
			}

			oElementOverlay.data("hasStableId", !bUnstable);
		}

		return oElementOverlay.data("hasStableId");
	};
});
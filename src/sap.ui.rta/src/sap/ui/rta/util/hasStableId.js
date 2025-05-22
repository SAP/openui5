/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/dt/ElementUtil",
	"sap/base/util/isPlainObject"
], function(
	FlUtils,
	ElementUtil,
	isPlainObject
) {
	"use strict";

	function isCloneFromAggregationBinding(oControl) {
		const {sParentAggregationName} = oControl;
		const oParent = oControl.getParent();

		if (oParent && sParentAggregationName) {
			const oBindingInfo = oParent.getBindingInfo(sParentAggregationName);
			if (oBindingInfo) {
				if (
					oBindingInfo.template
					&& oControl.isA(oBindingInfo.template.getMetadata().getClass())
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
			const aStableElements = oElementOverlay.getDesignTimeMetadata().getStableElements(oElementOverlay);
			let bUnstable = false;

			if (aStableElements.length > 0) {
				if (isCloneFromAggregationBinding(oElementOverlay.getElement())) {
					bUnstable = aStableElements.some(function(vStableElement) {
						const vControl = isPlainObject(vStableElement) ? vStableElement.id : vStableElement;
						const oAppComponent = isPlainObject(vStableElement) && vStableElement.appComponent;

						// 1. First we check control as is, as getStableElements() may already return a control from the template
						bUnstable = !FlUtils.checkControlId(vControl, oAppComponent);

						// 2. If it's unstable, we try to detect the corresponding control in the template manually
						if (bUnstable) {
							const oControl = ElementUtil.getElementInstance(vControl);
							if (ElementUtil.getElementInstance(vControl)) {
								const mLocationInTemplate = ElementUtil.getAggregationInformation(oControl);
								bUnstable = !FlUtils.checkControlId(ElementUtil.extractTemplateId(mLocationInTemplate), oAppComponent);
							}
						}

						return bUnstable;
					});
				} else {
					bUnstable = aStableElements.some(function(vStableElement) {
						const vControl = vStableElement.id || vStableElement;
						return !FlUtils.checkControlId(vControl, vStableElement.appComponent);
					});
				}
			}

			oElementOverlay.data("hasStableId", !bUnstable);
		}

		return oElementOverlay.data("hasStableId");
	};
});
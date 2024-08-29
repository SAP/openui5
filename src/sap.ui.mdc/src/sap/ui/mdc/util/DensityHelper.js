/*
 * ! ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/base/Object"], function(jQuery, BaseObject) {
	"use strict";

	const aContentDensityStyleClasses = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed"];
	const sDefaultContentDensity = aContentDensityStyleClasses[0]; // default to cozy

	const fnGetContentDensity = function(sFnName, oObject) {
		if (!oObject || !oObject[sFnName]) {
			return undefined;
		}

		for (let i = 0; i < aContentDensityStyleClasses.length; i++) {
			if (oObject[sFnName](aContentDensityStyleClasses[i])) {
				return aContentDensityStyleClasses[i];
			}
		}
		return undefined;
	};

	const fnGetDensity = function (vSource) {
		const bDOM = !BaseObject.isObjectA(vSource, "sap.ui.core.Control");
		return bDOM ? fnGetContentDensity("hasClass", jQuery(vSource).closest("." + aContentDensityStyleClasses.join(",."))) : fnGetContentDensity("hasStyleClass", vSource);
	};

	/**
	 * Utility class used by mdc controls to set/copy density configuration from a source control/DOM (or document body) to a control target.
	 * <b>Note</b>: Will also set a default density (cozy) if nothing else is found.
	 *
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.96
	 * @alias sap.ui.mdc.util.DensityHelper
	 */
	const DensityHelper = {};

	/**
	 * If no source is given, density configuration will be searched in document body or provided from a default (cozy).
	 *
	 * @param {sap.ui.core.Control} oTarget target <code>sap.ui.core.Control</code> the style class should be applied to
	 * @param {object|sap.ui.core.Control} [vSource] source DOM node or <code>sap.ui.core.Control</code>
	 * @returns {undefined}
	 */
	DensityHelper.syncDensity = function (oTarget, vSource) {
		if (!fnGetDensity(oTarget)) { // Only override if target does not contain an explicit density
			const sContentDensity = (vSource && fnGetDensity(vSource)) || fnGetDensity(document.body) || sDefaultContentDensity; // Search source if given, fall back to document.body or default density
			return oTarget.addStyleClass(sContentDensity);
		}
		return undefined;
	};

	return DensityHelper;
});
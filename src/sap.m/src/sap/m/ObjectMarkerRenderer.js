/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";


	/**
	 * <code>ObjectMarker</code> renderer.
	 * @namespace
	 */
	var ObjectMarkerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.ObjectMarker} oControl an object representation of the control that should be rendered
	 */
	ObjectMarkerRenderer.render = function(oRm, oControl) {
		var oInnerControl = oControl._getInnerControl(),
			bIsIconOnly = oControl._isIconVisible() && !oControl._isTextVisible(),
			oInnerIcon;

		// start control wrapper
		oRm.openStart("span", oControl);
		oRm.class("sapMObjectMarker");
		oRm.openEnd();
		if (oInnerControl) {
			oInnerControl.setIconOnly(bIsIconOnly);
			if (oControl.hasListeners("press")) {
				// if the control have "press" attached, and is icon-only, attach control's "press" handler to the inner icon
				oInnerIcon = oInnerControl._getIconAggregation();
				if (bIsIconOnly && oInnerIcon && !oInnerIcon.hasListeners("press")) {
					oInnerIcon.attachPress(oControl._firePress, oControl);
				}
			}
		}
		oRm.renderControl(oInnerControl);
		// end control wrapper
		oRm.close("span");
	};

	return ObjectMarkerRenderer;

}, /* bExport= */ true);
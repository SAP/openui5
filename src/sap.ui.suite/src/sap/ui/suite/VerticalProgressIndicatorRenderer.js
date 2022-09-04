/*!
 * ${copyright}
 */

// provides default renderer for sap.ui.suite.VerticalProgressIndicator
sap.ui.define(["sap/ui/core/Configuration"], function(Configuration) {
	"use strict";


	/**
	 * VerticalProgressIndicator renderer.
	 * @namespace
	 */
	var VerticalProgressIndicatorRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.suite.VerticalProgressIndicator} oControl an object representation of the control that should be rendered
	 */
	VerticalProgressIndicatorRenderer.render = function(rm, oControl){
		//calculate percentage
		var VerticalPercent = oControl.getPercentage();
		if (VerticalPercent < 0) {
			VerticalPercent = 0;
		}
		if (VerticalPercent > 100) {
			VerticalPercent = 100;
		}
		var PixelDown = Math.round(VerticalPercent * 58 / 100);
		var PixelUp	 = 58 - PixelDown;
		var PercentageString = VerticalPercent.toString();

		// write the HTML into the render manager
		rm.openStart("div", oControl);
		rm.attr('tabindex', '0');

		if (oControl.getTooltip_AsString()) {
			rm.attr("title", oControl.getTooltip_AsString());
		} else {
			rm.attr("title", PercentageString);
		}

		//ARIA
		if ( Configuration.getAccessibility()) {
			rm.attr('role', 'progressbar');
			rm.accessibilityState(oControl, {valuemin: '0%'});
			rm.accessibilityState(oControl, {valuemax: '100%'});
			rm.accessibilityState(oControl, {valuenow: VerticalPercent + '%'});
		}

		rm.class("sapUiVerticalProgressOuterContainer");
		rm.openEnd(); // Outer DIV element
		rm.openStart("div", oControl.getId() + "-bar");
		rm.class("sapUiVerticalProgressInnerContainer");
		rm.style("top", PixelUp + "px");
		rm.style("height", PixelDown + "px");
		rm.openEnd(); // Inner DIV element
		rm.close("div");
		rm.close("div");
	};


	return VerticalProgressIndicatorRenderer;

}, /* bExport= */ true);

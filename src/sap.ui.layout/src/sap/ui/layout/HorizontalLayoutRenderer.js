/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * HorizontalLayout renderer.
	 * @namespace
	 */
	var HorizontalLayoutRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HorizontalLayoutRenderer.render = function(oRenderManager, oControl){
		// convenience variable
		var rm = oRenderManager;
		var bNoWrap = !oControl.getAllowWrapping();

		// write the HTML into the render manager
		rm.openStart("div", oControl);
		rm.class("sapUiHLayout");
		if (bNoWrap) {
			rm.class("sapUiHLayoutNoWrap");
		}
		rm.openEnd(); // div element

		var aChildren = oControl.getContent();
		for (var i = 0; i < aChildren.length; i++) {
			if (bNoWrap) {
				rm.openStart("div");
				rm.class("sapUiHLayoutChildWrapper");
				rm.openEnd();
			}
			rm.renderControl(aChildren[i]);
			if (bNoWrap) {
				rm.close("div");
			}
		}

		rm.close("div");
	};


	return HorizontalLayoutRenderer;

}, /* bExport= */ true);

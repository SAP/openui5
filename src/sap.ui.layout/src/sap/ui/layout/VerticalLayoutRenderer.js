/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.layout.VerticalLayout
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * layout/VerticalLayout renderer.
	 * @namespace
	 */
	var VerticalLayoutRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oVerticalLayout an object representation of the control that should be rendered
	 */
	VerticalLayoutRenderer.render = function(oRenderManager, oVerticalLayout){
		// convenience variable
		var rm = oRenderManager;

		// write the HTML into the render manager
		rm.openStart("div", oVerticalLayout);
		rm.class("sapUiVlt");
		rm.class("sapuiVlt"); // for compatibility keep the old, wrong class name

		if (oVerticalLayout.getWidth() && oVerticalLayout.getWidth() != '') {
			rm.style("width", oVerticalLayout.getWidth());
		}
		rm.openEnd(); // DIV element

		// render content
		var aContent = oVerticalLayout.getContent();

		for ( var i = 0; i < aContent.length; i++) {
			// for compatibility keep the old, wrong class name
			rm.openStart("div");
			rm.class("sapUiVltCell");
			rm.class("sapuiVltCell");
			rm.openEnd();

			rm.renderControl(aContent[i]);
			rm.close("div");
		}

		rm.close("div");
	};


	return VerticalLayoutRenderer;

}, /* bExport= */ true);

/*!
 * ${copyright}
 */

// A renderer for the ComponentContainer control
sap.ui.define(function() {
	"use strict";


	/**
	 * ComponentContainer renderer.
	 * @namespace
	 * @alias sap.ui.core.ComponentContainerRenderer
	 */
	var ComponentContainerRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.ComponentContainer} oComponentContainer The ComponentContainer that should be rendered
	 */
	ComponentContainerRenderer.render = function(oRM, oComponentContainer){

		// convenience variable
		var oComponent = oComponentContainer.getComponentInstance();
		var sWidth = oComponentContainer.getWidth();
		var sHeight = oComponentContainer.getHeight();

		oRM.openStart("div", oComponentContainer);
		oRM.style("width", sWidth);
		oRM.style("height", sHeight);
		oRM.class("sapUiComponentContainer"); // this class can be used to be able to style the container, for example for support or demo reasons
		oRM.openEnd();
		oRM.openStart("div", oComponentContainer.getId() + "-uiarea");
		if (sWidth && sWidth !== "auto") {
			oRM.style("width", "100%"); // if a width is specified we use 100% width for the uiarea
		}
		if (sHeight && sHeight !== "auto") {
			oRM.style("height", "100%"); // if a height is specified we use 100% height for the uiarea
		}
		oRM.openEnd();
		if (oComponent) {
			oComponent.render(oRM);
		}
		oRM.close("div");
		oRM.close("div");
	};


	return ComponentContainerRenderer;

}, /* bExport= */ true);

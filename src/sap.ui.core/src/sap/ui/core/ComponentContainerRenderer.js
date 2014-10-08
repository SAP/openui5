/*!
 * ${copyright}
 */

// A renderer for the ComponentContainer control
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class ComponentContainer renderer.
	 * @static
	 * @name sap.ui.core.ComponentContainerRenderer
	 */
	var ComponentContainerRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl Object representation of the control that should be rendered
	 * @name sap.ui.core.ComponentContainerRenderer.render
	 * @function
	 */
	ComponentContainerRenderer.render = function(oRenderManager, oComponentContainer){
	
		// convenience variable
		var oRM = oRenderManager;
		var oComponent = oComponentContainer.getComponentInstance();
		var sWidth = oComponentContainer.getWidth();
		var sHeight = oComponentContainer.getHeight();
		
		oRM.write("<div");
		oRM.writeControlData(oComponentContainer);
		if (sWidth) {
			oRM.addStyle("width", sWidth);
		}
		if (sHeight) {
			oRM.addStyle("height", sHeight);
		}
		oRM.writeStyles();
		oRM.addClass("sapUiComponentContainer"); // this class can be used to be able to style the container, for example for support or demo reasons
		oRM.writeClasses();
		oRM.write(">");
		oRM.write("<div id=\"" + oComponentContainer.getId() + "-uiarea\"");
		if (sWidth && sWidth !== "auto") {
			oRM.addStyle("width", "100%"); // if a width is specified we use 100% width for the uiarea
		}
		if (sHeight && sHeight !== "auto") {
			oRM.addStyle("height", "100%"); // if a height is specified we use 100% height for the uiarea
		}
		oRM.writeStyles();
		oRM.write(">");
		if (oComponent) {
			oComponent.render(oRM);
		}
		oRM.write("</div></div>");
	};
	
	

	return ComponentContainerRenderer;

}, /* bExport= */ true);

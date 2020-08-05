/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.FacetFilter
sap.ui.define(["./library"],
	function(library) {
	"use strict";


	// shortcut for sap.ui.ux3.VisibleItemCountMode
	var VisibleItemCountMode = library.VisibleItemCountMode;


	/**
	 * FacetFilter renderer.
	 * @namespace
	 */
	var FacetFilterRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FacetFilterRenderer.render = function(rm, oControl) {
		var bFullHeight = (oControl.getVisibleItemCountMode() === VisibleItemCountMode.Auto); // "Auto"
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapUiUx3FacetFilter");
		rm.writeClasses();
		if (bFullHeight) {
			rm.writeAttribute("style", "height:100%");
		}
		rm.write(">");
		var aLists = oControl.getLists();
		if (aLists) {
			for (var i = 0; i < aLists.length; i++) {
				aLists[i].sWidth = 100 / aLists.length + "%";
				aLists[i].bFullHeight = bFullHeight;
				rm.renderControl(aLists[i]);
			}
		}
		rm.write("</div>");
	};

	return FacetFilterRenderer;

}, /* bExport= */ true);

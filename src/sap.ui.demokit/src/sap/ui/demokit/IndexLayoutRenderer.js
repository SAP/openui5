/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.IndexLayout
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class IndexLayout renderer.
	 * @static
	 */
	var IndexLayoutRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oLyt an object representation of the control that should be rendered
	 */
	IndexLayoutRenderer.render = function(rm, oLyt){
		var id = oLyt.getId();
	
		rm.write("<div");
		rm.writeControlData(oLyt);
		rm.addClass("sapDkIdxLayout");
		rm.addClass("sapDkIdxLayoutHidden");
		if (oLyt.getEnableScaling()) {
			rm.addClass("sapDkIdxLayoutScale");
		}
		rm.writeClasses();
		rm.write("><div id=\"", id, "-cntnt\">");
		
		var aContent = oLyt.getContent();
		for (var i = 0; i < aContent.length; i++) {
			rm.write("<div class=\"sapDkIdxLayoutItem\" style=\"width:", oLyt._scale(oLyt._itemWidth), "px;height:", oLyt._scale(oLyt._itemHeight), "px;\"><div>");
			rm.renderControl(aContent[i]);
			rm.write("</div></div>");
		}
		
		rm.write("</div></div>");
	};

	return IndexLayoutRenderer;

}, /* bExport= */ true);

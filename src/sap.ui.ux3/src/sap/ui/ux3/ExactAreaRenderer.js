/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.ExactArea
sap.ui.define(["sap/ui/commons/ToolbarRenderer", "sap/base/security/encodeXML"],
	function(ToolbarRenderer, encodeXML) {
	"use strict";


	/**
	 * ExactArea renderer.
	 * @namespace
	 */
	var ExactAreaRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ExactAreaRenderer.render = function(rm, oControl){
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapUiUx3ExactArea");
		rm.writeClasses();
		rm.write(">");
		if (oControl.getToolbarVisible()) {
			rm.write("<div id=\"" + oControl.getId() + "-tb\" class=\"sapUiTb sapUiTbDesignFlat sapUiTbStandalone\" role=\"toolbar\">");
			rm.write("<div class=\"sapUiTbCont\"><div class=\"sapUiTbInner\">");
			var aToolbarItems = oControl.getToolbarItems();
			for (var idx = 0; idx < aToolbarItems.length; idx++) {
				var oToolbarItem = aToolbarItems[idx];
				if (oToolbarItem instanceof sap.ui.commons.ToolbarSeparator) {
					ToolbarRenderer.renderSeparator(rm, oToolbarItem);
				} else if (oToolbarItem instanceof sap.ui.ux3.ExactAreaToolbarTitle) {
					rm.write("<div class=\"sapUiUx3ExactAreaTbTitle\">" + encodeXML(oToolbarItem.getText()) + "</div>");
				} else {
					rm.renderControl(oToolbarItem);
				}
			}
			rm.write("</div></div></div>");
		}
		rm.write("<div id=\"" + oControl.getId() + "-ct\" class=\"sapUiUx3ExactAreaCont\">");
		var aChildren = oControl.getContent();
		for (var idx = 0; idx < aChildren.length; idx++) {
			rm.renderControl(aChildren[idx]);
		}
		rm.write("</div>");
		rm.write("</div>");
	};

	return ExactAreaRenderer;

}, /* bExport= */ true);

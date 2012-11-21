/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.DisplayListItemRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.ListItemBaseRenderer");

/**
 * @class DisplayListItem renderer.
 * @static
 */
sap.m.DisplayListItemRenderer = sap.ui.core.Renderer.extend(sap.m.ListItemBaseRenderer);

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *          oRenderManager the RenderManager that can be used for writing to the
 *          Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *          oControl an object representation of the control that should be
 *          rendered
 */
sap.m.DisplayListItemRenderer.renderLIAttributes = function(rm, oLI) {
	rm.addClass("sapMDLI");
};

sap.m.DisplayListItemRenderer.renderLIContent = function(rm, oLI) {

	var isLabel = oLI.getLabel();

	// List item label
	if (isLabel) {
		rm.write("<label for='" + oLI.getId() + "-value' class='sapMDLILabel'>");
		rm.writeEscaped(oLI.getLabel());
		rm.write("</label>");
	}
	
	var isValue = oLI.getValue();
	
	// List item value
	if (isValue) {
		rm.write("<div id='" + oLI.getId() + "-value' class='sapMDLIValue'>");
		rm.writeEscaped(oLI.getValue());
		rm.write("</div>");
	}
};

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.ActionListItemRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.ListItemBaseRenderer");

/**
 * @class ActionListItem renderer.
 * @static
 */
sap.m.ActionListItemRenderer = sap.ui.core.Renderer.extend(sap.m.ListItemBaseRenderer);

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
sap.m.ActionListItemRenderer.renderLIAttributes = function(rm, oLI) {
	rm.addClass("sapMALI");
};

sap.m.ActionListItemRenderer.renderLIContent = function(rm, oLI) {

	var isText = oLI.getText();

	// List item label
	if (isText) {
		rm.write("<div class='sapMALIText'>");
		rm.writeEscaped(isText);
		rm.write("</div>");
	}
};

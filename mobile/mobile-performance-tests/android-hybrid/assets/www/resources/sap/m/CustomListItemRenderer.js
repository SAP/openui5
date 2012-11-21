/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.CustomListItemRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.ListItemBaseRenderer");

/**
 * @class CustomListItem renderer.
 * @static
 */
sap.m.CustomListItemRenderer = sap.ui.core.Renderer.extend(sap.m.ListItemBaseRenderer);

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */
sap.m.CustomListItemRenderer.renderLIAttributes = function(rm, oLI) {
	rm.addClass("sapMCLI");
};

sap.m.CustomListItemRenderer.renderLIContent = function(rm, oLI) {
	var aContent = oLI.getContent();
	var cLength = aContent.length;
	for ( var i = 0; i < cLength; i++) {
		rm.renderControl(aContent[i]);
	}
};
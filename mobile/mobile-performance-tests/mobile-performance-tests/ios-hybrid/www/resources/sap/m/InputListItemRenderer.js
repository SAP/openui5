/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.InputListItemRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.ListItemBaseRenderer");

/**
 * @class InputListItem renderer.
 * @static
 */
sap.m.InputListItemRenderer = sap.ui.core.Renderer.extend(sap.m.ListItemBaseRenderer);

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
sap.m.InputListItemRenderer.renderLIAttributes = function(rm, oLI) {
	rm.addClass("sapMILI");
};

sap.m.InputListItemRenderer.renderLIContent = function(rm, oLI) {

	var sLabel = oLI.getLabel();

	// List item label
	if (sLabel) {
		rm.write("<label for='" + oLI.getId() + "-content' class='sapMILILabel'>");
		rm.writeEscaped(oLI.getLabel());
		rm.write("</label>");
	}

	// List item input content
	rm.write("<div class='sapMILIDiv sapMILI-CTX'>");

	var aContent = oLI.getContent();
	var cLength = aContent.length;
	for ( var i = 0; i < cLength; i++) {
		rm.renderControl(aContent[i]);
	}
	rm.write("</div>");
};

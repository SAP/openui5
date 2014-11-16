/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * InputListItem renderer.
	 * @namespace
	 */
	var InputListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	
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
	InputListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMILI");
	};
	
	InputListItemRenderer.renderLIContent = function(rm, oLI) {
	
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
	

	return InputListItemRenderer;

}, /* bExport= */ true);

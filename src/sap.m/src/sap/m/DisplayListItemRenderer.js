/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * @class DisplayListItem renderer.
	 * @static
	 */
	var DisplayListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	
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
	DisplayListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMDLI");
	};
	
	DisplayListItemRenderer.renderLIContent = function(rm, oLI) {
	
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
	

	return DisplayListItemRenderer;

}, /* bExport= */ true);

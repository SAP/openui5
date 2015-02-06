/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * ActionListItem renderer.
	 * @namespace
	 */
	var ActionListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	
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
	ActionListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMALI");
	};
	
	ActionListItemRenderer.renderLIContent = function(rm, oLI) {
	
		var isText = oLI.getText();
	
		// List item label
		if (isText) {
			rm.write("<div class='sapMALIText'>");
			rm.writeEscaped(isText);
			rm.write("</div>");
		}
	};
	
	/**
	 * Action list item does not respect counter property of the LIB
	 * @overwrite
	 */
	ActionListItemRenderer.renderCounter = function(rm, oLI) {
	};
	

	return ActionListItemRenderer;

}, /* bExport= */ true);

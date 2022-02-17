/*!
 * ${copyright}
 */

sap.ui.define(["./ListItemBaseRenderer", "sap/ui/core/Renderer"],
	function(ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * ActionListItem renderer.
	 * @namespace
	 */
	var ActionListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	ActionListItemRenderer.apiVersion = 2;

	/**
	 * Renders the List item attributes for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *          RenderManager to be used for rendering
	 * @param {sap.m.ActionListItem} oLI
	 *          The item for which the attributes should be rendered
	 */
	ActionListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMALI");
	};

	ActionListItemRenderer.renderLIContent = function(rm, oLI) {

		// List item label
		var sText = oLI.getText();
		if (sText) {
			rm.openStart("div").class("sapMALIText").openEnd();
			rm.text(sText);
			rm.close("div");
		}
	};

	return ActionListItemRenderer;

}, /* bExport= */ true);

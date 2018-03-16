/*
 * ! ${copyright}
 */

sap.ui.define([
	'./TreeItemBaseRenderer', 'sap/ui/core/Renderer'
], function(TreeItemBaseRenderer, Renderer) {
	"use strict";

	/**
	 * @namespace
	 */
	var CustomTreeItemRenderer = Renderer.extend(TreeItemBaseRenderer);

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager RenderManager object
	 * @param {sap.ui.core.Control} oControl An object representation of the control that will be rendered
	 */
	CustomTreeItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMCTI");
		TreeItemBaseRenderer.renderLIAttributes.apply(this, arguments);
	};

	CustomTreeItemRenderer.renderLIContent = function(rm, oLI) {
		oLI.getContent().forEach(function(oContent) {
			rm.renderControl(oContent);
		});
	};

	return CustomTreeItemRenderer;

}, /* bExport= */true);

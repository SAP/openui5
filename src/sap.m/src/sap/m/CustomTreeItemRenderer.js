/*!
 * ${copyright}
 */

sap.ui.define([
	'./TreeItemBaseRenderer', 'sap/ui/core/Renderer'
], function(TreeItemBaseRenderer, Renderer) {
	"use strict";

	/**
	 * @namespace
	 */
	var CustomTreeItemRenderer = Renderer.extend(TreeItemBaseRenderer);
	CustomTreeItemRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager object
	 * @param {sap.m.CustomTreeItem} oLI The item to be rendered
	 */
	CustomTreeItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMCTI");
		TreeItemBaseRenderer.renderLIAttributes.apply(this, arguments);
	};

	CustomTreeItemRenderer.renderLIContent = function(rm, oLI) {
		oLI.getContent().forEach(function(oContent) {
			rm.renderControl(oContent);
		});
	};

	return CustomTreeItemRenderer;

}, /* bExport= */true);

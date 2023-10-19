/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/m/TableRenderer", "sap/m/Table"
], function (Renderer, TableRenderer, Table) {
	"use strict";

	/**
	 * UploadSetwithTable renderer.
	 * @namespace
	 */
	var UploadSetwithTableRenderer = Renderer.extend(TableRenderer);
	UploadSetwithTableRenderer.apiVersion = 2; // enable in-place DOM patching


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.upload.UploadSetwithTable} oControl an object representation of the control that should be rendered.
	 */
	UploadSetwithTableRenderer.render = function (oRm, oControl) {
		oControl.addStyleClass("sapMUST");
		TableRenderer.render.apply(this,arguments);
	};

	return UploadSetwithTableRenderer;
});
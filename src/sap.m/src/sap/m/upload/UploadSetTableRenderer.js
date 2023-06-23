/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/m/TableRenderer", "sap/m/Table"
], function (Renderer, TableRenderer, Table) {
	"use strict";

	/**
	 * UploadSetTable renderer.
	 * @namespace
	 */
	var UploadSetTableRenderer = Renderer.extend(TableRenderer);
	UploadSetTableRenderer.apiVersion = 2; // enable in-place DOM patching


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.upload.UploadSetTable} oControl an object representation of the control that should be rendered.
	 */
	UploadSetTableRenderer.render = function (oRm, oControl) {
		oRm.openStart("div",oControl);
		oRm.class("sapMUST");
		oRm.openEnd();
		TableRenderer.render.apply(this,arguments);
		oRm.close("div");
	};

	return UploadSetTableRenderer;
});
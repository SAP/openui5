/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
	"use strict";

	/**
	 * UploadSet renderer.
	 * @namespace
	 */
	var UploadSetRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 */
	UploadSetRenderer.render = function (oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMUC");
		oRm.writeClasses();
		oRm.write(">");
		this.renderDragDropOverlay(oRm, oControl);
		this.renderList(oRm, oControl);
		oRm.write("</div>");
	};

	UploadSetRenderer.renderDragDropOverlay = function (oRm, oControl) {
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-drag-drop-area");
		oRm.addClass("sapMUCDragDropOverlay");
		oRm.addClass("sapMUCDragDropOverlayHide");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapMUCDragDropIndicator");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");
	};

	UploadSetRenderer.renderList = function (oRm, oControl) {
		oRm.renderControl(oControl.getList());
	};

	return UploadSetRenderer;
});

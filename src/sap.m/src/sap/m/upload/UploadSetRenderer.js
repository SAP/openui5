/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/ListItemBaseRenderer'
], function (ListItemBaseRenderer) {
	"use strict";

	/**
	 * UploadSet renderer.
	 * @namespace
	 */
	var UploadSetRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 */
	UploadSetRenderer.render = function (oRm, oControl) {
		oRm.openStart("div",oControl);

		oRm.class("sapMUC");
		oRm.openEnd();
		this.renderDragDropOverlay(oRm, oControl);
		this.renderList(oRm, oControl);
		oRm.close("div");
	};

	UploadSetRenderer.renderDragDropOverlay = function (oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-drag-drop-area");
		oRm.class("sapMUCDragDropOverlay");
		oRm.class("sapMUCDragDropOverlayHide");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapMUCDragDropIndicator");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
	};

	UploadSetRenderer.renderList = function (oRm, oControl) {
		var fnOriginal = oControl.getList().getRenderer().renderNoData;
		oControl.getList().getRenderer().renderNoData = this.renderNoData;
		oRm.renderControl(oControl.getList());
		oControl.getList().getRenderer().renderNoData = fnOriginal;
	};

	UploadSetRenderer.renderNoData = function(oRm, oControl) {
		var oUploadSet = oControl.getParent();
		oRm.openStart("li", oUploadSet.getList().getId("nodata"));
		oRm.attr("tabindex", 0);
		oRm.class("sapMLIB").class("sapMUCNoDataPage");
		ListItemBaseRenderer.addFocusableClasses.call(ListItemBaseRenderer, oRm);
		oRm.openEnd();

		oRm.renderControl(oUploadSet._oNoDataIcon);

		oRm.openStart("div", oUploadSet.getId() + "-no-data-text");
		oRm.class("sapMUCNoDataText");
		oRm.openEnd();
		oRm.text(oUploadSet.getNoDataText());
		oRm.close("div");

		if (oUploadSet.getUploadEnabled()) {
			oRm.openStart("div" , oUploadSet.getId() + "-no-data-description");
			oRm.class("sapMUCNoDataDescription");
			oRm.openEnd();
			oRm.text(oUploadSet.getNoDataDescription());
			oRm.close("div");
		}
		oRm.close("li");
	};

	return UploadSetRenderer;
});

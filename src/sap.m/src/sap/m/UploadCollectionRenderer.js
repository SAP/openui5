/*!
 * ${copyright}
 */
sap.ui.define(['./ListItemBaseRenderer'], function(ListItemBaseRenderer) {
	"use strict";

	/**
	 * UploadCollection renderer.
	 * @namespace
	 */
	var UploadCollectionRenderer = {
		apiVersion: 2 // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.UploadCollection} oControl an object representation of the control that should be rendered
	 */
	UploadCollectionRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		oRm.openStart("div", oControl);
		oRm.class("sapMUC");
		oRm.openEnd();
		this.renderDragDropOverlay(oRm, oControl);
		this.renderList(oRm, oControl);
		oRm.close("div");
	};

	UploadCollectionRenderer.renderNoData = function(oRm, oControl) {
		// If noDataText or noDataDescription property are set by user, the user's text will be rendered.
		// If it is not set, the default no data text or description from resource bundle will be rendered.
		var oUploadCollection = oControl.getParent();
		oRm.openStart("li", oUploadCollection._oList.getId("nodata"));
		oRm.attr("tabindex", "0");
		oRm.attr("role", "option");
		ListItemBaseRenderer.addFocusableClasses.call(ListItemBaseRenderer, oRm);
		oRm.class("sapMLIB");
		oRm.class("sapMUCNoDataPage");
		oRm.openEnd();

		oRm.renderControl(oUploadCollection.getAggregation("_noDataIcon"));

		oRm.openStart("div", oUploadCollection.getId() + "-no-data-text");
		oRm.class("sapMUCNoDataText");
		oRm.openEnd();
		oRm.text(oUploadCollection.getNoDataText());
		oRm.close("div");

		if (oUploadCollection.getUploadEnabled()) {
			oRm.openStart("div", oUploadCollection.getId() + "-no-data-description");
			oRm.class("sapMUCNoDataDescription");
			oRm.openEnd();
			oRm.text(oUploadCollection.getNoDataDescription());
			oRm.close("div");
		}
		oRm.close("li");
	};

	UploadCollectionRenderer.renderDragDropOverlay = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-drag-drop-area");
		oRm.class("sapMUCDragDropOverlay");
		oRm.class("sapMUCDragDropOverlayHide");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapMUCDragDropIndicator");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("_dragDropIcon"));
		oRm.renderControl(oControl.getAggregation("_dragDropText"));
		oRm.close("div");
		oRm.close("div");
	};

	UploadCollectionRenderer.renderList = function(oRm, oControl) {
		var fnOriginal = oControl._oList.getRenderer().renderNoData;
		oControl._oList.getRenderer().renderNoData = this.renderNoData;
		oRm.renderControl(oControl._oList);
		oControl._oList.getRenderer().renderNoData = fnOriginal;
	};

	return UploadCollectionRenderer;

}, /* bExport= */ true);

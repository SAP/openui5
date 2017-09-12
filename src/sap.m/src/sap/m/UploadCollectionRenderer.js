/*!
 * ${copyright}
 */
sap.ui.define(['./ListItemBaseRenderer'], function(ListItemBaseRenderer) {
	"use strict";

	/**
	 * UploadCollection renderer.
	 * @namespace
	 */
	var UploadCollectionRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	UploadCollectionRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMUC");
		oRm.writeClasses();
		oRm.write(">");
		this.renderDragDropOverlay(oRm, oControl);
		this.renderList(oRm, oControl);
		oRm.write("</div>");
	};

	UploadCollectionRenderer.renderNoData = function(oRm, oControl) {
		// If noDataText or noDataDescription property are set by user, the user's text will be rendered.
		// If it is not set, the default no data text or description from resource bundle will be rendered.
		var oUploadCollection = oControl.getParent();
		oRm.write("<li");
		oRm.writeAttribute("tabindex", 0);
		oRm.writeAttribute("id", oUploadCollection._oList.getId("nodata"));
		oRm.addClass("sapMLIB sapMUCNoDataPage");
		ListItemBaseRenderer.addFocusableClasses.call(ListItemBaseRenderer, oRm);
		oRm.writeClasses();
		oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-page");
		oRm.write(">");

		oRm.renderControl(oUploadCollection.getAggregation("_noDataIcon"));

		oRm.write("<div");
		oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-text");
		oRm.addClass("sapMUCNoDataText");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oUploadCollection.getNoDataText());
		oRm.write("</div>");

		if (oUploadCollection.getUploadEnabled()) {
			oRm.write("<div");
			oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-description");
			oRm.addClass("sapMUCNoDataDescription");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(oUploadCollection.getNoDataDescription());
			oRm.write("</div>");
		}
		oRm.write("</li>");
	};

	UploadCollectionRenderer.renderDragDropOverlay = function(oRm, oControl) {
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
		oRm.renderControl(oControl.getAggregation("_dragDropIcon"));
		oRm.renderControl(oControl.getAggregation("_dragDropText"));
		oRm.write("</div>");
		oRm.write("</div>");
	};

	UploadCollectionRenderer.renderList = function(oRm, oControl) {
		var fnOriginal = oControl._oList.getRenderer().renderNoData;
		oControl._oList.getRenderer().renderNoData = this.renderNoData;
		oRm.renderControl(oControl._oList);
		oControl._oList.getRenderer().renderNoData = fnOriginal;
	};

	return UploadCollectionRenderer;

}, /* bExport= */ true);

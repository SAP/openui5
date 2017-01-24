/*!
* ${copyright}
*/
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/m/ListRenderer'],
	function(jQuery, Renderer, ListRenderer) {
	"use strict";


	/**
	* UploadCollection renderer.
	* @namespace
	*/
	var UploadCollectionRenderer = Renderer.extend(ListRenderer);

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
		ListRenderer.render.call(this, oRm, oControl._oList);
		oRm.write("</div>");
	};

	UploadCollectionRenderer.renderNoData = function(oRm, oControl) {
		// If noDataText or noDataDescription property are set by user, the user's text will be rendered.
		// If it is not set, the default no data text or description from resource bundle will be rendered.
		var oUploadCollection = oControl.getParent();
		oRm.write("<div");
		oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-page");
		oRm.addClass("sapMUCNoDataPage");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oUploadCollection.getAggregation("_noDataIcon"));

		oRm.write("<div");
		oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-text");
		oRm.addClass("sapMUCNoDataText");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oUploadCollection.getNoDataText());
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oUploadCollection.getId() + "-no-data-description");
		oRm.addClass("sapMUCNoDataDescription");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oUploadCollection.getNoDataDescription());
		oRm.write("</div>");
		oRm.write("</div>");
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

	return UploadCollectionRenderer;

}, /* bExport= */ true);

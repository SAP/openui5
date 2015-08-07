/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.Overlay
sap.ui.define(['sap/ui/dt/AggregationOverlay', 'sap/ui/dt/DOMUtil'],
	function(AggregationOverlay, DOMUtil) {
	"use strict";


	/**
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 */
	var OverlayRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 * @protected 
	 */
	OverlayRenderer.render = function(oRm, oOverlay) {
		if (oOverlay.getDomRef()) {
			oOverlay.$().empty();
			this._triggerOnAfterRenderingWithoutRendering(oRm, oOverlay);

			return;
		}

		oRm.addClass("sapUiDtOverlay");
		oRm.write("<div");
		oRm.writeControlData(oOverlay);
		oRm.write("data-sap-ui-dt-for='" + oOverlay.getElementInstance().getId() + "'");
		oRm.writeClasses();

		oRm.writeStyles();
		oRm.write(">");

		this._renderAggregationOverlays(oRm, oOverlay);

		oRm.write("</div>");
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 * @private 
	 */
	OverlayRenderer._renderAggregationOverlays = function(oRm, oOverlay) {
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			oRm.renderControl(oAggregationOverlay);
		});	
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 * @private 
	 */
	OverlayRenderer._triggerOnAfterRenderingWithoutRendering = function(oRm, oOverlay) {
		oRm.write("");
		this._renderAggregationOverlays(oRm, oOverlay);

		return;
	};

	return OverlayRenderer;

}, /* bExport= */ true);

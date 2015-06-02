/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.AggregationOverlay
sap.ui.define(['sap/ui/dt/DOMUtil'],
	function(DOMUtil) {
	"use strict";


	/**
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 */
	var AggregationOverlayRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay An object representation of the control that should be rendered.
	 * @protected
	 */
	AggregationOverlayRenderer.render = function(oRm, oAggregationOverlay) {
		if (oAggregationOverlay.getDomRef()) {
			oAggregationOverlay.$().empty();
			this._triggerOnAfterRenderingWithoutRendering(oRm, oAggregationOverlay);

			return;
		}

		oRm.addClass("sapUiDtAggregationOverlay");
		oRm.write("<div");
		oRm.writeControlData(oAggregationOverlay);
		oRm.write("data-sap-ui-dt-aggregation='" + oAggregationOverlay.getAggregationName() + "'");
		oRm.writeClasses();

		oRm.writeStyles();
		oRm.write(">");

		this._renderChildOverlays(oRm, oAggregationOverlay);

		oRm.write("</div>");
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay An object representation of the control that should be rendered.	
	 * @private
	 */
	AggregationOverlayRenderer._renderChildOverlays = function(oRm, oAggregationOverlay) {
		var aChildren = oAggregationOverlay.getChildren() || [];
		aChildren.forEach(function(oOverlay) {
			oRm.renderControl(oOverlay);
		});
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay An object representation of the control that should be rendered.	
	 * @private
	 */
	AggregationOverlayRenderer._triggerOnAfterRenderingWithoutRendering = function(oRm, oAggregationOverlay) {
		oRm.write("");
		this._renderChildOverlays(oRm, oAggregationOverlay);
	};

	return AggregationOverlayRenderer;

}, /* bExport= */ true);

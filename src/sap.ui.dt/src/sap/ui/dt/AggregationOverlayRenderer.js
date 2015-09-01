/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.AggregationOverlay
sap.ui.define(['sap/ui/dt/RenderingUtil'],
	function(RenderingUtil) {
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
		RenderingUtil.renderOverlay(oRm, oAggregationOverlay, "sapUiDtAggregationOverlay");
	};

	return AggregationOverlayRenderer;

}, /* bExport= */ true);

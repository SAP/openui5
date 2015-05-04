/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.Overlay
sap.ui.define(['sap/ui/dt/DOMUtil', 'sap/ui/dt/Utils'],
	function(DOMUtil, Utils) {
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
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 */
	AggregationOverlayRenderer.render = function(oRm, oAggregationOverlay) {
		var sAggregationName = oAggregationOverlay.getAggregationName();
		var oElementOverlay = oAggregationOverlay.getParent();
		var mElementOffset = oElementOverlay ? oElementOverlay.getOffset() : null;
		var oAggregationGeometry = oAggregationOverlay.getGeometry();

		if (!mElementOffset || !oAggregationGeometry) {
			return;
		}

		oRm.addClass("sapUiDtAggregationOverlay");
		oRm.write("<div");
		oRm.writeControlData(oAggregationOverlay);
		oRm.write("data-sap-ui-dt-aggregation='" + sAggregationName + "'");
		oRm.writeClasses();

		var mSize = oAggregationGeometry.size;
		var mPosition = DOMUtil.getOffsetFromParent(oAggregationGeometry.position, mElementOffset);
		oAggregationOverlay.setOffset({left : oAggregationGeometry.position.left, top: oAggregationGeometry.position.top});

		var iZIndex = DOMUtil.getZIndex(oAggregationGeometry.domRef);
		var oOverflows = DOMUtil.getOverflows(oAggregationGeometry.domRef);

		oRm.addStyle("width", mSize.width + "px");
		oRm.addStyle("height", mSize.height + "px");
		oRm.addStyle("top", mPosition.top + "px");
		oRm.addStyle("left", mPosition.left + "px");
		if (iZIndex) {
			oRm.addStyle("z-index", iZIndex);
		}
		if (oOverflows) {
			oRm.addStyle("overflow-x", oOverflows.overflowX);
			oRm.addStyle("overflow-y", oOverflows.overflowY);	
		}

		oRm.writeStyles();
		oRm.write(">");

		this._renderChildOverlays(oRm, oAggregationOverlay);

		oRm.write("</div>");
	};

	AggregationOverlayRenderer._renderChildOverlays = function(oRm, oAggregationOverlay) {
		var aChildren = oAggregationOverlay.getChildren() || [];
		aChildren.forEach(function(oOverlay) {
			oRm.renderControl(oOverlay);
		});
	};

	return AggregationOverlayRenderer;

}, /* bExport= */ true);

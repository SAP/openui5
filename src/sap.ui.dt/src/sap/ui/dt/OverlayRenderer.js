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
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 */
	OverlayRenderer.render = function(oRm, oOverlay) {
		var oElement = oOverlay.getElementInstance();
		var oElementGeometry = DOMUtil.getElementGeometry(oElement);

		if (!oElementGeometry) {
			return;
		}

		oRm.addClass("sapUiDtOverlay");
		oRm.write("<div");
		oRm.writeControlData(oOverlay);
		oRm.write("data-sap-ui-dt-for='" + oElement.getId() + "'");
		oRm.writeClasses();

		var mSize = oElementGeometry.size;
		var oOverlayParent = oOverlay.getParent();
		var mParentOffset = (oOverlayParent && oOverlayParent instanceof AggregationOverlay) ? oOverlayParent.getOffset() : null;
		var mPosition = DOMUtil.getOffsetFromParent(oElementGeometry.position, mParentOffset);
		oOverlay.setOffset({left : oElementGeometry.position.left, top: oElementGeometry.position.top});

		var iZIndex = DOMUtil.getZIndex(oElementGeometry.domRef);

		oRm.addStyle("width", mSize.width + "px");
		oRm.addStyle("height", mSize.height + "px");
		oRm.addStyle("top", mPosition.top + "px");
		oRm.addStyle("left", mPosition.left + "px");
		if (iZIndex) {
			oRm.addStyle("z-index", iZIndex);
		}

		oRm.writeStyles();
		oRm.write(">");

		this.renderAggregationOverlays(oRm, oOverlay);

		oRm.write("</div>");
	};


	OverlayRenderer.renderAggregationOverlays = function(oRm, oOverlay) {
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			oRm.renderControl(oAggregationOverlay);
		});	
	};

	return OverlayRenderer;

}, /* bExport= */ true);

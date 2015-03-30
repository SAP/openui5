/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.Overlay
sap.ui.define(['jquery.sap.global', 'sap/ui/dt/Overlay', 'sap/ui/dt/DOMUtil', 'sap/ui/dt/Utils'],
	function(jQuery, Overlay, DOMUtil, Utils) {
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
		if (!oElement || !oElement.getDomRef()) {
			return;
		}

		oRm.addClass("sapUiDtOverlay");
		oRm.write("<div");
		oRm.writeControlData(oOverlay);
		oRm.write("data-sap-ui-dt-for='" + oElement.getId() + "'");
		oRm.writeClasses();

		var oElementDomRef = oElement.getDomRef();
		var mSize = DOMUtil.getSize(oElementDomRef);
		var oOverlayParent = oOverlay.getParent();
		var oParentDomRef = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.getDomRef() : null;
		var mPosition = DOMUtil.getPosition(oElementDomRef, oParentDomRef);
		var iZIndex = DOMUtil.getZIndex(oElementDomRef);

		oRm.addStyle("width", mSize.width + "px");
		oRm.addStyle("height", mSize.height + "px");
		oRm.addStyle("top", mPosition.top + "px");
		oRm.addStyle("left", mPosition.left + "px");
		oRm.addStyle("z-index", iZIndex);

		oRm.writeStyles();
		oRm.write(">");

		this.renderPublicAggregations(oRm, oOverlay);

		oRm.write("</div>");
	};

	OverlayRenderer.renderChildOverlay = function(oRm, oOverlay, aAggregationElements) {
		jQuery.each(aAggregationElements, function(iIndex, oAggregationElement) {
			var oChildOverlay = Overlay.byId(oAggregationElement);
			if (oChildOverlay) {
				// Correct the parent relationship of the overlays
				oOverlay.addChild(oChildOverlay);
				oRm.renderControl(oChildOverlay);	
			}
		});
	};

	OverlayRenderer.renderPublicAggregations = function(oRm, oOverlay) {
		var oElement = oOverlay.getElementInstance();
		var oElementDomRef = oElement.getDomRef();
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

		var that = this;
		Utils.iterateOverAllPublicAggregations(oElement, function(oAggregation, aAggregationElements) {

			if (aAggregationElements.length > 0) {
				var sAggregationName = oAggregation.name;
				var oAggregationDomRef = DOMUtil.getDomRefForCSSSelector(oElement.getDomRef(), oDesignTimeMetadata.getAggregation(sAggregationName).cssSelector);

				oRm.write("<div class='sapUiDtAggregationOverlay' data-sap-ui-dt-aggregation='" + oAggregation.name + "'");

				if (oAggregationDomRef) {
					var mSize = DOMUtil.getSize(oAggregationDomRef);
					var mPosition = DOMUtil.getPosition(oAggregationDomRef, oElementDomRef);
					var iZIndex = DOMUtil.getZIndex(oAggregationDomRef);

					oRm.addStyle("width", mSize.width + "px");
					oRm.addStyle("height", mSize.height + "px");
					oRm.addStyle("top", mPosition.top + "px");
					oRm.addStyle("left", mPosition.left + "px");
					oRm.addStyle("z-index", iZIndex);
				}

				oRm.writeStyles();

				oRm.write(">");

				that.renderChildOverlay(oRm, oOverlay, aAggregationElements);
				oRm.write("</div>");	
			}
		}, null, Utils.getAggregationFilter());
	};

	return OverlayRenderer;

}, /* bExport= */ true);

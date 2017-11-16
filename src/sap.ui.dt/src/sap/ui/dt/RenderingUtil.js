/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.RenderingUtil.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	/**
	 * Class for RenderingUtil.
	 *
	 * @class
	 * Utility functionality to work with élements, e.g. iterate through aggregations, find parents, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.RenderingUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var RenderingUtil = {};

	/**
	 *
	 */
	RenderingUtil.renderOverlay = function(oRm, oOverlay, sClassName) {
		var oGeometry = oOverlay.getGeometry();
		var bGeometryVisible = oGeometry && oGeometry.visible;
		var bRenderOverlay = !oOverlay.getLazyRendering() || bGeometryVisible;

		if (oOverlay.isVisible() && bRenderOverlay) {
			if (oOverlay.getDomRef()) {
				this._triggerOnAfterRenderingWithoutRendering(oRm, oOverlay);

				return;
			}

			oRm.addClass("sapUiDtOverlay");
			oRm.addClass(sClassName);
			oRm.write("<div");
			oRm.writeControlData(oOverlay);
			var sAggregationName = oOverlay.getAggregationName && oOverlay.getAggregationName();
			if (sAggregationName) {
				oRm.write("data-sap-ui-dt-aggregation='" + oOverlay.getAggregationName() + "'");
			} else {
				oRm.write("data-sap-ui-dt-for='" + oOverlay.getElementInstance().getId() + "'");
			}
			oRm.writeClasses();

			oRm.writeStyles();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapUiDtOverlayChildren");
			oRm.writeClasses();
			oRm.write(">");
			this._renderChildren(oRm, oOverlay);

			oRm.write("</div>");
			oRm.write("</div>");
		}

	};

	/**
	 */
	RenderingUtil._renderChildren = function(oRm, oOverlay) {
		var aChildrenOverlays = oOverlay.getChildren();
		if (oOverlay._aScrollContainers) {
			oOverlay._aScrollContainers.forEach(function(oScrollContainer, iIndex) {
				oRm.write("<div");
				oRm.addClass("sapUiDtOverlayScrollContainer");
				oRm.writeClasses();
				oRm.write("data-sap-ui-dt-scrollContainerIndex='" + iIndex + "'");
				oRm.write(">");

				if (oScrollContainer.aggregations) {
					oScrollContainer.aggregations.forEach(function(sAggregationName) {
						var oAggregationOverlay = oOverlay.getAggregationOverlay(sAggregationName);
						if (oAggregationOverlay){
							//ensure it is available, it might be ignored
							oRm.renderControl(oAggregationOverlay);
							aChildrenOverlays.splice(aChildrenOverlays.indexOf(oAggregationOverlay), 1);
						}
					});
				}
				oRm.write("</div>");
			});
		}

		aChildrenOverlays.forEach(function(oChildOverlay) {
			oRm.renderControl(oChildOverlay);
		});
	};

	/**
	 */
	RenderingUtil._rerenderControls = function(oRm, oOverlay) {
		var aChildrenOverlays = oOverlay.getChildren();
		aChildrenOverlays.forEach(function(oChildOverlay) {
			oRm.renderControl(oChildOverlay);
		});
	};

	/**
	 */
	RenderingUtil._triggerOnAfterRenderingWithoutRendering = function(oRm, oOverlay) {
		// to trigger after rendering without rendering we need to write something in a renderManager buffer
		oRm.write("");
		this._rerenderControls(oRm, oOverlay);
	};

	return RenderingUtil;
}, /* bExport= */ true);

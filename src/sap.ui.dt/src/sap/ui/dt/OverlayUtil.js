/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayUtil.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementUtil'
],
function(jQuery, OverlayRegistry, ElementUtil) {
	"use strict";

	/**
	 * Class for Overlay Util.
	 * 
	 * @class
	 * Utility functionality to work with overlays
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var OverlayUtil = {};

	/**
	 * 
	 */
	OverlayUtil.getClosestOverlayFor = function(oElement) {
		var oParent = oElement.getParent();
		var oParentOverlay = OverlayRegistry.getOverlay(oParent);
		while (oParent && !oParentOverlay) {
			oParent = oParent.getParent();
			oParentOverlay = OverlayRegistry.getOverlay(oParent);
		}

		return oParentOverlay;
	};

	/**
	 * 
	 */
	OverlayUtil.getGeometry = function(aGeometry) {
		var minLeft, maxRight, minTop, maxBottom;
		aGeometry.forEach(function(oElementGeometry) {
			if (oElementGeometry) {
				if (!minLeft || oElementGeometry.position.left < minLeft) {
					minLeft = oElementGeometry.position.left;
				}
				if (!minTop || oElementGeometry.position.top < minTop) {
					minTop = oElementGeometry.position.top;
				}

				var iRight = oElementGeometry.position.left + oElementGeometry.size.width;
				if (!maxRight || iRight > maxRight) {
					maxRight = iRight;
				}
				var iBottom = oElementGeometry.position.top + oElementGeometry.size.height;
				if (!maxBottom || iBottom > maxBottom) {
					maxBottom = iBottom;
				}
			}
		});

		if (typeof minLeft === "number") {
			return {
				size : {
					width : maxRight - minLeft,
					height : maxBottom - minTop
				},
				position : {
					left : minLeft,
					top : minTop
				}
			};
		}		
	};

	/**
	 * 
	 */
	OverlayUtil.getClosestOverlayForType = function(sType, oOverlay) {
		while (oOverlay && !ElementUtil.isInstanceOf(oOverlay.getElementInstance(), sType)) {
			oOverlay = oOverlay.getParentOverlay();
		}

		return oOverlay;
	};

	/**
	 * 
	 */
	OverlayUtil.getClosestScrollable = function(oOverlay) {
		oOverlay = oOverlay.getParent();
		while (oOverlay && oOverlay.isScrollable && !oOverlay.isScrollable()) {
			oOverlay = oOverlay.getParent();
		}

		return oOverlay && oOverlay.isScrollable ? oOverlay : null;
	};

	return OverlayUtil;
}, /* bExport= */ true);

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
		if (!oElement || !oElement.getParent) {
			return null;
		}
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
		if (!oOverlay) {
			return;
		}
		
		oOverlay = oOverlay.getParent();
		while (oOverlay && oOverlay.isScrollable && !oOverlay.isScrollable()) {
			oOverlay = oOverlay.getParent();
		}

		return oOverlay && oOverlay.isScrollable ? oOverlay : null;
	};

	/**
	 * 
	 */
	OverlayUtil.getFirstChildOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}
		
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		if (aAggregationOverlays.length > 0) {
			for (var i = 0; i < aAggregationOverlays.length; i++) {
				var oAggregationOverlay = aAggregationOverlays[i];
				var aChildren = oAggregationOverlay.getChildren();
				if (aChildren.length > 0) {
					return aChildren[0];
				}
			}
		}
	};

	/**
	 * 
	 */
	OverlayUtil.getLastChildOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}
		
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		if (aAggregationOverlays.length > 0) {
			for (var i = 0; i < aAggregationOverlays.length; i++) {
				var oAggregationOverlay = aAggregationOverlays[i];
				var aChildren = oAggregationOverlay.getChildren();
				if (aChildren.length > 0) {
					return aChildren[aChildren.length - 1];
				}
			}
		}
	};

	/**
	 * 
	 */
	OverlayUtil.getPreviousSiblingOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}
		
		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			var aAggregationOverlays = oParentAggregationOverlay.getChildren();
			var iIndex = aAggregationOverlays.indexOf(oOverlay);
			if (iIndex > 0) {
				return aAggregationOverlays[iIndex - 1];
			}
		}
	};

	/**
	 * 
	 */
	OverlayUtil.getNextSiblingOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}

		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			var aAggregationOverlays = oParentAggregationOverlay.getChildren();
			var iIndex = aAggregationOverlays.indexOf(oOverlay);
			if (iIndex !== aAggregationOverlays.length - 1) {
				return aAggregationOverlays[iIndex + 1];
			}
		}
	};

	/**
	 * 
	 */
	OverlayUtil.getNextOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}

		var oFirstChildOverlay = this.getFirstChildOverlay(oOverlay);
		if (oFirstChildOverlay) {
			return oFirstChildOverlay;
		}

		var oNextSiblingOverlay = this.getNextSiblingOverlay(oOverlay);
		if (oNextSiblingOverlay) {
			return oNextSiblingOverlay;
		}

		do {
			oOverlay = oOverlay.getParentOverlay();
			oNextSiblingOverlay = this.getNextSiblingOverlay(oOverlay);
		} while (oOverlay && !oNextSiblingOverlay);

		return oNextSiblingOverlay;
	};

	/**
	 * 
	 */
	OverlayUtil.getPreviousOverlay = function(oOverlay) {
		if (!oOverlay) {
			return;
		}

		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (!oParentAggregationOverlay) {
			return;
		}

		var oPreviousSiblingOverlay = this.getPreviousSiblingOverlay(oOverlay);
		if (oPreviousSiblingOverlay) {
			var oLastChildOverlay = oPreviousSiblingOverlay;
			do {
				oPreviousSiblingOverlay = oLastChildOverlay;
				oLastChildOverlay = this.getLastChildOverlay(oPreviousSiblingOverlay);
			} while (oLastChildOverlay);

			return oPreviousSiblingOverlay;
		}

		return oOverlay.getParentOverlay();
	};

	/**
	 * 
	 */
	OverlayUtil.getRootOverlay = function(oOverlay) {
		var oParentOverlay = oOverlay;
		do {
			oOverlay = oParentOverlay;
			oParentOverlay = oOverlay.getParentOverlay();
		} while (oParentOverlay);

		return oOverlay;
	};

	return OverlayUtil;
}, /* bExport= */ true);

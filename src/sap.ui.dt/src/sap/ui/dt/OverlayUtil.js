/*
 * ! ${copyright}
 */

// Provides object sap.ui.dt.OverlayUtil.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/dt/OverlayRegistry', 'sap/ui/dt/ElementUtil'
], function(jQuery, OverlayRegistry, ElementUtil) {
	"use strict";

	/**
	 * Class for Overlay Util.
	 *
	 * @class Utility functionality to work with overlays
	 * @author SAP SE
	 * @version ${version}
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
	OverlayUtil.isInTargetZoneAggregation = function(oElementOverlay) {
		var oAggregationOverlay = oElementOverlay.getParent();
		return oAggregationOverlay && oAggregationOverlay.isTargetZone && oAggregationOverlay.isTargetZone();
	};

	/**
	 * Returns an object with public parent, aggregation in public parent and direct index
	 */
	OverlayUtil.getParentInformation = function(oElementOverlay) {
		var oParentOverlay = oElementOverlay.getParentElementOverlay();
		if (oParentOverlay){
			//calculate index in direct (maybe in hidden tree) parent
			var oParent = oParentOverlay.getElementInstance();
			var sParentAggregationName = oElementOverlay.getParentAggregationOverlay().getAggregationName();
			var aChildren = ElementUtil.getAggregation(oParent, sParentAggregationName);
			var oElement = oElementOverlay.getElementInstance();
			var iIndex = aChildren.indexOf(oElement);

			return {
				parent: oParent,
				aggregation : sParentAggregationName,
				index: iIndex
			};
		} else {
			return {
				parent: null,
				aggregation: "",
				index: -1
			};
		}

	};

	/**
	 *
	 */
	OverlayUtil.getClosestOverlayFor = function(oElement) {
		if (!oElement) {
			return null;
		}

		var oParent = oElement;
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
				size: {
					width: maxRight - minLeft,
					height: maxBottom - minTop
				},
				position: {
					left: minLeft,
					top: minTop
				},
				visible : true
			};
		}
	};

	/**
	 *
	 */
	OverlayUtil.getClosestOverlayForType = function(sType, oOverlay) {
		while (oOverlay && !ElementUtil.isInstanceOf(oOverlay.getElementInstance(), sType)) {
			oOverlay = oOverlay.getParentElementOverlay();
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
	 * Returns first descendant of given ElementOverlay which fulfills
	 * the given condition. Recursive function
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @param {function} fnCondition - condition to search
	 * @returns {sap.ui.dt.ElementOverlay} overlay which fulfills the condition otherwise it returns 'undefined'
	 * @private
	 */
	OverlayUtil.getFirstDescendantByCondition = function(oOverlay, fnCondition) {
		if (!fnCondition) {
			throw new Error("expected condition is 'undefined' or not a function");
		}
		var aChildrenOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
		for (var i = 0, n = aChildrenOverlays.length; i < n; i++) {
			var oChildOverlay = aChildrenOverlays[i];
			if (fnCondition(oChildOverlay)) {
				return oChildOverlay;
			}
			var oDescendantOverlay = this.getFirstDescendantByCondition(oChildOverlay, fnCondition);
			if (oDescendantOverlay) {
				return oDescendantOverlay;
			}
		}
		return undefined;
	};

	/**
	 * Returns all overlay children as ElementOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @returns {array} array of child overlays {sap.ui.dt.ElementOverlay}
	 * @private
	 */
	OverlayUtil.getAllChildOverlays = function(oOverlay) {
		var aChildOverlays = [], aChildren = [];
		if (!oOverlay) {
			return aChildOverlays;
		}
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		for (var i = 0; i < aAggregationOverlays.length; i++) {
			aChildren = aAggregationOverlays[i].getChildren();
			if (aChildren && aChildren.length > 0) {
				aChildOverlays = aChildOverlays.concat(aChildren);
			}
		}
		return aChildOverlays;
	};

	/**
	 * Returns first child overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @returns {sap.ui.dt.ElementOverlay} first child overlays
	 * @private
	 */
	OverlayUtil.getFirstChildOverlay = function(oOverlay) {
		var aChildren = this.getAllChildOverlays(oOverlay);
		if (aChildren.length) {
			return aChildren[0];
		}
		return undefined;
	};

	/**
	 * Returns last child overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @returns {sap.ui.dt.ElementOverlay} last child overlays
	 * @private
	 */
	OverlayUtil.getLastChildOverlay = function(oOverlay) {
		var aChildren = this.getAllChildOverlays(oOverlay);
		if (aChildren.length) {
			return aChildren[aChildren.length - 1];
		}
		return undefined;
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
			// get next sibling in the same aggregation
			if (iIndex !== aAggregationOverlays.length - 1) {
				return aAggregationOverlays[iIndex + 1];
			} else if (iIndex === aAggregationOverlays.length - 1) {
				// get next sibling from next aggregation in the same parent
				var oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getAggregationOverlays();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) + 1; iIndex < aAggregationOverlays.length; iIndex++) {
					var aOverlays = aAggregationOverlays[iIndex].getChildren();
					if (aOverlays.length) {
						return aOverlays[0];
					}
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
			// get previous sibling from the same aggregation
			if (iIndex > 0) {
				return aAggregationOverlays[iIndex - 1];
			} else if (iIndex === 0) {
				// get previous sibling from previous aggregation in the same parent
				var oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getAggregationOverlays();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) - 1; iIndex >= 0; iIndex--) {
					var aOverlays = aAggregationOverlays[iIndex].getChildren();
					if (aOverlays.length) {
						return aOverlays[aOverlays.length - 1];
					}
				}
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
			oOverlay = oOverlay.getParentElementOverlay();
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

		return oOverlay.getParentElementOverlay();
	};

	/**
	 *
	 */
	OverlayUtil.getRootOverlay = function(oOverlay) {
		var oParentOverlay = oOverlay;
		do {
			oOverlay = oParentOverlay;
			oParentOverlay = oOverlay.getParentElementOverlay();
		} while (oParentOverlay);

		return oOverlay;
	};

	/**
	 *
	 */
	OverlayUtil.iterateOverlayElementTree = function(oElementOverlay, fnCallback) {
		fnCallback(oElementOverlay);

		oElementOverlay.getAggregationOverlays().forEach(function(oAggregationOverlay) {
			oAggregationOverlay.getChildren().forEach(function(oChildOverlay) {
				this.iterateOverlayElementTree(oChildOverlay, fnCallback);
			}, this);
		}, this);
	};

	/**
	 *
	 */
	OverlayUtil.iterateOverlayTree = function(oOverlay, fnCallback) {
		fnCallback(oOverlay);

		oOverlay.getChildren().forEach(function(oChildOverlay) {
			this.iterateOverlayTree(oChildOverlay, fnCallback);
		}, this);
	};


	/**
	 *
	 */
	OverlayUtil.isInOverlayContainer = function(oNode) {
		if (oNode && jQuery(oNode).closest(".sapUiDtOverlay, #overlay-container").length) {
			return true;
		}
	};

	/**
	 *
	 */
	OverlayUtil.getClosestOverlayForNode = function(oNode) {
		var oElement = ElementUtil.getClosestElementForNode(oNode);
		return OverlayUtil.getClosestOverlayFor(oElement);
	};

	return OverlayUtil;
}, /* bExport= */true);

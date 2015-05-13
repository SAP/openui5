/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DOMUtil.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/ElementUtil'
],
function(jQuery, ElementUtil) {
	"use strict";

	/**
	 * Class for DOM Utils.
	 * 
	 * @class
	 * Utility functionality for DOM
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.DOMUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DOMUtil = {};

	DOMUtil.getSize = function(oDomRef) {
		return {
			width : oDomRef.offsetWidth,
			height : oDomRef.offsetHeight
		};
	};

	DOMUtil.getOffsetFromParent = function(oPosition, mParentOffset) {
		var mOffset = {
			left : oPosition.left,
			top : oPosition.top
		};
		
		if (mParentOffset) {
			mOffset.left -= mParentOffset.left;
			mOffset.top -= mParentOffset.top;
		}
		return mOffset;
	};

	DOMUtil.getZIndex = function(oDomRef) {
		var zIndex;
		var $ElementDomRef = jQuery(oDomRef);
		if ($ElementDomRef.length) {
			zIndex = $ElementDomRef.zIndex() || $ElementDomRef.css("z-index");
		}
		return zIndex;
	};

	DOMUtil.getOverflows = function(oDomRef) {
		var oOverflows;
		var $ElementDomRef = jQuery(oDomRef);
		if ($ElementDomRef.length) {
			oOverflows = {};
			oOverflows.overflowX = $ElementDomRef.css("overflow-x");
			oOverflows.overflowY = $ElementDomRef.css("overflow-y");
		}
		return oOverflows;
	};

	DOMUtil.getChildrenAreaGeometry = function(aElements) {
		var that = this;
		if (!aElements) {
			return;
		}

		var minLeft, maxRight, minTop, maxBottom;
		jQuery.each(aElements, function(index, oElement) {
			var oElementGeometry = that.getElementGeometry(oElement);
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

	DOMUtil.getDomGeometry = function(oDomRef) {
		if (oDomRef) {
			return {
				domRef : oDomRef,
				size : this.getSize(oDomRef),
				position :  jQuery(oDomRef).offset()
			};
		}
	};

	DOMUtil.getElementGeometry = function(oElement) {
		var oDomRef;
		if (!oElement) { 
			return;
		}
		
		if (oElement.getDomRef) {
			oDomRef = oElement.getDomRef();
		}
		if (!oDomRef && oElement.getRenderedDomRef) {
			oDomRef = oElement.getRenderedDomRef();
		}
		if (!oDomRef)  {
			var aFoundElements = ElementUtil.findAllPublicChildren(oElement);
			return this.getChildrenAreaGeometry(aFoundElements);
		} else {
			return this.getDomGeometry(oDomRef);
		}

	};

	DOMUtil.getDomRefForCSSSelector = function(oDomRef, sCSSSelector) {
		if (!sCSSSelector) {
			return false;
		}

		if (sCSSSelector === ":sap-domref") {
			return oDomRef;
		}
		// ":sap-domref > sapMPage" scenario
		if (sCSSSelector.indexOf(":sap-domref") > -1) {
			return document.querySelector(sCSSSelector.replace(":sap-domref", "#" + this.getEscapedString(oDomRef.id)));
		}
		return oDomRef ? oDomRef.querySelector(sCSSSelector) : undefined;
	};

	DOMUtil.getAggregationGeometryForCSSSelector = function(oDomRef, sCSSSelector) {
		return this.getDomGeometry(this.getDomRefForCSSSelector(oDomRef, sCSSSelector));
	};

	DOMUtil.getEscapedString = function(sString) {
		return sString.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
	};

	DOMUtil.setDraggable = function($element, bValue) {
		$element.attr("draggable", bValue);
	};

	return DOMUtil;
}, /* bExport= */ true);
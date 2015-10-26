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
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.DOMUtil
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DOMUtil = {};

	/**
	 *
	 */
	DOMUtil.getSize = function(oDomRef) {
		return {
			width : oDomRef.offsetWidth,
			height : oDomRef.offsetHeight
		};
	};

	/**
	 *
	 */
	DOMUtil.getOffsetFromParent = function(oPosition, mParentOffset, scrollTop, scrollLeft) {
		var mOffset = {
			left : oPosition.left,
			top : oPosition.top
		};

		if (mParentOffset) {
			mOffset.left -= (mParentOffset.left - (scrollLeft ? scrollLeft : 0));
			mOffset.top -= (mParentOffset.top - (scrollTop ? scrollTop : 0));
		}
		return mOffset;
	};

	/**
	 *
	 */
	DOMUtil.getZIndex = function(oDomRef) {
		var zIndex;
		var $ElementDomRef = jQuery(oDomRef);
		if ($ElementDomRef.length) {
			zIndex = $ElementDomRef.zIndex() || $ElementDomRef.css("z-index");
		}
		return zIndex;
	};

	/**
	 *
	 */
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

	/**
	 *
	 */
	DOMUtil.getGeometry = function(oDomRef) {
		if (oDomRef) {
			return {
				domRef : oDomRef,
				size : this.getSize(oDomRef),
				position :  jQuery(oDomRef).offset()
			};
		}
	};

	/**
	 *
	 */
	DOMUtil.syncScroll = function(oSourceDom, oTargetDom) {
		var $target = jQuery(oTargetDom);
		var oTargetScrollTop = $target.scrollTop();
		var oTargetScrollLeft = $target.scrollLeft();

		var $source = jQuery(oSourceDom);
		var oSourceScrollTop = $source.scrollTop();
		var oSourceScrollLeft = $source.scrollLeft();

		if (oSourceScrollTop !== oTargetScrollTop) {
			$target.scrollTop(oSourceScrollTop);
		}
		if (oSourceScrollLeft !== oTargetScrollLeft) {
			$target.scrollLeft(oSourceScrollLeft);
		}
	};

	/**
	 *
	 */
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

	/**
	 *
	 */
	DOMUtil.getEscapedString = function(sString) {
		return sString.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
	};

	/**
	 *
	 */
	DOMUtil.setDraggable = function(oElement, bValue) {
		oElement = jQuery(oElement);

		oElement.attr("draggable", bValue);
	};

	/**
	 *
	 */
	DOMUtil.copyComputedStyle = function(oSrc, oDest) {
		var fnCopyStylesTo = function(mStyles, oDest) {
			for ( var sStyle in mStyles ) {
				try {
					// Do not use `hasOwnProperty`, nothing will get copied
					if ( typeof sStyle == "string" && sStyle != "cssText" && !/\d/.test(sStyle) && sStyle.indexOf("margin") === -1 ) {
						oDest.style[sStyle] = mStyles[sStyle];
						// `fontSize` comes before `font` If `font` is empty, `fontSize` gets
						// overwritten.  So make sure to reset this property. (hackyhackhack)
						// Other properties may need similar treatment
						if ( sStyle == "font" ) {
							oDest.style.fontSize = mStyles.fontSize;
						}
					}
				/*eslint-disable no-empty */
				} catch (exc) {
					// readonly properties must not through an error
				}
				/*eslint-enable no-empty */
			}
		};

		oSrc = jQuery(oSrc).get(0);
		oDest = jQuery(oDest).get(0);

		var mStyles = window.getComputedStyle(oSrc);
		fnCopyStylesTo(mStyles, oDest);

		// copy styles fro pseudo elements as well, if they exist (have content)
		// pseudo elements can't be inserted via js, so we should create a real elements, which copy pseudo styling
		mStyles = window.getComputedStyle(oSrc, ":after");
		var sContent = mStyles.getPropertyValue("content");
		if (sContent && sContent !== "none") {
			var oAfterElement = jQuery("<span></span>").appendTo(oDest);
			oAfterElement.text(sContent.replace(/\"/g, ""));
			fnCopyStylesTo(mStyles, oAfterElement.get(0));
			oAfterElement.css("display", "inline");
		}

		mStyles = window.getComputedStyle(oSrc, ":before");
		sContent = mStyles.getPropertyValue("content");
		if (sContent && sContent !== "none") {
			var oBeforeElement = jQuery("<span></span>").prependTo(oDest);
			oBeforeElement.text(sContent.replace(/\"/g, ""));
			fnCopyStylesTo(mStyles, oBeforeElement.get(0));
			oBeforeElement.css("display", "inline");
		}

	};

	/**
	 *
	 */
	DOMUtil.copyComputedStylesForDOM = function(oSrc, oDest) {
		oSrc = jQuery(oSrc).get(0);
		oDest = jQuery(oDest).get(0);

		for (var i = 0; i < oSrc.children.length; i++) {
			this.copyComputedStylesForDOM(oSrc.children[i], oDest.children[i]);
		}
		jQuery(oDest).removeClass();
		this.copyComputedStyle(oSrc, oDest);
	};

	/**
	 *
	 */
	DOMUtil.cloneDOMAndStyles = function(oNode, oTarget) {
		oNode = jQuery(oNode).get(0);
		oTarget = jQuery(oTarget).get(0);

		var oCopy = oNode.cloneNode(true);
		this.copyComputedStylesForDOM(oNode, oCopy);

		var $copy = jQuery(oCopy);

		jQuery(oTarget).append($copy);
	};

	return DOMUtil;
}, /* bExport= */ true);
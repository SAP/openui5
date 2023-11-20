/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DOMUtil.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/dom/jquery/zIndex",
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	Localization,
	jQuery,
	Device
) {
	"use strict";

	/**
	 * Utility functionality for DOM operations.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DOMUtil
	 */

	var DOMUtil = {};

	/**
	 * Returns the offset for an element
	 * Replaces the jQuery method offset
	 * @param {HTMLElement} oElement - Element
	 * @returns {PositionObject} the calculated offset containing left and top values
	 */
	DOMUtil.getOffset = function(oElement) {
		var oBox = oElement.getBoundingClientRect();
		var oDocElement = document.documentElement;
		return {
			top: oBox.top + window.scrollY - oDocElement.clientTop,
			left: oBox.left + window.scrollX - oDocElement.clientLeft
		};
	};

	/**
	 * Returns the parents for an element
	 * Replaces the jQuery method parents
	 * @param {HTMLElement} oElement - Element
	 * @param {string} sSelector - jQuery (CSS-like) selector to search for
	 * @returns {Array} aParents - Array containing Parents which match selector
	 */
	DOMUtil.getParents = function(oElement, sSelector) {
		var aParents = [];
		while ((oElement = oElement.parentNode) && oElement !== document) {
			if (!sSelector || oElement.matches(sSelector)) {
				aParents.unshift(oElement);
			}
		}
		return aParents;
	};

	DOMUtil.getSize = function(oDomRef) {
		var oClientRec = oDomRef.getBoundingClientRect();
		return {
			width: oClientRec.width,
			height: oClientRec.height
		};
	};

	/**
	 * Returns the offset for an element based on the parent position and scrolling
	 * @typedef {object} SizeObject
	 * @property {number} width - Element width
	 * @property {number} height - Element height
	 * @typedef {object} PositionObject
	 * @property {number} left - Element left coordinate
	 * @property {number} top - Element top coordinate
	 * @typedef {object} GeometryObject
	 * @property {SizeObject} size - Element size
	 * @property {PositionObject} position - Element position
	 * @property {boolean} visible - Element visibility
	 * @param {GeometryObject} oGeometry - Position object containing left and top values
	 * @param {HTMLElement} oParent - Parent element
	 * @returns {PositionObject} the calculated offset containing left and top values
	 */
	DOMUtil.getOffsetFromParent = function(oGeometry, oParent) {
		var iScrollTop = oParent ? oParent.scrollTop : null;
		var iScrollLeft = oParent ? DOMUtil.getScrollLeft(oParent) : null;

		var mParentOffset = oParent ? this.getOffset(oParent) : null;

		var mOffset = {
			left: oGeometry.position.left,
			top: oGeometry.position.top
		};

		if (mParentOffset) {
			mOffset.left -= (mParentOffset.left - (iScrollLeft || 0));
			mOffset.top -= (mParentOffset.top - (iScrollTop || 0));
		}

		if (Localization.getRTL()) {
			var iParentWidth = oParent ? oParent.offsetWidth : window.innerWidth;
			// TODO: Workaround - remove when bug in Safari (issue 336512063) is solved
			if (Device.browser.safari && !Device.browser.mobile && DOMUtil.hasVerticalScrollBar(oParent)) {
				mOffset.left -= DOMUtil.getScrollbarWidth();
			}
			// Workaround end
			mOffset.left = mOffset.left - (iParentWidth - oGeometry.size.width);
		}

		return mOffset;
	};

	/**
	 * TEMPORARY METHOD - Remove when browser behavior is consistent accross the board
	 * The specification for the behavior of scrollLeft values in Right-to-Left (RTL)
	 * is still in draft, so different browsers calculate it differently.
	 * We return the result from Webkit/Gecko, which is becoming the standard.
	 * @param {HTMLElement} oElement - Element to read scrollLeft from
	 * @returns {number} browser agnostic scrollLeft value (negative in RTL)
	 */
	DOMUtil.getScrollLeft = function(oElement) {
		if (
			!Localization.getRTL()
			|| !DOMUtil.hasHorizontalScrollBar(oElement)
		) {
			return oElement.scrollLeft;
		}

		var iScrollLeftRTL = jQuery(oElement).scrollLeftRTL();

		// jQuery scrollLeftRTL function considers zero scrollLeft when the scrollBar is all the way to the left
		// and moves positively to the right
		var iMaxScrollValue = oElement.scrollWidth - oElement.clientWidth;
		return iScrollLeftRTL - iMaxScrollValue;
	};

	DOMUtil.getZIndex = function(oDomRef) {
		var zIndex;
		var $ElementDomRef = jQuery(oDomRef);
		if ($ElementDomRef.length) {
			zIndex = $ElementDomRef.zIndex() || $ElementDomRef.css("z-index");
		}
		return zIndex;
	};

	DOMUtil._getElementDimensions = function(oDomRef, sMeasure, aDirection) {
		var oRelevantDomRef = oDomRef[0] || oDomRef;
		var iOffsetWidth = oRelevantDomRef[`offset${sMeasure}`];
		var iValue = 0;
		for (var i = 0; i < 2; i++) {
			// remove border
			var sBorderMeasure = window.getComputedStyle(oRelevantDomRef, null)[`border${aDirection[ i ]}${sMeasure}`];
			iValue -= sBorderMeasure ? parseInt(sBorderMeasure.slice(0, -2)) : 0;
		}
		return iOffsetWidth + iValue;
	};

	DOMUtil._getElementWidth = function(oDomRef) {
		return DOMUtil._getElementDimensions(oDomRef, "Width", ["Right", "Left"]);
	};

	DOMUtil._getElementHeight = function(oDomRef) {
		return DOMUtil._getElementDimensions(oDomRef, "Height", ["Top", "Bottom"]);
	};

	/**
	 * Checks whether DOM Element has vertical scrollbar
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @returns {boolean} <code>true</code> if vertical scrollbar is available on DOM Element.
	 */
	DOMUtil.hasVerticalScrollBar = function(oDomRef) {
		if (oDomRef) {
			var bOverflowYScroll = window.getComputedStyle(oDomRef)["overflow-y"] === "auto" || window.getComputedStyle(oDomRef)["overflow-y"] === "scroll";
			return bOverflowYScroll && oDomRef.scrollHeight > DOMUtil._getElementHeight(oDomRef);
		}
		return false;
	};

	/**
	 * Checks whether DOM Element has horizontal scrollbar
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @returns {boolean} <code>true</code> if horizontal scrollbar is available on DOM Element
	 */
	DOMUtil.hasHorizontalScrollBar = function(oDomRef) {
		if (oDomRef) {
			var bOverflowXScroll = window.getComputedStyle(oDomRef)["overflow-x"] === "auto" || window.getComputedStyle(oDomRef)["overflow-x"] === "scroll";
			return bOverflowXScroll && oDomRef.scrollWidth > DOMUtil._getElementWidth(oDomRef);
		}
		return false;
	};

	/**
	 * Checks whether DOM Element has vertical or horizontal scrollbar
	 * @param {HTMLElement} oDomRef - DOM element
	 * @returns {boolean} <code>true</code> if the DOM element has a scrollbar
	 */
	DOMUtil.hasScrollBar = function(oDomRef) {
		return DOMUtil.hasVerticalScrollBar(oDomRef) || DOMUtil.hasHorizontalScrollBar(oDomRef);
	};

	/**
	 * Gets scrollbar width in the running browser
	 * @returns {number} returns width in pixels
	 */
	DOMUtil.getScrollbarWidth = function() {
		if (typeof DOMUtil.getScrollbarWidth._cache === "undefined") {
			// add outer div
			var oOuter = document.createElement("div");
			oOuter.style.position = "absolute";
			oOuter.style.top = "-9999px";
			oOuter.style.left = "-9999px";
			oOuter.style.width = "100px";
			document.body.append(oOuter);

			var iWidthNoScroll = oOuter.offsetWidth;
			oOuter.style.overflow = "scroll";

			// add inner div
			var oInner = document.createElement("div");
			oInner.style.width = "100%";
			oOuter.append(oInner);

			var iWidthWithScroll = oInner.offsetWidth;

			// clean up
			oOuter.remove();

			DOMUtil.getScrollbarWidth._cache = iWidthNoScroll - iWidthWithScroll;
		}

		return DOMUtil.getScrollbarWidth._cache;
	};

	/**
	 * @param {HTMLElement} oDomRef - DOM element
	 * @returns {object} Object with overflowX and overflowY
	 */
	DOMUtil.getOverflows = function(oDomRef) {
		return {
			overflowX: window.getComputedStyle(oDomRef)["overflow-x"],
			overflowY: window.getComputedStyle(oDomRef)["overflow-y"]
		};
	};

	DOMUtil.getGeometry = function(oDomRef, bUseWindowOffset) {
		if (oDomRef) {
			var oOffset = this.getOffset(oDomRef);
			if (bUseWindowOffset) {
				oOffset.left = oOffset.left - window.scrollX;
				oOffset.top = oOffset.top - window.scrollY;
			}

			return {
				domRef: oDomRef,
				size: this.getSize(oDomRef),
				position: oOffset,
				visible: this.isVisible(oDomRef)
			};
		}
		return undefined;
	};

	DOMUtil.syncScroll = function(oSourceDom, oTargetDom) {
		var oTargetScrollTop = oTargetDom.scrollTop;
		var oTargetScrollLeft = oTargetDom.scrollLeft;
		var oSourceScrollTop = oSourceDom.scrollTop;
		var oSourceScrollLeft = oSourceDom.scrollLeft;

		if (oSourceScrollTop !== oTargetScrollTop) {
			oTargetDom.scrollTop = oSourceScrollTop;
		}

		if (oSourceScrollLeft !== oTargetScrollLeft) {
			oTargetDom.scrollLeft = oSourceScrollLeft;
		}
	};

	/**
	 * returns jQuery object found in oDomRef for sCSSSelector
	 * @param {Element|jQuery} oDomRef - to search in
	 * @param {string} sCSSSelector - jQuery (CSS-like) selector to look for
	 * @returns {jQuery} found domRef
	 */
	DOMUtil.getDomRefForCSSSelector = function(oDomRef, sCSSSelector) {
		if (sCSSSelector && oDomRef) {
			var $domRef = jQuery(oDomRef);

			if (sCSSSelector === ":sap-domref") {
				return $domRef;
			}

			// ":sap-domref > sapMPage" scenario
			if (sCSSSelector.indexOf(":sap-domref") > -1) {
				return $domRef.find(sCSSSelector.replace(/:sap-domref/g, ""));
			}

			// normal selector
			return $domRef.find(sCSSSelector);
		}

		// empty jQuery object for typing
		return jQuery();
	};

	/**
	 * Checks whether DOM Element is visible by evaluating offsetWidth and offsetHeight
	 * For SVG Groups (tag `g`) getBBox is used, which returns a SVGRect object, defining the bounding box.
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @returns {boolean} <code>true</code> if element is visible.
	 */
	DOMUtil.isVisible = function(oDomRef) {
		if (oDomRef) {
			var oBBox = oDomRef.getBBox && oDomRef.getBBox();
			var iWidth = oBBox ? oBBox.width : oDomRef.offsetWidth;
			var iHeight = oBBox ? oBBox.height : oDomRef.offsetHeight;
			return iWidth > 0 && iHeight > 0;
		}
		return false;
	};

	/**
	 * Sets the draggable attribute to a specified node
	 * @param {HTMLElement} oNode - Target node to add the attribute to
	 * @param {boolean} bValue - Attribute value
	 */
	DOMUtil.setDraggable = function(oNode, bValue) {
		oNode.setAttribute("draggable", bValue);
	};

	/**
	 * Sets the draggable attribute of a specified node
	 * @param {HTMLElement} oNode - Target node to set the draggable attribute on
	 * @returns {boolean|undefined} undefined when draggable is not set to the node
	 */
	DOMUtil.getDraggable = function(oNode) {
		switch (oNode.getAttribute("draggable")) {
			case "true":
				return true;
			case "false":
				return false;
			default:
				return undefined;
		}
	};

	/**
	 * Copy the given styles object to a destination DOM node.
	 * @param {Object} oStyles A styles object, which is retrieved from window.getComputedStyle
	 * @param {Element} oDest The element to which the styles should be copied.
	 * @private
	 */
	DOMUtil._copyStylesTo = function(oStyles, oDest) {
		var sStyles = "";
		var sStyle = "";
		var iLength = oStyles.length;
		// Styles is an array, but has some special access functions
		for (var i = 0; i < iLength; i++) {
			sStyle = oStyles[i];
			sStyles = `${sStyles + sStyle}:${oStyles.getPropertyValue(sStyle)};`;
		}

		oDest.style.cssText = sStyles;
	};

	DOMUtil._copyPseudoElement = function(sPseudoElement, oSrc, oDest) {
		var mStyles = window.getComputedStyle(oSrc, sPseudoElement);
		var sContent = mStyles.getPropertyValue("content");
		if (sContent && sContent !== "none") {
			sContent = String(sContent).trim();
			if (sContent.indexOf("attr(") === 0) {
				sContent = sContent.replace("attr(", "");
				if (sContent.length) {
					sContent = sContent.substring(0, sContent.length - 1);
				}
				// oSrc.getAttribute may return null/undefined (e.g. in FireFox)
				sContent = oSrc.getAttribute(sContent) || "";
			}

			// pseudo elements can't be inserted via js, so we should create a real elements,
			// which copy pseudo styling
			var oPseudoElement = jQuery("<span></span>");
			if (sPseudoElement === ":after") {
				oPseudoElement.appendTo(oDest);
			} else {
				oPseudoElement.prependTo(oDest);
			}

			oPseudoElement.text(sContent.replace(/(^['"])|(['"]$)/g, ""));
			DOMUtil._copyStylesTo(mStyles, oPseudoElement.get(0));
			oPseudoElement.css("display", "inline");
		}
	};

	DOMUtil.copyComputedStyle = function(oSrc, oDest) {
		var mStyles = window.getComputedStyle(oSrc);

		if (mStyles.getPropertyValue("display") === "none") {
			oDest.style.display = "none";
			return;
		}

		DOMUtil._copyStylesTo(mStyles, oDest);

		this._copyPseudoElement(":after", oSrc, oDest);
		this._copyPseudoElement(":before", oSrc, oDest);
	};

	DOMUtil.copyComputedStyles = function(oSrc, oDest) {
		for (var i = 0; i < oSrc.children.length; i++) {
			this.copyComputedStyles(oSrc.children[i], oDest.children[i]);
		}

		// we shouldn't copy classes because they can affect styling
		oDest.removeAttribute("class");
		// remove all special attributes, which can affect app behaviour
		oDest.setAttribute("id", "");
		oDest.setAttribute("role", "");
		oDest.setAttribute("data-sap-ui", "");
		oDest.setAttribute("for", "");
		oDest.setAttribute("tabindex", -1);

		this.copyComputedStyle(oSrc, oDest);
	};

	DOMUtil.cloneDOMAndStyles = function(oNode, oTarget) {
		var oCopy = oNode.cloneNode(true);
		this.copyComputedStyles(oNode, oCopy);

		oTarget.append(oCopy);
	};

	/**
	 * Check whether the target node is a descendant of a node referenced by id
	 * @param {string} sId - ID of a potential parent node
	 * @param {HTMLElement} oTargetNode - Node to look for in a potential parent node
	 * @returns {boolean} <code>true</code> if a potential parent contains the target node
	 */
	DOMUtil.contains = function(sId, oTargetNode) {
		var oNode = document.getElementById(sId);
		return !!oNode && oNode.contains(oTargetNode);
	};

	/**
	 * Safely append child node to specified target node with persistent state of scrollTop/scrollLeft
	 * @param {HTMLElement} oTargetNode - Target node to whom child has to be appended
	 * @param {HTMLElement} oChildNode - Child node to be appended to specified target
	 */
	DOMUtil.appendChild = function(oTargetNode, oChildNode) {
		var iScrollTop = oChildNode.scrollTop;
		var iScrollLeft = oChildNode.scrollLeft;
		oTargetNode.appendChild(oChildNode);
		oChildNode.scrollTop = iScrollTop;
		oChildNode.scrollLeft = iScrollLeft;
	};

	return DOMUtil;
}, /* bExport= */ true);
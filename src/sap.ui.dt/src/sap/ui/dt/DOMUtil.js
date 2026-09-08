/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DOMUtil.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/dom/jquery/zIndex",
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	Localization,
	Element,
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

	const DOMUtil = {};

	/**
	 * Derives the document offset from an already-read bounding client rect.
	 * Kept separate so callers holding a rect (e.g. getGeometry) can avoid a second layout read.
	 * @param {DOMRect} oClientRect - Bounding client rect of the element
	 * @returns {PositionObject} the calculated offset containing left and top values
	 */
	function getOffsetFromRect(oClientRect) {
		const oDocElement = document.documentElement;
		return {
			top: oClientRect.top + window.scrollY - oDocElement.clientTop,
			left: oClientRect.left + window.scrollX - oDocElement.clientLeft
		};
	}

	/**
	 * Returns the offset for an element
	 * @param {HTMLElement} oElement - Element
	 * @returns {PositionObject} the calculated offset containing left and top values
	 */
	DOMUtil.getOffset = function(oElement) {
		return getOffsetFromRect(oElement.getBoundingClientRect());
	};

	/**
	 * Returns the parents for an element
	 * @param {HTMLElement} oElement - Element
	 * @param {string} sSelector - CSS selector to search for
	 * @returns {Array} aParents - Array containing Parents which match selector
	 */
	DOMUtil.getParents = function(oElement, sSelector) {
		const aParents = [];
		while ((oElement = oElement.parentNode) && oElement !== document) {
			if (!sSelector || oElement.matches(sSelector)) {
				aParents.unshift(oElement);
			}
		}
		return aParents;
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
		const iScrollTop = oParent ? oParent.scrollTop : null;
		const iScrollLeft = oParent ? DOMUtil.getScrollLeft(oParent) : null;

		const mParentOffset = oParent ? DOMUtil.getOffset(oParent) : null;

		const mOffset = {
			left: oGeometry.position.left,
			top: oGeometry.position.top
		};

		if (mParentOffset) {
			mOffset.left -= (mParentOffset.left - (iScrollLeft || 0));
			mOffset.top -= (mParentOffset.top - (iScrollTop || 0));
		}

		if (Localization.getRTL()) {
			const iParentWidth = oParent ? oParent.offsetWidth : window.innerWidth;
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

		const iScrollLeftRTL = jQuery(oElement).scrollLeftRTL();

		// jQuery scrollLeftRTL function considers zero scrollLeft when the scrollBar is all the way to the left
		// and moves positively to the right
		const iMaxScrollValue = oElement.scrollWidth - oElement.clientWidth;
		return iScrollLeftRTL - iMaxScrollValue;
	};

	DOMUtil.getZIndex = function(oDomRef) {
		let zIndex = null;
		let oCurrentDomRef = oDomRef;
		do {
			zIndex = window.getComputedStyle(oCurrentDomRef).getPropertyValue("z-index");
			oCurrentDomRef = oCurrentDomRef.parentElement;
			if (!oCurrentDomRef || (oCurrentDomRef.id && Element.getElementById(oCurrentDomRef.id))) {
				break;
			}
		} while (isNaN(zIndex));
		return isNaN(zIndex) ? zIndex : +zIndex;
	};

	DOMUtil._getElementDimensions = function(oDomRef, sMeasure, aDirection) {
		const oRelevantDomRef = oDomRef[0] || oDomRef;
		const iOffsetWidth = oRelevantDomRef[`offset${sMeasure}`];
		let iValue = 0;
		for (let i = 0; i < 2; i++) {
			// remove border
			const sBorderMeasure = window.getComputedStyle(oRelevantDomRef, null)[`border${aDirection[ i ]}${sMeasure}`];
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
			const bOverflowYScroll = window.getComputedStyle(oDomRef)["overflow-y"] === "auto" || window.getComputedStyle(oDomRef)["overflow-y"] === "scroll";
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
			const bOverflowXScroll = window.getComputedStyle(oDomRef)["overflow-x"] === "auto" || window.getComputedStyle(oDomRef)["overflow-x"] === "scroll";
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
			const oOuter = document.createElement("div");
			oOuter.style.position = "absolute";
			oOuter.style.top = "-9999px";
			oOuter.style.left = "-9999px";
			oOuter.style.width = "100px";
			document.body.append(oOuter);

			const iWidthNoScroll = oOuter.offsetWidth;
			oOuter.style.overflow = "scroll";

			// add inner div
			const oInner = document.createElement("div");
			oInner.style.width = "100%";
			oOuter.append(oInner);

			const iWidthWithScroll = oInner.offsetWidth;

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
		const oStyle = window.getComputedStyle(oDomRef);
		return {
			overflowX: oStyle["overflow-x"],
			overflowY: oStyle["overflow-y"]
		};
	};

	DOMUtil.getGeometry = function(oDomRef, bUseWindowOffset) {
		if (oDomRef) {
			// Read the bounding client rect once and derive both position and size from it,
			// avoiding a second forced reflow (getOffset + getSize each read the rect otherwise).
			const oClientRect = oDomRef.getBoundingClientRect();
			const oOffset = getOffsetFromRect(oClientRect);
			if (bUseWindowOffset) {
				oOffset.left = oOffset.left - window.scrollX;
				oOffset.top = oOffset.top - window.scrollY;
			}

			return {
				domRef: oDomRef,
				size: {
					width: oClientRect.width,
					height: oClientRect.height
				},
				position: oOffset,
				visible: DOMUtil.isVisible(oDomRef)
			};
		}
		return undefined;
	};

	/**
	 * Synchronizes the scroll position of one or more target DOM nodes with a source DOM node.
	 * When multiple targets are passed, all scroll positions are read before any write, so that
	 * iterating over the targets does not trigger write-then-read reflows.
	 * @param {Element} oSourceDom - Element whose scroll position is the source of truth
	 * @param {Element|Element[]} vTargetDom - Target element, or array of target elements, to synchronize
	 */
	DOMUtil.syncScroll = function(oSourceDom, vTargetDom) {
		const aTargets = Array.isArray(vTargetDom) ? vTargetDom : [vTargetDom];
		const iSourceScrollTop = oSourceDom.scrollTop;
		const iSourceScrollLeft = oSourceDom.scrollLeft;
		const aTargetScrollPositions = aTargets.map((oTargetDom) => ({
			scrollTop: oTargetDom.scrollTop,
			scrollLeft: oTargetDom.scrollLeft
		}));

		aTargets.forEach((oTargetDom, iIndex) => {
			if (iSourceScrollTop !== aTargetScrollPositions[iIndex].scrollTop) {
				oTargetDom.scrollTop = iSourceScrollTop;
			}
			if (iSourceScrollLeft !== aTargetScrollPositions[iIndex].scrollLeft) {
				oTargetDom.scrollLeft = iSourceScrollLeft;
			}
		});
	};

	/**
	 * Returns HTML Element found in oDomRef for sCSSSelector
	 * @param {Element} oDomRef - to search in
	 * @param {string} sCSSSelector - CSS-like selector to look for
	 * @returns {Element} found domRef
	 */

	DOMUtil.getDomRefForCSSSelector = function(oDomRef, sCSSSelector) {
		if (sCSSSelector && oDomRef) {
			if (sCSSSelector === ":sap-domref") {
				return oDomRef;
			}

			// Replace ":sap-domref" with ":scope" to make the selector compatible with browsers.
			// Example: ":sap-domref > sapMPage" becomes ":scope > sapMPage", scoping the query to oDomRef.
			if (sCSSSelector.indexOf(":sap-domref") > -1) {
				const sModifiedSelector = sCSSSelector.replace(/:sap-domref/g, ":scope");
				return oDomRef.querySelector(sModifiedSelector);
			}

			// Prefix ":scope" to child selectors (>) to scope the query to oDomRef.
			// Example: "div > p, span > a" becomes "div :scope > p, span :scope > a".
			const sScopedSelector = sCSSSelector.replace(/(^|,)\s*(>)/g, "$1:scope$2");
			return oDomRef.querySelector(sScopedSelector);
		}

		return undefined;
	};

	/**
	 * Checks whether DOM Element is visible by evaluating offsetWidth and offsetHeight
	 * For SVG Groups (tag `g`) getBBox is used, which returns a SVGRect object, defining the bounding box.
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @returns {boolean} <code>true</code> if element is visible.
	 */
	DOMUtil.isVisible = function(oDomRef) {
		if (oDomRef) {
			const oBBox = oDomRef.getBBox && oDomRef.getBBox();
			const iWidth = oBBox ? oBBox.width : oDomRef.offsetWidth;
			const iHeight = oBBox ? oBBox.height : oDomRef.offsetHeight;
			return iWidth > 0 && iHeight > 0;
		}
		return false;
	};

	/**
	 * Copy the given styles object to a destination DOM node.
	 * @param {Object} oStyles A styles object, which is retrieved from window.getComputedStyle
	 * @param {Element} oDest The element to which the styles should be copied.
	 * @private
	 */
	DOMUtil._copyStylesTo = function(oStyles, oDest) {
		let sStyles = "";
		let sStyle = "";
		const iLength = oStyles.length;
		// Styles is an array, but has some special access functions
		for (let i = 0; i < iLength; i++) {
			sStyle = oStyles[i];
			sStyles = `${sStyles + sStyle}:${oStyles.getPropertyValue(sStyle)};`;
		}

		oDest.style.cssText = sStyles;
	};

	DOMUtil._copyPseudoElement = function(sPseudoElement, oSrc, oDest) {
		const mStyles = window.getComputedStyle(oSrc, sPseudoElement);
		let sContent = mStyles.getPropertyValue("content");
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
			const oPseudoElement = document.createElement("span");
			if (sPseudoElement === ":after") {
				oDest.appendChild(oPseudoElement);
			} else {
				oDest.insertBefore(oPseudoElement, oDest.firstChild);
			}

			oPseudoElement.textContent = sContent.replace(/(^['"])|(['"]$)/g, "");
			DOMUtil._copyStylesTo(mStyles, oPseudoElement);
			oPseudoElement.style.display = "inline";
		}
	};

	DOMUtil.copyComputedStyle = function(oSrc, oDest) {
		const mStyles = window.getComputedStyle(oSrc);

		if (mStyles.getPropertyValue("display") === "none") {
			oDest.style.display = "none";
			return;
		}

		DOMUtil._copyStylesTo(mStyles, oDest);

		DOMUtil._copyPseudoElement(":after", oSrc, oDest);
		DOMUtil._copyPseudoElement(":before", oSrc, oDest);
	};

	DOMUtil.copyComputedStyles = function(oSrc, oDest) {
		for (let i = 0; i < oSrc.children.length; i++) {
			DOMUtil.copyComputedStyles(oSrc.children[i], oDest.children[i]);
		}

		// we shouldn't copy classes because they can affect styling
		oDest.removeAttribute("class");
		// remove all special attributes, which can affect app behaviour
		oDest.setAttribute("id", "");
		oDest.setAttribute("role", "");
		oDest.setAttribute("data-sap-ui", "");
		oDest.setAttribute("for", "");
		oDest.setAttribute("tabindex", -1);

		DOMUtil.copyComputedStyle(oSrc, oDest);
	};

	DOMUtil.cloneDOMAndStyles = function(oNode, oTarget) {
		const oCopy = oNode.cloneNode(true);
		DOMUtil.copyComputedStyles(oNode, oCopy);

		oTarget.append(oCopy);
	};

	/**
	 * Check whether the target node is a descendant of a node referenced by id
	 * @param {string} sId - ID of a potential parent node
	 * @param {HTMLElement} oTargetNode - Node to look for in a potential parent node
	 * @returns {boolean} <code>true</code> if a potential parent contains the target node
	 */
	DOMUtil.contains = function(sId, oTargetNode) {
		const oNode = document.getElementById(sId);
		return !!oNode && oNode.contains(oTargetNode);
	};

	/**
	 * Safely append child node to specified target node with persistent state of scrollTop/scrollLeft
	 * @param {HTMLElement} oTargetNode - Target node to whom child has to be appended
	 * @param {HTMLElement} oChildNode - Child node to be appended to specified target
	 */
	DOMUtil.appendChild = function(oTargetNode, oChildNode) {
		const iScrollTop = oChildNode.scrollTop;
		const iScrollLeft = oChildNode.scrollLeft;
		oTargetNode.appendChild(oChildNode);
		oChildNode.scrollTop = iScrollTop;
		oChildNode.scrollLeft = iScrollLeft;
	};

	return DOMUtil;
});
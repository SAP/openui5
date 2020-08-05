/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DOMUtil.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	// jQuery Plugin "zIndex"
	"sap/ui/dom/jquery/zIndex"
],
function(
	jQuery,
	Device
) {
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
		var oClientRec = oDomRef.getBoundingClientRect();
		return {
			width: oClientRec.width,
			height: oClientRec.height
		};
	};

	/**
	 * Returns the offset for an element based on the parent position and scrolling
	 * @typedef {object} SizeObject
	 * @property {number} width Element width
	 * @property {number} height Element height
	 * @typedef {object} PositionObject
	 * @property {number} left Element left coordinate
	 * @property {number} top Element top coordinate
	 * @typedef {object} GeometryObject
	 * @property {SizeObject} size Element size
	 * @property {PositionObject} position Element position
	 * @property {boolean} visible Element visibility
	 * @param {GeometryObject} oGeometry - Position object containing left and top values
	 * @param {HTMLElement} oParent - Parent element
	 * @return {PositionObject} - Returns the calculated offset containing left and top values
	 */
	DOMUtil.getOffsetFromParent = function(oGeometry, oParent) {
		var $Parent = oParent ? jQuery(oParent) : null;
		var iScrollTop = $Parent ? $Parent.scrollTop() : null;
		var iScrollLeft = oParent ? DOMUtil.getScrollLeft(oParent) : null;
		var mParentOffset = $Parent ? $Parent.offset() : null;

		var mOffset = {
			left: oGeometry.position.left,
			top: oGeometry.position.top
		};

		if (mParentOffset) {
			mOffset.left -= (mParentOffset.left - (iScrollLeft || 0));
			mOffset.top -= (mParentOffset.top - (iScrollTop || 0));
		}

		if (sap.ui.getCore().getConfiguration().getRTL()) {
			var iParentWidth = $Parent ? $Parent.width() : jQuery(window).width();
			//TODO: Workaround - remove when bug in Safari (issue 336512063) is solved
			if (Device.browser.safari && !Device.browser.mobile && DOMUtil.hasVerticalScrollBar($Parent)) {
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
	 * @param {HTMLElement} oElement Element to read scrollLeft from
	 * @return {number} returns browser agnostic scrollLeft value (negative in RTL)
	 */
	DOMUtil.getScrollLeft = function(oElement) {
		var iScrollLeft = oElement.scrollLeft;
		// The adjustment is only required in RTL mode
		if (
			!sap.ui.getCore().getConfiguration().getRTL()
			|| !DOMUtil.hasHorizontalScrollBar(oElement)
		) {
			return iScrollLeft;
		}
		// Blink (Chrome) considers zero scrollLeft when the scrollBar is all the way to the left
		// and moves positively to the right
		if (Device.browser.blink) {
			var iMaxScrollValue = oElement.scrollWidth - oElement.clientWidth;
			return iScrollLeft - iMaxScrollValue;
		// Internet Explorer considers zero scrollLeft when the scrollbar is all the way
		// to the right (initial position) and moves positively to the left
		} else if (Device.browser.msie || Device.browser.edge) {
			return -iScrollLeft;
		// Firefox (Gecko) & Safari (Webkit) consider zero scrollLeft when the scrollbar is
		// all the way to the right (initial position) and moves negatively to the left [desired behavior]
		}

		return iScrollLeft;
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
	 * @private
	 */
	DOMUtil._getElementDimensions = function (oDomRef, sMeasure, aDirection) {
		var oRelevantDomRef = oDomRef[0] || oDomRef;
		var iOffsetWidth = oRelevantDomRef["offset" + sMeasure];
		var iValue = 0;
		for (var i = 0; i < 2; i++) {
			// remove border
			var sBorderMeasure = window.getComputedStyle(oRelevantDomRef, null)["border" + aDirection[ i ] + sMeasure];
			iValue -= sBorderMeasure ? parseInt(sBorderMeasure.slice(0, -2)) : 0;
		}
		return iOffsetWidth + iValue;
	};

	/**
	 * @private
	 */
	DOMUtil._getElementWidth = function (oDomRef) {
		return DOMUtil._getElementDimensions(oDomRef, "Width", ["Right", "Left"]);
	};

	/**
	 * @private
	 */
	DOMUtil._getElementHeight = function (oDomRef) {
		return DOMUtil._getElementDimensions(oDomRef, "Height", ["Top", "Bottom"]);
	};

	/**
	 * Checks whether DOM Element has vertical scrollbar
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @return {boolean} <code>true</code> if vertical scrollbar is available on DOM Element.
	 */
	DOMUtil.hasVerticalScrollBar = function(oDomRef) {
		var $DomRef = jQuery(oDomRef);
		var bOverflowYScroll = $DomRef.css("overflow-y") === "auto" || $DomRef.css("overflow-y") === "scroll";
		return bOverflowYScroll && $DomRef.get(0).scrollHeight > DOMUtil._getElementHeight(oDomRef);
	};

	/**
	 * Checks whether DOM Element has horizontal scrollbar
	 * @param {HTMLElement} oDomRef - DOM Element
	 * @return {boolean} <code>true</code> if horizontal scrollbar is available on DOM Element
	 */
	DOMUtil.hasHorizontalScrollBar = function (oDomRef) {
		var $DomRef = jQuery(oDomRef);
		var bOverflowXScroll = $DomRef.css("overflow-x") === "auto" || $DomRef.css("overflow-x") === "scroll";
		return bOverflowXScroll && $DomRef.get(0).scrollWidth > DOMUtil._getElementWidth(oDomRef);
	};

	/**
	 * Checks whether DOM Element has vertical or horizontal scrollbar
	 * @param oDomRef {HTMLElement} - DOM Element
	 * @return {boolean}
	 */
	DOMUtil.hasScrollBar = function(oDomRef) {
		return DOMUtil.hasVerticalScrollBar(oDomRef) || DOMUtil.hasHorizontalScrollBar(oDomRef);
	};

	/**
	 * Gets scrollbar width in the running browser
	 * @return {number} - returns width in pixels
	 */
	DOMUtil.getScrollbarWidth = function() {
		if (typeof DOMUtil.getScrollbarWidth._cache === 'undefined') {
			// add outer div
			var oOuter = jQuery('<div/>')
				.css({
					position: 'absolute',
					top: '-9999px',
					left: '-9999px',
					width: '100px'
				})
				.appendTo('body');

			var iWidthNoScroll = oOuter.width();
			oOuter.css('overflow', 'scroll');

			// add inner div
			var oInner = jQuery('<div/>')
				.css('width', '100%')
				.appendTo(oOuter);

			var iWidthWithScroll = oInner.width();

			// clean up
			oOuter.remove();

			DOMUtil.getScrollbarWidth._cache = iWidthNoScroll - iWidthWithScroll;
		}

		return DOMUtil.getScrollbarWidth._cache;
	};


	/**
	 * @param {HTMLElement} oDomRef
	 */
	DOMUtil.getOverflows = function(oDomRef) {
		var $DomRef = jQuery(oDomRef);

		return {
			overflowX: $DomRef.css("overflow-x"),
			overflowY: $DomRef.css("overflow-y")
		};
	};

	/**
	 *
	 */
	DOMUtil.getGeometry = function(oDomRef, bUseWindowOffset) {
		if (oDomRef) {
			var oOffset = jQuery(oDomRef).offset();
			if (bUseWindowOffset) {
				oOffset.left = oOffset.left - jQuery(window).scrollLeft();
				oOffset.top = oOffset.top - jQuery(window).scrollTop();
			}

			return {
				domRef : oDomRef,
				size : this.getSize(oDomRef),
				position :  oOffset,
				visible : this.isVisible(oDomRef)
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
	 * returns jQuery object found in oDomRef for sCSSSelector
	 * @param  {Element|jQuery} oDomRef to search in
	 * @param  {string} sCSSSelector jQuery (CSS-like) selector to look for
	 * @return {jQuery} found domRef
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
	 *
	 */
	DOMUtil.isVisible = function(oDomRef) {
		return oDomRef ? oDomRef.offsetWidth > 0 && oDomRef.offsetHeight > 0 : false;
	};

	/**
	 * Sets the draggable attribute to a specified node
	 * @param {HTMLElement} oNode - Target node to add the attribute to
	 * @param {boolean} bValue - Attribute value
	 */
	DOMUtil.setDraggable = function (oNode, bValue) {
		oNode.setAttribute("draggable", bValue);
	};

	/**
	 * Sets the draggable attribute of a specified node
	 * @param {HTMLElement} oNode - Target node to set the draggable attribute on
	 * @return {boolean|undefined} - returns undefined when draggable is not set to the node
	 */
	DOMUtil.getDraggable = function (oNode) {
		switch (oNode.getAttribute("draggable")) {
			case "true":
				return true;
			case "false":
				return false;
			default:
				return;
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
			sStyles = sStyles + sStyle + ":" + oStyles.getPropertyValue(sStyle) + ";";
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

	/**
	 *
	 */
	DOMUtil.copyComputedStyle = function(oSrc, oDest) {
		oSrc = jQuery(oSrc).get(0);
		oDest = jQuery(oDest).get(0);
		var mStyles = window.getComputedStyle(oSrc);

		if (mStyles.getPropertyValue("display") === "none") {
			oDest.style.display = "none";
			return;
		}

		DOMUtil._copyStylesTo(mStyles, oDest);

		this._copyPseudoElement(":after", oSrc, oDest);
		this._copyPseudoElement(":before", oSrc, oDest);
	};

	/**
	 *
	 */
	DOMUtil.copyComputedStyles = function(oSrc, oDest) {
		oSrc = jQuery(oSrc).get(0);
		oDest = jQuery(oDest).get(0);

		for (var i = 0; i < oSrc.children.length; i++) {
			this.copyComputedStyles(oSrc.children[i], oDest.children[i]);
		}

		// we shouldn't copy classes because they can affect styling
		jQuery(oDest).removeClass();
		// remove all special attributes, which can affect app behaviour
		jQuery(oDest).attr("id", "");
		jQuery(oDest).attr("role", "");
		jQuery(oDest).attr("data-sap-ui", "");
		jQuery(oDest).attr("for", "");

		jQuery(oDest).attr("tabindex", -1);
		this.copyComputedStyle(oSrc, oDest);
	};

	/**
	 *
	 */
	DOMUtil.cloneDOMAndStyles = function(oNode, oTarget) {
		oNode = jQuery(oNode).get(0);

		var oCopy = oNode.cloneNode(true);
		this.copyComputedStyles(oNode, oCopy);

		jQuery(oTarget).append(oCopy);
	};

	/**
	 * Inserts <style/> tag width specified styles into #overlay-container
	 * @param {string} sStyles - Plain CSS as a string to be added into the page
	 * @param {HTMLElement} oTarget - Target DOM Node where to add <style> tag with CSS
	 */
	DOMUtil.insertStyles = function (sStyles, oTarget) {
		var oStyle = document.createElement('style');
		oStyle.type = 'text/css';
		oStyle.appendChild(document.createTextNode(sStyles));
		oTarget.appendChild(oStyle);
	};

	/**
	 * Check whether the target node is a descendant of a node referenced by id
	 * @param {string} sId - ID of a potential parent node
	 * @param oTargetNode - Node to look for in a potential parent node
	 * @returns {boolean} - true if a potential parent contains the target node
	 */
	DOMUtil.contains = function (sId, oTargetNode) {
		var oNode = document.getElementById(sId);
		return !!oNode && oNode.contains(oTargetNode);
	};

	/**
	 * Safely append child node to specified target node with persistent state of scrollTop/scrollLeft
	 * @param {HTMLElement} oTargetNode - Target node to whom child has to be appended
	 * @param {HTMLElement} oChildNode - Child node to be appended to specified target
	 */
	DOMUtil.appendChild = function (oTargetNode, oChildNode) {
		var iScrollTop = oChildNode.scrollTop;
		var iScrollLeft = oChildNode.scrollLeft;
		oTargetNode.appendChild(oChildNode);
		oChildNode.scrollTop = iScrollTop;
		oChildNode.scrollLeft = iScrollLeft;
	};

	/**
	 * Set the Focus to the DOM Element without scrolling
	 * @param {HTMLElement} oTargetNode - Target node to whom focus should be set
	 */
	DOMUtil.focusWithoutScrolling = function (oTargetNode) {
		// Only for Newer Devices
		if (Device.browser.name !== "ie") {
			oTargetNode.focus({preventScroll: true});
			return;
		}

		var aScrollHierarchy = [];
		var oParentNode = oTargetNode.parentNode;

		while (oParentNode) {
			aScrollHierarchy.push([oParentNode, oParentNode.scrollLeft, oParentNode.scrollTop]);
			oParentNode = oParentNode.parentNode;
		}

		oTargetNode.focus();

		aScrollHierarchy.forEach(function (oItem) {
			var oElementNode = oItem[0];

			// Check first to avoid triggering unnecessary `scroll` events
			if (oElementNode.scrollLeft !== oItem[1]) {
				oElementNode.scrollLeft = oItem[1];
			}

			if (oElementNode.scrollTop !== oItem[2]) {
				oElementNode.scrollTop = oItem[2];
			}
		});
	};

	return DOMUtil;
}, /* bExport= */ true);
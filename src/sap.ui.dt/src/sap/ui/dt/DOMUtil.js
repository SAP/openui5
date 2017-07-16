/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.DOMUtil.
sap.ui.define([
	'jquery.sap.global'
],
function(
	jQuery
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
	 * Checks whether DOM Element has vertical scrollbar
	 * @param oDomRef {HTMLElement} - DOM Element
	 * @return {boolean}
	 */
	DOMUtil.hasVerticalScrollBar = function(oDomRef) {
		var $DomRef = jQuery(oDomRef);
		var bOverflowYScroll = $DomRef.css("overflow-y") === "auto" || $DomRef.css("overflow-y") === "scroll";

		return bOverflowYScroll && $DomRef.get(0).scrollHeight > $DomRef.height();
	};

	/**
	 * Checks whether DOM Element has horizontal scrollbar
	 * @param oDomRef {HTMLElement} - DOM Element
	 * @return {boolean}
	 */
	DOMUtil.hasHorizontalScrollBar = function (oDomRef) {
		var $DomRef = jQuery(oDomRef);
		var bOverflowXScroll = $DomRef.css("overflow-x") === "auto" || $DomRef.css("overflow-x") === "scroll";

		return bOverflowXScroll && $DomRef.get(0).scrollWidth > $DomRef.width();
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
		} else {
			// empty jQuery object for typing
			return jQuery();
		}
	};

	/**
	 *
	 */
	DOMUtil.isVisible = function(oDomRef) {
		// mimic the jQuery 1.11.1 impl of the ':visible' selector as the jQuery 2.2.0 selector no longer reports empty SPANs etc. as 'hidden'
		return oDomRef ? oDomRef.offsetWidth > 0 || oDomRef.offsetHeight > 0 : false;
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
	 * Copy the given styles object to a destination DOM node.
	 *
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
			sContent = jQuery.trim(sContent);
			if (sContent.indexOf("attr(") === 0) {
				sContent = sContent.replace("attr(", "");
				if (sContent.length) {
					sContent = sContent.substring(0, sContent.length - 1);
				}
				sContent = oSrc.getAttribute(sContent);
			}

			// due to a firefox bug sContent can be null after oSrc.getAttribute
			// sContent is requried for copy pseudo styling
			if (sContent === null || sContent === undefined) {
				sContent = "";
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

		if (mStyles.getPropertyValue("display") == "none") {
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

		jQuery(oDest).attr("tabIndex", -1);
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
	 * @param {string} sStyles - string with plain CSS to be rendered into the page
	 */
	DOMUtil.insertStyles = function (sStyles) {
		var oStyle = document.createElement('style');
		oStyle.type = 'text/css';

		if (oStyle.styleSheet) {
			oStyle.styleSheet.cssText = sStyles;
		} else {
			oStyle.appendChild(document.createTextNode(sStyles));
		}

		// FIXME: we can't use Overlay module because of the cycled dependency
		jQuery('#overlay-container').prepend(oStyle);
	};

	return DOMUtil;
}, /* bExport= */ true);

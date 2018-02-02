/*!
 * ${copyright}
 */

// Provides functionality related to DOM analysis and manipulation which is not provided by jQuery itself.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'],
	function(jQuery, Device) {
	"use strict";

	/**
	 * Shortcut for document.getElementById(), including a bug fix for older IE versions.
	 *
	 * @param {string} sId The id of the DOM element to return
	 * @param {Window} [oWindow=window] The window (optional)
	 * @return {Element} The DOMNode identified by the given sId
	 * @public
	 * @function
	 * @since 0.9.0
	 */
	jQuery.sap.domById = function domById(sId, oWindow) {
		return sId ? (oWindow || window).document.getElementById(sId) : null;
	};

	/**
	 * Shortcut for jQuery("#" + id) with additionally the id being escaped properly.
	 * I.e.: returns the jQuery object for the DOM element with the given id
	 *
	 * Use this method instead of jQuery(...) if you know the argument is exactly one id and
	 * the id is not known in advance because it is in a variable (as opposed to a string
	 * constant with known content).
	 *
	 * @param {string} sId The id to search for and construct the jQuery object
	 * @param {Element} oContext the context DOM Element
	 * @return {Object} The jQuery object for the DOM element identified by the given sId
	 * @public
	 * @since 0.9.1
	 */
	jQuery.sap.byId = function byId(sId, oContext) {
		var escapedId = "";
		if (sId) {
			// Note: This does not escape all relevant characters according to jQuery's documentation
			// (see http://api.jquery.com/category/selectors/)
			// As the behavior hasn't been changed for a long time it is not advisable to change it in
			// future as users might be already escaping characters on their own or relying on the fact
			// selector like jQuery.sap.byId("my-id > div") can be used.
			escapedId = "#" + sId.replace(/(:|\.)/g,'\\$1');
		}
		return jQuery(escapedId, oContext);
	};


	/**
	 * Calls focus() on the given DOM element.
	 *
	 * @param {Element} oDomRef The DOM element to focus (or null - in this case the method does nothing)
	 * @return {boolean} Whether the focus() command was executed without an error
	 * @public
	 * @since 1.1.2
	 */
	jQuery.sap.focus = function focus(oDomRef) {
		if (!oDomRef) {
			return;
		}
		oDomRef.focus();
		return true;
	};

	function getRootFontSize() {
		var oRootDomRef = document.documentElement;

		if (!oRootDomRef) {
			return 16; // browser default font size
		}

		return parseFloat(window.getComputedStyle(oRootDomRef).getPropertyValue("font-size"));
	}

	/*
	 * Convert <code>px</code> values to <code>rem</code>.
	 *
	 * @param {string|float} vPx The value in <code>px</code> units. E.g.: <code>"16px"</code> or <code>16</code>
	 * @returns {float} The converted value in <code>rem</code> units. E.g.: <code>1</code>
	 * @protected
	 * @since 1.48
	 */
	jQuery.sap.pxToRem = function(vPx) {
		jQuery.sap.assert(((typeof vPx === "string") && (vPx !== "") && !isNaN(parseFloat(vPx)) && (typeof parseFloat(vPx) === "number")) || ((typeof vPx === "number") && !isNaN(vPx)), 'jQuery.sap.pxToRem: either the "vPx" parameter must be an integer, or a string e.g.: "16px"');
		return parseFloat(vPx) / getRootFontSize();
	};

	/*
	 * Convert <code>rem</code> values to <code>px</code>.
	 *
	 * @param {string|float} vRem The value in <code>rem</code>. E.g.: <code>"1rem"</code> or <code>1</code>
	 * @returns {float} The converted value in <code>px</code> units. E.g.: <code>16</code>
	 * @protected
	 * @since 1.48
	 */
	jQuery.sap.remToPx = function(vRem) {
		jQuery.sap.assert(((typeof vRem === "string") && (vRem !== "") && !isNaN(parseFloat(vRem)) && (typeof parseFloat(vRem) === "number")) || ((typeof vRem === "number") && !isNaN(vRem)), 'jQuery.sap.remToPx: either the "vRem" parameter must be an integer, or a string e.g.: "1rem"');
		return parseFloat(vRem) * getRootFontSize();
	};

	/**
	 * Sets or gets the position of the cursor in an element that supports cursor positioning
	 *
	 * @param {int} iPos The cursor position to set (or no parameter to retrieve the cursor position)
	 * @return {int | jQuery} The cursor position (or the jQuery collection if the position has been set)
	 * @public
	 * @name jQuery#cursorPos
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.cursorPos = function cursorPos(iPos) {
		var len = arguments.length,
			sTagName,
			sType;

		sTagName = this.prop("tagName");
		sType = this.prop("type");

		if ( this.length === 1 && ((sTagName == "INPUT" && (sType == "text" || sType == "password" || sType == "search"))
				|| sTagName == "TEXTAREA" )) {

			var oDomRef = this.get(0);

			if (len > 0) { // SET

				if (typeof (oDomRef.selectionStart) == "number") {
					oDomRef.focus();
					oDomRef.selectionStart = iPos;
					oDomRef.selectionEnd = iPos;
				}

				return this;
				// end of SET

			} else { // GET
				if (typeof (oDomRef.selectionStart) == "number") {
					return oDomRef.selectionStart;
				}
				return -1;
			} // end of GET
		} else {
			// shouldn't really happen, but to be safe...
			return this;
		}
	};

	/**
	 * Sets the text selection in the first element of the collection.
	 *
	 * <b>Note</b>: This feature is only supported for input element’s type of text, search, url, tel and password.
	 *
	 * @param {int} iStart Start position of the selection (inclusive)
	 * @param {int} iEnd End position of the selection (exclusive)
	 * @return {jQuery} The jQuery collection
	 * @public
	 * @name jQuery#selectText
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.selectText = function selectText(iStart, iEnd) {
		var oDomRef = this.get(0);

		try {
			// In Chrome 58 and above selection start is set to selection end when the first parameter of a setSelectionRange call is negative.
			if (typeof (oDomRef.selectionStart) === "number") {
				oDomRef.setSelectionRange(iStart > 0 ? iStart : 0, iEnd);
			}
		} catch (e) {
			// note: some browsers fail to read the "selectionStart" and "selectionEnd" properties from HTMLInputElement, e.g.: The input element's type "number" does not support selection.
		}

		return this;
	};

	/**
	 * Retrieve the selected text in the first element of the collection.
	 *
	 * <b>Note</b>: This feature is only supported for input element’s type of text, search, url, tel and password.
	 *
	 * @return {string} The selected text.
	 * @public
	 * @name jQuery#getSelectedText
	 * @author SAP SE
	 * @since 1.26.0
	 * @function
	 */
	jQuery.fn.getSelectedText = function() {
		var oDomRef = this.get(0);

		try {
			if (typeof oDomRef.selectionStart === "number") {
				return oDomRef.value.substring(oDomRef.selectionStart, oDomRef.selectionEnd);
			}
		} catch (e) {
			// note: some browsers fail to read the "selectionStart" and "selectionEnd" properties from HTMLInputElement, e.g.: The input element's type "number" does not support selection.
		}

		return "";
	};

	/**
	 * Returns the outer HTML of the given HTML element
	 *
	 * @return {string} outer HTML
	 * @public
	 * @name jQuery#outerHTML
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.outerHTML = function outerHTML() {
		var oDomRef = this.get(0);

		if (oDomRef && oDomRef.outerHTML) {
			return jQuery.trim(oDomRef.outerHTML);
		} else {
			var doc = this[0] ? this[0].ownerDocument : document;

			var oDummy = doc.createElement("div");
			oDummy.appendChild(oDomRef.cloneNode(true));
			return oDummy.innerHTML;
		}
	};


	/**
	 * Returns whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>.
	 *
	 * This is a browser-independent version of the .contains method of Internet Explorer.
	 * For compatibility reasons it returns <code>true</code> if <code>oDomRefContainer</code> and
	 * <code>oDomRefChild</code> are equal.
	 *
	 * This method intentionally does not operate on the jQuery object, as the original <code>jQuery.contains()</code>
	 * method also does not do so.
	 *
	 * @param {Element} oDomRefContainer The container element
	 * @param {Element} oDomRefChild The child element (must not be a text node, must be an element)
	 * @return {boolean} Whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>
	 * @public
	 * @author SAP SE
	 * @since 0.9.0
	 */
	jQuery.sap.containsOrEquals = function containsOrEquals(oDomRefContainer, oDomRefChild) {
		if (oDomRefChild && oDomRefContainer && oDomRefChild != document && oDomRefChild != window) {
			return (oDomRefContainer === oDomRefChild) || jQuery.contains(oDomRefContainer, oDomRefChild);
		}
		return false;
	};


	/**
	 * Returns a rectangle describing the current visual positioning of the first DOM object in the collection
	 * (or <code>null</code> if no element was given)
	 *
	 * @return {object} An object with left, top, width and height
	 * @public
	 * @name jQuery#rect
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.rect = function rect() {
		var oDomRef = this.get(0);

		if (oDomRef) {
			// this should be available in all 'modern browsers'
			if (oDomRef.getBoundingClientRect) {
				var oClientRect = oDomRef.getBoundingClientRect();
				var oRect = { top : oClientRect.top,
						left : oClientRect.left,
						width : oClientRect.right - oClientRect.left,
						height : oClientRect.bottom - oClientRect.top };

				var oWnd = jQuery.sap.ownerWindow(oDomRef);
				oRect.left += jQuery(oWnd).scrollLeft();
				oRect.top += jQuery(oWnd).scrollTop();

				return oRect;
			} else {
				// IE6 and older; avoid crashing and give some hardcoded size
				return { top : 10, left : 10, width : oDomRef.offsetWidth, height : oDomRef.offsetWidth };
			}
		}
		return null;
	};


	/**
	 * Returns whether a point described by X and Y is inside this Rectangle's boundaries
	 *
	 * @param {int} iPosX
	 * @param {int} iPosY
	 * @return {boolean} Whether X and Y are inside this Rectangle's boundaries
	 * @public
	 * @name jQuery#rectContains
	 * @author SAP SE
	 * @since 0.18.0
	 * @function
	 */
	jQuery.fn.rectContains = function rectContains(iPosX, iPosY) {
		jQuery.sap.assert(!isNaN(iPosX), "iPosX must be a number");
		jQuery.sap.assert(!isNaN(iPosY), "iPosY must be a number");

		var oRect = this.rect();

		if (oRect) {

			return iPosX >= oRect.left
				&& iPosX <= oRect.left + oRect.width
				&& iPosY >= oRect.top
				&& iPosY <= oRect.top + oRect.height;

		}
		return false;
	};

	function hasTabIndex(oElem) {

		var iTabIndex = jQuery.prop(oElem, "tabIndex");

		// compensate for 'specialties' in the implementation of jQuery.prop:
		// - it returns undefined for text, comment and attribute nodes
		// - when calculating an implicit tabindex for focusable/clickable elements, it ignores the 'disabled' attribute
		return iTabIndex != null && iTabIndex >= 0 &&
			( !jQuery.attr(oElem, "disabled") || jQuery.attr(oElem, "tabindex") );

	}

	/**
	 * Returns <code>true</code> if the first element has a set tabindex
	 *
	 * @return {boolean} If the first element has a set tabindex
	 * @public
	 * @name jQuery#hasTabIndex
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.hasTabIndex = function() {
		return hasTabIndex(this.get(0));
	};

	/**
	 * Checks whether an Element is invisible for the end user.
	 *
	 * This is a combination of jQuery's :hidden selector (but with a slightly
	 * different semantic, see below) and a check for CSS visibility 'hidden'.
	 *
	 * Since jQuery 2.x, inline elements (SPAN etc.) might be considered 'visible'
	 * although they have zero dimensions (e.g. an empty span). In jQuery 1.x such
	 * elements had been treated as 'hidden'.
	 *
	 * As some UI5 controls rely on the old behavior, this method restores it.
	 *
	 * @param {Element} oElem Element to check the dimensions for
	 * @returns {boolean} whether the Element either has only zero dimensions or has visiblity:hidden (CSS)
	 * @private
	 */
	function isHidden(oElem) {
		return (oElem.offsetWidth <= 0 && oElem.offsetHeight <= 0) || jQuery.css(oElem, 'visibility') === 'hidden';
	}

	/**
	 * Searches for a descendant of the given node that is an Element and focusable and visible.
	 *
	 * The search is executed 'depth first'.
	 *
	 * @param {Node} oContainer Node to search for a focusable descendant
	 * @param {boolean} bForward Whether to search forward (true) or backwards (false)
	 * @returns {Element} Element node that is focusable and visible or null
	 * @private
	 */
	function findFocusableDomRef(oContainer, bForward) {

		var oChild = bForward ? oContainer.firstChild : oContainer.lastChild,
			oFocusableDescendant;

		while (oChild) {

			if ( oChild.nodeType == 1 && !isHidden(oChild) ) {

				if ( hasTabIndex(oChild) ) {
					return oChild;
				}

				oFocusableDescendant = findFocusableDomRef(oChild, bForward);
				if (oFocusableDescendant) {
					return oFocusableDescendant;
				}

			}

			oChild = bForward ? oChild.nextSibling : oChild.previousSibling;

		}

		return null;
	}


	/**
	 * Returns the first focusable domRef in a given container (the first element of the collection)
	 *
	 * @return {Element} The domRef
	 * @public
	 * @name jQuery#firstFocusableDomRef
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.firstFocusableDomRef = function firstFocusableDomRef() {
		var oContainerDomRef = this.get(0);

		if ( !oContainerDomRef || isHidden(oContainerDomRef) ) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search forward */ true);
	};


	/**
	 * Returns the last focusable domRef in a given container
	 *
	 * @return {Element} The last domRef
	 * @public
	 * @name jQuery#lastFocusableDomRef
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.lastFocusableDomRef = function lastFocusableDomRef() {
		var oContainerDomRef = this.get(0);

		if ( !oContainerDomRef || isHidden(oContainerDomRef) ) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search backwards */ false);
	};


	/**
	 * Sets or returns the scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 *
	 * Reason for this method is that the major browsers use three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns/applies the same value that would be returned in LTR mode: The distance in px
	 * how far the given container is scrolled away from the leftmost scroll position.
	 *
	 * Returns "undefined" if no element and no iPos is given.
	 *
	 * @param {int} iPos
	 * @return {jQuery | int} The jQuery collection if iPos is given, otherwise the scroll position, counted from the leftmost position
	 * @public
	 * @name jQuery#scrollLeftRTL
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 */
	jQuery.fn.scrollLeftRTL = function scrollLeftRTL(iPos) {
		var oDomRef = this.get(0);
		if (oDomRef) {

			if (iPos === undefined) { // GETTER code
				if (Device.browser.msie || Device.browser.edge) {
					return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;

				} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
					// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
					return oDomRef.scrollWidth + oDomRef.scrollLeft - oDomRef.clientWidth;

				} else if (Device.browser.webkit) {
					// WebKit browsers (except Safari 10+, as it's handled above)
					return oDomRef.scrollLeft;

				} else {
					// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
					return oDomRef.scrollLeft;
				}

			} else { // SETTER code
				oDomRef.scrollLeft = jQuery.sap.denormalizeScrollLeftRTL(iPos, oDomRef);
				return this;
			}
		}
	};

	/**
	 * Returns the MIRRORED scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 *
	 * Reason for this method is that the major browsers return three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns the value that would be returned in LTR mode if the UI would be mirrored horizontally:
	 * The distance in px how far the given container is scrolled away from the rightmost scroll position.
	 *
	 * Returns "undefined" if no element is given.
	 *
	 * @return {int} The scroll position, counted from the rightmost position
	 * @public
	 * @name jQuery#scrollRightRTL
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 */
	jQuery.fn.scrollRightRTL = function scrollRightRTL() {
		var oDomRef = this.get(0);
		if (oDomRef) {

			if (Device.browser.msie) {
				return oDomRef.scrollLeft;

			} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
				// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
				return (-oDomRef.scrollLeft);

			} else if (Device.browser.webkit) {
				// WebKit browsers (except Safari 10+, as it's handled above)
				return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return oDomRef.scrollLeft;
			}
		}
	};


	/**
	 * For the given scrollLeft value this method returns the scrollLeft value as understood by the current browser in RTL mode.
	 * This value is specific to the given DOM element, as the computation may involve its dimensions.
	 *
	 * So when oDomRef should be scrolled 2px from the leftmost position, the number "2" must be given as iNormalizedScrollLeft
	 * and the result of this method (which may be a large or even negative number, depending on the browser) can then be set as
	 * oDomRef.scrollLeft to achieve the desired (cross-browser-consistent) scrolling position.
	 *
	 * This method does no scrolling on its own, it only calculates the value to set (so it can also be used for animations).
	 *
	 * @param {int} iNormalizedScrollLeft The distance from the leftmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @author SAP SE
	 * @since 0.20.0
	 */
	jQuery.sap.denormalizeScrollLeftRTL = function(iNormalizedScrollLeft, oDomRef) {

		if (oDomRef) {
			if (Device.browser.msie || Device.browser.edge) {
				return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollLeft;

			} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
				// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
				return oDomRef.clientWidth + iNormalizedScrollLeft - oDomRef.scrollWidth;

			} else if (Device.browser.webkit) {
				// WebKit browsers (except Safari 10+, as it's handled above)
				return iNormalizedScrollLeft;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return iNormalizedScrollLeft;
			}
		}
	};


	/**
	 * For the given scroll position measured from the "beginning" of a container (the right edge in RTL mode)
	 * this method returns the scrollLeft value as understood by the current browser in RTL mode.
	 * This value is specific to the given DOM element, as the computation may involve its dimensions.
	 *
	 * So when oDomRef should be scrolled 2px from the beginning, the number "2" must be given as iNormalizedScrollBegin
	 * and the result of this method (which may be a large or even negative number, depending on the browser) can then be set as
	 * oDomRef.scrollLeft to achieve the desired (cross-browser-consistent) scrolling position.
	 * Low values make the right part of the content visible, high values the left part.
	 *
	 * This method does no scrolling on its own, it only calculates the value to set (so it can also be used for animations).
	 *
	 * Only use this method in RTL mode, as the behavior in LTR mode is undefined and may change!
	 *
	 * @param {int} iNormalizedScrollBegin The distance from the rightmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @author SAP SE
	 * @since 1.26.1
	 */
	jQuery.sap.denormalizeScrollBeginRTL = function(iNormalizedScrollBegin, oDomRef) {

		if (oDomRef) {
			if (Device.browser.msie) {
				return iNormalizedScrollBegin;

			} else if (Device.browser.webkit) {
				return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollBegin;

			} else if (Device.browser.firefox) {
				return -iNormalizedScrollBegin;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return iNormalizedScrollBegin;
			}
		}
	};



	/*
	 * The following methods are taken from jQuery UI core but modified.
	 *
	 * jQuery UI Core
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/category/ui-core/
	 */
	jQuery.support.selectstart = "onselectstart" in document.createElement("div");
	jQuery.fn.extend( /** @lends jQuery.prototype */ {

		/**
		 * Disable HTML elements selection.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @protected
		 * @since 1.24.0
		 */
		disableSelection: function() {
			return this.on((jQuery.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(oEvent) {
				oEvent.preventDefault();
			});
		},

		/**
		 * Enable HTML elements to get selected.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @protected
		 * @since 1.24.0
		 */
		enableSelection: function() {
			return this.off(".ui-disableSelection");
		}
	});


	/*!
	 * The following functions are taken from jQuery UI 1.8.17 but modified
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI
	 */
	function visible( element ) {
		// check if one of the parents (until it's position parent) is invisible
		// prevent that elements in static area are always checked as invisible

		// list all items until the offsetParent item (with jQuery >1.6 you can use parentsUntil)
		var oOffsetParent = jQuery(element).offsetParent();
		var bOffsetParentFound = false;
		var $refs = jQuery(element).parents().filter(function() {
			if (this === oOffsetParent) {
				bOffsetParentFound = true;
			}
			return bOffsetParentFound;
		});

		// check for at least one item to be visible
		return !jQuery(element).add($refs).filter(function() {
			return jQuery.css( this, "visibility" ) === "hidden" || jQuery.expr.filters.hidden( this );
		}).length;
	}

	function focusable( element, isTabIndexNotNaN ) {
		var nodeName = element.nodeName.toLowerCase();
		if ( nodeName === "area" ) {
			var map = element.parentNode,
				mapName = map.name,
				img;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = jQuery( "img[usemap='#" + mapName + "']" )[0];
			return !!img && visible( img );
		}
		/*eslint-disable no-nested-ternary */
		return ( /input|select|textarea|button|object/.test( nodeName )
			? !element.disabled
			: nodeName == "a"
				? element.href || isTabIndexNotNaN
				: isTabIndexNotNaN)
			// the element and all of its ancestors must be visible
			&& visible( element );
		/*eslint-enable no-nested-ternary */
	}


	if (!jQuery.expr[":"].focusable) {
		/*!
		 * The following function is taken from jQuery UI 1.8.17
		 *
		 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 * http://jquery.org/license
		 *
		 * http://docs.jquery.com/UI
		 *
		 * But since visible is modified, focusable is different too the jQuery UI version too.
		 */
		jQuery.extend( jQuery.expr[ ":" ], {
			/**
			 * This defines the jQuery ":focusable" selector; it is also defined in jQuery UI. If already present, nothing is
			 * done here, so we will not overwrite any previous implementation.
			 * If jQuery UI is loaded later on, this implementation here will be overwritten by that one, which is fine,
			 * as it is semantically the same thing and intended to do exactly the same.
			 */
			focusable: function( element ) {
				return focusable( element, !isNaN( jQuery.attr( element, "tabindex" ) ) );
			}
		});
	}

	if (!jQuery.expr[":"].sapTabbable) {
		/*!
		 * The following function is taken from
		 * jQuery UI Core 1.11.1
		 * http://jqueryui.com
		 *
		 * Copyright 2014 jQuery Foundation and other contributors
		 * Released under the MIT license.
		 * http://jquery.org/license
		 *
		 * http://api.jqueryui.com/category/ui-core/
		 */
		jQuery.extend( jQuery.expr[ ":" ], {
			/**
			 * This defines the jQuery ":tabbable" selector; it is also defined in jQuery UI. If already present, nothing is
			 * done here, so we will not overwrite any previous implementation.
			 * If jQuery UI is loaded later on, this implementation here will be overwritten by that one, which is fine,
			 * as it is semantically the same thing and intended to do exactly the same.
			 */
			sapTabbable: function( element ) {
				var tabIndex = jQuery.attr( element, "tabindex" ),
					isTabIndexNaN = isNaN( tabIndex );
				return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
			}
		});
	}

	if (!jQuery.expr[":"].sapFocusable) {
		/*!
		 * Do not use jQuery UI focusable because this might be overwritten if jQuery UI is loaded
		 */
		jQuery.extend( jQuery.expr[ ":" ], {
			/**
			 * This defines the jQuery ":sapFocusable" selector; If already present, nothing is
			 * done here, so we will not overwrite any previous implementation.
			 * If jQuery UI is loaded later on, this implementation here will NOT be overwritten by.
			 */
			sapFocusable: function( element ) {
				return focusable( element, !isNaN( jQuery.attr( element, "tabindex" ) ) );
			}
		});
	}

	if (!jQuery.fn.zIndex) {
		/*!
		 * The following function is taken from
		 * jQuery UI Core 1.11.1
		 * http://jqueryui.com
		 *
		 * Copyright 2014 jQuery Foundation and other contributors
		 * Released under the MIT license.
		 * http://jquery.org/license
		 *
		 * http://api.jqueryui.com/category/ui-core/
		 */
		jQuery.fn.zIndex = function( zIndex ) {
			if ( zIndex !== undefined ) {
				return this.css( "zIndex", zIndex );
			}

			if ( this.length ) {
				var elem = jQuery( this[ 0 ] ), position, value;
				while ( elem.length && elem[ 0 ] !== document ) {
					// Ignore z-index if position is set to a value where z-index is ignored by the browser
					// This makes behavior of this function consistent across browsers
					// WebKit always returns auto if the element is positioned
					position = elem.css( "position" );
					if ( position === "absolute" || position === "relative" || position === "fixed" ) {
						// IE returns 0 when zIndex is not specified
						// other browsers return a string
						// we ignore the case of nested elements with an explicit value of 0
						// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
						value = parseInt( elem.css( "zIndex" ), 10 );
						if ( !isNaN( value ) && value !== 0 ) {
							return value;
						}
					}
					elem = elem.parent();
				}
			}

			return 0;
		};
	}

	/**
	 * Gets the next parent DOM element with a given attribute and attribute value starting above the first given element
	 *
	 * @param {string} sAttribute Name of the attribute
	 * @param {string} sValue Value of the attribute (optional)
	 * @return {Element} null or the DOM reference
	 * @public
	 * @name jQuery#parentByAttribute
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */
	jQuery.fn.parentByAttribute = function parentByAttribute(sAttribute, sValue) {
		if (this.length > 0) {
			if (sValue) {
				return this.first().parents("[" + sAttribute + "='" + sValue + "']").get(0);
			} else {
				return this.first().parents("[" + sAttribute + "]").get(0);
			}
		}
	};


	/**
	 * Returns the window reference for a DomRef
	 *
	 * @param {Element} oDomRef The DOM reference
	 * @return {Window} Window reference
	 * @public
	 * @since 0.9.0
	 */
	jQuery.sap.ownerWindow = function ownerWindow(oDomRef){
		if (oDomRef.ownerDocument.parentWindow) {
			return oDomRef.ownerDocument.parentWindow;
		}
		return oDomRef.ownerDocument.defaultView;
	};


	var _oScrollbarSize = {};

	/**
	 * Returns the size (width of the vertical / height of the horizontal) native browser scrollbars.
	 *
	 * This function must only be used when the DOM is ready.
	 *
	 * @param {string} [sClasses=null] the CSS class that should be added to the test element.
	 * @param {boolean} [bForce=false] force recalculation of size (e.g. when CSS was changed). When no classes are passed all calculated sizes are reset.
	 * @return {object} JSON object with properties <code>width</code> and <code>height</code> (the values are of type number and are pixels).
	 * @public
	 * @since 1.4.0
	 */
	jQuery.sap.scrollbarSize = function(sClasses, bForce) {
		if (typeof sClasses === "boolean") {
			bForce = sClasses;
			sClasses = null;
		}

		var sKey = sClasses || "#DEFAULT"; // # is an invalid character for CSS classes

		if (bForce) {
			if (sClasses) {
				delete _oScrollbarSize[sClasses];
			} else {
				_oScrollbarSize = {};
			}
		}

		if (_oScrollbarSize[sKey]) {
			return _oScrollbarSize[sKey];
		}

		if (!document.body) {
			return {width: 0, height: 0};
		}

		var $Area = jQuery("<DIV/>")
			.css("visibility", "hidden")
			.css("height", "0")
			.css("width", "0")
			.css("overflow", "hidden");

		if (sClasses) {
			$Area.addClass(sClasses);
		}

		$Area.prependTo(document.body);

		var $Dummy = jQuery("<div style=\"visibility:visible;position:absolute;height:100px;width:100px;overflow:scroll;opacity:0;\"></div>");
		$Area.append($Dummy);

		var oDomRef = $Dummy.get(0);
		var iWidth = oDomRef.offsetWidth - oDomRef.scrollWidth;
		var iHeight = oDomRef.offsetHeight - oDomRef.scrollHeight;

		$Area.remove();

		// due to a bug in FireFox when hiding iframes via an outer DIV element
		// the height and width calculation is not working properly - by not storing
		// height and width when one value is 0 we make sure that once the iframe
		// gets visible the height calculation will be redone (see snippix: #64049)
		if (iWidth === 0 || iHeight === 0) {
			return {width: iWidth, height: iHeight};
		}

		_oScrollbarSize[sKey] = {width: iWidth, height: iHeight};

		return _oScrollbarSize[sKey];
	};

	// handle weak dependency to sap/ui/core/Control
	var _Control;

	function getControl() {
		return _Control || (_Control = sap.ui.require('sap/ui/core/Control'));
	}

	/**
	 * Search ancestors of the given source DOM element for the specified CSS class name.
	 * If the class name is found, set it to the root DOM element of the target control.
	 * If the class name is not found, it is also removed from the target DOM element.
	 *
	 * @param {string} sStyleClass CSS class name
	 * @param {jQuery|sap.ui.core.Control|string} vSource jQuery object, control or an id of the source element.
	 * @param {jQuery|sap.ui.core.Control} vDestination target jQuery object or a control.
	 * @return {jQuery|Element} Target element
	 * @public
	 * @since 1.22
	 */
	jQuery.sap.syncStyleClass = function(sStyleClass, vSource, vDestination) {

		if (!sStyleClass) {
			return vDestination;
		}

		var Control = getControl();

		if (Control && vSource instanceof Control) {
			vSource = vSource.$();
		} else if (typeof vSource === "string") {
			vSource = jQuery.sap.byId(vSource);
		} else if (!(vSource instanceof jQuery)) {
			jQuery.sap.assert(false, 'jQuery.sap.syncStyleClass(): vSource must be a jQuery object or a Control or a string');
			return vDestination;
		}

		var bClassFound = !!vSource.closest("." + sStyleClass).length;

		if (vDestination instanceof jQuery) {
			vDestination.toggleClass(sStyleClass, bClassFound);
		} else if (Control && vDestination instanceof Control) {
			vDestination.toggleStyleClass(sStyleClass, bClassFound);
		} else {
			jQuery.sap.assert(false, 'jQuery.sap.syncStyleClass(): vDestination must be a jQuery object or a Control');
		}

		return vDestination;
	};

	/**
	 * Adds space separated value to the given attribute.
	 * This method ignores when the value is already available for the given attribute.
	 *
	 * @this {jQuery} jQuery context
	 * @param {string} sAttribute The name of the attribute.
	 * @param {string} sValue The value of the attribute to be inserted.
	 * @param {string} [bPrepend=false] whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @private
	 */
	function addToAttributeList(sAttribute, sValue, bPrepend) {
		var sAttributes = this.attr(sAttribute);
		if (!sAttributes) {
			return this.attr(sAttribute, sValue);
		}

		var aAttributes = sAttributes.split(" ");
		if (aAttributes.indexOf(sValue) == -1) {
			bPrepend ? aAttributes.unshift(sValue) : aAttributes.push(sValue);
			this.attr(sAttribute, aAttributes.join(" "));
		}

		return this;
	}

	/**
	 * Remove space separated value from the given attribute.
	 *
	 * @this {jQuery} jQuery context
	 * @param {string} sAttribute The name of the attribute.
	 * @param {string} sValue The value of the attribute to be inserted.
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 * @private
	 */
	function removeFromAttributeList(sAttribute, sValue) {
		var sAttributes = this.attr(sAttribute) || "",
			aAttributes = sAttributes.split(" "),
			iIndex = aAttributes.indexOf(sValue);

		if (iIndex == -1) {
			return this;
		}

		aAttributes.splice(iIndex, 1);
		if (aAttributes.length) {
			this.attr(sAttribute, aAttributes.join(" "));
		} else {
			this.removeAttr(sAttribute);
		}

		return this;
	}

	/**
	 * Adds the given ID reference to the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#addAriaLabelledBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 */
	jQuery.fn.addAriaLabelledBy = function (sId, bPrepend) {
		return addToAttributeList.call(this, "aria-labelledby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#removeAriaLabelledBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 */
	jQuery.fn.removeAriaLabelledBy = function (sId) {
		return removeFromAttributeList.call(this, "aria-labelledby", sId);
	};

	/**
	 * Adds the given ID reference to the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#addAriaDescribedBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 */
	jQuery.fn.addAriaDescribedBy = function (sId, bPrepend) {
		return addToAttributeList.call(this, "aria-describedby", sId, bPrepend);
	};

	/**
	 * Removes the given ID reference from the aria-describedby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#removeAriaDescribedBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 */
	jQuery.fn.removeAriaDescribedBy = function (sId) {
		return removeFromAttributeList.call(this, "aria-describedby", sId);
	};


	/**
	 * This method try to patch two HTML elements according to changed attributes.
	 *
	 * @param {HTMLElement} oOldDom existing element to be patched
	 * @param {HTMLElement} oNewDom is the new node to patch old dom
	 * @return {boolean} true when patch is applied correctly or false when nodes are replaced.
	 * @author SAP SE
	 * @since 1.30.0
	 * @private
	 */
	function patchDOM(oOldDom, oNewDom) {

		// start checking with most common use case and backwards compatible
		if (oOldDom.childElementCount != oNewDom.childElementCount ||
			oOldDom.tagName != oNewDom.tagName) {
			oOldDom.parentNode.replaceChild(oNewDom, oOldDom);
			return false;
		}

		// go with native... if nodes are equal there is nothing to do
		// http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode
		if (oOldDom.isEqualNode(oNewDom)) {
			return true;
		}

		// remove outdated attributes from old dom
		var aOldAttributes = oOldDom.attributes;
		for (var i = 0, ii = aOldAttributes.length; i < ii; i++) {
			var sAttrName = aOldAttributes[i].name;
			if (oNewDom.getAttribute(sAttrName) === null) {
				oOldDom.removeAttribute(sAttrName);
				ii = ii - 1;
				i = i - 1;
			}
		}

		// patch new or changed attributes to the old dom
		var aNewAttributes = oNewDom.attributes;
		for (var i = 0, ii = aNewAttributes.length; i < ii; i++) {
			var sAttrName = aNewAttributes[i].name,
				vOldAttrValue = oOldDom.getAttribute(sAttrName),
				vNewAttrValue = oNewDom.getAttribute(sAttrName);

			if (vOldAttrValue === null || vOldAttrValue !== vNewAttrValue) {
				oOldDom.setAttribute(sAttrName, vNewAttrValue);
			}
		}

		// check whether more child nodes to continue or not
		var iNewChildNodesCount = oNewDom.childNodes.length;
		if (!iNewChildNodesCount && !oOldDom.hasChildNodes()) {
			return true;
		}

		// maybe no more child elements
		if (!oNewDom.childElementCount) {
			// but child nodes(e.g. Text Nodes) still needs to be replaced
			if (!iNewChildNodesCount) {
				// new dom does not have any child node, so we can clean the old one
				oOldDom.textContent = "";
			} else if (iNewChildNodesCount == 1 && oNewDom.firstChild.nodeType == 3 /* TEXT_NODE */) {
				// update the text content for the first text node
				oOldDom.textContent = oNewDom.textContent;
			} else {
				// in case of comments or other node types are used
				oOldDom.innerHTML = oNewDom.innerHTML;
			}
			return true;
		}

		// patch child nodes
		for (var i = 0, r = 0, ii = iNewChildNodesCount; i < ii; i++) {
			var oOldDomChildNode = oOldDom.childNodes[i],
				oNewDomChildNode = oNewDom.childNodes[i - r];

			if (oNewDomChildNode.nodeType == 1 /* ELEMENT_NODE */) {
				// recursively patch child elements
				if (!patchDOM(oOldDomChildNode, oNewDomChildNode)) {
					// if patch is not possible we replace nodes
					// in this case replaced node is removed
					r = r + 1;
				}
			} else {
				// when not element update only node values
				oOldDomChildNode.nodeValue = oNewDomChildNode.nodeValue;
			}
		}

		return true;
	}

	/**
	 * This method try to replace two HTML elements according to changed attributes.
	 * As a fallback it replaces DOM nodes.
	 *
	 * @param {HTMLElement} oOldDom existing element to be patched
	 * @param {HTMLElement|String} vNewDom is the new node to patch old dom
	 * @param {boolean} bCleanData wheter jQuery data should be removed or not
	 * @return {boolean} true when patch is applied correctly or false when nodes are replaced.
	 * @author SAP SE
	 * @since 1.30.0
	 * @private
	 */
	jQuery.sap.replaceDOM = function(oOldDom, vNewDom, bCleanData) {
		var oNewDom;
		if (typeof vNewDom === "string") {
			oNewDom = jQuery.parseHTML(vNewDom)[0];
		} else {
			oNewDom = vNewDom;
		}

		if (bCleanData) {
			jQuery.cleanData([oOldDom]);
			jQuery.cleanData(oOldDom.getElementsByTagName("*"));
		}

		return patchDOM(oOldDom, oNewDom);
	};

	return jQuery;

});

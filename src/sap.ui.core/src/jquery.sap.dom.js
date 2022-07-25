/*!
 * ${copyright}
 */

// Provides functionality related to DOM analysis and manipulation which is not provided by jQuery itself.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/dom/containsOrEquals',
	'sap/ui/core/syncStyleClass', 'sap/ui/dom/getOwnerWindow', 'sap/ui/dom/getScrollbarSize',
	'sap/ui/dom/denormalizeScrollLeftRTL', 'sap/ui/dom/denormalizeScrollBeginRTL',
	'sap/ui/dom/units/Rem', 'sap/ui/dom/jquery/Aria',
	'sap/ui/dom/jquery/Selection', 'sap/ui/dom/jquery/zIndex', 'sap/ui/dom/jquery/parentByAttribute',
	'sap/ui/dom/jquery/cursorPos', 'sap/ui/dom/jquery/selectText', 'sap/ui/dom/jquery/getSelectedText',
	'sap/ui/dom/jquery/rect', 'sap/ui/dom/jquery/rectContains', 'sap/ui/dom/jquery/Focusable',
	'sap/ui/dom/jquery/hasTabIndex', 'sap/ui/dom/jquery/scrollLeftRTL', 'sap/ui/dom/jquery/scrollRightRTL', 'sap/ui/dom/jquery/Selectors'
], function(jQuery, domContainsOrEquals, fnSyncStyleClass, domGetOwnerWindow,
	domGetScrollbarSize, domDenormalizeScrollLeftRTL, domDenormalizeScrollBeginRTL, domUnitsRem
	/*
	jqueryAria,
	jquerySelection,
	jqueryzIndex,
	jqueryParentByAttribute,
	jqueryCursorPos,
	jquerySelectText,
	jqueryGetSelectedText,
	jqueryRect,
	jqueryRectContains,
	jqueryFocusable,
	jqueryHasTabIndex,
	jqueryScrollLeftRTL,
	jqueryScrollRightRTL,
	jquerySelectors*/
) {
	"use strict";

	/**
	 * Shortcut for document.getElementById().
	 *
	 * @param {string} sId The id of the DOM element to return
	 * @param {Window} [oWindow=window] The window (optional)
	 * @returns {Element|null} The DOMNode identified by the given sId, or <code>null</code>
	 * @public
	 * @since 0.9.0
	 * @deprecated since 1.58 use <code>document.getElementById</code> instead
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
	 * @returns {jQuery} The jQuery object for the DOM element identified by the given sId
	 * @public
	 * @since 0.9.1
	 * @function
	 * @deprecated since 1.58 use <code>jQuery(document.getElementById(sId))</code> instead
	 */
	jQuery.sap.byId = function byId(sId, oContext) {
		var escapedId = "";
		if (sId) {
			// Note: This does not escape all relevant characters according to jQuery's documentation
			// (see http://api.jquery.com/category/selectors/)
			// As the behavior hasn't been changed for a long time it is not advisable to change it in
			// future as users might be already escaping characters on their own or relying on the fact
			// selector like byId("my-id > div") can be used.
			escapedId = "#" + sId.replace(/(:|\.)/g,'\\$1');
		}
		return jQuery(escapedId, oContext);
	};

	/**
	 * Calls focus() on the given DOM element.
	 *
	 * @param {Element} oDomRef The DOM element to focus (or null - in this case the method does nothing)
	 * @returns {boolean|undefined} <code>true</code> when the focus() command was executed without an error, otherwise undefined.
	 * @public
	 * @since 1.1.2
	 * @function
	 * @deprecated since 1.58 use <code>oDomRef.focus()</code> instead
	 */
	jQuery.sap.focus = function focus(oDomRef) {
		if (!oDomRef) {
			return;
		}
		oDomRef.focus();
		return true;
	};

	/*
	 * Convert <code>px</code> values to <code>rem</code>.
	 *
	 * @param {string|float} vPx The value in <code>px</code> units. E.g.: <code>"16px"</code> or <code>16</code>
	 * @returns {float} The converted value in <code>rem</code> units. E.g.: <code>1</code>
	 * @protected
	 * @since 1.48
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/units/Rem.fromPx} instead
	 */
	jQuery.sap.pxToRem = domUnitsRem.fromPx;

	/*
	 * Convert <code>rem</code> values to <code>px</code>.
	 *
	 * @param {string|float} vRem The value in <code>rem</code>. E.g.: <code>"1rem"</code> or <code>1</code>
	 * @returns {float} The converted value in <code>px</code> units. E.g.: <code>16</code>
	 * @protected
	 * @since 1.48
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/units/Rem.toPx} instead
	 */
	jQuery.sap.remToPx = domUnitsRem.toPx;

	/**
	 * Returns the outer HTML of the given HTML element.
	 *
	 * @returns {string} outer HTML
	 * @public
	 * @name jQuery#outerHTML
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @deprecated since 1.58 use native <code>Element#outerHTML</code> instead
	 */
	jQuery.fn.outerHTML = function() {
		var oDomRef = this.get(0);

		if (oDomRef && oDomRef.outerHTML) {
			return oDomRef.outerHTML.trim();
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
	 * For compatibility reasons it returns <code>true</code> if <code>oDomRefContainer</code> and
	 * <code>oDomRefChild</code> are equal.
	 *
	 * This method intentionally does not operate on the jQuery object, as the original <code>jQuery.contains()</code>
	 * method also does not do so.
	 *
	 * @param {Element} oDomRefContainer The container element
	 * @param {Element} oDomRefChild The child element (must not be a text node, must be an element)
	 * @returns {boolean} Whether <code>oDomRefChild</code> is contained in or equal to <code>oDomRefContainer</code>
	 * @public
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/containsOrEquals} instead
	 */
	jQuery.sap.containsOrEquals = domContainsOrEquals;

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
	 * @returns {int} The scroll position that must be set for the DOM element
	 * @public
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/denormalizeScrollLeftRTL} instead
	 */
	jQuery.sap.denormalizeScrollLeftRTL = domDenormalizeScrollLeftRTL;

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
	 * @returns {int} The scroll position that must be set for the DOM element
	 * @public
	 * @author SAP SE
	 * @since 1.26.1
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/denormalizeScrollBeginRTL} instead
	 */
	jQuery.sap.denormalizeScrollBeginRTL = domDenormalizeScrollBeginRTL;

	/*
	 * The following implementation of jQuery.support.selectstart is taken from jQuery UI core but modified.
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

	/**
	 * States whether the selectstart event is supported by the browser.
	 *
	 * @private
	 * @type {boolean}
	 * @deprecated since 1.58
	 */
	jQuery.support.selectstart = "onselectstart" in document.createElement("div");

	/**
	 * Returns the window reference for a DomRef.
	 *
	 * @param {Element} oDomRef The DOM reference
	 * @returns {Window} Window reference
	 * @public
	 * @since 0.9.0
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/getOwnerWindow} instead
	 */
	jQuery.sap.ownerWindow = domGetOwnerWindow;

	/**
	 * Returns the size (width of the vertical / height of the horizontal) native browser scrollbars.
	 *
	 * This function must only be used when the DOM is ready.
	 *
	 * @param {string} [sClasses=null] the CSS class that should be added to the test element.
	 * @param {boolean} [bForce=false] force recalculation of size (e.g. when CSS was changed). When no classes are passed all calculated sizes are reset.
	 * @returns {{width: number, height: number}} JSON object with properties <code>width</code> and <code>height</code> (the values are of type number and are pixels).
	 * @public
	 * @since 1.4.0
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/getScrollbarSize} instead
	 */
	jQuery.sap.scrollbarSize = domGetScrollbarSize;

	/**
	 * Search ancestors of the given source DOM element for the specified CSS class name.
	 * If the class name is found, set it to the root DOM element of the target control.
	 * If the class name is not found, it is also removed from the target DOM element.
	 *
	 * @param {string} sStyleClass CSS class name
	 * @param {jQuery|sap.ui.core.Control|string} vSource jQuery object, control or an id of the source element.
	 * @param {jQuery|sap.ui.core.Control} vDestination target jQuery object or a control.
	 * @returns {jQuery|Element} Target element
	 * @public
	 * @since 1.22
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/core/syncStyleClass} instead
	 */
	jQuery.sap.syncStyleClass = fnSyncStyleClass;

	return jQuery;

});

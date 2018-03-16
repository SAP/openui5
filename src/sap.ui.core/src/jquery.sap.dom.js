/*!
 * ${copyright}
 */

// Provides functionality related to DOM analysis and manipulation which is not provided by jQuery itself.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/dom/focus', 'sap/ui/dom/containsOrEquals',
	'sap/ui/dom/replaceNode', 'sap/ui/dom/syncStyleClass', 'sap/ui/dom/ownerWindow', 'sap/ui/dom/scrollbarSize',
	'sap/ui/dom/denormalizeScrollLeftRTL', 'sap/ui/dom/denormalizeScrollBeginRTL',
	'sap/ui/dom/units/Rem', 'sap/ui/dom/jquery/byId', 'sap/ui/dom/jquery/Aria',
	'sap/ui/dom/jquery/Selection', 'sap/ui/dom/jquery/zIndex', 'sap/ui/dom/jquery/parentByAttribute',
	'sap/ui/dom/jquery/cursorPos', 'sap/ui/dom/jquery/selectText', 'sap/ui/dom/jquery/getSelectedText',
	'sap/ui/dom/jquery/outerHTML', 'sap/ui/dom/jquery/rect', 'sap/ui/dom/jquery/rectContains', 'sap/ui/dom/jquery/Focusable',
	'sap/ui/dom/jquery/hasTabIndex', 'sap/ui/dom/jquery/scrollLeftRTL', 'sap/ui/dom/jquery/scrollRightRTL', 'sap/ui/dom/jquery/Selectors'
], function(jQuery, domFocus, domContainsOrEquals, domReplaceNode, domSyncStyleClass, domOwnerWindow,
	domScrollbarSize, domDenormalizeScrollLeftRTL, domDenormalizeScrollBeginRTL, domUnitsRem,
	jqueryById/*,
	jqueryAria,
	jquerySelection,
	jqueryzIndex,
	jqueryParentByAttribute,
	jqueryCursorPos,
	jquerySelectText,
	jqueryGetSelectedText,
	jqueryOuterHTML,
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
	 * @return {Element} The DOMNode identified by the given sId
	 * @public
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
	 * @function
	 */
	jQuery.sap.byId = jqueryById;


	/**
	 * Calls focus() on the given DOM element.
	 *
	 * @param {Element} oDomRef The DOM element to focus (or null - in this case the method does nothing)
	 * @return {boolean} Whether the focus() command was executed without an error
	 * @public
	 * @since 1.1.2
	 * @function
	 */
	jQuery.sap.focus = domFocus;

	/*
	 * Convert <code>px</code> values to <code>rem</code>.
	 *
	 * @param {string|float} vPx The value in <code>px</code> units. E.g.: <code>"16px"</code> or <code>16</code>
	 * @returns {float} The converted value in <code>rem</code> units. E.g.: <code>1</code>
	 * @protected
	 * @since 1.48
	 */
	jQuery.sap.pxToRem = domUnitsRem.fromPx;

	/*
	 * Convert <code>rem</code> values to <code>px</code>.
	 *
	 * @param {string|float} vRem The value in <code>rem</code>. E.g.: <code>"1rem"</code> or <code>1</code>
	 * @returns {float} The converted value in <code>px</code> units. E.g.: <code>16</code>
	 * @protected
	 * @since 1.48
	 */
	jQuery.sap.remToPx = domUnitsRem.toPx;

	/**
	 * Sets or gets the position of the cursor in an element that supports cursor positioning.
	 *
	 * @param {int} iPos The cursor position to set (or no parameter to retrieve the cursor position)
	 * @return {int | jQuery} The cursor position (or the jQuery collection if the position has been set)
	 * @public
	 * @name jQuery#cursorPos
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */

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

	/**
	 * Returns the outer HTML of the given HTML element.
	 *
	 * @return {string} outer HTML
	 * @public
	 * @name jQuery#outerHTML
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */

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
	 * @function
	 */
	jQuery.sap.containsOrEquals = domContainsOrEquals;

	/**
	 * Returns a rectangle describing the current visual positioning of the first DOM object in the collection
	 * (or <code>null</code> if no element was given).
	 *
	 * @return {object} An object with left, top, width and height
	 * @public
	 * @name jQuery#rect
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */

	/**
	 * Returns whether a point described by X and Y is inside this Rectangle's boundaries.
	 *
	 * @param {int} iPosX The X coordinate
	 * @param {int} iPosY The Y coordinate
	 * @return {boolean} Whether X and Y are inside this Rectangle's boundaries
	 * @public
	 * @name jQuery#rectContains
	 * @author SAP SE
	 * @since 0.18.0
	 * @function
	 */

	/**
	 * Returns <code>true</code> if the first element has a set tabindex.
	 *
	 * @return {boolean} If the first element has a set tabindex
	 * @public
	 * @name jQuery#hasTabIndex
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 */

	/**
	 * Returns the first focusable domRef in a given container (the first element of the collection)
	 *
	 * @return {Element} The domRef
	 * @public
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @name jQuery#firstFocusableDomRef
	 */

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
	 * @param {int} iPos The desired scroll position
	 * @return {jQuery | int} The jQuery collection if iPos is given, otherwise the scroll position, counted from the leftmost position
	 * @public
	 * @name jQuery#scrollLeftRTL
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 */

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
	 * @function
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
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @author SAP SE
	 * @since 1.26.1
	 * @function
	 */
	jQuery.sap.denormalizeScrollBeginRTL = domDenormalizeScrollBeginRTL;


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

	/**
	 * States whether the selectstart event is supported by the browser.
	 *
	 * @private
	 * @type {boolean}
	 */
	jQuery.support.selectstart = "onselectstart" in document.createElement("div");

	/**
	 * Disable HTML elements selection.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.24.0
	 * @name jQuery#disableSelection
	 * @function
	 */

	/**
	 * Enable HTML elements to get selected.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.24.0
	 * @name jQuery#enableSelection
	 * @function
	 */

	/**
	 * Get the z-index for an element.
	 *
	 * @param {Integer} zIndex The z-index to set
	 * @returns {number} The z-index
	 * @public
	 * @name jQuery#zIndex
	 * @function
	 */

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

	/**
	 * Returns the window reference for a DomRef.
	 *
	 * @param {Element} oDomRef The DOM reference
	 * @return {Window} Window reference
	 * @public
	 * @since 0.9.0
	 * @function
	 */
	jQuery.sap.ownerWindow = domOwnerWindow;

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
	 * @function
	 */
	jQuery.sap.scrollbarSize = domScrollbarSize;

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
	 * @function
	 */
	jQuery.sap.syncStyleClass = domSyncStyleClass;

	/**
	 * Adds the given ID reference to the the aria-labelledby attribute.
	 *
	 * @param {string} sId The ID reference of an element
	 * @param {boolean} [bPrepend=false] Whether prepend or not
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @name jQuery#addAriaLabelledBy
	 * @public
	 * @author SAP SE
	 * @since 1.30.0
	 * @function
	 */

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
	 * @function
	 */
	jQuery.sap.replaceDOM = domReplaceNode;

	return jQuery;

});

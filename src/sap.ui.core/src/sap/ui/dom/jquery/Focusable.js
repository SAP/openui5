/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/dom/jquery/hasTabIndex"], function(jQuery, domHasTabIndex) {
	"use strict";

	/**
	 * @exports sap/ui/dom/Focusable
	 */
	var Focusable = Object.create(null);

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
	 * @returns {boolean} Whether the Element either has only zero dimensions or has visiblity:hidden (CSS)
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

				if ( jQuery(oChild).hasTabIndex() ) {
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
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Focusable.firstDomRef = function() {
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
	 * @private
	 * @author SAP SE
	 * @function
	 */
	Focusable.lastDomRef = function() {
		var oContainerDomRef = this.get(0);

		if ( !oContainerDomRef || isHidden(oContainerDomRef) ) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search backwards */ false);
	};


	jQuery.fn.firstFocusableDomRef = Focusable.firstDomRef;
	jQuery.fn.lastFocusableDomRef = Focusable.lastDomRef;

	return jQuery;

});


/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/hasTabIndex",
	"sap/ui/dom/isHidden"
], function(jQuery, domHasTabIndex, isHidden) {
	"use strict";

	/**
	 * This module provides the following API:
	 * <ul>
	 * <li>{@link jQuery#firstFocusableDomRef}</li>
	 * <li>{@link jQuery#lastFocusableDomRef}</li>
	 * <ul>
	 * @namespace
	 * @name module:sap/ui/dom/jquery/Focusable
	 * @public
	 * @since 1.58
	 */

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
	 * @public
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @name jQuery#firstFocusableDomRef
	 * @requires module:sap/ui/dom/jquery/Focusable
	 */
	jQuery.fn.firstFocusableDomRef = function() {
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
	 * @requires module:sap/ui/dom/jquery/Focusable
	 */
	jQuery.fn.lastFocusableDomRef = function() {
		var oContainerDomRef = this.get(0);

		if ( !oContainerDomRef || isHidden(oContainerDomRef) ) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search backwards */ false);
	};

	return jQuery;

});


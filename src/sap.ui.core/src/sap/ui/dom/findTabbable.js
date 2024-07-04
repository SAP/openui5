/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/dom/jquery/Selectors'
], function() {
	"use strict";

	/**
	 * Finds the next element in the DOM tree based on the given parameters.
	 * @param {Object} mParams The parameters for finding the next element.
	 * @param {Element} mParams.element The current element.
	 * @param {boolean} mParams.skipChild Whether to skip child elements.
	 * @param {Element} mParams.scope The scope within which to find the next element.
	 * @returns {Element} The next element in the DOM tree.
	 */
	function findNextElement(mParams) {
		var oElement = mParams.element;
		var bSkipChild = mParams.skipChild;
		var oScope = mParams.scope;

		if (!oElement) {
			return;
		}

		if (oElement.id === "sap-ui-static") {
			// skip the check in static UIArea
			// when oScope is within static UIArea, this function will never reach the static UIArea
			bSkipChild = true;
		}

		// First check for child elements
		if (!bSkipChild) {
			if (oElement.shadowRoot && oElement.shadowRoot.firstElementChild) {
				return oElement.shadowRoot.firstElementChild;
			} else if (oElement.assignedElements && oElement.assignedElements().length) {
				return oElement.assignedElements()[0];
			} else if (oElement.firstElementChild) {
				return oElement.firstElementChild;
			}
		}

		// If there are no child elements or in case we children were skipped, check for the next sibling
		// Next element sibling should be only considered if there is no slot assigned (no Web Component)
		// If a slot is assigned, check for the next logical slot element (Web Component)
		// nextElementSibling also returns the next slot element but the slot elements in DOM must not
		// necessarily be grouped by the slots
		if (oElement.assignedSlot) {
			var aAssignedElements = oElement.assignedSlot.assignedElements();
			var iNextSlotIndex = aAssignedElements.indexOf(oElement) + 1;
			if (iNextSlotIndex < aAssignedElements.length) {
				return aAssignedElements[iNextSlotIndex];
			}
		} else if (oElement.nextElementSibling) {
			return oElement.nextElementSibling;
		}

		// Return the scope in case our parent is the scope
		if (oElement.parentNode === oScope) {
			return oScope;
		}

		// Check the parent element for the next DOM element
		return findNextElement({
			element: oElement.assignedSlot || oElement.parentElement || oElement.parentNode || oElement.host,
			skipChild: true,
			scope: oScope
		});
	}

	/**
	 * Finds the previous element in the DOM tree based on the given parameters.
	 * @param {Object} mParams The parameters for finding the previous element.
	 * @param {Element} mParams.element The current element.
	 * @param {Element} mParams.scope The scope within which to find the previous element.
	 * @param {boolean} [mParams.checkChildren=false] Whether to check children of the element.
	 * @returns {Element} The previous element in the DOM tree.
	 */
	function findPreviousElement(mParams) {
		var oElement = mParams.element;
		var oScope = mParams.scope;
		var bCheckChildren = mParams.checkChildren || oElement === oScope;
		var aAssignedElements;

		if (!oElement) {
			return;
		}

		if (oElement.id === "sap-ui-static") {
			// skip the check in static UIArea
			// when oScope is within static UIArea, this function will never reach the static UIArea
			bCheckChildren = false;
		}

		if (bCheckChildren) {
			var oChildElement;
			// Check if there is a child element
			if (oElement.shadowRoot) {
				oChildElement = oElement.shadowRoot;
			} else if (oElement.lastElementChild) {
				oChildElement = oElement.lastElementChild;
			} else if (oElement.assignedElements && oElement.assignedElements().length) {
				aAssignedElements = oElement.assignedElements();
				oChildElement = aAssignedElements[aAssignedElements.length - 1];
			}

			if (oChildElement) {
				// If a child element exist, check for children of the detected child
				return findPreviousElement({
					element: oChildElement,
					checkChildren: true,
					scope: oScope
				});
			} else {
				// In case there are no child elements return the current element
				// except the current element is a #shadowRoot (nodeType === 11)
				return oElement.nodeType === 11 ? oElement.host : oElement;
			}
		}

		// In case children should be skipped, check for the previous element sibling first.
		// Previous element sibling should be only considered if there is no slot assigned (no Web Component)
		// If a slot is assigned, check for the previous logical slot element (Web Component)
		// previousElementSibling also returns the previous slot element but the slot elements in DOM must not
		// necessarily be grouped by the slots
		if (oElement.assignedSlot) {
			aAssignedElements = oElement.assignedSlot.assignedElements();
			var iPreviousSlotIndex = aAssignedElements.indexOf(oElement) - 1;
			if (iPreviousSlotIndex >= 0) {
				return findPreviousElement({
					element: aAssignedElements[iPreviousSlotIndex],
					checkChildren: true,
					scope: oScope
				});
			}
		} else if (oElement.previousElementSibling) {
			return findPreviousElement({
				element: oElement.previousElementSibling,
				checkChildren: true,
				scope: oScope
			});
		}

		var oParentElement;
		// If did not find something check for assignedSlot, shadowRoot and parentElement
		if (oElement.assignedSlot) {
			oParentElement = oElement.assignedSlot;
		} else if (oElement.parentElement) {
			oParentElement = oElement.parentElement;
		} else if (oElement.parentNode) {
			// when oElement is a direct child of #shadow-root, return the host of the #shadow-root directly
			oParentElement = oElement.parentNode.host;
		}

		return oParentElement;
	}

	/**
	 * Finds the next tabbable element within the specified scope.
	 * @param {Element} oOriginalElement The original element from which to start searching.
	 * @param {Object} oConfig The configuration object for finding the tabbable element.
	 * @param {Element} [oConfig.scope=document.documentElement] The scope within which to search for the tabbable element.
	 * @param {boolean} [oConfig.forward=true] Whether to search forward or backward.
	 * @param {boolean} [oConfig.skipChild=false] Whether to skip child elements.
	 * @returns {Object} An object containing the found tabbable element and a flag indicating if the search started over.
	 */
	function findTabbable(oOriginalElement, oConfig) {
		const oScope = oConfig.scope || document.documentElement;
		const bForward = !!oConfig.forward;
		const bSkipChild = !!oConfig.skipChild;
		let bStartOver = false;

		/**
		 * Helper function to recursively find the tabbable element.
		 * @param {Element} oElement The current element.
		 * @param {boolean} bSkipChild Whether to skip child elements.
		 * @returns {Object|undefined} An object containing the found tabbable element and a flag indicating if the search started over or 'undefined' if nothing is found.
		 * @private
		 */
		function _findTabbable(oElement, bSkipChild) {
			var oNextElement;

			if (bForward) {
				oNextElement = findNextElement({
					element: oElement,
					scope: oScope,
					skipChild: bSkipChild
				});
			} else {
				oNextElement = findPreviousElement({
					element: oElement,
					scope: oScope
				});
			}

			if (!oNextElement) {
				return;
			}

			if (oNextElement === oScope) {
				bStartOver = true;
			}

			if (bStartOver && oNextElement === oOriginalElement) {
				return {
					element: null,
					startOver: true
				};
			}

			if (jQuery.expr.pseudos.sapTabbable(oNextElement)) {
				return {
					element: oNextElement,
					startOver: bStartOver
				};
			} else {
				return _findTabbable(oNextElement);
			}
		}

		return _findTabbable(oOriginalElement, bSkipChild);
	}

	return findTabbable;
});

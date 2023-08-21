/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/events/PseudoEvents',
	'sap/ui/dom/jquery/Selectors'
], function (jQuery, PseudoEvents/*, sapTabbable */) {
	"use strict";

	/**
	 * Central handler for F6 key event. Based on the current target and the given event the next element in the F6 chain is focused.
	 *
	 * This handler might be also called manually. In this case the central handler is deactivated for the given event.
	 *
	 * If the event is not a keydown event, it does not represent the F6 key, the default behavior is prevented,
	 * the handling is explicitly skipped (<code>oSettings.skip</code>) or the target (<code>oSettings.target</code>) is not contained
	 * in the used scopes (<code>oSettings.scope</code>), the event is skipped.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/events/F6Navigation
	 * @private
	 * @ui5-restricted sap.ui.core, sap.m, sap.uxap
	 */
	var F6Navigation = {};

	var bStartOver = false;

	/**
	 * CustomData attribute name for fast navigation groups (in DOM additional prefix "data-" is needed)
	 *
	 * @type string
	 * @const
	 * @private
	 * @ui5-restricted sap.ui.core, sap.m, sap.uxap
	 */
	F6Navigation.fastNavigationKey = "sap-ui-fastnavgroup";

	function getFastNavGroup(oElement) {
		var oHtmlElement = document.querySelector("html");
		var oFastNavGroup, oCustomFastNavGroup;

		while (oElement && oElement !== oHtmlElement) {
			if (oElement.getAttribute("data-sap-ui-customfastnavgroup") === "true") {
				oCustomFastNavGroup = oElement;
			}
			if (oElement.getAttribute("data-sap-ui-fastnavgroup") === "true") {
				oFastNavGroup = oFastNavGroup || oElement;
			}
			if (oCustomFastNavGroup) {
				break;
			}
			oElement = oElement.assignedSlot || oElement.parentElement || oElement.parentNode.host;
		}

		return oCustomFastNavGroup || oFastNavGroup;
	}

	function getActiveElement(oRoot) {
		if (oRoot.activeElement && oRoot.activeElement.shadowRoot) {
			return getActiveElement(oRoot.activeElement.shadowRoot);
		}

		return oRoot.activeElement;
	}

	function isContainedIn(oTarget, oScope) {
		var oParentElement = oTarget.parentElement || oTarget.parentNode || oTarget.host;
		if (oParentElement && oParentElement !== oScope) {
			return isContainedIn(oParentElement, oScope);
		}
		return oTarget !== document;
	}

	function findNextElement(mParams) {
		var oElement = mParams.element;
		var bSkipChild = mParams.skipChild;
		var oScope = mParams.scope;

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

	function findPreviousElement(mParams) {
		var oElement = mParams.element;
		var oScope = mParams.scope;
		var bCheckChildren = mParams.checkChildren || oElement === oScope;
		var aAssignedElements;

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

	function findTabbable(oOriginalElement, oScope, bForward) {
		var oNextElement;

		if (bForward) {
			oNextElement = findNextElement({
				element: oOriginalElement,
				scope: oScope
			});
		} else {
			oNextElement = findPreviousElement({
				element: oOriginalElement,
				scope: oScope
			});
		}

		if (oNextElement === oScope) {
			bStartOver = true;
		}

		if (jQuery.expr.pseudos.sapTabbable(oNextElement)) {
			var oRes = {
				element: oNextElement,
				startOver: bStartOver
			};

			bStartOver = false;

			return oRes;
		} else {
			return findTabbable(oNextElement, oScope, bForward);
		}
	}

	/**
	 * Handles the F6 key event.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core, sap.m, sap.uxap
	 * @param {jQuery.Event} oEvent a <code>keydown</code> event object.
	 * @param {object} [oSettings] further options in case the handler is called manually.
	 * @param {boolean} [oSettings.skip=false] whether the event should be ignored by the central handler (see above)
	 * @param {Element} [oSettings.target=document.activeElement] the DOMNode which should be used as starting point to find the next DOMNode in the F6 chain.
	 * @param {Element[]} [oSettings.scope=[document]] the DOMNodes(s) which are used for the F6 chain search
	 */
	F6Navigation.handleF6GroupNavigation = function (oEvent, oSettings) {
		// Use PseudoEvent check in order to verify validity of shortcuts
		var oSapSkipForward = PseudoEvents.events.sapskipforward,
			oSapSkipBack = PseudoEvents.events.sapskipback,
			bSapSkipForward = oSapSkipForward.aTypes.includes(oEvent.type) && oSapSkipForward.fnCheck(oEvent),
			bIsValidShortcut = bSapSkipForward || (oSapSkipBack.aTypes.includes(oEvent.type) && oSapSkipBack.fnCheck(oEvent)),
			oFastNavEvent = null,
			oNextTabbable;

		if (!bIsValidShortcut ||
			oEvent.isMarked("sapui5_handledF6GroupNavigation") ||
			oEvent.isMarked() ||
			oEvent.isDefaultPrevented()) {
			return;
		}

		oEvent.setMark("sapui5_handledF6GroupNavigation");
		oEvent.setMarked();
		oEvent.preventDefault();

		if (oSettings && oSettings.skip) {
			return;
		}

		var oTarget = oSettings && oSettings.target ? oSettings.target : getActiveElement(document);
		var oScope;

		if (oSettings && oSettings.scope) {
			oScope = oSettings.scope;
		} else {
			oScope = document.documentElement;
		}

		if (!isContainedIn(oTarget, oScope)) {
			return;
		}

		// Determine currently selected fast navigation group
		var oCurrentSelectedGroup = getFastNavGroup(oTarget);
		var oNextFastNavGroup;
		var oTabbableInfo;
		oNextTabbable = oTarget;

		do {
			oTabbableInfo = findTabbable(oNextTabbable, oScope, bSapSkipForward);
			oNextTabbable = oTabbableInfo.element;
			oNextFastNavGroup = getFastNavGroup(oNextTabbable);
		} while ((!oTabbableInfo.startOver && (oCurrentSelectedGroup === oNextFastNavGroup)));

		if (!bSapSkipForward) {
			var oPreviousTabbable, oPreviousFastNavGroup;
			do {
				oNextTabbable = oPreviousTabbable || oNextTabbable;
				oTabbableInfo = findTabbable(oNextTabbable, oScope, bSapSkipForward);
				oPreviousTabbable = oTabbableInfo.element;
				oPreviousFastNavGroup = getFastNavGroup(oPreviousTabbable);
			} while (oPreviousFastNavGroup === oNextFastNavGroup && !oTabbableInfo.startOver);
		}

		if (oNextFastNavGroup && oNextFastNavGroup.getAttribute("data-sap-ui-customfastnavgroup") === "true" && oNextFastNavGroup.id) {
			var Element = sap.ui.require("sap/ui/core/Element");
			var oControl = Element?.getElementById(oNextFastNavGroup.id);
			if (oControl) {
				oFastNavEvent = jQuery.Event("BeforeFastNavigationFocus");
				oFastNavEvent.target = oNextTabbable;
				oFastNavEvent.source = oTarget;
				oFastNavEvent.forward = bSapSkipForward;
				oControl._handleEvent(oFastNavEvent);
			}
		}

		if (!oFastNavEvent || !oFastNavEvent.isDefaultPrevented()) {
			oNextTabbable.focus();
		}
	};

	return F6Navigation;
});
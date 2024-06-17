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
	'sap/ui/dom/findTabbable'
], function (jQuery, PseudoEvents, findTabbable) {
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
			oTabbableInfo = findTabbable(oNextTabbable, {
				scope: oScope,
				forward: bSapSkipForward
			});
			oNextTabbable = oTabbableInfo.element;
			oNextFastNavGroup = getFastNavGroup(oNextTabbable);
		} while ((!oTabbableInfo.startOver && (oCurrentSelectedGroup === oNextFastNavGroup)));

		if (!bSapSkipForward) {
			var oPreviousTabbable, oPreviousFastNavGroup;
			do {
				oNextTabbable = oPreviousTabbable || oNextTabbable;
				oTabbableInfo = findTabbable(oNextTabbable, {
					scope: oScope,
					forward: bSapSkipForward
				});
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
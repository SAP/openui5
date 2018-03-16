/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/base/events/KeyCodes',
	'sap/ui/dom/focus',
	'sap/ui/thirdparty/jquery'
], function(KeyCodes, focus /*,jQuery*/) {
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
	 * @param {jQuery.Event} oEvent a <code>keydown</code> event object.
	 * @param {object} [oSettings] further options in case the handler is called manually.
	 * @param {boolean} [oSettings.skip=false] whether the event should be ignored by the central handler (see above)
	 * @param {Element} [oSettings.target=document.activeElement] the DOMNode which should be used as starting point to find the next DOMNode in the F6 chain.
	 * @param {Element[]} [oSettings.scope=[document]] the DOMNodes(s) which are used for the F6 chain search
	 * @static
	 * @private
	 */


	/**
	 * @exports sap/ui/events/F6Navigation
	 * @private
	 */
	var oF6Navigation = {};

	// CustomData attribute name for fast navigation groups (in DOM additional prefix "data-" is needed)
	oF6Navigation.fastNavigationKey = "sap-ui-fastnavgroup";

	oF6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {

		// Returns the nearest parent DomRef of the given DomRef with attribute data-sap-ui-customfastnavgroup="true".
		function findClosestCustomGroup(oRef) {
			var $Group = jQuery(oRef).closest('[data-sap-ui-customfastnavgroup="true"]');
			return $Group[0];
		}

		// Returns the nearest parent DomRef of the given DomRef with attribute data-sap-ui-fastnavgroup="true" or
		// (if available) the nearest parent with attribute data-sap-ui-customfastnavgroup="true".
		function findClosestGroup(oRef) {
			var oGroup = findClosestCustomGroup(oRef);
			if (oGroup) {
				return oGroup;
			}

			var $Group = jQuery(oRef).closest('[data-' + oF6Navigation.fastNavigationKey + '="true"]');
			return $Group[0];
		}

		// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef) within the given scopes (DOMRefs)
		function findTabbables(oRef, aScopes, bNext) {
			var $Ref = jQuery(oRef),
				$All, $Tabbables;

			if (bNext) {
				$All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
				$Tabbables = $All.find(':sapTabbable').addBack(':sapTabbable');
			} else {
				$All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
				$Tabbables = jQuery.merge($Ref.parents(':sapTabbable'), $All.find(':sapTabbable').addBack(':sapTabbable'));
			}

			var $Tabbables = jQuery.unique($Tabbables);
			return $Tabbables.filter(function() {
				return isContained(aScopes, this);
			});
		}

		// Filters all elements in the given jQuery object which are in the static UIArea and which are not in the given scopes.
		function filterStaticAreaContent($Refs, aScopes) {
			var oStaticArea = window.document.getElementById("sap-ui-static");
			if (!oStaticArea) {
				return $Refs;
			}

			var aScopesInStaticArea = [];
			for (var i = 0; i < aScopes.length; i++) {
				if (jQuery.contains(oStaticArea, aScopes[i])) {
					aScopesInStaticArea.push(aScopes[i]);
				}
			}

			return $Refs.filter(function() {
				if (aScopesInStaticArea.length && isContained(aScopesInStaticArea, this)) {
					return true;
				}
				return !jQuery.contains(oStaticArea, this);
			});
		}

		// Checks whether the given DomRef is contained or equals (in) one of the given container
		function isContained(aContainers, oRef) {
			for (var i = 0; i < aContainers.length; i++) {
				if (aContainers[i] === oRef || jQuery.contains(aContainers[i], oRef)) {
					return true;
				}
			}
			return false;
		}

		//see navigate() (bForward = false)
		function findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $Tabbables, oSouceGroup, bFindPreviousGroup) {
			var oGroup, $Target;

			for (var i = $Tabbables.length - 1; i >= 0; i--) {
				oGroup = findClosestGroup($Tabbables[i]);
				if (oGroup != oSouceGroup) {
					if (bFindPreviousGroup) {
						//First find last tabbable of previous group and remember this new group (named "X" in the following comments)
						oSouceGroup = oGroup;
						bFindPreviousGroup = false;
					} else {
						//Then starting from group X and try to find again the last tabbable of previous group (named "Y")
						//-> Jump one tabbable back to get the first tabbable of X
						$Target = jQuery($Tabbables[i + 1]);
						break;
					}
				}
			}

			if (!$Target && !bFindPreviousGroup) {
				//Group X found but not group Y -> X is the first group -> Focus the first tabbable scope (e.g. page) element
				$Target = $FirstTabbableInScope;
			}

			return $Target;
		}

		// Finds the next/previous (bForward) element in the F6 chain starting from the given source element within the given scopes and focus it
		function navigate(oSource, aScopes, bForward) {
			if (!aScopes || aScopes.length == 0) {
				aScopes = [document];
			}

			if (!isContained(aScopes, oSource)) {
				return;
			}

			var oSouceGroup = findClosestGroup(oSource),
				$AllTabbables = filterStaticAreaContent(jQuery(aScopes).find(':sapTabbable').addBack(':sapTabbable'), aScopes),
				$FirstTabbableInScope = $AllTabbables.first(),
				$Tabbables = filterStaticAreaContent(findTabbables(oSource, aScopes, bForward), aScopes),
				oGroup, $Target;

			if (bForward) {
				//Find the first next tabbable within another group
				for (var i = 0; i < $Tabbables.length; i++) {
					oGroup = findClosestGroup($Tabbables[i]);
					if (oGroup != oSouceGroup) {
						$Target = jQuery($Tabbables[i]);
						break;
					}
				}

				//If not found, end of scope (e.g. page) is reached -> Focus the first tabbable scope (e.g. page) element
				if (!$Target || !$Target.length) {
					$Target = $FirstTabbableInScope;
				}
			} else {
				$Target = findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $Tabbables, oSouceGroup, true);

				if (!$Target || !$Target.length) {
					//No other group found before -> find first element of last group in the scope (e.g. page)

					if ($AllTabbables.length == 1) {
						//Only one tabbable element -> use it
						$Target = jQuery($AllTabbables[0]);
					} else if ($AllTabbables.length > 1) {
						oSouceGroup = findClosestGroup($AllTabbables.eq(-1));
						oGroup = findClosestGroup($AllTabbables.eq(-2));
						if (oSouceGroup != oGroup) {
							//Last tabbable scope (e.g. page) element and the previous tabbable scope (e.g. page) element have different groups -> last tabbable scope (e.g. page) element is first tabbable element of its group
							$Target = $AllTabbables.eq(-1);
						} else {
							//Take last tabbable scope (e.g. page) element as reference and start search for first tabbable of the same group
							$Target = findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $AllTabbables, oSouceGroup, false);
						}
					}
				}
			}

			if ($Target && $Target.length) {
				var oTarget = $Target[0],
					oEvent = null,
					oCustomGroup = findClosestCustomGroup(oTarget);

				if (oCustomGroup && oCustomGroup.id) {
					var oControl = sap.ui.getCore().byId(oCustomGroup.id);
					if (oControl) {
						oEvent = jQuery.Event("BeforeFastNavigationFocus");
						oEvent.target = oTarget;
						oEvent.source = oSource;
						oEvent.forward = bForward;
						oControl._handleEvent(oEvent);
					}
				}

				if (!oEvent || !oEvent.isDefaultPrevented()) {
					focus(oTarget);
				}
			}
		}

		if (oEvent.type != "keydown" ||
			oEvent.keyCode != KeyCodes.F6 ||
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

		var oTarget = oSettings && oSettings.target ? oSettings.target : document.activeElement,
			aScopes = null;

		if (oSettings && oSettings.scope) {
			aScopes = Array.isArray(oSettings.scope) ? oSettings.scope : [oSettings.scope];
		}

		navigate(oTarget, aScopes, !oEvent.shiftKey);
	};

	jQuery(function() {
		jQuery(document).on("keydown", function(oEvent) {
			oF6Navigation.handleF6GroupNavigation(oEvent, null);
		});
	});

	return oF6Navigation;
});
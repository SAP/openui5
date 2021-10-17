import jQuery from "sap/ui/thirdparty/jquery";
import PseudoEvents from "sap/ui/events/PseudoEvents";
export class F6Navigation {
    static fastNavigationKey = "sap-ui-fastnavgroup";
    static handleF6GroupNavigation(oEvent: any, oSettings: any) {
        function findClosestCustomGroup(oRef) {
            var $Group = jQuery(oRef).closest("[data-sap-ui-customfastnavgroup=\"true\"]");
            return $Group[0];
        }
        function findClosestGroup(oRef) {
            var oGroup = findClosestCustomGroup(oRef);
            if (oGroup) {
                return oGroup;
            }
            var $Group = jQuery(oRef).closest("[data-" + F6Navigation.fastNavigationKey + "=\"true\"]");
            return $Group[0];
        }
        function findTabbables(oRef, aScopes, bNext) {
            var $Ref = jQuery(oRef), $All, $Tabbables;
            if (bNext) {
                $All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
                $Tabbables = $All.find(":sapTabbable").addBack(":sapTabbable");
            }
            else {
                $All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
                $Tabbables = jQuery.merge($Ref.parents(":sapTabbable"), $All.find(":sapTabbable").addBack(":sapTabbable"));
            }
            var $Tabbables = jQuery.uniqueSort($Tabbables);
            return $Tabbables.filter(function () {
                return isContained(aScopes, this);
            });
        }
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
            return $Refs.filter(function () {
                if (aScopesInStaticArea.length && isContained(aScopesInStaticArea, this)) {
                    return true;
                }
                return !jQuery.contains(oStaticArea, this);
            });
        }
        function isContained(aContainers, oRef) {
            for (var i = 0; i < aContainers.length; i++) {
                if (aContainers[i] === oRef || jQuery.contains(aContainers[i], oRef)) {
                    return true;
                }
            }
            return false;
        }
        function findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $Tabbables, oSouceGroup, bFindPreviousGroup) {
            var oGroup, $Target;
            for (var i = $Tabbables.length - 1; i >= 0; i--) {
                oGroup = findClosestGroup($Tabbables[i]);
                if (oGroup != oSouceGroup) {
                    if (bFindPreviousGroup) {
                        oSouceGroup = oGroup;
                        bFindPreviousGroup = false;
                    }
                    else {
                        $Target = jQuery($Tabbables[i + 1]);
                        break;
                    }
                }
            }
            if (!$Target && !bFindPreviousGroup) {
                $Target = $FirstTabbableInScope;
            }
            return $Target;
        }
        function navigate(oSource, aScopes, bForward) {
            if (!aScopes || aScopes.length == 0) {
                aScopes = [document];
            }
            if (!isContained(aScopes, oSource)) {
                return;
            }
            var oSouceGroup = findClosestGroup(oSource), $AllTabbables = filterStaticAreaContent(jQuery(aScopes).find(":sapTabbable").addBack(":sapTabbable"), aScopes), $FirstTabbableInScope = $AllTabbables.first(), $Tabbables = filterStaticAreaContent(findTabbables(oSource, aScopes, bForward), aScopes), oGroup, $Target;
            if (bForward) {
                for (var i = 0; i < $Tabbables.length; i++) {
                    oGroup = findClosestGroup($Tabbables[i]);
                    if (oGroup != oSouceGroup) {
                        $Target = jQuery($Tabbables[i]);
                        break;
                    }
                }
                if (!$Target || !$Target.length) {
                    $Target = $FirstTabbableInScope;
                }
            }
            else {
                $Target = findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $Tabbables, oSouceGroup, true);
                if (!$Target || !$Target.length) {
                    if ($AllTabbables.length == 1) {
                        $Target = jQuery($AllTabbables[0]);
                    }
                    else if ($AllTabbables.length > 1) {
                        oSouceGroup = findClosestGroup($AllTabbables.eq(-1));
                        oGroup = findClosestGroup($AllTabbables.eq(-2));
                        if (oSouceGroup != oGroup) {
                            $Target = $AllTabbables.eq(-1);
                        }
                        else {
                            $Target = findFirstTabbableOfPreviousGroup($FirstTabbableInScope, $AllTabbables, oSouceGroup, false);
                        }
                    }
                }
            }
            if ($Target && $Target.length) {
                var oTarget = $Target[0], oEvent = null, oCustomGroup = findClosestCustomGroup(oTarget);
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
                    oTarget.focus();
                }
            }
        }
        var oSapSkipForward = PseudoEvents.events.sapskipforward, oSapSkipBack = PseudoEvents.events.sapskipback, bSapSkipForward = oSapSkipForward.aTypes.includes(oEvent.type) && oSapSkipForward.fnCheck(oEvent), bIsValidShortcut = bSapSkipForward || (oSapSkipBack.aTypes.includes(oEvent.type) && oSapSkipBack.fnCheck(oEvent));
        if (!bIsValidShortcut || oEvent.isMarked("sapui5_handledF6GroupNavigation") || oEvent.isMarked() || oEvent.isDefaultPrevented()) {
            return;
        }
        oEvent.setMark("sapui5_handledF6GroupNavigation");
        oEvent.setMarked();
        oEvent.preventDefault();
        if (oSettings && oSettings.skip) {
            return;
        }
        var oTarget = oSettings && oSettings.target ? oSettings.target : document.activeElement, aScopes = null;
        if (oSettings && oSettings.scope) {
            aScopes = Array.isArray(oSettings.scope) ? oSettings.scope : [oSettings.scope];
        }
        navigate(oTarget, aScopes, bSapSkipForward);
    }
}
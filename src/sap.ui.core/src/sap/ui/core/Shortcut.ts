import ShortcutHelper from "sap/ui/core/util/ShortcutHelper";
import assert from "sap/base/assert";
export class Shortcut {
    static register(oScopeControl: any, vShortcut: any, fnCallback: any) {
        if (!oScopeControl) {
            throw new Error("Shortcut.register: oScopeControl must be given.");
        }
        if (typeof fnCallback !== "function") {
            throw new Error("Shortcut.register: a function fnCallback must be given.");
        }
        var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut);
        ShortcutHelper.validateKeyCombination(oNormalizedShortcutSpec);
        var existingShortcut = ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
        if (existingShortcut) {
            throw new Error("Same shortcut is already registered on this element");
        }
        function wrapCallback() {
            var oFocusedElement = document.activeElement, oSpan = document.createElement("span"), oStaticUiAreaDomRef = sap.ui.getCore().getStaticAreaRef();
            oSpan.setAttribute("tabindex", 0);
            oSpan.setAttribute("id", "sap-ui-shortcut-focus");
            oSpan.style.position = "absolute";
            oSpan.style.top = "50%";
            oSpan.style.bottom = "50%";
            oSpan.style.left = "50%";
            oSpan.style.right = "50%";
            oStaticUiAreaDomRef.appendChild(oSpan);
            oSpan.focus();
            oFocusedElement.focus();
            oStaticUiAreaDomRef.removeChild(oSpan);
            fnCallback.apply(null, arguments);
        }
        var oDelegate = {};
        oDelegate["onkeydown"] = ShortcutHelper.handleKeydown.bind(null, oNormalizedShortcutSpec, vShortcut, wrapCallback);
        oScopeControl.addEventDelegate(oDelegate);
        var aData = oScopeControl.data("sap.ui.core.Shortcut");
        if (!aData) {
            aData = [];
            oScopeControl.data("sap.ui.core.Shortcut", aData);
        }
        aData.push({
            shortcutSpec: oNormalizedShortcutSpec,
            platformIndependentShortcutString: ShortcutHelper.getNormalizedShortcutString(oNormalizedShortcutSpec),
            delegate: oDelegate
        });
    }
    static isRegistered(oScopeControl: any, vShortcut: any) {
        assert(oScopeControl, "Shortcut.isRegistered: oScopeControl must be given.");
        var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut);
        return !!ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
    }
    static unregister(oScopeControl: any, vShortcut: any) {
        assert(oScopeControl, "Shortcut.unregister: oScopeControl must be given.");
        var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut);
        var oShortcutData = ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
        if (oShortcutData) {
            oScopeControl.removeEventDelegate(oShortcutData.delegate);
            var aData = oScopeControl.data("sap.ui.core.Shortcut");
            var index = aData.indexOf(oShortcutData);
            aData.splice(index, 1);
            return true;
        }
        return false;
    }
}
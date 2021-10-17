import Device from "sap/ui/Device";
export class oShortcutHelper {
    static findShortcut(oScopeControl: any, oNormalizedShortcutSpec: any) {
        var aRegisteredShortcutData = oScopeControl.data("sap.ui.core.Shortcut");
        if (!aRegisteredShortcutData) {
            return;
        }
        var aMatching = aRegisteredShortcutData.filter(function (oData) {
            var bMatches = oData.shortcutSpec.key === oNormalizedShortcutSpec.key && oData.shortcutSpec.ctrlKey === oNormalizedShortcutSpec.ctrlKey && oData.shortcutSpec.altKey === oNormalizedShortcutSpec.altKey && oData.shortcutSpec.shiftKey === oNormalizedShortcutSpec.shiftKey && oData.shortcutSpec.metaKey === oNormalizedShortcutSpec.metaKey;
            return bMatches;
        });
        return aMatching[0];
    }
    static getNormalizedShortcutSpec(vShortcut: any) {
        var oNormalizedShortcutSpec;
        if (typeof vShortcut === "string") {
            oNormalizedShortcutSpec = oShortcutHelper.parseShortcut(vShortcut);
        }
        else {
            var key = vShortcut.key;
            var bValidShortcut = /^([a-z0-9\.,\-\*\/= +]|Tab|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i.test(key);
            if (!bValidShortcut) {
                throw new Error("Shortcut key '" + key + "' is not a valid shortcut key. It must match /^([a-z0-9.,-*/= +]|Tab|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i");
            }
            oNormalizedShortcutSpec = {
                key: oShortcutHelper.translateRegisteredKeyToStandard(key).toLowerCase(),
                ctrlKey: Device.os.macintosh ? false : !!vShortcut.ctrl,
                ctrlRequested: vShortcut.ctrl,
                altKey: !!vShortcut.alt,
                shiftKey: !!vShortcut.shift,
                metaKey: Device.os.macintosh ? !!vShortcut.ctrl : false
            };
        }
        return oNormalizedShortcutSpec;
    }
    static parseShortcut(sShortcut: any) {
        this.validateShortcutString(sShortcut);
        var aParts = sShortcut.toLowerCase().split("+");
        return {
            key: oShortcutHelper.translateRegisteredKeyToStandard(aParts.pop()),
            ctrlKey: Device.os.macintosh ? false : aParts.indexOf("ctrl") > -1,
            ctrlRequested: aParts.indexOf("ctrl") > -1,
            altKey: aParts.indexOf("alt") > -1,
            shiftKey: aParts.indexOf("shift") > -1,
            metaKey: Device.os.macintosh ? aParts.indexOf("ctrl") > -1 : false
        };
    }
    static translateRegisteredKeyToStandard(sKeySpec: any) {
        return mKeyDefinitionFix.hasOwnProperty(sKeySpec) ? mKeyDefinitionFix[sKeySpec] : sKeySpec;
    }
    static validateShortcutString(sShortcut: any) {
        var bValidShortcut = /^((Ctrl|Shift|Alt)\+){0,3}([a-z0-9\.,\-\*\/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|Escape|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F[1-9]|F1[0-2])$/i.test(sShortcut);
        if (!bValidShortcut) {
            throw new Error("Shortcut '" + sShortcut + "' is not a valid shortcut string. It must be a '+'-separated list of modifier keys and the actual key, like 'Ctrl+Alt+S'. Or more generally, it must match the expression /^((Ctrl|Shift|Alt)+){0,3}([a-z0-9.,-*/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i.");
        }
    }
    static validateKeyCombination(oNormalizedShortcutSpec: any) {
        var sNormalizedShortcut = oNormalizedShortcutSpec.ctrlRequested ? "ctrl+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.altKey ? "alt+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.shiftKey ? "shift+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.key;
        if (mDisallowedShortcuts[sNormalizedShortcut]) {
            throw new Error("Registering the shortcut '" + sNormalizedShortcut + "' is not allowed (" + mDisallowedShortcuts[sNormalizedShortcut] + ").");
        }
        if ([".", ",", "-", "+", "=", "*", "/"].indexOf(oNormalizedShortcutSpec.key) > -1 && sNormalizedShortcut.indexOf("shift") > -1) {
            throw new Error("Registering the shortcut '" + sNormalizedShortcut + "' is not allowed because the 'Shift' modifier changes the meaning of the " + oNormalizedShortcutSpec.key + " key on many keyboards.");
        }
    }
    static getNormalizedShortcutString(oNormalizedShortcutSpec: any) {
        var sNormalizedShortcut = oNormalizedShortcutSpec.ctrlRequested ? "ctrl+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.altKey ? "alt+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.shiftKey ? "shift+" : "";
        sNormalizedShortcut += oNormalizedShortcutSpec.key;
        return sNormalizedShortcut;
    }
    static shortcutMayBeUsedHere(oShortcutSpec: any, oDomElement: any) {
        var sTagName = oDomElement.tagName.toLowerCase();
        if ((sTagName === "input" || sTagName === "textarea") && oShortcutSpec.key.includes("arrow")) {
            return false;
        }
        return true;
    }
    static handleKeydown(oShortcutSpec: any, vOriginalShortcut: any, fnCallback: any, oEvent: any) {
        if (oEvent.key === "Control" || oEvent.key === "Shift" || oEvent.key === "Alt" || oEvent.key === "AltGraph" || oEvent.key === "Meta") {
            return;
        }
        if (oEvent.isMarked()) {
            return;
        }
        if (oEvent.altKey && !bLastAltWasLeftAlt) {
            return;
        }
        var key = mEventKeyFix.hasOwnProperty(oEvent.key) ? mEventKeyFix[oEvent.key] : oEvent.key;
        key = key.toLowerCase();
        if (key !== oShortcutSpec.key || oEvent.ctrlKey !== oShortcutSpec.ctrlKey || oEvent.altKey !== oShortcutSpec.altKey || oEvent.shiftKey !== oShortcutSpec.shiftKey || oEvent.metaKey !== oShortcutSpec.metaKey) {
            return;
        }
        if (!oShortcutHelper.shortcutMayBeUsedHere(oShortcutSpec, oEvent.target || oEvent.srcElement)) {
            return;
        }
        oEvent.preventDefault();
        oEvent.setMarked();
        oEvent.stopPropagation();
        var oShortcutInfo = {
            registeredShortcut: vOriginalShortcut,
            originalBrowserEvent: oEvent.originalEvent || oEvent
        };
        fnCallback(oShortcutInfo);
    }
}
var mKeyDefinitionFix = {
    plus: "+",
    space: " "
};
var mEventKeyFix = {
    OS: "Meta"
};
var mDisallowedShortcuts = {
    "ctrl+l": "jump to address bar",
    "ctrl+n": "new window, cannot be registered in Chrome",
    "ctrl+shift+n": "new incognito window, cannot be registered in Chrome",
    "ctrl+alt+shift+p": "UI5 Technical Info",
    "ctrl+q": "quit Chrome in Mac",
    "ctrl+alt+shift+s": "UI5 Support Popup",
    "ctrl+t": "new tab, cannot be registered in Chrome",
    "ctrl+shift+t": "reopen last tab, cannot be registered in Chrome",
    "ctrl+w": "close tab, cannot be registered in Chrome",
    "ctrl+shift+w": "close window, cannot be registered in Chrome",
    "ctrl+0": "reset zoom",
    "ctrl+-": "zoom out",
    "ctrl++": "zoom in",
    "ctrl+shift+=": "cannot be handled",
    "tab": "TAB-based keyboard navigation",
    "shift+tab": "TAB-based keyboard navigation",
    "ctrl+tab": "cycling through tabs, cannot be registered in Chrome",
    "ctrl+shift+tab": "cycling through tabs, cannot be registered in Chrome",
    "ctrl+alt+delete": "nice try",
    "ctrl+pageup": "cycling through tabs, cannot be registered in Chrome",
    "ctrl+pagedown": "cycling through tabs, cannot be registered in Chrome",
    "f6": "F6-based group navigation",
    "f11": "fullscreen, cannot be registered in Chrome",
    "f12": "browser dev tools"
};
var bLastAltWasLeftAlt = false;
document.addEventListener("keydown", function (e) {
    try {
        if (e.keyCode === 18) {
            bLastAltWasLeftAlt = (typeof e.location !== "number" || e.location === 1);
            return;
        }
    }
    catch (err) {
    }
});
import deepEqual from "sap/base/util/deepEqual";
export class TestFWK {
    static init(oContentWindow: any) {
        this.oContentWindow = oContentWindow;
        this.updateContent();
    }
    static getAllowedThemes(...args: any) {
        if (this.oThemeConstraints) {
            var aSupportedThemes = this.oThemeConstraints.supports;
            return aSupportedThemes.reduce(function (result, sThemeName) {
                result[sThemeName] = TestFWK.THEMES[sThemeName];
                return result;
            }, {});
        }
        else {
            return TestFWK.THEMES;
        }
    }
    static getContentURL(...args: any) {
        return this.sContentURL;
    }
    static setContentURL(sURL: any, oThemeConstraints: any, sLibName: any) {
        this.sContentURL = sURL;
        var newTheme = this.getEffectiveTheme(this.sTheme, oThemeConstraints);
        var bSomethingChanged = false;
        if (this.sTheme !== newTheme) {
            this.sTheme = newTheme;
            bSomethingChanged = true;
        }
        if (!deepEqual(oThemeConstraints, this.oThemeConstraints)) {
            this.oThemeConstraints = oThemeConstraints;
            bSomethingChanged = true;
        }
        if (bSomethingChanged) {
            this.fireThemeConfigurationChanged();
        }
        this.updateContent(sLibName);
    }
    static updateContent(sLibName: any) {
        if (!this.oContentWindow || !this.sContentURL) {
            return;
        }
        this.fireContentWillChange(sLibName);
        var sURL = this.addSettingsToURL(this.sContentURL, null, true);
        this.oContentWindow.document.location.replace(sURL);
    }
    static getLanguage(...args: any) {
        return this.sLanguage;
    }
    static setLanguage(sLanguage: any) {
        if (this.sLanguage !== sLanguage) {
            this.sLanguage = sLanguage;
            this.applySettings();
        }
    }
    static getTheme(...args: any) {
        return this.sTheme;
    }
    static setTheme(sTheme: any) {
        if (this.sTheme !== sTheme) {
            this.sTheme = sTheme;
            if (this.oContentWindow && this.oContentWindow.sap && this.oContentWindow.sap.ui && this.oContentWindow.sap.ui.getCore) {
                this.oContentWindow.sap.ui.getCore().applyTheme(sTheme);
                return;
            }
            this.applySettings();
        }
    }
    static getRTL(...args: any) {
        return this.bRTL;
    }
    static setRTL(bRTL: any) {
        if (this.bRTL !== bRTL) {
            this.bRTL = bRTL;
            this.applySettings();
        }
    }
    static getAccessibilityMode(...args: any) {
        return this.bAccessibilityMode;
    }
    static setAccessibilityMode(bAccessibilityMode: any) {
        if (this.bAccessibilityMode !== bAccessibilityMode) {
            this.bAccessibilityMode = bAccessibilityMode;
            this.applySettings();
        }
    }
    static getContrastMode(...args: any) {
        return this.bContrastMode;
    }
    static setContrastMode(bContrastMode: any) {
        if (this.bContrastMode !== bContrastMode) {
            var frameDocument = this.oContentWindow.document;
            var frameDocumentBody = frameDocument.querySelector("body");
            if (frameDocumentBody) {
                frameDocumentBody.classList.remove("sapContrast");
                frameDocumentBody.classList.remove("sapContrastPlus");
                if (this.sTheme == "sap_belize" && bContrastMode) {
                    frameDocumentBody.classList.add("sapContrast");
                }
                else if (this.sTheme == "sap_belize_plus" && bContrastMode) {
                    frameDocumentBody.classList.add("sapContrastPlus");
                }
            }
            this.bContrastMode = bContrastMode;
        }
    }
    static getEffectiveTheme(sRequestedTheme: any, oThemeConstraints: any) {
        if (sRequestedTheme) {
            if (oThemeConstraints) {
                for (var i = 0; i < oThemeConstraints.supports.length; i++) {
                    if (oThemeConstraints.supports[i] === sRequestedTheme) {
                        return sRequestedTheme;
                    }
                }
                return oThemeConstraints["default"];
            }
            else {
                return sRequestedTheme;
            }
        }
        else {
            return oThemeConstraints ? oThemeConstraints["default"] : null;
        }
    }
    static applySettings(...args: any) {
        this.updateContent();
    }
    static addSettingsToURL(sURL: any, oThemeConstraints: any, bActualNavigation: any) {
        if (bActualNavigation) {
            var hash = sURL.replace(/\?/g, "_");
            var sUrlToDisplay = top.window.document.location.href.split("#")[0];
            if (sURL.endsWith("testsuite/welcome.html")) {
                top.window.history.replaceState(sURL, null, sUrlToDisplay);
            }
            else {
                sUrlToDisplay = sUrlToDisplay + "#" + hash;
                top.window.history.pushState(sURL, null, sUrlToDisplay);
            }
        }
        function add(sParam, vValue) {
            if (sURL.indexOf("?") != -1) {
                sURL += "&";
            }
            else {
                sURL += "?";
            }
            sURL += sParam + "=" + vValue;
        }
        add("sap-ui-debug", true);
        if (this.sLanguage) {
            add("sap-ui-language", this.sLanguage);
        }
        var theme = this.getEffectiveTheme(this.sTheme, oThemeConstraints);
        if (theme) {
            add("sap-ui-theme", theme);
        }
        if (this.bRTL) {
            add("sap-ui-rtl", this.bRTL);
        }
        add("sap-ui-accessibility", this.bAccessibilityMode);
        return sURL;
    }
    static onContentLoad(...args: any) {
    }
    static attachThemeConfigurationChanged(fnCallback: any) {
        this.mThemeConfigListeners.push(fnCallback);
    }
    static detachThemeConfigurationChanged(fnCallback: any) {
        for (var i = 0; i < this.mThemeConfigListeners.length;) {
            if (this.mThemeConfigListeners[i] === fnCallback) {
                this.mThemeConfigListeners.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }
    static fireThemeConfigurationChanged(...args: any) {
        for (var i = 0; i < this.mThemeConfigListeners.length; i++) {
            this.mThemeConfigListeners[i]();
        }
    }
    static attachContentWillChange(fnCallback: any) {
        this.mContentListeners.push(fnCallback);
    }
    static detachContentWillChange(fnCallback: any) {
        for (var i = 0; i < this.mContentListeners.length;) {
            if (this.mContentListeners[i] === fnCallback) {
                this.mContentListeners.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }
    static fireContentWillChange(sLibName: any) {
        for (var i = 0; i < this.mContentListeners.length; i++) {
            try {
                this.mContentListeners[i](this.getContentURL(), this.getTheme(), sLibName);
            }
            catch (ex) {
            }
        }
    }
}
if (!sap.ui.testfwk) {
    sap.ui.testfwk = {};
}
window.testfwk = sap.ui.testfwk.TestFWK = TestFWK;
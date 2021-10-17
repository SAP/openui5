var waitForThemeApplied = function () {
    if (typeof sap === "undefined" || !sap.ui || typeof sap.ui.getCore !== "function") {
        return Promise.reject(new Error("UI5 Core must be loaded and booted before using the sap/ui/qunit/utils/waitForThemeApplied module"));
    }
    return new Promise(function (resolve) {
        var oCore = sap.ui.getCore();
        if (oCore.isThemeApplied()) {
            resolve();
        }
        else {
            var themeChanged = function () {
                resolve();
                oCore.detachThemeChanged(themeChanged);
            };
            oCore.attachThemeChanged(themeChanged);
        }
    });
};
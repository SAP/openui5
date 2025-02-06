/* global sinon */
sap.ui.define(["sap/ui/core/Lib"], function(Lib) {
    "use strict";

    sinon.stub(Lib.prototype, "loadManifest").callsFake(function() {
        // Stub Library.init to always set noLibraryCSS to true in order
        // to avoid activation of ThemeManager
        // This allows to test future scenarios, where theming is not
        // necessarily loaded
        this.oManifest = {
            "sap.ui5": {
                library: {
                    css: false
                }
            }
        };
        this._loadingStatus.manifest = Promise.resolve(this.oManifest);
        return this._loadingStatus.manifest;
    });
    var oStub = sinon.stub(Lib, "init").callsFake(function(mSettings) {
        // Stub Library.init to always set noLibraryCSS to true in order
        // to avoid activation of ThemeManager
        // This allows to test future scenarios, where theming is not
        // necessarily loaded
        mSettings.noLibraryCSS = true;
        return oStub.wrappedMethod.call(this, mSettings);
    });
});
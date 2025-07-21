sap.ui.define([
    "sap/ui/test/Opa5"
], function (Opa5) {
    "use strict";

    return Opa5.extend("your.app.test.arrangements.Common", {
        iStartMyApp: function (sUrl) {
            this.iStartMyAppInAFrame(sUrl);
        },

        iTeardownMyApp: function () {
            this.iTeardownMyAppFrame();
        }
    });
});
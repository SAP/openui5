
sap.ui.define([
    "sap/ui/test/Opa5"
], (Opa5) => {
    "use strict";

    return Opa5.extend("sap.ui.demo.illustrationExplorer.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "sap.ui.demo.illustrationExplorer",
                    manifest: true,
                    async: true
                }
            });
        }
    });
});
sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    var Base = Opa5.extend("sap.ui.core.sample.RoutingNestedComponent.test.integration.pages.Base", {

        iShouldSeeHash: function (sHash) {
            return this.waitFor({
                success: function () {
                    Opa5.assert.strictEqual(window.location.hash, sHash, "The hash is correctly '" + sHash + "'.");
                },
                errorMessage: "The hash is not correct."
            });
        },

        iPressBrowserBack: function(){
            return this.waitFor({
                actions: function(){
                    history.back();
                },
                success: function () {
                    Opa5.assert.ok(true, "The 'click' on the browser back button is simulated.");
                },
                errorMessage: "The 'click' on the browser back button could not be simulated."

            });
        },

        iPressBrowserForward: function(){
            return this.waitFor({
                actions: function(){
                    history.forward();
                },
                success: function () {
                    Opa5.assert.ok(true, "The 'click' on the browser forward button is simulated.");
                },
                errorMessage: "The 'click' on the browser forward button could not be simulated."

            });
        }
    });

    return Base;

});
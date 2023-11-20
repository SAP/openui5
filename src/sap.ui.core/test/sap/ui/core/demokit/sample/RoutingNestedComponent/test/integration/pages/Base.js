sap.ui.define(["sap/ui/test/Opa5", "sap/base/util/Deferred"], function (Opa5, Deferred) {
    "use strict";

    var fnGetHashChangeEventDeferred = function(){
        var oDeferredHashChangeFired = new Deferred();

        oDeferredHashChangeFired.handler = function() {
            oDeferredHashChangeFired.resolve();
        };

        oDeferredHashChangeFired.promise.then(function(){
            window.removeEventListener("hashchange", oDeferredHashChangeFired.handler);
        });
        return oDeferredHashChangeFired;
    };

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
            var oDeferredHashChangeEventFired = fnGetHashChangeEventDeferred();

            this.waitFor({
                actions: [
                    function () {
                        window.addEventListener("hashchange", oDeferredHashChangeEventFired.handler);
                        Opa5.getWindow().history.back();
                    }
                ],
                success: function () {
                    Opa5.assert.ok(true, "The 'click' on the browser back button is simulated.");
                },
                errorMessage: "The 'click' on the browser back button could not be simulated."
            });

            return this.iWaitForPromise(oDeferredHashChangeEventFired.promise);
        },

        iPressBrowserForward: function(){
            var oDeferredHashChangeEventFired = fnGetHashChangeEventDeferred();

            this.waitFor({
                actions: [
                    function () {
                        window.addEventListener("hashchange", oDeferredHashChangeEventFired.handler);
                        Opa5.getWindow().history.forward();
                    }
                ],
                success: function () {
                    Opa5.assert.ok(true, "The 'click' on the browser forward button is simulated.");
                },
                errorMessage: "The 'click' on the browser forward button could not be simulated."
            });

            return this.iWaitForPromise(oDeferredHashChangeEventFired.promise);
        }
    });

    return Base;

});
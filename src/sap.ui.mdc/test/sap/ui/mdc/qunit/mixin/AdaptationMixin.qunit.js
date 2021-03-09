/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define(
    ["sap/ui/mdc/mixin/AdaptationMixin", "sap/ui/core/Control"],
    function (AdaptationMixin, Control) {
        "use strict";

        var TestClass;
        var oSomeInstance;

        var fnExtendTestClass = function () {
            TestClass = Control.extend("temp", {
                metadata: {
                    interfaces: [
                        "sap.ui.mdc.IFilterSource"
                    ],
                    properties: {
                        filterConditions: {
                            type: "object",
                            defaultValue: {}
                        }
                    }
                }
            });
            AdaptationMixin.call(TestClass.prototype);
        };

        var fnCleanup = function () {
            if (oSomeInstance) {
                oSomeInstance.destroy();
                oSomeInstance = undefined;
            }
            if (TestClass) {
                TestClass = undefined;
            }
        };

        QUnit.module("AdaptationMixin error handling", {
            beforeEach: function () {
                fnExtendTestClass();
                oSomeInstance = new TestClass();
            },
            afterEach: function () {
                fnCleanup();
            }
        });

        QUnit.test("retrieveInbuiltFilter", function (assert) {
            var done = assert.async();

            oSomeInstance.retrieveInbuiltFilter()
            .then(function (oFilterControl) {
                assert.ok(oFilterControl.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"),
                    "An filter control should be provided."
                );
                assert.ok(
                    oSomeInstance._oP13nFilter,
                    "A member field is added."
                );
                assert.ok(
                    oSomeInstance.getInbuiltFilter(),
                    "An AdaptationFilterBar instance should be provided"
                );
                done();
            });
        });

        QUnit.test("retrieveInbuiltFilter after destruction", function (assert) {
            var done = assert.async();

            oSomeInstance.destroy();
            oSomeInstance.retrieveInbuiltFilter()
            .catch(function (sMessage) {
                assert.ok(sMessage === "exit", "retrieveInbuiltFilter promise fails");
                done();
            });
        });

        QUnit.test("exit", function (assert) {
            var done = assert.async();
            var oExitSpy = sinon.spy(TestClass.prototype, "exit");
            oSomeInstance.retrieveInbuiltFilter()
            .then(function() {
                var oAdaptationFilterBarDestroySpy = sinon.spy(
                    oSomeInstance._oP13nFilter,
                    "destroy"
                );

                oSomeInstance.destroy();

                assert.ok(
                    oAdaptationFilterBarDestroySpy.calledOnce,
                    "The adaptation filterbar should be destroyed."
                );
                assert.ok(
                    !oSomeInstance._oP13nFilter,
                    "The member field should be reset."
                );
                assert.ok(
                    oExitSpy.calledOnce,
                    " an existing exit method should be called"
                );

                oExitSpy.restore();
                oAdaptationFilterBarDestroySpy.restore();

                done();
            });
        });
    }
);

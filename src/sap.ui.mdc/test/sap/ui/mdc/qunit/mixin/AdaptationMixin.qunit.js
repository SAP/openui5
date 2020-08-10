/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define(
    ["sap/ui/mdc/mixin/AdaptationMixin", "sap/ui/core/Control"],
    function (AdaptationMixin, Control) {
        "use strict";

        var TestClass;
        var oSomeInstance;

        var oExampleAdaptationConfig = {
            retrievePropertyInfo: function getSomeInfo() {},
            itemConfig: {
                addOperation: "addFilter",
                removeOperation: "removeFilter",
                moveOperation: "moveFilter",
                adaptationUI: "sap/ui/mdc/p13n/panels/AdaptFiltersPanel",
                title: "Some title"
            },
            filterConfig: {
                adaptationUI: this
            }
        };

        var fnExtendTestClass = function () {
            TestClass = Control.extend("temp", {
                metadata: {
                    properties: {
                        adaptationConfig: {
                            type: "object",
                            group: "Data",
                            visiblity: "hidden"
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

        QUnit.test("getAdaptationConfigAttribute error", function (assert) {
            assert.throws(
                function () {
                    oSomeInstance.getAdaptationConfigAttribute();
                },
                function (oError) {
                    return (
                        oError instanceof Error &&
                        oError.message ===
                            "Please provide an adaptation config for this control before calling getAdaptationConfigAttribute."
                    );
                },
                "getAdaptationConfigAttribute should throw an error if no adaptation configuration is provided for the control"
            );
        });

        QUnit.test("retrieveAdaptationController error", function (assert) {
            assert.throws(
                function () {
                    oSomeInstance.retrieveAdaptationController();
                },
                function (oError) {
                    return (
                        oError instanceof Error &&
                        oError.message ===
                            "Please provide an adaptation config for this control before instantiating an adaptation controller."
                    );
                },
                "retrieveAdaptationController should throw an error if no adaptation configuration is provided for the control"
            );
        });

        QUnit.test("getAdaptationController error", function (assert) {
            assert.throws(
                function () {
                    oSomeInstance.getAdaptationController();
                },
                function (oError) {
                    return (
                        oError instanceof Error &&
                        oError.message ===
                            "An adaptation controller instance is not (yet) available. You must call retrieveAdaptationController before calling getAdaptationController."
                    );
                },
                "getAdaptationController should throw an error if retrieveAdaptationController was not called yet."
            );
        });

        QUnit.module("AdaptationMixin basics", {
            beforeEach: function () {
                fnExtendTestClass();
                oSomeInstance = new TestClass({
                    adaptationConfig: oExampleAdaptationConfig
                });
            },
            afterEach: function () {
                fnCleanup();
            }
        });

        QUnit.test("retrieveAdaptationController", function (assert) {
            var done = assert.async();
            oSomeInstance
                .retrieveAdaptationController()
                .then(function (oAdaptationController) {
                    assert.ok(
                        oAdaptationController.isA(
                            "sap.ui.mdc.AdaptationController"
                        ),
                        "An adaptation controller should be provided."
                    );
                    assert.ok(
                        oSomeInstance._oAdaptationController,
                        "A member field is added."
                    );
                    done();
                });
        });

        QUnit.module("AdaptationMixin after controller retrieval", {
            beforeEach: function () {
                fnExtendTestClass();
                oSomeInstance = new TestClass({
                    adaptationConfig: oExampleAdaptationConfig
                });

                return oSomeInstance.retrieveAdaptationController();
            },
            afterEach: function () {
                fnCleanup();
            }
        });

        QUnit.test("getAdaptationController", function (assert) {
            var oAdaptationController = oSomeInstance.getAdaptationController();
            assert.ok(
                oAdaptationController.isA("sap.ui.mdc.AdaptationController"),
                "An adaptation controller should be provided."
            );
            assert.ok(
                oSomeInstance._oAdaptationController === oAdaptationController,
                "It should be the same controller instance as stored in the _oAdaptationController field."
            );
        });

        QUnit.test("getAdaptationConfigAttribute", function (assert) {
            var oItemConfig = oSomeInstance.getAdaptationConfigAttribute(
                "itemConfig"
            );
            assert.ok(
                oItemConfig === oExampleAdaptationConfig.itemConfig,
                "The desired attribute of the provided adaptation config is provided."
            );
        });

        QUnit.test("enhanceAdaptationConfig", function (assert) {

            var oFilterConfig = {
                title: "MyAdaptationConfigEnhancement",
                adaptationUI: undefined
            };

            var oFullConfig = Object.assign(oExampleAdaptationConfig, {filterConfig: oFilterConfig});
            var oEnhancedInstance = oSomeInstance.enhanceAdaptationConfig({filterConfig: oFilterConfig});
            assert.deepEqual(oEnhancedInstance, oSomeInstance, "Same control instance is returned");
            assert.deepEqual(oFullConfig, oSomeInstance.getAdaptationConfig(), "The existing adaptation config was correctly enhanced.");
            assert.deepEqual(oFilterConfig, oSomeInstance._oAdaptationController.getFilterConfig(), "The existing adaptation controller was also updated");
        });

        QUnit.test("exit", function (assert) {
            var oExitSpy = sinon.spy(TestClass.prototype, "exit");

            assert.ok(
                oSomeInstance._oAdaptationController.isA(
                    "sap.ui.mdc.AdaptationController"
                ),
                "An adaptation controller should be provided."
            );

            var oAdaptationControllerDestroySpy = sinon.spy(
                oSomeInstance._oAdaptationController,
                "destroy"
            );

            oSomeInstance.destroy();

            assert.ok(
                oAdaptationControllerDestroySpy.calledOnce,
                "The adaptation controller should be destroyed."
            );
            assert.ok(
                !oSomeInstance._oAdaptationController,
                "The member field should be reset."
            );
            assert.ok(
                oExitSpy.calledOnce,
                " an existing exit method should be called"
            );

            oExitSpy.restore();
            oAdaptationControllerDestroySpy.restore();
        });
    }
);

/*global sinon */

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/XMLView'


], function(Controller, XMLView) {
	"use strict";

    var aPublicControllerMethods = [
        /*public by every Controller*/
        "byId",
        "getView",
        /*public by Controller impl*/
        "myFinalMethod",
		"onAfterRendering",
		"onBeforeRendering",
		"onExit",
		"publicMethod",
        "onInit"
    ];


    var aPublicControllerMethodsChangedVisibility = [
        /*public by Controller impl*/
        "myFinalMethod",
		"onAfterRendering",
		"onBeforeRendering",
		"onExit",
		"onInit"
    ];

    var aLegacyPublicControllerMethods = [
        /*public by every Controller*/
        "byId",
        "getView",
        /*public by Controller impl*/
        "myFinalMethod",
        "privateMethod1",
		"publicMethod"
    ];

    QUnit.module("Controller Metadata Legacy", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.MainLegacy"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
            });
		},
		afterEach: function() {

		}
	});

    QUnit.test("private, public checks", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oControllerInterface = oView.getController().getInterface();
            var aInterfaceKeys = Object.keys(oControllerInterface);
            assert.ok(oControllerInterface, "Controller Interface created");
            assert.equal(aInterfaceKeys.length, 5, "5 public methods are exposed");
            assert.deepEqual(aInterfaceKeys.sort(), aLegacyPublicControllerMethods.sort(), "All public methods exposed are correctly");
            done();
        });
    });

    QUnit.module("Controller Metadata", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.Main"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

    QUnit.test("private, public checks", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oControllerInterface = oView.getController().getInterface();
            var aInterfaceKeys = Object.keys(oControllerInterface);
            assert.ok(oControllerInterface, "Controller Interface created");
            assert.equal(aInterfaceKeys.length, 8, "8 public methods are exposed");
            assert.deepEqual(aInterfaceKeys.sort(), aPublicControllerMethods.sort(), "All public methods exposed are correctly");
            done();
        });
    });

    QUnit.module("Controller Member Extension", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.MainMemberExt"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

     QUnit.test("override controllers lifecycle hooks", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            oView.placeAt("content");
            var oController = oView.getController();
            var mLifeCycleCalls = oController.getLifeCycleCalls();
            assert.equal(mLifeCycleCalls.onInit.length, 2, "onInit called on controller and extension");
            assert.deepEqual(mLifeCycleCalls.onInit, ["base", "reuseExtension"], "onInit call sequence ok");
            /*timeout needed as rendering is async by timeout 0 */
            setTimeout(function() {
                assert.equal(mLifeCycleCalls.onBeforeRendering.length, 2, "onBeforeRendering called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onBeforeRendering, ["reuseExtension", "base"], "onBeforeRendering call sequence ok");
                assert.equal(mLifeCycleCalls.onAfterRendering.length, 2, "onAfterRendering called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onAfterRendering, ["base", "reuseExtension"], "onAfterRendering call sequence ok");
                oView.destroy();
                assert.equal(mLifeCycleCalls.onExit.length, 2, "oExit called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onExit, ["reuseExtension", "base"], "oExit call sequence ok");

                done();
            },0);
        });
    });

    QUnit.test("controller final method check", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oController = oView.getController();
            var oControllerMetadata = oController.getMetadata();
            assert.ok(oControllerMetadata.isMethodFinal("myFinalMethod"), "method myFinalMethod declared final");
            assert.equal(oController.myFinalMethod(), "I am final", "final method myFinalMethod not overidden");
            done();
        });
    });


    QUnit.module("Controller Member Legacy Extension", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.MainMemberExtLegacy"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

    QUnit.test("override controllers lifecycle hooks", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            oView.placeAt("content");
            var oController = oView.getController();
            var mLifeCycleCalls = oController.getLifeCycleCalls();
            assert.equal(mLifeCycleCalls.onInit.length, 2, "onInit called on controller and extension");
            assert.deepEqual(mLifeCycleCalls.onInit, ["base", "reuseExtension"], "onInit call sequence ok");
            /*timeout needed as rendering is async by timeout 0 */
            setTimeout(function() {
                assert.equal(mLifeCycleCalls.onBeforeRendering.length, 2, "onBeforeRendering called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onBeforeRendering, ["reuseExtension", "base"], "onBeforeRendering call sequence ok");
                assert.equal(mLifeCycleCalls.onAfterRendering.length, 2, "onAfterRendering called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onAfterRendering, ["base", "reuseExtension"], "onAfterRendering call sequence ok");
                oView.destroy();
                assert.equal(mLifeCycleCalls.onExit.length, 2, "oExit called on controller and extension");
                assert.deepEqual(mLifeCycleCalls.onExit, ["reuseExtension", "base"], "oExit call sequence ok");

                done();
            },0);
        });
    });

    QUnit.test("controller final method check", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oController = oView.getController();
            var oControllerMetadata = oController.getMetadata();
            assert.ok(!oControllerMetadata.isMethodFinal("myFinalMethod"), "method myFinalMethod not declared final");
            assert.equal(oController.myFinalMethod(), "Final Methods could not be overidden by an extension", "method myFinalMethod overidden as no metadata delared");
            done();
        });
    });

     QUnit.module("Controller Member Extension inline override", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.MainMemberExtInlineOverride"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

    QUnit.test("extension final method check", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oController = oView.getController();
            var oExtension = oController.reuse;
            //assert.expects()
            assert.equal(oExtension.myFinalMethod(), "I am final", "final method myFinalMethod not overidden");
            done();
        });
    });

     QUnit.module("Extend Controller", {
		beforeEach: function() {
			this.pView = Controller.create({name:"my.test.AnotherMain"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

     QUnit.test("change visibility", function(assert) {
        var done = assert.async();
        this.pView.then(function(oView) {
            var oControllerInterface = oView.getController().getInterface();
            var aInterfaceKeys = Object.keys(oControllerInterface);
            assert.ok(oControllerInterface, "Controller Interface created");
            assert.equal(aInterfaceKeys.length, 5, "5 public methods are exposed");
            assert.deepEqual(aInterfaceKeys.sort(), aPublicControllerMethodsChangedVisibility.sort(), "All public methods exposed are correctly");
            done();
        });
    });

    QUnit.module("Context checks", {
		beforeEach: function() {
            Controller.registerExtensionProvider("my.test.ExtensionProvider");
			this.pView = Controller.create({name:"my.test.MainContext"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

     QUnit.test("controller & ControllerExtension", function(assert) {
        var done = assert.async();
        assert.expect(22);
        //register assert globally for checks in controller and extension...
        window.assert = assert;
        this.pView.then(function(oView) {
            var oController = oView.getController();
            oView.placeAt("content");
            setTimeout(function() {
                oController.publicMethod();
                oController.reuse.myPublicMethod();
                delete window.assert;
                done();
            }, 0);
        });
    });

    QUnit.module("Controller final checks", {
		beforeEach: function() {
            Controller.registerExtensionProvider("");
            this.pView = Controller.create({name:"my.test.ExtendMain"}).then(function(oController) {
                return XMLView.create({
				    viewName: "my.test.Main",
                    controller: oController
                });
			});
		},
		afterEach: function() {

		}
	});

     QUnit.test("override final metadata/function", function(assert) {
        var done = assert.async();
        assert.expect(2);
        this.pView.then(function(oView) {
            var oController = oView.getController();
            assert.equal(oController.myFinalMethod(), "final method could not be overidden", "final method not overridden by controller extend");
            assert.equal(oController.getMetadata().isMethodFinal("myFinalMethod"), true, "metadata not changed");
            done();
        });
    });
});
/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/Fragment',
	'sap/ui/core/Element',
	'sap/ui/core/ElementRegistry',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/mvc/Controller',
	'sap/base/future',
	'sap/base/Log',
	'sap/ui/qunit/utils/nextUIUpdate'
], function(Component, Fragment, Element, ElementRegistry, XMLView, Controller, future, Log, nextUIUpdate) {
	"use strict";

	QUnit.module("Controller.create API");

	/**
	 * See @evo-todo in Controller.js
	 */
	QUnit.test("Controller Loading", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/core/mvc/Controller"], function(Controller) {
			Controller.create({
				name: "testdata.mvc.ControllerCreateTest"
			})
			.then(function(oController) {
				assert.equal(oController.double(8), 16, "Controller implementation was correctly returned");
				oController.destroy();
				done();
			});
		});
	});

	QUnit.module("ControllerExtensionTests");

	QUnit.test("Extend Controller with ExtensionDefinition", function(assert) {
		var done = assert.async();

		sap.ui.loader.config({
			paths: {
				"mvc": "test-resources/sap/ui/core/qunit/mvc"
			}
		});

		sap.ui.require(["sap/ui/core/Component"], function(Component) {
			let oCreatedComponent;
			Component.create({
				name: "mvc.testdata.ControllerExtensionTest.Test1"
			})
			.then(function(oComponent) {
				oCreatedComponent = oComponent;
				//oControl is a view and we must take care of the loaded promise.
				//Actually nested Views/Fragments are created in the 'old' not fully async way
				return oComponent.getRootControl().loaded();
			})
			.then(function(oView) {
				var oController = oView.getController();

				assert.ok(oController.triple, "Controller should be extended with 'triple' function");
				assert.equal(oController.double(3), 6, "Controller implementation works correctly");
				assert.equal(oController.triple(3), 9, "Controller implementation works correctly");
				oCreatedComponent.destroy();
				done();
			});
		});
	});

	QUnit.module("Fragment Destroy / Asynchronous", {
		before: function() {
			this.oLogErrorSpy = sinon.spy(Log, "error");
		},
		beforeEach: function() {
			this.oLogErrorSpy.resetHistory();
		},
		after: function() {
			this.oLogErrorSpy.restore();
		}
	});

	// helper function to check if a view fully destroys itself
	function checkForDanglingControls(assert, oView) {
		var aDangling = ElementRegistry.filter(function(o) {
			return o.getId().startsWith(oView.getId());
		});

		assert.equal(aDangling.length, 0, "No dangling controls found for '" + oView.getId() + "'.");
	}

	QUnit.test("Multiple asynchronous Fragment.create - duplicate ID issue expected", function(assert) {
		assert.expect(4);
		var aFragmentPromises = [];
		var aViews = [];

		var assertCatch = function(oErr) {
			// Catch should be only executed once for the failing Fragment.load (independent which fragment is first).
			assert.ok(true, "Promise is rejected correctly because of duplicate ID error");
			assert.strictEqual(oErr.message, "Error: adding element with duplicate id 'xmlViewInsideFragment'", "Error message is correct");
		};

		sap.ui.define("my/Controller01.controller", function() {
			return Controller.extend("my.Controller01", {
				onInit: function() {
					this._pFragment = Fragment.load({
						name: "testdata.fragments.XMLView",
						type: "XML"
					}).then(function(oControl) {
						//oControl is a view and we must take care of the loaded promise.
						//Actually nested Views/Fragments are created in the 'old' not fully async way
						return oControl.loaded();
					});
				}
			});
		});

		var pView1 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller01'>" +
				"</mvc:View>"
		}).then(function(oView) {
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		var pView2 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller01'>" +
				"</mvc:View>"
		}).then(function(oView) {
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		return Promise.all([pView1, pView2]).then(function(oArguments) {
			aViews = oArguments;

			return Promise.allSettled(aFragmentPromises).then(function() {
				// Clean-Up
				aViews[0].destroy();
				aViews[1].destroy();
				// dangling fragment content (not prefixed and not aggregated)
				Element.getElementById("xmlViewInsideFragment").destroy();
			});
		}).then(function() {
			checkForDanglingControls(assert, aViews[0]);
			checkForDanglingControls(assert, aViews[1]);
		});
	});

	QUnit.test("Multiple asynchronous Controller.loadFragment - no duplicate ID issue expectecd", function(assert) {
		assert.expect(2);

		var aViews = [], aFragmentPromises = [];

		// Catch should not be executed
		var assertCatch = function() {
			assert.ok(false, "should not reject with duplicate ID error");
		};

		sap.ui.define("my/Controller02.controller", function() {
			return Controller.extend("my.Controller02", {
				onInit: function() {
					this._pFragment = this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML"
					});
				}
			});
		});

		var pView1 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller02'>" +
				"</mvc:View>"
		}).then(function(oView) {
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		var pView2 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller02'>" +
				"</mvc:View>"
		}).then(function(oView) {
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		return Promise.all([pView1, pView2]).then(function(aResult) {
			aViews = aResult;

			// get controller first, the reference is otherwise lost after calling destroy()
			var oCtr1 = aViews[0].getController();
			var oCtr2 = aViews[1].getController();

			// Destroy views before fragment promises are settled.
			// Should lead to automatic cleanup of so called 'destroyables'.
			// If a fragment is already resolved, its content is added to the dependents aggregation
			// and will be cleaned up normally.
			aViews[0].destroy();
			aViews[1].destroy();

			// capture all concurrent promises, the catch handler above and the implicit destroy of the controller
			return Promise.allSettled(
				aFragmentPromises.concat(oCtr1._getDestroyables())
					.concat(oCtr2._getDestroyables()));
		}).then(function() {
			checkForDanglingControls(assert, aViews[0]);
			checkForDanglingControls(assert, aViews[1]);
		});
	});

	QUnit.test("Fragment.create - add to dependents after destruction of view", function(assert) {
		assert.expect(3);

		sap.ui.define("my/Controller03.controller", function() {
			return Controller.extend("my.Controller03", {
				onInit: function() {
					this._pFragment = Fragment.load({
						name: "testdata.fragments.XMLView",
						type: "XML"
					}).then(function(oControl) {
						//oControl is a view and we must take care of the loaded promise.
						//Actually nested Views/Fragments are created in the 'old' not fully async way
						return oControl.loaded();
					}).then(function(oControl) {
						this.getView().addDependent(oControl);
					}.bind(this));
				}
			});
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller03'>" +
				"</mvc:View>"
		}).then(function(oView) {
			var pFragmentPromise = oView.getController()._pFragment;
			oView.destroy();
			return pFragmentPromise.then(function() {
				assert.ok(oView.isDestroyed(), "View destroyed");
				assert.ok(oView.getDependents().length === 1, "View has 1 dependent");
				// Nested view is not destroyed. That's the reason why we have introduced Controller.prototype.loadFragment
				assert.notOk(oView.getDependents()[0].isDestroyed(), "Nested view is not destroyed");
				oView.getDependents()[0].destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - dependents cleaned up correctly", function(assert) {
		assert.expect(5);

		sap.ui.define("my/Controller04.controller", function() {
			return Controller.extend("my.Controller04", {
				onInit: function() {
					this._pFragment = this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML"
					});
				}
			});
		});

		var pView1 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller04'>" +
				"</mvc:View>"
		}).then(function(oView) {
			var pResult = oView.getController()._pFragment.then(function() {
				// return so we can use it for a clean up check later!
				return oView;
			});

			// destroy view before inner fragment is resolved
			oView.destroy();

			return pResult;
		});

		var pView2 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller04'>" +
				"</mvc:View>"
		}).then(function(oView) {
			return oView.getController()._pFragment.then(function() {
				assert.ok(oView.byId("xmlViewInsideFragment"), "Nested view added to dependents");
				assert.ok(oView.getDependents().length === 1, "View has 1 dependent");
				assert.equal(oView.getDependents()[0], oView.byId("xmlViewInsideFragment"), "View correctly added to dependents");
				oView.destroy();

				// return so we can use it for a clean up check later!
				return oView;
			});

		}).catch(function() {
			assert.ok(false, "should not reject with duplicate ID error");
		});

		return Promise.all([pView1, pView2]).then(function(aViews) {
			// check if everything is cleaned up
			checkForDanglingControls(assert, aViews[0]);
			checkForDanglingControls(assert, aViews[1]);
		});
	});

	QUnit.test("Controller.loadFragment - owner component set correctly", function(assert) {
		assert.expect(1);

		var oComponent = new Component({ id: "myComponent" });
		var pFragmentReady;

		sap.ui.define("my/Controller05.controller", function() {
			return Controller.extend("my.Controller05", {
				onInit: function() {
					pFragmentReady = new Promise(function(res, rej) {
						this.loadFragment({
							name: "testdata.fragments.XMLView",
							type: "XML",
							id: "horst"
						}).then(function(oControl) {
							//oControl is a view and we must take care of the loaded promise.
							//Actually nested Views/Fragments are created in the 'old' not fully async way
							return oControl.loaded();
						}).then(function() {
							res([]);
						});
					}.bind(this));
				}
			});
		});

		return oComponent.runAsOwner(function() {
			return XMLView.create({
				definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller05'>" +
					"</mvc:View>"
			}).then(function(oView) {
				return pFragmentReady.then(function() {
					assert.equal(oComponent, Component.getOwnerComponentFor(oView.getDependents()[0]), "Owner component set cortrectly for fragment");
					oComponent.destroy();
					oView.destroy();
				});
			});
		});
	});

	QUnit.test("Controller.loadFragment - add not to dependents", function(assert) {
		assert.expect(1);

		var pFragmentReady;

		sap.ui.define("my/Controller06.controller", function() {
			return Controller.extend("my.Controller06", {
				onInit: function() {
					pFragmentReady = new Promise(function(res, rej) {
						this.loadFragment({
							name: "testdata.fragments.XMLView",
							type: "XML",
							addToDependents: false
						}).then(function(oControl) {
							//oControl is a view and we must take care of the loaded promise.
							//Actually nested Views/Fragments are created in the 'old' not fully async way
							return oControl.loaded();
						}).then(function(oFragment) {
							res(oFragment);
						});
					}.bind(this));
				}
			});
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller06'>" +
				"</mvc:View>"
		}).then(function(oView) {
			return pFragmentReady.then(function(oFragment) {
				assert.equal(oView.getDependents().length, 0, "Fragment is not added to the dependents aggregation of the view");
				oFragment.destroy();
				oView.destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - no fragment ID and no autoPrefixId", function(assert) {
		assert.expect(2);

		var pFragmentReady;

		sap.ui.define("my/Controller07.controller", function() {
			return Controller.extend("my.Controller07", {
				onInit: function() {
					pFragmentReady = new Promise(function(res, rej) {
						this.loadFragment({
							name: "testdata.fragments.XMLView",
							type: "XML",
							autoPrefixId: false
						}).then(function(oControl) {
							//oControl is a view and we must take care of the loaded promise.
							//Actually nested Views/Fragments are created in the 'old' not fully async way
							return oControl.loaded();
						}).then(function() {
							res([]);
						});
					}.bind(this));
				}
			});
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller07'>" +
				"</mvc:View>"
		}).then(function(oView) {
			return pFragmentReady.then(function() {
				assert.ok(Element.getElementById("xmlViewInsideFragment"), "Fragment content is not prefixed by any ID.");
				assert.notOk(oView.byId("xmlViewInsideFragment"), "Fragment content is not prefixed by the view ID.");
				oView.destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - fragment ID but no autoPrefixId", function(assert) {
		assert.expect(2);

		var pFragmentReady;

		sap.ui.define("my/Controller08.controller", function() {
			return Controller.extend("my.Controller08", {
				onInit: function() {
					pFragmentReady = new Promise(function(res, rej) {
						this.loadFragment({
							name: "testdata.fragments.XMLView",
							type: "XML",
							id: "myFragment",
							autoPrefixId: false
						}).then(function(oControl) {
							//oControl is a view and we must take care of the loaded promise.
							//Actually nested Views/Fragments are created in the 'old' not fully async way
							return oControl.loaded();
						}).then(function() {
							res([]);
						});
					}.bind(this));
				}
			});
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.Controller08'>" +
				"</mvc:View>"
		}).then(function(oView) {
			return pFragmentReady.then(function() {
				assert.ok(Element.getElementById("myFragment--xmlViewInsideFragment"), "Fragment content is prefixed by the given ID.");
				assert.notOk(oView.byId("myFragment--xmlViewInsideFragment"), "Fragment content is not prefixed by the view ID.");
				oView.destroy();
			});
		});
	});

	QUnit.module("Controller Lifecycle-Hooks");

	/**
	 * In 2.x calling a hook will throw an error when a value is returned
	 * @deprecated
	 */

	QUnit.test("Shouldn't return any values (future=false)", async (assert) => {
		future.active = false;
		const aPromises = [];
		sap.ui.define("my/Controller09.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
			return Controller.extend("my.Controller09", {
				onInit: function() {
					return "onInit returns a String value";
				},
				onExit: function() {
					const oPromise = Promise.reject(new Error("onExit returns rejected Promise."));
					aPromises.push(oPromise);
					return oPromise;
				},
				onBeforeRendering: async function() {
					const oPromise = Promise.resolve("async onBeforeRendering returns resolved Promise.");
					aPromises.push(oPromise);
					await oPromise;
				},
				onAfterRendering: async function() {
					const oPromise = Promise.reject(new Error("async onAfterRendering returns rejected Promise."));
					aPromises.push(oPromise);
					await oPromise;
				}
			});
		});

		const oErrorLogSpy = sinon.spy(Log, "error");
		const oFatalLogSpy = sinon.spy(Log, "fatal");
		const oController = await Controller.create({
			name: "my.Controller09"
		});
		const oView = await XMLView.create({
			viewName: "example.mvc.asyncHooks",
			controller: oController
		});
		assert.ok(oView, "View is created");
		assert.ok(oFatalLogSpy.getCall(0).calledWith("[FUTURE FATAL] The registered Event Listener 'onInit' must not have a return value."), "Correct Fatal Log displayed");

		// render view to enforce lifecycle-Hooks to be triggered
		oView.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.ok(oView.getDomRef(), "View is rendered");
		assert.ok(oFatalLogSpy.getCall(1).calledWith("[FUTURE FATAL] The registered Event Listener 'onBeforeRendering' must not have a return value."), "Correct Fatal Log displayed");
		assert.ok(oFatalLogSpy.getCall(2).calledWith("[FUTURE FATAL] The registered Event Listener 'onAfterRendering' must not have a return value."), "Correct Fatal Log displayed");

		oView.destroy();
		assert.ok(oFatalLogSpy.getCall(3).calledWith("[FUTURE FATAL] The registered Event Listener 'onExit' must not have a return value."), "Correct Fatal Log displayed");

		await (async () => {
			await Promise.allSettled(aPromises);
			assert.equal(oErrorLogSpy.callCount, 2, "Two error logs should occur reg. rejected Promises.");
			assert.ok(oErrorLogSpy.getCall(0).calledWith("The registered Event Listener 'onAfterRendering' of 'my.Controller09' failed."), "Rejected Promise of 'onAfterRendering' hook should be handled and the correct error logged.");
			assert.ok(oErrorLogSpy.getCall(1).calledWith("The registered Event Listener 'onExit' of 'my.Controller09' failed."), "Rejected Promise of 'onExit' hook should be handled and the correct error logged.");
			oErrorLogSpy.restore();
		})();

		oFatalLogSpy.restore();
		future.active = undefined;
	});

	QUnit.test("onInit Shouldn't return any values (future=true)", async (assert) => {
		future.active = true;
		sap.ui.define("my/Controller10.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
			return Controller.extend("my.Controller10", {
				onInit: function() {
					return "onInit returns a String value";
				}
			});
		});

		const expectedMessage = "The registered Event Listener 'onInit' must not have a return value.";
		const oController = await Controller.create({
			name: "my.Controller10"
		});
		await assert.rejects(XMLView.create({
			viewName: "example.mvc.asyncHooks",
			controller: oController
		}), new Error(expectedMessage), "onInit must throw an error as it has a return value");

		future.active = undefined;
	});

	QUnit.test("onExit Shouldn't return any values (future=true)", async (assert) => {
		future.active = true;
		let oOnExitPromise;
		sap.ui.define("my/Controller11.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
			return Controller.extend("my.Controller11", {
				onExit: function() {
					const oPromise = Promise.reject(new Error("onExit returns rejected Promise."));
					oOnExitPromise = oPromise;
					return oPromise;
				}
			});
		});

		const expectedMessage = "The registered Event Listener 'onExit' must not have a return value.";
		const oController = await Controller.create({
			name: "my.Controller11"
		});
		const oView = await XMLView.create({
			viewName: "example.mvc.asyncHooks",
			controller: oController
		});

		assert.throws(() => {
			oView.destroy();
		}, new Error(expectedMessage), "onExit must throw an error as it has a return value");

		await oOnExitPromise.catch((err) => {
			assert.equal(err.message, "onExit returns rejected Promise.", "onExit promise rejected");
		});

		future.active = undefined;
	});

	QUnit.test("onBeforeRendering Shouldn't return any values (future=true)", async (assert) => {
		future.active = true;

		sap.ui.define("my/Controller12.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
			return Controller.extend("my.Controller12", {
				onBeforeRendering: async function() {
					const oPromise = Promise.resolve("async onBeforeRendering returns resolved Promise.");
					await oPromise;
				}
			});
		});

		const expectedMessage = "The registered Event Listener 'onBeforeRendering' must not have a return value.";
		const oController = await Controller.create({
			name: "my.Controller12"
		});
		const oView = await XMLView.create({
			viewName: "example.mvc.asyncHooks",
			controller: oController
		});
		oView.placeAt("qunit-fixture");

		await assert.rejects(nextUIUpdate(), new Error(expectedMessage), "onBeforeRendering must throw an error as it has a return value");

		future.active = undefined;
		oView.destroy();
	});

	QUnit.test("onAfterRendering Shouldn't return any values (future=true)", async (assert) => {
		future.active = true;
		let oOnAfterRenderingPromise;
		sap.ui.define("my/Controller13.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
			return Controller.extend("my.Controller13", {
				onAfterRendering: function() {
					const oPromise = Promise.reject(new Error("async onAfterRendering returns rejected Promise."));
					oOnAfterRenderingPromise =  oPromise;
					return oPromise;
				}
			});
		});

		const expectedMessage = "The registered Event Listener 'onAfterRendering' must not have a return value.";
		const oController = await Controller.create({
			name: "my.Controller13"
		});
		const oView = await XMLView.create({
			viewName: "example.mvc.asyncHooks",
			controller: oController
		});
		oView.placeAt("qunit-fixture");

		await assert.rejects(nextUIUpdate(), new Error(expectedMessage), "onAfterRendering must throw an error as it has a return value");
		await oOnAfterRenderingPromise.catch((err) => {
			assert.equal(err.message, "async onAfterRendering returns rejected Promise.", "onAfterRendering promise rejected");
		});
		future.active = undefined;
		oView.destroy();
	});
});

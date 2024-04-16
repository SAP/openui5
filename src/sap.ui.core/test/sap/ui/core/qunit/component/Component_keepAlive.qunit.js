sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/core/Component"
], function (future, Log, Component) {
	"use strict";
	/*global QUnit, sinon*/

	var fnWaitUntilHomeRouteMatched = function (oComponent) {
		return new Promise(function (resolve) {
			var fnHomeRouteMatchedHandler = function () {
				oComponent.getRouter().getRoute("home").detachPatternMatched(fnHomeRouteMatchedHandler);
				resolve();
			};
			oComponent.getRouter().getRoute("home").attachPatternMatched(fnHomeRouteMatchedHandler);
		});
	};

	var fnWaitForChild1HomeRouteMatched = function (oParentComponent) {
		return new Promise(function (resolve) {
			var fnParentHomeRouteMatchedHandler = function () {
				oParentComponent.getRouter().getRoute("home").detachPatternMatched(fnParentHomeRouteMatchedHandler);
				var oChildComponent1 = oParentComponent.getRootControl().getContent()[0].getPages()[0].getComponentInstance();

				// spy to the home routes of both components
				var oChild1HomeRouteMatchedSpy = sinon.spy(oChildComponent1.getRouter().getRoute("home"), "_routeMatched");
				var oParentHomeRouteMatchedSpy = sinon.spy(oParentComponent.getRouter().getRoute("home"), "_routeMatched");

				Promise.all([oChild1HomeRouteMatchedSpy.returnValues[0], oParentHomeRouteMatchedSpy.returnValues[0]]).then(function () {
					oChild1HomeRouteMatchedSpy.restore();
					oParentHomeRouteMatchedSpy.restore();
				}).finally(function () {
					resolve();
				});

			};
			oParentComponent.getRouter().getRoute("home").attachPatternMatched(fnParentHomeRouteMatchedHandler);
		});
	};

	QUnit.module("Parent and Child", {
		beforeEach: function () {
			var that = this;

			// setup component scenario
			return Component.create({
				id: "parent",
				name: "testdata.keepAlive.parent"
			}).then(function (oParentComponent) {
				that.oParentComponent = oParentComponent;

				return new Promise(function (res) {
					// create 1st nested component via routing
					var fnRouteMatchedHandler = function () {
						oParentComponent.getRouter().getRoute("home").detachPatternMatched(fnRouteMatchedHandler);

						that.oChildComponent1 = oParentComponent.getRootControl().getContent()[0].getPages()[0].getComponentInstance();
						// create 2nd nested component via factory
						that.oChildComponent1.createComponent({ id: "child2", usage: "child2" }).then(function (oChildComponent2) {
							that.oChildComponent2 = oChildComponent2;
							res();
						});
					};
					oParentComponent.getRouter().getRoute("home").attachPatternMatched(fnRouteMatchedHandler);
				});
			});
		},
		afterEach: function () {
			this.oParentComponent.destroy();
			this.oChildComponent2.destroy();
			window.location.hash = "";
		}
	});

	QUnit.test("Scenario 1: Deactivate/Activate parent component: Basics", function (assert) {
		assert.expect(13);

		assert.strictEqual(this.oParentComponent.getMetadata().getName(), "testdata.keepAlive.parent.Component",
			"Parent Component was created");
		assert.strictEqual(this.oChildComponent1.getMetadata().getName(), "testdata.keepAlive.child1.Component",
			"Child1 Component was created");
		assert.strictEqual(this.oChildComponent2.getMetadata().getName(), "testdata.keepAlive.child2.Component",
			"Child2 Component was created");

		// spy the home route of component child1
		var oChild1HomeRouteMatchedSpy = this.spy(this.oChildComponent1.getRouter().getRoute("home"), "_routeMatched");

		assert.ok(this.oParentComponent.isKeepAliveSupported(), "Parent Component: The component and all its nested components support keep alive.");

		assert.ok(this.oParentComponent.isActive(), "Parent Component: The component is active.");
		assert.ok(this.oChildComponent1.isActive(), "Child1 Component: The component is active.");
		assert.ok(this.oChildComponent2.isActive(), "Child2 Component: The component is active.");

		// --- DEACTIVATION ---
		this.oParentComponent.deactivate();

		assert.notOk(this.oParentComponent.isActive(), "Parent Component: The component is inactive.");
		assert.notOk(this.oChildComponent1.isActive(), "Child1 Component: The component is inactive.");
		assert.notOk(this.oChildComponent2.isActive(), "Child2 Component: The component is inactive.");

		// --- ACTIVATION ---
		this.oParentComponent.activate();

		assert.ok(this.oParentComponent.isActive(), "Parent Component: The component is active.");
		assert.ok(this.oChildComponent1.isActive(), "Child1 Component: The component is active.");
		assert.ok(this.oChildComponent2.isActive(), "Child2 Component: The component is active.");

		// wait until the home route of component child1 is matched before finishing the test and destroying the components
		return oChild1HomeRouteMatchedSpy.returnValues[0];
	});

	QUnit.test("Scenario 1: Deactivate/Activate parent component: EventBus", function (assert) {
		assert.expect(3);

		// spy the home route of component child1
		var oChild1HomeRouteMatchedSpy = this.spy(this.oChildComponent1.getRouter().getRoute("home"), "_routeMatched");

		assert.ok(this.oParentComponent.getEventBus(),
			"Parent Component: The eventbus for the parent component was created");

		var fnEventBusParentFail = function () {
			assert.notOk(true, "Parent Component: Should not be called because the eventbus of the parent component must be suspended!");
		};

		var fnEventBusChildFail = function () {
			assert.notOk(true, "Child1 Component: Should not be called because the eventbus of the child1 component must be suspended!");
		};

		// parent component - subscribe to an event
		this.oParentComponent.getEventBus().subscribe("parent_component", "event_1", fnEventBusParentFail);

		// --- DEACTIVATION ---
		this.oParentComponent.deactivate();

		// child component - subscribe to an event
		this.oChildComponent1.getEventBus().subscribe("child1_component", "event_1", fnEventBusChildFail);

		// child component - fire event
		this.oChildComponent1.getEventBus().publish("child1_component", "event_1");

		// parent component - fire event
		this.oParentComponent.getEventBus().publish("parent_component", "event_1");

		// --- Clean-Up ---
		this.oChildComponent1.getEventBus().unsubscribe("child1_component", "event_1", fnEventBusChildFail);
		this.oParentComponent.getEventBus().unsubscribe("parent_component", "event_1", fnEventBusParentFail);

		// parent component - subscribe to an event
		this.oParentComponent.getEventBus().subscribeOnce("parent_component", "event_1", function () {
			assert.ok(true, "Parent Component: Should be called because the eventbus of the parent component is resumed.");
		});

		// child component - subscribe to an event
		this.oChildComponent1.getEventBus().subscribeOnce("child1_component", "event_1", function () {
			assert.ok(true, "Child1 Component: Should be called because the eventbus of the child1 component is resumed.");
		});

		// --- ACTIVATION ---
		this.oParentComponent.activate();

		// child component - fire event
		this.oChildComponent1.getEventBus().publish("child1_component", "event_1");

		// parent component - fire event
		this.oParentComponent.getEventBus().publish("parent_component", "event_1");

		// wait until the home route of component child1 is matched before finishing the test and destroying the components
		return oChild1HomeRouteMatchedSpy.returnValues[0];
	});

	QUnit.test("Scenario 1: Deactivate/Activate parent component: Hooks", function (assert) {
		assert.expect(12);

		// spy the home route of component child1
		var oChild1HomeRouteMatchedSpy = this.spy(this.oChildComponent1.getRouter().getRoute("home"), "_routeMatched");

		var fnOnActivate = function () { };

		var fnOnDeactivate = function () { };

		// --- Component Hooks ---
		// assign actions to the hooks
		this.oParentComponent.onActivate = fnOnActivate;
		this.oParentComponent.onDeactivate = fnOnDeactivate;
		this.oChildComponent1.onActivate = fnOnActivate;
		this.oChildComponent1.onDeactivate = fnOnDeactivate;
		this.oChildComponent2.onActivate = fnOnActivate;
		this.oChildComponent2.onDeactivate = fnOnDeactivate;

		// spy the 'onActivate' and 'onDeactivate' hooks
		var oParentActivateSpy = sinon.spy(this.oParentComponent, "onActivate");
		var oParentDeactivateSpy = sinon.spy(this.oParentComponent, "onDeactivate");
		var oChild1ActivateSpy = sinon.spy(this.oChildComponent1, "onActivate");
		var oChild1DeactivateSpy = sinon.spy(this.oChildComponent1, "onDeactivate");
		var oChild2ActivateSpy = sinon.spy(this.oChildComponent2, "onActivate");
		var oChild2DeactivateSpy = sinon.spy(this.oChildComponent2, "onDeactivate");

		// --- DEACTIVATION ---
		this.oParentComponent.deactivate();

		// --- Component Hooks ---
		// check the 'onActivate' and 'onDeactivate' hooks
		assert.strictEqual(oParentActivateSpy.callCount, 0, "Parent Component: The 'onActivate' hook is not called.");
		assert.strictEqual(oParentDeactivateSpy.callCount, 1, "Parent Component: The 'onDeactivate' hook is called once.");

		assert.strictEqual(oChild1ActivateSpy.callCount, 0, "Child1 Component: The 'onActivate' hook is not called.");
		assert.strictEqual(oChild1DeactivateSpy.callCount, 1, "Child1 Component: The 'onDeactivate' hook is called once.");

		assert.strictEqual(oChild2ActivateSpy.callCount, 0, "Child2 Component: The 'onActivate' hook is not called.");
		assert.strictEqual(oChild2DeactivateSpy.callCount, 1, "Child2 Component: The 'onDeactivate' hook is called once.");


		// --- ACTIVATION ---
		this.oParentComponent.activate();

		// --- Component Hooks ---
		// check the 'onActivate' and 'onDeactivate' hooks
		assert.strictEqual(oParentActivateSpy.callCount, 1,
			"Parent Component: The 'onActivate' hook is called once.");
		assert.strictEqual(oParentDeactivateSpy.callCount, 1,
			"Parent Component: The 'onDeactivate' hook is not called again.");

		assert.strictEqual(oChild1ActivateSpy.callCount, 1,
			"Child1 Component: The 'onActivate' hook is called once.");
		assert.strictEqual(oChild1DeactivateSpy.callCount, 1,
			"Child1 Component: The 'onDeactivate' hook is not called again.");

		assert.strictEqual(oChild2ActivateSpy.callCount, 1,
			"Child2 Component: The 'onActivate' hook is called once.");
		assert.strictEqual(oChild2DeactivateSpy.callCount, 1,
			"Child2 Component: The 'onDeactivate' hook is not called again.");

		// wait until the home route of component child1 is matched before finishing the test and destroying the components
		return oChild1HomeRouteMatchedSpy.returnValues[0];
	});

	QUnit.test("Scenario 1: Deactivate/Activate parent component: Routing", function (assert) {
		assert.expect(6);

		// spy the home route of component child1
		var oChild1HomeRouteMatchedSpy = this.spy(this.oChildComponent1.getRouter().getRoute("home"), "_routeMatched");

		var oParentRouter = this.oParentComponent.getRouter();
		var oChild1Router = this.oChildComponent1.getRouter();

		assert.notOk(oParentRouter.isStopped(), "Parent Component: The router is not stopped.");
		assert.notOk(oChild1Router.isStopped(), "Child1 Component: The router is not stopped.");

		// --- DEACTIVATION ---
		this.oParentComponent.deactivate();

		assert.ok(oParentRouter.isStopped(), "Parent Component: The router is stopped.");
		assert.ok(oChild1Router.isStopped(), "Child1 Component: The router is stopped.");

		// --- ACTIVATION ---
		this.oParentComponent.activate();

		assert.notOk(oParentRouter.isStopped(), "Parent Component: The router is not stopped.");
		assert.notOk(oChild1Router.isStopped(), "Child1 Component: The router is not stopped.");

		// wait until the home route of component child1 is matched before finishing the test and destroying the components
		return oChild1HomeRouteMatchedSpy.returnValues[0];
	});

	QUnit.test("Scenario 2: Deactivate child component: Basics", function (assert) {
		assert.expect(11);

		// spy the home route of component child1
		var oChild1HomeRouteMatchedSpy = this.spy(this.oChildComponent1.getRouter().getRoute("home"), "_routeMatched");

		assert.strictEqual(this.oParentComponent.getMetadata().getName(), "testdata.keepAlive.parent.Component",
			"Parent Component was created");
		assert.strictEqual(this.oChildComponent1.getMetadata().getName(), "testdata.keepAlive.child1.Component",
			"Child1 Component was created");
		assert.strictEqual(this.oChildComponent2.getMetadata().getName(), "testdata.keepAlive.child2.Component",
			"Child2 Component was created");

		assert.ok(this.oParentComponent.isKeepAliveSupported(), "Parent Component: The component and all its nested components support keep alive.");

		assert.ok(this.oParentComponent.isActive(), "Parent Component: The component is active.");
		assert.ok(this.oChildComponent1.isActive(), "Child1 Component: The component is active.");
		assert.ok(this.oChildComponent2.isActive(), "Child2 Component: The component is active.");

		// --- DEACTIVATION ---
		assert.throws(function() {
			this.oChildComponent1.deactivate();
		}, new Error("Component.deactivate must not be called on nested components."), "Child1 Component: The component can not be deactivated.");

		assert.ok(this.oParentComponent.isActive(), "Parent Component: The component is active.");
		assert.ok(this.oChildComponent1.isActive(), "Child1 Component: The component is still active.");
		assert.ok(this.oChildComponent2.isActive(), "Child2 Component: The component is still active.");

		// wait until the home route of component child1 is matched before finishing the test and destroying the components
		return oChild1HomeRouteMatchedSpy.returnValues[0];
	});

	QUnit.module("Basics");

	QUnit.test("Scenario 3: Throw an error if a child component is created on an inactive component", function (assert) {
		assert.expect(7);

		return Component.create({
			id: "parent",
			name: "testdata.keepAlive.parent"
		}).then(function (oParentComponent) {
			assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
			assert.ok(oParentComponent.isKeepAliveSupported(), "Parent Component: The component supports keep alive.");

			// resolves as soon as the home route of the child is matched
			var pChild1HomeRouteMatched = fnWaitForChild1HomeRouteMatched(oParentComponent);

			// --- DEACTIVATION ---
			oParentComponent.deactivate();

			assert.notOk(oParentComponent.isActive(), "Parent Component: The component is inactive.");

			assert.throws(function () {
				return oParentComponent.createComponent({ usage: "child1" });
			}, new Error("Creation of component 'testdata.keepAlive.child1' is not possible due to inactive owner component 'parent'"), "Child1 Component: The component can not be created.");

			assert.notOk(oParentComponent.isActive(), "Parent Component: The component is inactive.");

			// --- ACTIVATION ---
			oParentComponent.activate();

			assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
			assert.ok(oParentComponent.isKeepAliveSupported(), "Parent Component: The component and its nested component supports keep alive.");

			// Clean-Up
			return pChild1HomeRouteMatched.then(function () {
				oParentComponent.destroy();
			});

		});
	});

	QUnit.test("Scenario 4: Throw an error if 'runAsOwner' is called on an inactive component", function (assert) {
		assert.expect(7);

		return Component.create({
			id: "parent",
			name: "testdata.keepAlive.parent"
		}).then(function (oParentComponent) {
			assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
			assert.ok(oParentComponent.isKeepAliveSupported(), "Parent Component: The component supports keep alive.");

			// resolves as soon as the home route of the child is matched
			var pChild1HomeRouteMatched = fnWaitForChild1HomeRouteMatched(oParentComponent);

			// --- DEACTIVATION ---
			oParentComponent.deactivate();

			assert.notOk(oParentComponent.isActive(), "Parent Component: The component is inactive.");

			var fnRunAsOwnerCallback = function () {
				assert.notOk(true, "Should not be called because the component is inactive.");
			};

			assert.throws(function () {
				return oParentComponent.runAsOwner(fnRunAsOwnerCallback);
			}, new Error("Execute 'runAsOwner' on an inactive owner component is not supported. Component: 'testdata.keepAlive.parent.Component' with id 'parent'."), "Parent Component: The component can not execute 'runAsOwner' because it is inactive.");

			assert.notOk(oParentComponent.isActive(), "Parent Component: The component is inactive.");

			// --- ACTIVATION ---
			oParentComponent.activate();

			assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
			assert.ok(oParentComponent.isKeepAliveSupported(), "Parent Component: The component and its nested component supports keep alive.");

			// Clean-Up
			return pChild1HomeRouteMatched.then(function () {
				oParentComponent.destroy();
			});

		});
	});

	QUnit.test("Scenario 5: Deactivate/Activate parent component when child component does not support keepAlive: deactivation after child creation", function (assert) {
		assert.expect(12);
		return Component.create({
			id: "parent",
			name: "testdata.keepAlive.parent"
		}).then(function (oParentComponent) {
			assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
			assert.ok(oParentComponent.isKeepAliveSupported(), "Parent Component: The component supports keep alive.");

			// resolves as soon as the home route of the child is matched
			var pChild1HomeRouteMatched = fnWaitForChild1HomeRouteMatched(oParentComponent);

			return oParentComponent.createComponent({ usage: "noKeepAlive" }).then(function (oNoKeepAliveComponent) {
				// resolves as soon as the home route matched
				var pHomeRouteMatched = fnWaitUntilHomeRouteMatched(oNoKeepAliveComponent);

				assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
				assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");
				assert.notOk(oParentComponent.isKeepAliveSupported(), "Parent Component: The component does not support keep alive.");
				assert.notOk(oNoKeepAliveComponent.isKeepAliveSupported(), "No Keep Alive Component: The component does not support keep alive.");

				// --- DEACTIVATION ---
				oParentComponent.deactivate();

				assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
				assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");

				// --- ACTIVATION ---
				oParentComponent.activate();

				assert.ok(oParentComponent.isActive(), "Parent Component: The component is active.");
				assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");
				assert.notOk(oParentComponent.isKeepAliveSupported(), "Parent Component: The component and its nested component do not support keep alive.");
				assert.notOk(oNoKeepAliveComponent.isKeepAliveSupported(), "No Keep Alive Component: The component does not support keep alive.");

				// Clean-Up
				return Promise.all([pHomeRouteMatched, pChild1HomeRouteMatched]).then(function () {
					oNoKeepAliveComponent.destroy();
					oParentComponent.destroy();
				});

			});
		});
	});

	QUnit.test("Scenario 6: Deactivate/Activate component when component does not support keep alive", function (assert) {
		assert.expect(4);
		return Component.create({
			id: "noKeepAlive",
			name: "testdata.keepAlive.noKeepAlive"
		}).then(function (oNoKeepAliveComponent) {
			assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");
			assert.notOk(oNoKeepAliveComponent.isKeepAliveSupported(), "No Keep Alive Component: The component does not support keep alive.");

			// resolves as soon as the home route matched
			var pHomeRouteMatched = fnWaitUntilHomeRouteMatched(oNoKeepAliveComponent);

			// --- DEACTIVATION ---
			oNoKeepAliveComponent.deactivate();

			assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");

			// --- ACTIVATION ---
			oNoKeepAliveComponent.activate();

			assert.ok(oNoKeepAliveComponent.isActive(), "No Keep Alive Component: The component is active.");

			// Clean-Up
			return pHomeRouteMatched.then(function () {
				oNoKeepAliveComponent.destroy();
			});
		});
	});

	QUnit.test("Scenario 6: Deactivate/Activate component when component does not support keep alive implicitly", function (assert) {
		assert.expect(4);
		return Component.create({
			id: "noKeepAlive",
			name: "testdata.keepAlive.noKeepAliveImplicit"
		}).then(function (oNoKeepAliveComponent) {
			assert.ok(oNoKeepAliveComponent.isActive(), "Implicit No Keep Alive Component: The component is active.");
			assert.notOk(oNoKeepAliveComponent.isKeepAliveSupported(), "Implicit No Keep Alive Component: The component does not support keep alive.");

			// resolves as soon as the home route matched
			var pHomeRouteMatched = fnWaitUntilHomeRouteMatched(oNoKeepAliveComponent);

			// --- DEACTIVATION ---
			oNoKeepAliveComponent.deactivate();

			assert.ok(oNoKeepAliveComponent.isActive(), "Implicit No Keep Alive Component: The component is active.");

			// --- ACTIVATION ---
			oNoKeepAliveComponent.activate();

			assert.ok(oNoKeepAliveComponent.isActive(), "Implicit No Keep Alive Component: The component is active.");

			// Clean-Up
			return pHomeRouteMatched.then(function () {
				oNoKeepAliveComponent.destroy();
			});
		});
	});

	QUnit.test("Scenario 7: Deactivate/Activate component and keep other not nested component active", function (assert) {
		assert.expect(6);
		return Component.create({
			id: "parent1",
			name: "testdata.keepAlive.parent"
		}).then(function (oParentComponent1) {
			// resolves as soon as the home route of the child is matched
			var pChild1Parent1HomeRouteMatched = fnWaitForChild1HomeRouteMatched(oParentComponent1);

			return Component.create({
				id: "parent2",
				name: "testdata.keepAlive.parent"
			}).then(function (oParentComponent2) {
				// resolves as soon as the home route of the child is matched
				var pChild1Parent2HomeRouteMatched = fnWaitForChild1HomeRouteMatched(oParentComponent2);

				assert.ok(oParentComponent1.isActive(), "Parent 1 Component: The component is active.");
				assert.ok(oParentComponent2.isActive(), "Parent 2 Component: The component is active.");

				// --- DEACTIVATION ---
				oParentComponent1.deactivate();

				assert.notOk(oParentComponent1.isActive(), "Parent 1 Component: The component is inactive.");
				assert.ok(oParentComponent2.isActive(), "Parent 2 Component: The component is active.");

				// --- ACTIVATION ---
				oParentComponent1.activate();

				assert.ok(oParentComponent1.isActive(), "Parent 1 Component: The component is active.");
				assert.ok(oParentComponent2.isActive(), "Parent 2 Component: The component is active.");

				// Clean-up
				return Promise.all([pChild1Parent1HomeRouteMatched, pChild1Parent2HomeRouteMatched]).then(function () {
					oParentComponent1.destroy();
					oParentComponent2.destroy();
				});
			});
		});
	});

	QUnit.test("Scenario 8: Do not trigger deactivation when component is already inactive", function (assert) {
		assert.expect(4);

		return Component.create({
			id: "component",
			name: "testdata.keepAlive.child1"
		}).then(function (oComponent) {
			// resolves as soon as the home route is matched
			var pHomeRouteMatched = fnWaitUntilHomeRouteMatched(oComponent);

			return pHomeRouteMatched.then(function () {

				// spy the 'onOwnerDeactivation' hook
				var onOwnerDeactivationSpy = sinon.spy(oComponent, "onOwnerDeactivation");

				// --- DEACTIVATION ---
				oComponent.deactivate();

				assert.notOk(oComponent.isActive(), "Component: The component is inactive.");
				assert.equal(onOwnerDeactivationSpy.callCount, 1, "Component: The deactivation was triggered.");

				// --- DEACTIVATION ---
				oComponent.deactivate();

				assert.notOk(oComponent.isActive(), "Component: The component is inactive.");
				assert.equal(onOwnerDeactivationSpy.callCount, 1, "Component: The deactivation was not triggered again.");

			}).finally(function () {
				// Clean-Up
				oComponent.destroy();
			});

		});
	});

	QUnit.test("Scenario 9: Do not trigger activation when component is already active", function (assert) {
		assert.expect(7);

		return Component.create({
			id: "component",
			name: "testdata.keepAlive.child1"
		}).then(function (oComponent) {

			// resolves as soon as the home route is matched
			var pHomeRouteMatched = fnWaitUntilHomeRouteMatched(oComponent);

			// spy the synchronous home route matched method
			var oHomeRouteMatchedSpy = sinon.spy(oComponent.getRouter().getRoute("home"), "_routeMatched");

			// spy the 'onOwnerActivation' hook
			var onOwnerActivationSpy = sinon.spy(oComponent, "onOwnerActivation");

			// --- ACTIVATION ---
			oComponent.activate();

			assert.ok(oComponent.isActive(), "Component: The component is active.");
			assert.equal(onOwnerActivationSpy.callCount, 0, "Component: The activation was not triggered, because the component is already active.");

			// --- DEACTIVATION ---
			oComponent.deactivate();

			assert.notOk(oComponent.isActive(), "Component: The component is inactive.");

			// --- ACTIVATION ---
			oComponent.activate();

			assert.ok(oComponent.isActive(), "Component: The component is active.");
			assert.equal(onOwnerActivationSpy.callCount, 1, "Component: The activation was triggered.");

			return pHomeRouteMatched.then(function () {
				// --- ACTIVATION ---
				oComponent.activate();

				assert.ok(oComponent.isActive(), "Component: The component is active.");
				assert.equal(onOwnerActivationSpy.callCount, 1, "Component: The activation was not triggered, because the component is already active.");

				return oHomeRouteMatchedSpy.returnValues[0];
			}).finally(function () {
				// Clean-Up
				oComponent.destroy();
			});
		});
	});

	/**
	 * @deprecated
	 */
	QUnit.test("'onActivate' should not return a value (future=false)", async function(assert) {
		future.active = false;
		window.aPromises = []; // see testdata.keepAlive.child3.Component.js
		const oComponent = await Component.create({
			id: "component",
			name: "testdata.keepAlive.child3OnActivateReturns"
		});

		await fnWaitUntilHomeRouteMatched(oComponent);
		assert.ok(oComponent.isActive(), "Component: Initially, the component is active");

		const oFatalLogSpy = sinon.spy(Log, "fatal");
		oComponent.deactivate();
		oComponent.activate();
		assert.ok(oComponent.isActive(), "Component: The component is active after activate()");
		assert.ok(oFatalLogSpy.getCall(0).calledWith("[FUTURE FATAL] The registered Event Listener 'onActivate' must not have a return value."), "The 'onActivate' should not return a value.");

		oFatalLogSpy.restore();
		oComponent.destroy();
		future.active = undefined;
	});

	/**
	 * @deprecated
	 */
	QUnit.test("'onDeactivate' should not return a value (future=false)", async function(assert) {
		future.active = false;
		window.aPromises = []; // see testdata.keepAlive.child3.Component.js
		const oComponent = await Component.create({
			id: "component",
			name: "testdata.keepAlive.child3OnDeactivateReturns"
		});

		await fnWaitUntilHomeRouteMatched(oComponent);
		assert.ok(oComponent.isActive(), "Component: Initially, the component is active");

		const oFatalLogSpy = sinon.spy(Log, "fatal");
		/**
		 * @deprecated
		 */
		const oErrorLogSpy = sinon.spy(Log, "error");

		oComponent.deactivate();
		await Promise.allSettled(window.aPromises);
		assert.notOk(oComponent.isActive(), "Component: The component is not active after deactivate()");
		assert.ok(oFatalLogSpy.getCall(0).calledWith("[FUTURE FATAL] The registered Event Listener 'onDeactivate' must not have a return value."), "The 'onDeactivate' should not return a value.");

		/**
		 * @deprecated
		 */
		await Promise.resolve(() => {
			assert.ok(oErrorLogSpy.getCall(0).calledWith("The registered Event Listener 'onDeactivate' of 'component' failed."), "The rejected Promise is caught successfully");
			oErrorLogSpy.restore();
		});

		oFatalLogSpy.restore();
		oComponent.destroy();
		future.active = undefined;
	});

	QUnit.test("'onActivate' should not return a value (future=true)", async function(assert) {
		future.active = true;
		const oComponent = await Component.create({
			id: "component",
			name: "testdata.keepAlive.child3OnActivateReturns"
		});

		await fnWaitUntilHomeRouteMatched(oComponent);
		assert.ok(oComponent.isActive(), "Component: Initially, the component is active");

		oComponent.deactivate();
		assert.throws(() => oComponent.activate(),
			new Error("The registered Event Listener 'onActivate' must not have a return value."),
			"The 'onActivate' should not return a value."
		);

		oComponent.destroy();
		future.active = undefined;
	});

	QUnit.test("'onDeactivate' should not return a value (future=true)", async function(assert) {
		future.active = true;
		const oComponent = await Component.create({
			id: "component",
			name: "testdata.keepAlive.child3OnDeactivateReturns"
		});

		await fnWaitUntilHomeRouteMatched(oComponent);
		assert.ok(oComponent.isActive(), "Component: Initially, the component is active");

		assert.throws(() => oComponent.deactivate(),
			new Error("The registered Event Listener 'onDeactivate' must not have a return value."),
			"The 'onDeactivate' should not return a value."
		);

		oComponent.destroy();
		future.active = undefined;
	});

});

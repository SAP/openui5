/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/mdc/mixin/DeferredAggregationForwardMixin"
], function(
	Control,
	DeferredAggregationForwardMixin
) {
	"use strict";

	const StubControl = Control.extend("sap.ui.mdc.test.StubControl", {
		metadata: {},
		renderer: {apiVersion: 2, render: function() { }}
	});

	function makeHostClass() {
		return Control.extend("sap.ui.mdc.test.HostControl" + makeHostClass._counter++, {
			metadata: {
				aggregations: {
					myAgg: {type: "sap.ui.core.Control", multiple: false},
					myOtherAgg: {type: "sap.ui.core.Control", multiple: false},
					stringOrControl: {type: "sap.ui.core.Control", multiple: false, altTypes: ["string"]}
				}
			},
			renderer: {apiVersion: 2, render: function() { }}
		});
	}
	makeHostClass._counter = 0;

	QUnit.module("Setter / getter", {
		beforeEach: function() {
			const HostClass = makeHostClass();
			this.applyToTarget = sinon.spy();
			DeferredAggregationForwardMixin.call(HostClass.prototype, [{
				aggregation: "myAgg",
				applyToTarget: this.applyToTarget
			}]);
			this.oHost = new HostClass();
		},
		afterEach: function() {
			this.oHost.destroy();
		}
	});

	QUnit.test("Set stashes the value and defers forwarding until a target is registered", function(assert) {
		const oControl = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl);
		assert.strictEqual(this.oHost.getMyAgg(), oControl, "getter reflects the stashed value");
		assert.ok(this.applyToTarget.notCalled, "applyToTarget is not called while no target is registered");

		this.oHost._registerForwardingTarget(oTarget);
		assert.equal(this.applyToTarget.callCount, 1, "applyToTarget is called once the target registers");
		assert.ok(this.applyToTarget.calledWith(oControl), "the deferred value is forwarded on registration");

		oControl.destroy();
		oTarget.destroy();
	});

	QUnit.test("Set forwards immediately once a target is registered", function(assert) {
		const oTarget = new StubControl();
		const oControl = new StubControl();

		this.oHost._registerForwardingTarget(oTarget);
		this.applyToTarget.resetHistory();
		this.oHost.setMyAgg(oControl);

		assert.strictEqual(this.oHost.getMyAgg(), oControl, "getter reflects the stashed value");
		assert.equal(this.applyToTarget.callCount, 1, "applyToTarget is called once");
		assert.ok(this.applyToTarget.calledWith(oControl), "applyToTarget is called with the value");

		oControl.destroy();
		oTarget.destroy();
	});

	QUnit.test("Get returns the stashed value", function(assert) {
		const oControl = new StubControl();

		this.oHost.setMyAgg(oControl);

		assert.strictEqual(this.oHost.getMyAgg(), oControl, "getter returns stashed control");

		oControl.destroy();
	});

	QUnit.test("Get returns null after control is destroyed", function(assert) {
		const oControl = new StubControl();

		this.oHost.setMyAgg(oControl);
		oControl.destroy();

		assert.strictEqual(this.oHost.getMyAgg(), null, "getter returns null for destroyed control");
	});

	QUnit.test("Set with null stashes null and getter returns null", function(assert) {
		const oTarget = new StubControl();

		this.oHost._registerForwardingTarget(oTarget);
		this.applyToTarget.resetHistory();
		this.oHost.setMyAgg(null);

		assert.strictEqual(this.oHost.getMyAgg(), null, "getter returns null");
		assert.ok(this.applyToTarget.calledWith(null), "applyToTarget called with null");

		oTarget.destroy();
	});

	QUnit.test("String value (altTypes) — getter returns it and destroyer does not throw", function(assert) {
		const HostClass = makeHostClass();
		const applyToTarget = sinon.spy();

		DeferredAggregationForwardMixin.call(HostClass.prototype, [{
			aggregation: "stringOrControl",
			applyToTarget: applyToTarget
		}]);

		const oHost = new HostClass();

		oHost.setStringOrControl("hello");
		assert.strictEqual(oHost.getStringOrControl(), "hello", "getter returns the string");
		let bThrew = false;
		try {oHost.destroyStringOrControl();} catch (e) {bThrew = true;}
		assert.notOk(bThrew, "destroyer does not throw for string value");
		assert.strictEqual(oHost.getStringOrControl(), null, "getter returns null after destroy");

		oHost.destroy();
	});

	QUnit.module("Destroyer", {
		beforeEach: function() {
			const HostClass = makeHostClass();
			this.applyToTarget = sinon.spy();
			DeferredAggregationForwardMixin.call(HostClass.prototype, [{
				aggregation: "myAgg",
				applyToTarget: this.applyToTarget
			}]);
			this.oHost = new HostClass();
		},
		afterEach: function() {
			this.oHost.destroy();
		}
	});

	QUnit.test("destroyX destroys the stashed control and getter returns null", function(assert) {
		const oControl = new StubControl();

		this.oHost.setMyAgg(oControl);
		this.oHost.destroyMyAgg();

		assert.ok(oControl.isDestroyed(), "stashed control is destroyed");
		assert.strictEqual(this.oHost.getMyAgg(), null, "getter returns null after destroy");
	});

	QUnit.test("destroyX on empty host does not throw", function(assert) {
		let bThrew = false;
		try {this.oHost.destroyMyAgg();} catch (e) {bThrew = true;}
		assert.notOk(bThrew, "destroy with no value does not throw");
	});

	QUnit.module("_registerForwardingTarget", {
		beforeEach: function() {
			const HostClass = makeHostClass();
			this.applyToTarget1 = sinon.spy();
			this.applyToTarget2 = sinon.spy();
			DeferredAggregationForwardMixin.call(HostClass.prototype, [
				{aggregation: "myAgg", applyToTarget: this.applyToTarget1},
				{aggregation: "myOtherAgg", applyToTarget: this.applyToTarget2}
			]);
			this.oHost = new HostClass();
		},
		afterEach: function() {
			this.oHost.destroy();
		}
	});

	QUnit.test("Calls applyToTarget for each stashed value on registration", function(assert) {
		const oControl1 = new StubControl();
		const oControl2 = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl1);
		this.oHost.setMyOtherAgg(oControl2);
		this.applyToTarget1.resetHistory();
		this.applyToTarget2.resetHistory();
		this.oHost._registerForwardingTarget(oTarget);

		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget for myAgg called on register");
		assert.ok(this.applyToTarget1.calledWith(oControl1), "applyToTarget called with stashed myAgg control");
		assert.equal(this.applyToTarget2.callCount, 1, "applyToTarget for myOtherAgg called on register");
		assert.ok(this.applyToTarget2.calledWith(oControl2), "applyToTarget called with stashed myOtherAgg control");

		oTarget.destroy();
		oControl1.destroy();
		oControl2.destroy();
	});

	QUnit.test("Does not forward a stashed value that was destroyed before target registration", function(assert) {
		const oControl = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl);
		oControl.destroy(); // destroyed externally before target registration

		this.applyToTarget1.resetHistory();
		this.oHost._registerForwardingTarget(oTarget);

		assert.ok(this.applyToTarget1.notCalled, "applyToTarget is not called for a destroyed stashed value");

		oTarget.destroy();
	});

	QUnit.test("Does not call applyToTarget for unset aggregations on registration", function(assert) {
		const oControl = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl);
		// myOtherAgg is never set
		this.applyToTarget1.resetHistory();
		this.applyToTarget2.resetHistory();
		this.oHost._registerForwardingTarget(oTarget);

		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget for myAgg called");
		assert.ok(this.applyToTarget2.notCalled, "applyToTarget for unset myOtherAgg not called");

		oTarget.destroy();
		oControl.destroy();
	});

	QUnit.test("Calls applyToTarget(undefined) for each stashed value when the target is destroyed", function(assert) {
		const oControl1 = new StubControl();
		const oControl2 = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl1);
		this.oHost.setMyOtherAgg(oControl2);
		this.oHost._registerForwardingTarget(oTarget);
		this.applyToTarget1.resetHistory();
		this.applyToTarget2.resetHistory();
		oTarget.destroy();

		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget for myAgg called on target destroy");
		assert.ok(this.applyToTarget1.calledWith(undefined), "applyToTarget called with undefined");
		assert.equal(this.applyToTarget2.callCount, 1, "applyToTarget for myOtherAgg called on target destroy");
		assert.ok(this.applyToTarget2.calledWith(undefined), "applyToTarget called with undefined");

		// stashed values still accessible via getters after target is destroyed
		assert.strictEqual(this.oHost.getMyAgg(), oControl1, "stashed value still accessible via getter");
		assert.strictEqual(this.oHost.getMyOtherAgg(), oControl2, "stashed value still accessible via getter");

		oControl1.destroy();
		oControl2.destroy();
	});

	QUnit.test("Does not call applyToTarget for unset aggregations when the target is destroyed", function(assert) {
		const oControl = new StubControl();
		const oTarget = new StubControl();

		this.oHost.setMyAgg(oControl);
		// myOtherAgg not set
		this.oHost._registerForwardingTarget(oTarget);
		this.applyToTarget1.resetHistory();
		this.applyToTarget2.resetHistory();
		oTarget.destroy();

		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget for myAgg called");
		assert.ok(this.applyToTarget2.notCalled, "applyToTarget for unset myOtherAgg not called");

		oControl.destroy();
	});

	QUnit.test("Prototype exit is called and own-property wrapper is removed after target destroy", function(assert) {
		const oControl = new StubControl();
		const TargetClass = StubControl.extend("sap.ui.mdc.test.TargetControl" + Date.now(), {
			metadata: {},
			renderer: {apiVersion: 2, render: function() { }}
		});
		const oTarget = new TargetClass();
		const fnPrototypeExit = sinon.spy();

		TargetClass.prototype.exit = fnPrototypeExit;

		this.oHost.setMyAgg(oControl);
		assert.notOk(Object.hasOwn(oTarget, "exit"), "no own exit on instance before registration");

		this.oHost._registerForwardingTarget(oTarget);
		assert.ok(Object.hasOwn(oTarget, "exit"), "exit wrapper installed as own property on instance");
		assert.notStrictEqual(oTarget.exit, fnPrototypeExit, "wrapper is not the prototype exit");

		oTarget.destroy();
		assert.equal(fnPrototypeExit.callCount, 1, "prototype exit was called during destroy");
		assert.strictEqual(oTarget.exit, fnPrototypeExit, "exit restored to prototype exit");

		oControl.destroy();
	});

	QUnit.test("Each registered target calls applyToTarget independently when destroyed", function(assert) {
		const oControl = new StubControl();
		const oTarget1 = new StubControl();
		const oTarget2 = new StubControl();

		this.oHost.setMyAgg(oControl);
		this.oHost._registerForwardingTarget(oTarget1);
		this.oHost._registerForwardingTarget(oTarget2);
		this.applyToTarget1.resetHistory();

		oTarget1.destroy();
		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget called on first target's destroy");

		this.applyToTarget1.resetHistory();

		oTarget2.destroy();
		assert.equal(this.applyToTarget1.callCount, 1, "applyToTarget called on second target's destroy");

		oControl.destroy();
	});

	QUnit.test("Reverts to deferred forwarding after the target is destroyed", function(assert) {
		const oControl = new StubControl();
		const oTarget = new StubControl();

		this.oHost._registerForwardingTarget(oTarget);
		oTarget.destroy();

		this.applyToTarget1.resetHistory();
		this.oHost.setMyAgg(oControl);
		assert.ok(this.applyToTarget1.notCalled, "set after target destroy stashes without forwarding");

		const oNewTarget = new StubControl();
		this.oHost._registerForwardingTarget(oNewTarget);
		assert.ok(this.applyToTarget1.calledWith(oControl), "the value is forwarded when a new target registers");

		oControl.destroy();
		oNewTarget.destroy();
	});

	QUnit.module("Destroy cleanup");

	QUnit.test("exit destroys each registered aggregation control", function(assert) {
		const HostClass = makeHostClass();
		DeferredAggregationForwardMixin.call(HostClass.prototype, [
			{aggregation: "myAgg", applyToTarget: function() { }},
			{aggregation: "myOtherAgg", applyToTarget: function() { }}
		]);

		const oHost = new HostClass();
		const oControl1 = new StubControl();
		const oControl2 = new StubControl();
		oHost.setMyAgg(oControl1);
		oHost.setMyOtherAgg(oControl2);

		oHost.destroy();

		assert.ok(oControl1.isDestroyed(), "stashed control 1 is destroyed");
		assert.ok(oControl2.isDestroyed(), "stashed control 2 is destroyed");
		assert.strictEqual(oHost.getMyAgg(), null, "getMyAgg returns null after host destroy");
		assert.strictEqual(oHost.getMyOtherAgg(), null, "getMyOtherAgg returns null after host destroy");
	});

	QUnit.test("Multiple aggregations in a single call are all registered", function(assert) {
		const HostClass = makeHostClass();
		const applyToTarget1 = sinon.spy();
		const applyToTarget2 = sinon.spy();
		DeferredAggregationForwardMixin.call(HostClass.prototype, [
			{aggregation: "myAgg", applyToTarget: applyToTarget1},
			{aggregation: "myOtherAgg", applyToTarget: applyToTarget2}
		]);

		const oHost = new HostClass();
		const oControl1 = new StubControl();
		const oControl2 = new StubControl();
		oHost.setMyAgg(oControl1);
		oHost.setMyOtherAgg(oControl2);

		const oTarget = new StubControl();
		oHost._registerForwardingTarget(oTarget);

		assert.ok(applyToTarget1.calledWith(oControl1), "applyToTarget called for first aggregation");
		assert.ok(applyToTarget2.calledWith(oControl2), "applyToTarget called for second aggregation");

		oTarget.destroy();
		oHost.destroy();
	});

	QUnit.test("exit wrap composes with a pre-existing exit (chains to original exit)", function(assert) {
		const HostClass = makeHostClass();
		const fnExitSpy = sinon.spy();
		HostClass.prototype.exit = fnExitSpy;

		DeferredAggregationForwardMixin.call(HostClass.prototype, [{aggregation: "myAgg", applyToTarget: function() { }}]);

		const oHost = new HostClass();
		oHost.destroy();

		assert.equal(fnExitSpy.callCount, 1, "original exit called during destroy");
	});

	QUnit.test("Two instances of the same class do not share mixin state", function(assert) {
		const HostClass = makeHostClass();

		DeferredAggregationForwardMixin.call(HostClass.prototype, [{aggregation: "myAgg", applyToTarget: function() { }}]);

		const oHost1 = new HostClass();
		const oHost2 = new HostClass();
		const oControl1 = new StubControl();
		const oControl2 = new StubControl();

		oHost1.setMyAgg(oControl1);
		assert.strictEqual(oHost1.getMyAgg(), oControl1, "Host1 getter returns its own value");
		assert.strictEqual(oHost2.getMyAgg(), null, "Host2 getter is unaffected by Host1 set");

		oHost2.setMyAgg(oControl2);
		assert.strictEqual(oHost1.getMyAgg(), oControl1, "Host1 getter is unaffected by Host2 set");
		assert.strictEqual(oHost2.getMyAgg(), oControl2, "Host2 getter returns its own value");

		oHost1.destroy();
		oHost2.destroy();
	});

	QUnit.module("Setup validation");

	QUnit.test("Throws if aggregation does not exist", function(assert) {
		const HostClass = makeHostClass();
		assert.throws(function() {
			DeferredAggregationForwardMixin.call(HostClass.prototype, [{aggregation: "nonExistent", applyToTarget: function() { }}]);
		}, /Aggregation.*nonExistent/, "throws for unknown aggregation");
	});

	QUnit.test("Throws if applyToTarget is not a function", function(assert) {
		const HostClass = makeHostClass();
		assert.throws(function() {
			DeferredAggregationForwardMixin.call(HostClass.prototype, [{aggregation: "myAgg", applyToTarget: "not-a-function"}]);
		}, /applyToTarget.*function/, "throws if applyToTarget is not a function");
	});

	QUnit.test("_registerForwardingTarget throws if the argument is not a sap.ui.core.Element", function(assert) {
		const HostClass = makeHostClass();
		DeferredAggregationForwardMixin.call(HostClass.prototype, [{aggregation: "myAgg", applyToTarget: function() { }}]);
		const oHost = new HostClass();

		assert.throws(function() { oHost._registerForwardingTarget(null); }, /sap\.ui\.core\.Element/, "throws for null");
		assert.throws(function() { oHost._registerForwardingTarget({}); }, /sap\.ui\.core\.Element/, "throws for plain object");
		assert.throws(function() { oHost._registerForwardingTarget("string"); }, /sap\.ui\.core\.Element/, "throws for string");

		oHost.destroy();
	});
});

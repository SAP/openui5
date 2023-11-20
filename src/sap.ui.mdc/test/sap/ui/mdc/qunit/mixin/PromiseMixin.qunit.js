/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/mixin/PromiseMixin",
	"sap/ui/mdc/util/PromiseCache",
	"sap/ui/base/ManagedObject"
], function(
	PromiseMixin,
	PromiseCache,
	ManagedObject
) {
	"use strict";

	let TestClass;
	let oSomeInstance;

	const fnCreateInstance = function () {
		TestClass = ManagedObject.extend("temp", {
			metadata: {
				properties: {}
			}
		});
		PromiseMixin.call(TestClass.prototype);
		oSomeInstance = new TestClass();
	};

	const fnCleanup = function () {
		if (oSomeInstance) {
			oSomeInstance.destroy();
			oSomeInstance = undefined;
		}
		if (TestClass) {
			TestClass = undefined;
		}
	};

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			fnCreateInstance();
		},
		afterEach: fnCleanup
	});

	QUnit.test("method mapping", function(assert) {
		assert.ok(oSomeInstance._addPromise, "_addPromise successfully set");
		assert.ok(oSomeInstance._cancelPromise, "_cancelPromise successfully set");
		assert.ok(oSomeInstance._removePromise, "_removePromise successfully set");
		assert.ok(oSomeInstance._resolvePromise, "_resolvePromise successfully set");
		assert.ok(oSomeInstance._rejectPromise, "_rejectPromise successfully set");
		assert.ok(oSomeInstance._retrievePromise, "_retrievePromise successfully set");
		assert.ok(oSomeInstance._retrievePromises, "_retrievePromises successfully set");
	});

	QUnit.test("cache initialization / destruction", function(assert) {
		assert.notOk(oSomeInstance.promiseCache, "promiseCache is only created when needed.");
		oSomeInstance._addPromise("a");
		assert.ok(oSomeInstance.promiseCache.isA("sap.ui.mdc.util.PromiseCache"), "promiseCache is created after using a mixin method.");

		oSomeInstance.destroy();
		assert.notOk(oSomeInstance.promiseCache, "promiseCache destroyed on control destruction");
	});

	QUnit.module("Creation", {
		beforeEach: function() {
			fnCreateInstance();
		},
		afterEach: fnCleanup
	});

	QUnit.test("_addPromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "add");
		const oPromise = oSomeInstance._addPromise("a");
		assert.ok(PromiseCache.prototype.add.calledWith("a"), "calls PromiseCache.prototype.add.");
		assert.ok(PromiseCache.prototype.add.returned(oPromise), "returns PromiseCache.prototype.add returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._addPromise("a");
		assert.notOk(PromiseCache.prototype.add.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.add.restore();
	});

	QUnit.test("_retrievePromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "retrieve");
		const aArgs = ["a", Promise.resolve()];
		const oPromise = oSomeInstance._retrievePromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.retrieve.calledWith(aArgs[0], aArgs[1]), "calls PromiseCache.prototype.retrieve.");
		assert.ok(PromiseCache.prototype.retrieve.returned(oPromise), "returns PromiseCache.prototype.retrieve returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._retrievePromise(aArgs);
		assert.notOk(PromiseCache.prototype.retrieve.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.retrieve.restore();
	});

	QUnit.module("Retrieval / Updates / Removal", {
		beforeEach: function() {
			fnCreateInstance();
			oSomeInstance._addPromise("a");
		},
		afterEach: fnCleanup
	});

	QUnit.test("_retrievePromises", function(assert) {
		sinon.spy(PromiseCache.prototype, "retrieveMany");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._retrievePromises.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.retrieveMany.calledWith(aArgs[0]), "calls PromiseCache.prototype.retrieve.");
		assert.ok(PromiseCache.prototype.retrieveMany.returned(oPromise), "returns PromiseCache.prototype.retrieve returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._retrievePromises();
		assert.notOk(PromiseCache.prototype.retrieveMany.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.retrieveMany.restore();
	});

	QUnit.test("_retrievePromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "retrieve");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._retrievePromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.retrieve.calledWith(aArgs[0]), "calls PromiseCache.prototype.retrieve.");
		assert.ok(PromiseCache.prototype.retrieve.returned(oPromise), "returns PromiseCache.prototype.retrieve returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._retrievePromise(aArgs);
		assert.notOk(PromiseCache.prototype.retrieve.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.retrieve.restore();
	});


	QUnit.test("_cancelPromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "cancel");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._cancelPromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.cancel.calledWith(aArgs[0]), "calls PromiseCache.prototype.cancel.");
		assert.ok(PromiseCache.prototype.cancel.returned(oPromise), "returns PromiseCache.prototype.cancel returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._cancelPromise(aArgs);
		assert.notOk(PromiseCache.prototype.cancel.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.cancel.restore();
	});

	QUnit.test("_removePromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "remove");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._removePromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.remove.calledWith(aArgs[0]), "calls PromiseCache.prototype.remove.");
		assert.ok(PromiseCache.prototype.remove.returned(oPromise), "returns PromiseCache.prototype.remove returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._removePromise(aArgs);
		assert.notOk(PromiseCache.prototype.remove.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.remove.restore();
	});

	QUnit.test("_resolvePromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "resolve");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._resolvePromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.resolve.calledWith(aArgs[0]), "calls PromiseCache.prototype.resolve.");
		assert.ok(PromiseCache.prototype.resolve.returned(oPromise), "returns PromiseCache.prototype.resolve returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._resolvePromise(aArgs);
		assert.notOk(PromiseCache.prototype.resolve.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.resolve.restore();
	});

	QUnit.test("_rejectPromise", function(assert) {
		sinon.spy(PromiseCache.prototype, "reject");
		const aArgs = ["a"];
		const oPromise = oSomeInstance._rejectPromise.apply(oSomeInstance, aArgs);
		assert.ok(PromiseCache.prototype.reject.calledWith(aArgs[0]), "calls PromiseCache.prototype.reject.");
		assert.ok(PromiseCache.prototype.reject.returned(oPromise), "returns PromiseCache.prototype.reject returnValue.");

		oSomeInstance.destroy();
		oSomeInstance._rejectPromise(aArgs);
		assert.notOk(PromiseCache.prototype.reject.calledTwice, "No-op if control is destroyed.");
		PromiseCache.prototype.reject.restore();
	});
});

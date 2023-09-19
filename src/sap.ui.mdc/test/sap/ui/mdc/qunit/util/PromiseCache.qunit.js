/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/util/PromiseCache"
], function(
	PromiseCache
) {
	"use strict";
	let oPromiseCache;
	QUnit.module("Basics", {
		beforeEach: function() {
			oPromiseCache = new PromiseCache();
		},
		afterEach: function() {
			if (oPromiseCache && !oPromiseCache.bIsDestroyed) {
				oPromiseCache.destroy();
			}
		}
	});
	QUnit.test("basics", function(assert) {
		const done = assert.async();
		// Adding
		let oCancelablePromise = oPromiseCache.add("test");
		const oCancelablePromiseConfig = oPromiseCache._oCache["test"];
		const fnResolveStub = sinon.stub();
		oCancelablePromise.then(fnResolveStub);
		assert.ok(oCancelablePromise, "promise returned");
		assert.ok(typeof oCancelablePromise.then === 'function' && typeof oCancelablePromise.catch === 'function', "is promise");
		assert.ok(oCancelablePromise === oPromiseCache._oCache["test"].promise, "promise properly stored in cache");
		// Replacing
		const oNewCancelablePromise = oPromiseCache.add("test");
		assert.ok(oNewCancelablePromise === oPromiseCache._oCache["test"].promise, "promise properly replaced in cache");
		// Retrieving
		const oRetrievedPromise = oPromiseCache.retrieve("test");
		// Canceling
		assert.ok(oCancelablePromiseConfig._isCanceled, "promise was canceled");
		assert.ok(oNewCancelablePromise === oRetrievedPromise, "correct promise was retrieved");
		// Using fnCreate
		const fnCreate = sinon.stub();
		fnCreate.returns(Promise.resolve());
		oCancelablePromise = oPromiseCache.add("testFnCreate", fnCreate);
		assert.ok(fnCreate.calledOnce, "fnCreate was called");
		assert.ok(oCancelablePromise, "promise returned");
		// using native promise
		const oResolvedPromise = Promise.resolve("greatsuccess!");
		oCancelablePromise = oPromiseCache.add("test", oResolvedPromise);
		// resolving
		oCancelablePromise.then(function name(oValue) {
			assert.ok(oValue === "greatsuccess!", "promise properly resolved");
			// Removing
			oPromiseCache.remove("test");
			assert.ok(oPromiseCache._oCache["test"] === undefined, "promise properly removed from cache");
			done();
		});
	});
	QUnit.test("behaviour cancel / resolve", function (assert) {
		const done = assert.async();
		const oCancelablePromise = oPromiseCache.add("test");
		const fnResolveStub = sinon.stub();
		oCancelablePromise.then(fnResolveStub);
		oPromiseCache.cancel("test");
		oPromiseCache.resolve("test");
		setTimeout(function (){
			assert.notOk(fnResolveStub.called, "resolve handler was not called due to cancellation");
			done();
		}, 0);
	});
	QUnit.test("behaviour cancel / reject", function (assert) {
		const done = assert.async();
		const oCancelablePromise = oPromiseCache.add("test");
		const fnRejectStub = sinon.stub();
		oCancelablePromise.then(undefined, fnRejectStub);
		oPromiseCache.cancel("test");
		oPromiseCache.reject("test");
		setTimeout(function (){
			assert.notOk(fnRejectStub.called, "reject handler was not called due to cancellation");
			done();
		}, 0);
	});
	QUnit.test("retrieveMany", function(assert){
		const aKeys = ["A", "B", "C"];
		aKeys.forEach(function (sKey) {
			oPromiseCache.add(sKey);
		});
		// implicit retrieval
		let aPromises = oPromiseCache.retrieveMany();
		assert.ok(aPromises.length === 3, "3 Promises found");
		// explicit retrieval
		aPromises = oPromiseCache.retrieveMany("A", "B", "C");
		assert.ok(aPromises.length === 3, "3 Promises found");
	});
	QUnit.test("cleanup", function(assert){
		const aKeys = ["A", "B", "C"];
		aKeys.forEach(function (sKey) {
			oPromiseCache.add(sKey);
		});
		const fremove = sinon.spy(oPromiseCache, "remove");
		const fclear = sinon.spy(oPromiseCache, "clear");
		oPromiseCache.destroy();
		assert.ok(fclear.calledOnce, "clear was called");
		assert.ok(fremove.callCount === 3, "remove was called three times");
		assert.notOk(oPromiseCache._oCache, "Promise cache deleted");
		fclear.restore();
		fremove.restore();
		oPromiseCache = null;
	});
});
/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/util/PromiseCache"
], function(
	PromiseCache
) {
	"use strict";
	var oPromiseCache;
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
		var done = assert.async();
		// Adding
		var oCancelablePromise = oPromiseCache.add("test");
		var oCancelablePromiseConfig = oPromiseCache._oCache["test"];
		var fnResolveStub = sinon.stub();
		oCancelablePromise.then(fnResolveStub);
		assert.ok(oCancelablePromise, "promise returned");
		assert.ok(typeof oCancelablePromise.then === 'function' && typeof oCancelablePromise.catch === 'function', "is promise");
		assert.ok(oCancelablePromise === oPromiseCache._oCache["test"].promise, "promise properly stored in cache");
		// Replacing
		var oNewCancelablePromise = oPromiseCache.add("test");
		assert.ok(oNewCancelablePromise === oPromiseCache._oCache["test"].promise, "promise properly replaced in cache");
		// Retrieving
		var oRetrievedPromise = oPromiseCache.retrieve("test");
		// Canceling
		assert.ok(oCancelablePromiseConfig._isCanceled, "promise was canceled");
		assert.ok(oNewCancelablePromise === oRetrievedPromise, "correct promise was retrieved");
		// Using fnCreate
		var fnCreate = sinon.stub();
		fnCreate.returns(Promise.resolve());
		oCancelablePromise = oPromiseCache.add("testFnCreate", fnCreate);
		assert.ok(fnCreate.calledOnce, "fnCreate was called");
		assert.ok(oCancelablePromise, "promise returned");
		// using native promise
		var oResolvedPromise = Promise.resolve("greatsuccess!");
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
		var done = assert.async();
		var oCancelablePromise = oPromiseCache.add("test");
		var fnResolveStub = sinon.stub();
		oCancelablePromise.then(fnResolveStub);
		oPromiseCache.cancel("test");
		oPromiseCache.resolve("test");
		setTimeout(function (){
			assert.notOk(fnResolveStub.called, "resolve handler was not called due to cancellation");
			done();
		}, 0);
	});
	QUnit.test("behaviour cancel / reject", function (assert) {
		var done = assert.async();
		var oCancelablePromise = oPromiseCache.add("test");
		var fnRejectStub = sinon.stub();
		oCancelablePromise.then(undefined, fnRejectStub);
		oPromiseCache.cancel("test");
		oPromiseCache.reject("test");
		setTimeout(function (){
			assert.notOk(fnRejectStub.called, "reject handler was not called due to cancellation");
			done();
		}, 0);
	});
	QUnit.test("retrieveMany", function(assert){
		var aKeys = ["A", "B", "C"];
		aKeys.forEach(function (sKey) {
			oPromiseCache.add(sKey);
		});
		// implicit retrieval
		var aPromises = oPromiseCache.retrieveMany();
		assert.ok(aPromises.length === 3, "3 Promises found");
		// explicit retrieval
		aPromises = oPromiseCache.retrieveMany("A", "B", "C");
		assert.ok(aPromises.length === 3, "3 Promises found");
	});
	QUnit.test("cleanup", function(assert){
		var aKeys = ["A", "B", "C"];
		aKeys.forEach(function (sKey) {
			oPromiseCache.add(sKey);
		});
		var fremove = sinon.spy(oPromiseCache, "remove");
		var fclear = sinon.spy(oPromiseCache, "clear");
		oPromiseCache.destroy();
		assert.ok(fclear.calledOnce, "clear was called");
		assert.ok(fremove.callCount === 3, "remove was called three times");
		assert.notOk(oPromiseCache._oCache, "Promise cache deleted");
		fclear.restore();
		fremove.restore();
		oPromiseCache = null;
	});
});
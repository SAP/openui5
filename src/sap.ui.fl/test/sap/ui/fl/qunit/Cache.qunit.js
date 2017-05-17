/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.Cache");
jQuery.sap.require("sap.ui.fl.LrepConnector");

(function(QUnit, sinon, Cache, LrepConnector) {
	"use strict";
	sinon.config.useFakeTimers = false;

	function createLoadChangesResponse() {
		return Promise.resolve({
			changes: {
				changes: [{something: "1"}],
				settings: {switchedOnBusinessFunctions: ["bFunction1", "bFunction2"]}
			}
		});
	}

	function createLoadChangesErrorResponse() {
		return Promise.reject({
			error: 'error'
		});
	}

	QUnit.module("sap.ui.fl.Cache", {
		beforeEach: function() {
			Cache._entries = {};
			Cache._switches = {};
			Cache.setActive(true);
			this.oLrepConnector = LrepConnector.createConnector();
		},
		afterEach: function() {
			Cache._entries = {};
			Cache._switches = {};
		}
	});

	QUnit.test('getSwitches shall return the list of switched-on business functions', function(assert) {
		var that = this;
		var oChangesFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName).then(function(changes) {
			var mSwitches = Cache.getSwitches();
			var mSwitchesExp = {"bFunction1": true, "bFunction2": true};
			assert.deepEqual(mSwitchesExp, mSwitches);
		});
	});

	QUnit.test('isActive should ensure, that calls for same component are done only once', function(assert) {
		var that = this;
		var oChangesFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(function(secondChanges) {
			assert.strictEqual(oChangesFromFirstCall, secondChanges);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('if NOT isActive, all calls for same component have their own call', function(assert) {
		var that = this;
		var oChangesFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		Cache.setActive(false);

		return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(function(secondChanges) {
			assert.notStrictEqual(oChangesFromFirstCall, secondChanges);
			sinon.assert.calledTwice(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('if error occours, subsequent calls in their own execution path should get the chance to make a new request', function(assert) {
		var that = this;
		var oErrorFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesErrorResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName).then(null, function(firstError) {
			oErrorFromFirstCall = firstError;
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(null, function(secondError) {
			assert.notStrictEqual(oErrorFromFirstCall, secondError);
			sinon.assert.calledTwice(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('setActive should enable and disable the cache globally', function(assert) {
		assert.strictEqual(Cache.isActive(), true);
		Cache.setActive(false);
		assert.strictEqual(Cache.isActive(), false);
		Cache.setActive(true);
		assert.strictEqual(Cache.isActive(), true);
	});

	QUnit.test('addFile', function(assert) {
		var that = this;
		var sComponentName = "test";
		var oEntry = {
			changes: {
				changes: [
					{something: "1"}
				]
			}
		};
		var oAddedEntry = {something: "2"};
		var oChangesFromFirstCall;

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sComponentName).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			Cache.addChange(sComponentName, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(function(changes) {
			assert.strictEqual(oChangesFromFirstCall, changes);
			assert.strictEqual(changes.changes.changes.length, 2);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});

	});

	QUnit.test('updateFile', function(assert) {
		var that = this;
		var sComponentName = "test";
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};
		var oAddedEntry = {something: "2", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sComponentName).then(function() {
			Cache.updateChange(sComponentName, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 1);
			assert.strictEqual(changes.changes.changes[0].something, "2");
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('deleteChange', function(assert) {
		var that = this;
		var sComponentName = "test";
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};

		var oAddedEntry = {something: "1", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sComponentName).then(function() {
			Cache.deleteChange(sComponentName, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, sComponentName);
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 0);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});

	});

	QUnit.test("getChangesFillingCache returns an empty list of changes without sending an request " +
			"if the passed parameter contain already the information that there are no changes", function(assert) {
		var sComponentName = "smartFilterBar.Component";
		var mPropertyBag = {
			cacheKey: "<NO CHANGES>"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, sComponentName, mPropertyBag).then(function(oResult) {
			assert.ok(Array.isArray(oResult.changes.changes), "an array of changes was returned");
			assert.ok(Array.isArray(oResult.changes.contexts), "an array of contexts was returned");
			assert.equal(oResult.changes.changes.length, 0, "but no change is present");
			assert.equal(oResult.changes.contexts.length, 0, "but no context is present");
			assert.equal(oResult.componentClassName, sComponentName, "the component class name was returned correctly");
		});
	});

	QUnit.test('if cache key equals NO CHANGES, a cache entry is available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var mPropertyBag = {
			cacheKey: "<NO CHANGES>"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1"}
				]
			}
		};
		Cache._entries[sTestComponentName] = {
			promise: Promise.resolve(oEntry)
		};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sTestComponentName, mPropertyBag).then(function(oResult) {
			sinon.assert.notCalled(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oEntry, "then the available cache entry is returned");
		});
	});

	QUnit.test('if cache key equals NO CHANGES, no cache entry is available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var mPropertyBag = {
			cacheKey: "<NO CHANGES>"
		};
		var oEntry = {
			changes: {
				changes: []
			}
		};
		Cache._entries[sTestComponentName] = {
			promise: Promise.resolve(oEntry)
		};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sTestComponentName, mPropertyBag).then(function(oResult) {
			sinon.assert.notCalled(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oEntry, "then an empty array is returned");
		});
	});

	QUnit.test('if cache key not equals NO CHANGES, a cache entry is available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var mPropertyBag = {
			cacheKey: "TEST"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1"}
				]
			}
		};
		Cache._entries[sTestComponentName] = {
			promise: Promise.resolve(oEntry)
		};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, sTestComponentName, mPropertyBag).then(function(oResult) {
			sinon.assert.notCalled(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oEntry, "then the available cache entry is returned");
		});
	});

	QUnit.test('if cache key not equals NO CHANGES, a cache entry is not available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var mPropertyBag = {
			cacheKey: "TEST"
		};
		var oChange = {
			changes: {
				changes: [
					{something: "1"}
				]
			}
		};
		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oChange));

		return Cache.getChangesFillingCache(this.oLrepConnector, sTestComponentName, mPropertyBag).then(function(oResult) {
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oChange, "then a backend request load changes should be executed");
		});
	});
}(QUnit, sinon, sap.ui.fl.Cache, sap.ui.fl.LrepConnector));
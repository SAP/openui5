/*global QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.Cache");
jQuery.sap.require("sap.ui.fl.LrepConnector");
jQuery.sap.require("sap.ui.fl.Utils");

(function(QUnit, sinon, Cache, LrepConnector, Utils) {
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
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function() {
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

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
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

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(secondChanges) {
			assert.notStrictEqual(oChangesFromFirstCall, secondChanges);
			sinon.assert.calledTwice(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('getEntry shall create an empty entry if it is not initiated', function(assert) {
		var oInitEntry = {
			file: {
				changes: {
					changes: []
				}
			}
		};
		assert.deepEqual(Cache.getEntries(), {});
		var oEntry = Cache.getEntry("test", "1.2.3");
		assert.deepEqual(oEntry, oInitEntry);
		assert.deepEqual(Cache.getEntries(), {
			"test" : {
				"1.2.3": oInitEntry
			}
		});
	});

	QUnit.test('clearEntries replaces the whole cache content and clearEntry replace a single cache entry', function(assert) {
		var oEntry1 = {
			mockChanges1: {}
		};
		var oEntry2 = {
			mockChanges1: {}
		}
		Cache._entries = {
			"testComponent1": {
				"1.2.3": oEntry1
			},
			"testComponent2": {
				"1.2.3": oEntry2
			}
		};
		Cache.clearEntry("testComponent1", "1.2.3");
		assert.deepEqual(Cache.getEntry("testComponent1", "1.2.3"), {});
		Cache.clearEntries({})
		assert.deepEqual(Cache.getEntries(), {});
	});

	QUnit.test('if error occours, subsequent calls in their own execution path should get the chance to make a new request', function(assert) {
		var that = this;
		var oErrorFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesErrorResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(null, function(firstError) {
			oErrorFromFirstCall = firstError;
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
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

	QUnit.test('addChange', function(assert) {
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

		return Cache.getChangesFillingCache(this.oLrepConnector, {name: sComponentName}).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			Cache.addChange({name: sComponentName}, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(changes) {
			assert.strictEqual(oChangesFromFirstCall, changes);
			assert.strictEqual(changes.changes.changes.length, 2);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});

	});

	QUnit.test('addChange with a specific application version', function(assert) {
		var that = this;
		var oComponent = {
			name : "testComponent",
			appVersion : "1.2.3"
		};
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

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			Cache.addChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
		}).then(function(changes) {
			assert.strictEqual(oChangesFromFirstCall, changes);
			assert.strictEqual(changes.changes.changes.length, 2);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});

	});

	QUnit.test('updateChange', function(assert) {
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

		return Cache.getChangesFillingCache(this.oLrepConnector, {name: sComponentName}).then(function() {
			Cache.updateChange({name: sComponentName}, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 1);
			assert.strictEqual(changes.changes.changes[0].something, "2");
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('updateChange with a specific application version', function(assert) {
		var that = this;
		var oComponent = {
			name : "testComponent",
			appVersion : "1.2.3"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};
		var oAddedEntry = {something: "2", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function() {
			Cache.updateChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
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

		return Cache.getChangesFillingCache(this.oLrepConnector, {name: sComponentName}).then(function() {
			Cache.deleteChange({name: sComponentName}, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 0);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});

	});

	QUnit.test('deleteChange with a specific version', function(assert) {
		var that = this;
		var oComponent = {
			name : "testComponent",
			appVersion : "1.2.3"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};

		var oAddedEntry = {something: "1", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function() {
			Cache.deleteChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
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

		return Cache.getChangesFillingCache(this.oLrepConnector, {name: sComponentName}, mPropertyBag).then(function(oResult) {
			assert.ok(Array.isArray(oResult.changes.changes), "an array of changes was returned");
			assert.ok(Array.isArray(oResult.changes.contexts), "an array of contexts was returned");
			assert.equal(oResult.changes.changes.length, 0, "but no change is present");
			assert.equal(oResult.changes.contexts.length, 0, "but no context is present");
			assert.equal(oResult.componentClassName, sComponentName, "the component class name was returned correctly");
		});
	});

	QUnit.module("sap.ui.fl.Cache when cache of other application versions already exist", {
		beforeEach: function() {
			Cache._entries = {
				"testComponent" : {
					"DEFAULT_APP_VERSION" : {
						file : "defaultContent"
					},
					"oldVersion" : {
						file : "oldContent"
					}
				}
			};
			Cache._switches = {};
			Cache.setActive(true);
			this.oLrepConnector = LrepConnector.createConnector();
		}
	});

	QUnit.test('addChange with a new application version', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var oComponent = {
			name : sTestComponentName,
			appVersion : "newVersion"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1"}
				]
			}
		};
		var oDefaultEntry = Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION];
		var oOldEntry = Cache._entries[sTestComponentName]["oldVersion"];
		var oAddedEntry = {something: "2"};
		var oChangesFromFirstCall;

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			Cache.addChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
		}).then(function(changes) {
			assert.strictEqual(oChangesFromFirstCall, changes);
			assert.strictEqual(changes.changes.changes.length, 2);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
			assert.strictEqual(Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION], oDefaultEntry, "cache of default version was not changed");
			assert.strictEqual(Cache._entries[sTestComponentName]["oldVersion"], oOldEntry, "cache of old version was not changed");
		});
	});

	QUnit.test('updateChange with a specific application version', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var oComponent = {
			name : sTestComponentName,
			appVersion : "newVersion"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};
		var oDefaultEntry = Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION];
		var oOldEntry = Cache._entries[sTestComponentName]["oldVersion"];
		var oAddedEntry = {something: "2", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function() {
			Cache.updateChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 1);
			assert.strictEqual(changes.changes.changes[0].something, "2");
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
			assert.strictEqual(Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION], oDefaultEntry, "cache of default version was not changed");
			assert.strictEqual(Cache._entries[sTestComponentName]["oldVersion"], oOldEntry, "cache of old version was not changed");
		});
	});

	QUnit.test('deleteChange with a specific version', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var oComponent = {
			name : sTestComponentName,
			appVersion : "newVersion"
		};
		var oEntry = {
			changes: {
				changes: [
					{something: "1", fileName: "A"}
				]
			}
		};
		var oDefaultEntry = Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION];
		var oOldEntry = Cache._entries[sTestComponentName]["oldVersion"];
		var oAddedEntry = {something: "1", fileName: "A"};

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent).then(function() {
			Cache.deleteChange(oComponent, oAddedEntry);
		}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, oComponent);
		}).then(function(changes) {
			assert.strictEqual(changes.changes.changes.length, 0);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
			assert.strictEqual(Cache._entries[sTestComponentName][Utils.DEFAULT_APP_VERSION], oDefaultEntry, "cache of default version was not changed");
			assert.strictEqual(Cache._entries[sTestComponentName]["oldVersion"], oOldEntry, "cache of old version was not changed");
		});
	});
}(QUnit, sinon, sap.ui.fl.Cache, sap.ui.fl.LrepConnector, sap.ui.fl.Utils));
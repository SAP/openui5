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
			status: 'error'
		});
	}

	QUnit.module("sap.ui.fl.Cache", {
		beforeEach: function() {
			Cache._entries = {};
			Cache._switches = {};
			Cache.setActive(true);
			this.oLrepConnector = LrepConnector.createConnector();
			Cache._oFlexDataPromise = undefined;
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

	QUnit.test('isActive should ensure, that calls for same component are done only once and promise of last /flex/data call is cached', function(assert) {
		var that = this;
		var oChangesFromFirstCall;
		var sComponentName = "test";
		var oPromise1, oPromise2;

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			oPromise1 = Cache.getFlexDataPromise();
			assert.notEqual(oPromise1, undefined);
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(secondChanges) {
			oPromise2 = Cache.getFlexDataPromise();
			assert.strictEqual(oPromise1, oPromise2);
			assert.strictEqual(oChangesFromFirstCall, secondChanges);
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('if NOT isActive, all calls for same component have their own call and no promise of /flex/data call is cached', function(assert) {
		var that = this;
		var oChangesFromFirstCall;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesResponse);

		Cache.setActive(false);

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function(firstChanges) {
			oChangesFromFirstCall = firstChanges;
			assert.equal(Cache.getFlexDataPromise(), undefined);
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function(secondChanges) {
			assert.equal(Cache.getFlexDataPromise(), undefined);
			assert.notStrictEqual(oChangesFromFirstCall, secondChanges);
			sinon.assert.calledTwice(that.oLrepConnector.loadChanges);
		});
	});

	QUnit.test('getEntry shall create an empty entry if it is not initiated', function(assert) {
		var oInitEntry = {
			file: {
				changes: {
					changes: [],
					contexts: [],
					ui2personalization: {},
					variantSection: {}
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
		};
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
		Cache.clearEntries({});
		assert.deepEqual(Cache.getEntries(), {});
	});

	QUnit.test('deleteEntry deletes a single cache entry', function(assert) {
		var oEntry1 = {
			mockChanges1: {}
		};
		Cache._entries = {
			"testComponent1": {
				"1.2.3": oEntry1
			}
		};
		Cache._deleteEntry("testComponent1", "4.5.6");
		assert.deepEqual(Cache.getEntry("testComponent1", "1.2.3"), oEntry1);
		Cache._deleteEntry("testComponent1", "1.2.3");
		assert.equal(Cache._entries["testComponent1"], undefined);
	});

	QUnit.test('if error occurs, subsequent calls in their own execution path should not request the data anew', function(assert) {
		var that = this;
		var sComponentName = "test";

		sinon.stub(this.oLrepConnector, 'loadChanges', createLoadChangesErrorResponse);

		return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName}).then(function() {
			return Cache.getChangesFillingCache(that.oLrepConnector, {name: sComponentName});
		}).then(function() {
			assert.equal(1, that.oLrepConnector.loadChanges.callCount, "only one call was done to the backend");
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

	QUnit.module("getChangesFillingCache and level0-changes", {
		beforeEach: function() {
			this.oChangeFromBackend = {};
			this.sComponentName = "testComponent";
			this.oLrepConnector = LrepConnector.createConnector();
			this.mComponent = {
				name : this.sComponentName,
				appVersion : "1.2.3"
			};
		},

		afterEach: function () {
			Cache._entries = {};
		}
	});

	var fnStubDebug = function (bDebug) {
		var oCore = sap.ui.getCore();
		var oCoreConfiguration = oCore.getConfiguration();
		this.stub(oCoreConfiguration, "getDebug").returns(bDebug);
	};

	var fnStubBundle = function (bIsLoaded, aBundledChanges) {
		this.stub(jQuery.sap, "isResourceLoaded").returns(bIsLoaded);
		if (aBundledChanges) {
			return this.stub(jQuery.sap, "loadResource").returns(aBundledChanges);
		} else {
			// if no bundle is specified the default error is thrown
			return this.spy(jQuery.sap, "loadResource");
		}
	};

	var fnStubBackend = function (bSuccessful, aChanges) {
		var oResult;

		if (bSuccessful) {
			oResult = Promise.resolve({
				response: {
					changes: aChanges
				},
				componentClassName: this.sComponentName,
				etag: "abc1234"
			});
		} else {
			oResult = Promise.reject({
				status: "mocked that way!"
			});
		}

		return this.stub(this.oLrepConnector, "send").returns(oResult);
	};

	QUnit.test("can retrieve a preloaded changes-bundle in addition to the changes from the connector", function (assert) {
		var that = this;

		fnStubDebug.call(this, false); // debug is off
		var oChangeFromBundle = {};
		var oLoadResourceStub = fnStubBundle.call(this, true, [oChangeFromBundle]); // bundle is loaded and has a change
		fnStubBackend.call(this, true, [that.oChangeFromBackend]); // backend call is successful and returns a change

		var mPropertyBag = {
			appName: "sap.app.name"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, this.mComponent, mPropertyBag).then(function (oResponse) {
			var aLoadedChanges = oResponse.changes.changes;
			assert.equal(1, oLoadResourceStub.callCount, "the changes-bundle was requested");
			assert.equal(2, aLoadedChanges.length, "two changes are returned");
			assert.equal(oChangeFromBundle, aLoadedChanges[0], "the change form the changes-bundle is returned");
			assert.equal(that.oChangeFromBackend, aLoadedChanges[1], "the change form the back end is returned");
		});
	});

	QUnit.test("getChangesFillingCache does not send a request if the changes-bundle is not preloaded (on normal runtime = no debug)", function (assert) {
		var that = this;

		fnStubDebug.call(this, false); // debug is off
		var oLoadResourceStub = fnStubBundle.call(this, false); // bundle is neither loaded nor existing
		fnStubBackend.call(this, true, [that.oChangeFromBackend]); // backend call is successful and returns a change

		var mPropertyBag = {
			appName: "sap.app.name"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, this.mComponent, mPropertyBag).then(function (oResponse) {
			var aLoadedChanges = oResponse.changes.changes;
			assert.equal(0, oLoadResourceStub.callCount, "the changes-bundle was NOT requested");
			assert.equal(1, aLoadedChanges.length, "one change was returned");
			assert.equal(that.oChangeFromBackend, aLoadedChanges[0], "the change form the back end is returned");
		});
	});

	QUnit.test("getChangesFillingCache requests the changes-bundle if it is not preloaded in debug mode", function (assert) {
		var that = this;

		fnStubDebug.call(this, true); // debug is on
		var oChangeFromBundle = {};
		var oLoadResourceStub = fnStubBundle.call(this, true, [oChangeFromBundle]); // bundle is not loaded and has a change
		fnStubBackend.call(this, true, [that.oChangeFromBackend]); // backend call is successful and returns a change

		var mPropertyBag = {
			appName: "sap.app.name"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, this.mComponent, mPropertyBag).then(function (oResponse) {
			var aLoadedChanges = oResponse.changes.changes;
			assert.equal(1, oLoadResourceStub.callCount, "the changes-bundle was requested");
			assert.equal(2, aLoadedChanges.length, "two changes are returned");
			assert.equal(oChangeFromBundle, aLoadedChanges[0], "the change form the changes-bundle is returned first");
			assert.equal(that.oChangeFromBackend, aLoadedChanges[1], "the change form the back end is returned second");
		});
	});

	QUnit.test("getChangesFillingCache returns the changes from the changes bundle in case the no changes is flagged by the async hints", function (assert) {
		fnStubDebug.call(this, false); // debug is off
		var oChangeFromBundle = {};
		var oLoadResourceStub = fnStubBundle.call(this, true, [oChangeFromBundle]); // bundle is loaded and has a change
		var oBackendStub = fnStubBackend.call(this, false); // backend call will fail (but should not be done anyhow)

		var mPropertyBag = {
			appName: "sap.app.name",
			cacheKey: "<NO CHANGES>"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, this.mComponent, mPropertyBag).then(function (oResponse) {
			var aLoadedChanges = oResponse.changes.changes;
			assert.equal(oBackendStub.callCount, 0, "no call was done to the back end");
			assert.equal(1, oLoadResourceStub.callCount, "the changes-bundle was requested");
			assert.equal(1, aLoadedChanges.length, "one change are returned");
			assert.equal(oChangeFromBundle, aLoadedChanges[0], "the change form the changes-bundle is returned");
		});
	});

	QUnit.test("getChangesFillingCache in case the connector cannot return a valid response (service unavailable) the changes-bundle is still returned", function (assert) {
		fnStubDebug.call(this, false); // debug is off
		var oChangeFromBundle = {};
		var oLoadResourceStub = fnStubBundle.call(this, true, [oChangeFromBundle]); // bundle is loaded and has a change
		var oBackendStub = fnStubBackend.call(this, false); // backend call will fail

		var mPropertyBag = {
			appName: "sap.app.name",
			cacheKey: "abc123"
		};

		return Cache.getChangesFillingCache(this.oLrepConnector, this.mComponent, mPropertyBag).then(function (oResponse) {
			var aLoadedChanges = oResponse.changes.changes;
			assert.equal(1, oLoadResourceStub.callCount, "the changes-bundle was requested");
			assert.equal(1, aLoadedChanges.length, "one change are returned");
			assert.equal(oChangeFromBundle, aLoadedChanges[0], "the change form the changes-bundle is returned");
			assert.equal(oBackendStub.callCount, 1, "a backend call was done");
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

	QUnit.test('if cache key equals NO CHANGES, a cache entry is available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var sAppVersion = "oldVersion";
		var oComponent = {
			name : sTestComponentName,
			appVersion : sAppVersion
		};
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
		Cache._entries[sTestComponentName][sAppVersion].promise = Promise.resolve(oEntry);

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent, mPropertyBag).then(function(oResult) {
			sinon.assert.notCalled(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oEntry, "then the available cache entry is returned");
		});
	});

	QUnit.test('if cache key equals NO CHANGES, no cache entry is available and no change information is passed by cache key', function(assert) {
		var sTestComponentName = "testComponent";
		var sAppVersion = "oldVersion";
		var oComponent = {
			name : sTestComponentName,
			appVersion : sAppVersion
		};
		var mPropertyBag = {
			cacheKey: "<NO CHANGES>"
		};
		var oEntry = {
			changes: {
				changes : [],
				contexts : [],
				variantSection : {},
				ui2personalization : {}
			},
			componentClassName: sTestComponentName
		};
		var oAddedEntry = {something: "2"};
		var oStubLoadBundle = this.stub(Cache, '_getChangesFromBundle').returns(Promise.resolve([]));
		var oStubLoadChanges = this.stub(LrepConnector.prototype, 'loadChanges');

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent, mPropertyBag).then(function(oResult) {
			assert.ok(oStubLoadBundle, "then load changes from bundle");
			assert.ok(oStubLoadChanges.notCalled, "instead of back end request");
			assert.deepEqual(oResult, oEntry, "and return correct entry");
		}).then(Cache.getCacheKey.bind(Cache, oComponent)).then(function(oResult) {
			assert.ok(oStubLoadChanges.notCalled, "getCacheKey does not trigger back end request");
			assert.equal(oResult, Cache.NOTAG, "but no tag for cache key is return");
		}).then(Cache.addChange.bind(Cache, oComponent, oAddedEntry)).then(function() {
			var oCacheEntry = Cache.getEntry(oComponent.name, oComponent.appVersion);
			assert.deepEqual(oCacheEntry.file.changes.changes[0], oAddedEntry, "New dirty change is added into cache entry content");
			return oCacheEntry.promise.then(function(mChanges) {
				assert.deepEqual(mChanges.changes.changes[0], oAddedEntry, "New dirty change is added into cache entry promise");
			});
		});
	});

	QUnit.test('if cache key not equals NO CHANGES, a cache entry is available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var sAppVersion = "oldVersion";
		var oComponent = {
			name : sTestComponentName,
			appVersion : sAppVersion
		};
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
		Cache._entries[sTestComponentName][sAppVersion].promise = Promise.resolve(oEntry);

		sinon.stub(this.oLrepConnector, 'loadChanges').returns(Promise.resolve(oEntry));

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent, mPropertyBag).then(function(oResult) {
			sinon.assert.notCalled(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oEntry, "then the available cache entry is returned");
		});
	});

	QUnit.test('if cache key not equals NO CHANGES, a cache entry is not available and no change information is passed by cache key', function(assert) {
		var that = this;
		var sTestComponentName = "testComponent";
		var sAppVersion = "oldVersion";
		var oComponent = {
			name : sTestComponentName,
			appVersion : sAppVersion
		};
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

		return Cache.getChangesFillingCache(this.oLrepConnector, oComponent, mPropertyBag).then(function(oResult) {
			sinon.assert.calledOnce(that.oLrepConnector.loadChanges);
			assert.deepEqual(oResult, oChange, "then a backend request load changes should be executed");
		});
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

	QUnit.module("getPersonalization", {
		beforeEach: function() {
			this.oChangeFromBackend = {};
			this.sComponentName = "testComponent";
			this.sAppVersion = "1.2.3";
			this.sContainerKey = "someContainerKey";
			this.sItemName = "someItemName";
			this.oLrepConnector = LrepConnector.createConnector();
		},

		afterEach: function () {
			Cache._entries = {};
		}
	});

	QUnit.test("returns undefined if no personalization is stored for the app", function(assert) {
		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {

				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey, this.sItemName).then(
			function(oResponse) {
				assert.strictEqual(oResponse, undefined);
			}
		);
	});

	QUnit.test("returns undefined if no personalization under the component key is stored for the app", function(assert) {
		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someOtherContainerKey: {}
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey, this.sItemName).then(
			function(oResponse) {
				assert.strictEqual(oResponse, undefined);
			}
		);
	});

	QUnit.test("returns undefined if no personalization under the component key is stored for the app", function(assert) {
		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someOtherContainerKey: {}
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey, this.sItemName).then(
			function(oResponse) {
				assert.strictEqual(oResponse, undefined);
			}
		);
	});

	QUnit.test("returns undefined if no personalization under the item name is stored for the app", function(assert) {
		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someContainerKey: [
						{itemName: "someOtherItemName"}
					]
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey, this.sItemName).then(
			function(oResponse) {
				assert.strictEqual(oResponse, undefined);
			}
		);
	});

	QUnit.test("returns an empty list if no personalization is stored under the container key", function(assert) {

		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someOtherContainerKey: [{}, {}]
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey).then(
			function(oResponse) {
				assert.strictEqual(oResponse.length, 0);
			}
		);
	});

	QUnit.test("returns the searched personalization item under the container key and item name stored for the app", function(assert) {
		var sItemName = "itemName";
		var oExpectedItem = {itemName: sItemName};

		var aEntries = [{itemName: "someOtherItemName"}, oExpectedItem,{itemName: "someCompletlyDifferentItemName"}];

		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someContainerKey: aEntries
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey, sItemName).then(
			function(oResponse) {
				assert.strictEqual(oResponse, oExpectedItem);
			}
		);
	});

	QUnit.test("returns all personalization items under the container key stored for the app if no item key is provided", function(assert) {
		var aEntries = [{},{}];

		var oEntry = {
			changes: {
				changes: [
				],
				ui2personalization: {
					someContainerKey: aEntries
				}
			}
		};

		this.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
		this.stub(this.oLrepConnector, "loadChanges").returns(Promise.resolve(oEntry));

		return Cache.getPersonalization(this.sComponentName, this.sAppVersion, this.sContainerKey).then(
			function(oResponse) {
				assert.strictEqual(oResponse, aEntries);
			}
		);
	});

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.sComponentName = "testComponent";
			this.sAppVersion = "1.2.3";
			this.sAppVersion2 = "4.5.6";
			this.sContainerKey = "someContainerKey";
			this.sItemName = "someItemName";
			this.sToken = "someXcsrfToken";

			this.oEntry = Cache.getEntry(this.sComponentName, this.sAppVersion);
			this.oEntry2 = Cache.getEntry(this.sComponentName, this.sAppVersion2);

			this.server = sinon.fakeServer.create();
			this.server.respondWith("HEAD", "/sap/bc/lrep/actions/getcsrftoken/",
				[204, { "x-csrf-token": this.sToken}, ""]);
		},
		afterEach: function () {
			Cache._entries = {};
			this.server.restore();
		}
	});

	QUnit.test("complains about too few parameters (no object passed)", function(assert) {
		return new Promise(function(resolve, reject) {
			return Cache.setPersonalization().then(reject, function () {
				assert.ok(true, "a rejection took place");
				resolve();
			});
		});
	});

	QUnit.test("complains about too few parameters (no properties)", function(assert) {
		return new Promise(function(resolve, reject) {
			return Cache.setPersonalization({}).then(reject, function () {
				assert.ok(true, "a rejection took place");
				resolve();
			});
		});
	});

	QUnit.test("complains about too few parameters (no containerKey)", function(assert) {
		return new Promise(function(resolve, reject) {
			return Cache.setPersonalization({reference: "lala"}).then(reject, function () {
				assert.ok(true, "a rejection took place");
				resolve();
			});
		});
	});

	QUnit.test("complains about too few parameters (no ItemName)", function(assert) {
		return new Promise(function(resolve, reject) {
			return Cache.setPersonalization({reference: "lala", containerKey: "blub"}).then(reject, function () {
				assert.ok(true, "a rejection took place");
				resolve();
			});
		});
	});

	QUnit.test("complains about too few parameters", function(assert) {
		return new Promise(function(resolve, reject) {
			return Cache.setPersonalization({}).then(reject, function () {
				assert.ok(true, "a rejection took place");
				resolve();
			});
		});
	});

	QUnit.test("setPersonalization sends a write to the backend", function(assert) {
		var oPersItem = {
			reference: this.sComponentName,
			containerKey: this.sContainerKey,
			itemName: this.sItemName,
			content: {}
		};

		this.server.respondWith("PUT", "/sap/bc/lrep/ui2personalization/", [204, {}, ""]);
		this.server.autoRespond = true;

		return Cache.setPersonalization(oPersItem).then(
			function() {
				assert.equal(this.server.requests.length, 2, " two calls were sent to the backend");
				assert.equal(this.server.requests[0].method, "HEAD", "a token was requested");
				assert.equal(this.server.requests[1].requestBody, JSON.stringify(oPersItem), "the persItem was sent");
				assert.equal(this.oEntry.file.changes.ui2personalization[this.sContainerKey].length, 1, "an entry was written into the container");
				assert.equal(this.oEntry.file.changes.ui2personalization[this.sContainerKey][0], oPersItem, "the written item is in the container");
				assert.equal(this.oEntry2.file.changes.ui2personalization[this.sContainerKey].length, 1, "an entry was written into the second container");
				assert.equal(this.oEntry2.file.changes.ui2personalization[this.sContainerKey][0], oPersItem, "the written item is in the second container");
			}.bind(this)
		);
	});


	QUnit.test("setPersonalization rejects and does not update entries if the call failed", function(assert) {
		var oPersItem = {
			reference: this.sComponentName,
			containerKey: this.sContainerKey,
			itemName: this.sItemName,
			content: {}
		};

		this.server.respondWith("PUT", "/sap/bc/lrep/ui2personalization/", [500, {}, ""]);
		this.server.autoRespond = true;

		return new Promise(function (resolve, reject) {
			Cache.setPersonalization(oPersItem).then(reject,
				function() {
					assert.equal(this.server.requests.length, 2, " two calls were sent to the backend");
					assert.ok(!this.oEntry.file.changes.ui2personalization[this.sContainerKey], "no entry was written into the container");
					assert.ok(!this.oEntry2.file.changes.ui2personalization[this.sContainerKey], "no entry was written into the second container");
					resolve();
				}.bind(this)
			);
		}.bind(this));
	});

	QUnit.module("deletePersonalization", {
		beforeEach: function() {
			this.sComponentName = "testComponent";
			this.sAppVersion = "1.2.3";
			this.sAppVersion2 = "4.5.6";
			this.sContainerKey = "someContainerKey";
			this.sItemName1 = "someItemName";
			this.sItemName2 = "someOtherItemName";
			this.sToken = "someXcsrfToken";

			this.server = sinon.fakeServer.create();
			this.server.respondWith("GET", "/sap/bc/lrep/flex/data/",
				[400, {}, ""]); // generic issue to make an autofill
			this.server = sinon.fakeServer.create();
			this.server.respondWith("HEAD", "/sap/bc/lrep/actions/getcsrftoken/",
				[204, { "x-csrf-token": this.sToken}, ""]);
			this.sExpectedUrl = "/sap/bc/lrep/ui2personalization/?reference=" + this.sComponentName + "&containerkey=" + this.sContainerKey + "&itemname=" + this.sItemName1;
			this.server.respondWith("DELETE", this.sExpectedUrl,
				[204, {}, ""]);
			this.server.autoRespond = true;
		},
		afterEach: function () {
			Cache._entries = {};
			this.server.restore();
		}
	});

	QUnit.test("deletePersonalization resolves if a personalization is successful deleted and the entry is gone from the session in all entries", function(assert) {
		var aGetPromises = [];

		this.oEntry = undefined;
		var oPromise1 = Cache.getChangesFillingCache(new LrepConnector(), {name: this.sComponentName, appVersion: this.sAppVersion});
		aGetPromises.push(oPromise1);
		this.oEntry2 = undefined;
		var oPromise2 = Cache.getChangesFillingCache(new LrepConnector(), {name: this.sComponentName, appVersion: this.sAppVersion2});
		aGetPromises.push(oPromise2);

		this.oItem1 = {
			reference : this.sComponentName,
			containerKey : this.sContainerKey,
			itemName : this.sItemName1
		};
		this.oItem2 = {
			reference : this.sComponentName,
			containerKey : this.sContainerKey,
			itemName : this.sItemName2
		};

		return Promise.all(aGetPromises).then( function (aParams) {
			this.oEntry = aParams[0];
			this.oEntry2 = aParams[1];
		}.bind(this))
			.then(Cache._addPersonalizationToEntries.bind(Cache, this.oItem1))
			.then(Cache._addPersonalizationToEntries.bind(Cache, this.oItem2))
			.then(Cache.deletePersonalization.bind(Cache, this.sComponentName, this.sContainerKey, this.sItemName1))
			.then( function () {
				assert.equal(this.server.requests.length, 4, " four calls were sent to the backend (two setup, 1 token, 1 delete)");
				assert.equal(this.server.requests[2].method, "HEAD", "a token was requested");
				assert.equal(this.server.requests[3].method, "DELETE", "a delete was requested");
				assert.equal(this.server.requests[3].url, this.sExpectedUrl, "the delete was sent to the correct url");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey].length, 1, "one entry is in first the container");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey][0], this.oItem2, "the 'other' item is still in the container");
				assert.equal(this.oEntry2.changes.ui2personalization[this.sContainerKey].length, 1, "one entry is in the second container");
				assert.equal(this.oEntry2.changes.ui2personalization[this.sContainerKey][0], this.oItem2, "the 'other' item is still in the container");
			}.bind(this)
		);
	});

}(QUnit, sinon, sap.ui.fl.Cache, sap.ui.fl.LrepConnector, sap.ui.fl.Utils));
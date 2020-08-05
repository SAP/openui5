/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/Cache",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
], function(
	Cache,
	FlexState,
	sinon,
	jQuery,
	Log
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sComponentName = "testComponent";

	function _createEntryMap(mChangesObject) {
		return {
			changes: {
				changes: [mChangesObject],
				variantSection: {},
				ui2personalization: {}
			}
		};
	}

	QUnit.module("add / update / delete change", {
		beforeEach: function() {
			this.oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves(this.oEntry);
			this.oGetFlexObjectsStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oEntry.changes);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addChange", function(assert) {
			var oAddedEntry = {something: "2"};
			var oChangesFromFirstCall;

			return Cache.getChangesFillingCache({name: sComponentName}).then(function(oFirstChanges) {
				oChangesFromFirstCall = oFirstChanges;
				Cache.addChange({name: sComponentName}, oAddedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(oSecondChanges) {
				assert.strictEqual(oChangesFromFirstCall, oSecondChanges);
				assert.equal(oSecondChanges.changes.changes.length, 2);
			});
		});

		QUnit.test("updateChange", function(assert) {
			var oEntry = _createEntryMap({something: "1", fileName: "A"});
			var oUpdatedEntry = {something: "2", fileName: "A"};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function(oFirstChanges) {
				assert.strictEqual(oFirstChanges.changes.changes.length, 1);
				assert.strictEqual(oFirstChanges.changes.changes[0].something, "1");

				Cache.updateChange({name: sComponentName}, oUpdatedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(oSecondChanges) {
				assert.strictEqual(oSecondChanges.changes.changes.length, 1);
				assert.strictEqual(oSecondChanges.changes.changes[0].something, "2");
			});
		});

		QUnit.test("deleteChange", function(assert) {
			var oEntry = _createEntryMap({something: "1", fileName: "A"});
			var oAddedEntry = {something: "1", fileName: "A"};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function(oFirstChanges) {
				assert.strictEqual(oFirstChanges.changes.changes.length, 1);

				Cache.deleteChange({name: sComponentName}, oAddedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(changes) {
				assert.strictEqual(changes.changes.changes.length, 0);
			});
		});
	});

	QUnit.module("getCacheKey", {
		beforeEach: function() {
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves(this.oEntry);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getCacheKey with invalid mComponent is called", function(assert) {
			var mComponentMock = {};
			var oAppComponentMock = {
				getComponentData: function() {
					return {
						technicalParameters: {}
					};
				}
			};
			var oLogWarningSpy = sandbox.spy(Log, "warning");
			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cachekey is returned");
				assert.equal(sCacheKey, Cache.NOTAG, "then cachekey returns <NoTag>");
				assert.ok(oLogWarningSpy.calledOnce, "then warning message called once");
			})
			.catch(function(oErr) {
				assert.notOk(true, "getCacheKey shouldn't reject execution: " + oErr);
			});
		});

		QUnit.test("getCacheKey with invalid appComponent is called", function(assert) {
			var mComponentMock = {
				name : sComponentName,
				appVersion : "testApplicationVersion"
			};
			var oLogWarningSpy = sandbox.spy(Log, "warning");
			return Cache.getCacheKey(mComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cacheKey is returned");
				assert.equal(sCacheKey, Cache.NOTAG, "then cacheKey returns <NoTag>");
				assert.ok(oLogWarningSpy.calledOnce, "then warning message called once");
			})
			.catch(function(oErr) {
				assert.notOk(true, "getCacheKey shouldn't reject execution: " + oErr);
			});
		});

		QUnit.test("getCacheKey is called and cache entry and current variant ids are available", function(assert) {
			var sControlVariantId1 = "id_1541412437845_176_Copy";
			var sControlVariantId2 = "id_1541412437845_186_Copy";
			var sCacheKeyResult = "<NoTag-" + sControlVariantId1 + "-" + sControlVariantId2 + ">";
			var mComponentMock = {
				name : sComponentName
			};
			var oAppComponentMock = {
				getModel: function() {
					return {
						getCurrentControlVariantIds: function() {
							return [sControlVariantId1, sControlVariantId2];
						}
					};
				}
			};
			var oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub.resolves(oEntry);

			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cachekey is returned");
				assert.equal(sCacheKey, sCacheKeyResult, "then cachekey is extended by control variant id");
			});
		});

		QUnit.test("getCacheKey is called and cache entry, etag, and current variant management-id are available", function(assert) {
			// etag is returned from backend with double quotes and possibly also with W/ value at the begining
			// returned cacheKey shouldn't contain this chars 'W/"abc123"' --> 'abc123'
			var sEtag = 'W/"abc123"';
			var sControlVariantId = "id_1541412437845_176_Copy";
			var sCacheKeyResult = 'abc123'.concat('-', sControlVariantId);
			var mComponentMock = {
				name : "testComponent",
				appVersion : "oldVersion"
			};
			var oAppComponentMock = {
				getModel: function() {
					return {
						getCurrentControlVariantIds: function() {
							return [sControlVariantId];
						}
					};
				}
			};
			var oWrappedChangeFileContentMock = { cacheKey: sEtag };
			this.oGetStorageResponseStub.resolves(oWrappedChangeFileContentMock);

			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cachekey is returned");
				assert.equal(sCacheKey, sCacheKeyResult, "then cachekey is trimmed and extended by control variant id");
			});
		});
	});

	QUnit.module("getChangesFillingCache", {
		beforeEach: function() {
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves("response");
			this.oClearAndInitStub = sandbox.stub(FlexState, "clearAndInitialize").resolves();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getChangesFillingCache should call the FlexState and return the StorageResponse", function(assert) {
			return Cache.getChangesFillingCache({name: "name"}, {}, false).then(function(oResponse) {
				assert.equal(oResponse, "response", "the function returns the value of the function");
				assert.equal(this.oClearAndInitStub.callCount, 0, "the function was not called");
				assert.equal(this.oGetStorageResponseStub.callCount, 1, "the function was called once");
				assert.equal(this.oGetStorageResponseStub.lastCall.args[0], "name", "the function was called with the correct parameter");
			}.bind(this));
		});

		QUnit.test("getChangesFillingCache with invalidate should re-initialize the FlexState and return the StorageResponse", function(assert) {
			var oPropertyBag = {
				property: "value",
				property2: "value"
			};
			return Cache.getChangesFillingCache({name: "name"}, oPropertyBag, true).then(function(oResponse) {
				assert.equal(oResponse, "response", "the function returns the value of the function");
				assert.equal(this.oGetStorageResponseStub.callCount, 1, "the function was called once");
				assert.equal(this.oClearAndInitStub.callCount, 1, "the function was called once");
				assert.equal(this.oClearAndInitStub.lastCall.args[0], oPropertyBag, "the function was called with the correct parameter");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery('#qunit-fixture').hide();
	});
});
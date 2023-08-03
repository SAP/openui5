/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	UIComponent,
	FlexState,
	ControlVariantApplyAPI,
	StorageUtils,
	Cache,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sComponentName = "testComponent";

	function createEntryMap(mChangesObject, mVariantObject, mVariantChangeObject) {
		return {
			changes: Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				changes: [mChangesObject],
				comp: {
					changes: mVariantChangeObject ? [mVariantChangeObject] : [],
					variants: mVariantObject ? [mVariantObject] : [],
					standardVariant: [],
					defaultVariant: []
				}
			}),
			cacheKey: "foo"
		};
	}

	QUnit.module("getCacheKey", {
		beforeEach: function() {
			this.oEntry = createEntryMap({something: "1"});
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
				name: sComponentName
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

		QUnit.test("getCacheKey with no backend response", async function(assert) {
			this.oGetStorageResponseStub.resolves(undefined);

			const sCacheKey = await Cache.getCacheKey({name: "foobar"}, "appComponent");
			assert.strictEqual(sCacheKey, Cache.NOTAG, "then cacheKey returns <NoTag>");
		});

		QUnit.test("getCacheKey is called and cache entry, etag, and current variant management-id are available", function(assert) {
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			// etag is returned from backend with double quotes and possibly also with W/ value at the beginning
			// returned cacheKey shouldn't contain this chars 'W/"abc123"' --> 'abc123'
			var sEtag = 'W/"abc123"';
			var sControlVariantId = "id_1541412437845_176_Copy";
			var sCacheKeyResult = "abc123".concat("-", sControlVariantId);
			var mComponentMock = {
				name: "testComponent"
			};
			var oAppComponentMock = {
				getModel: function() {
					return {
						getCurrentControlVariantIds: function() {
							return [sControlVariantId];
						},
						getVariantManagementControlIds: function() {
							return [];
						}
					};
				}
			};
			this.oEntry.cacheKey = sEtag;

			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.equal(sCacheKey, sCacheKeyResult, "then cache key is trimmed and extended by control variant id");
			});
		});

		QUnit.test("getCacheKey is called and cache entry and standard + custom variant ids are available", function(assert) {
			sandbox.stub(Utils, "isEmbeddedComponent").returns(true);
			var sControlVariantId1 = "myStandardVariant";
			var sControlVariantId2 = "myCustomVariant";
			var sCacheKeyResult = "foo-" + sControlVariantId2;
			var mComponentMock = {
				name: sComponentName
			};
			var oAppComponentMock = {
				getModel: function() {
					return {
						getCurrentControlVariantIds: function() {
							return [sControlVariantId1, sControlVariantId2];
						},
						getVariantManagementControlIds: function() {
							return [sControlVariantId1, "myStandardVariant2"]; // Standard variant has same name as vm control
						}
					};
				}
			};

			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cachekey is returned for embedded components");
				assert.strictEqual(sCacheKey, sCacheKeyResult, "then the standard variants are filtered from the cache key");
			});
		});

		QUnit.test("when getCacheKey is called and the VariantModel is not yet available", function(assert) {
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			var sControlVariantId = "someControlVariantId";
			var oAppComponent = new UIComponent("appComponent");
			// Stub the model getter to delay setting the VariantModel until after it was requested for the first time
			// simulating that it is initialized after the Cache tries to access it
			var oGetVariantModelPromise = new Promise(function(resolve) {
				sandbox.stub(oAppComponent, "getModel")
				.onFirstCall()
				.callsFake(function() {
					resolve();
					return undefined;
				})
				.callThrough();
			});

			var oGetCacheKeyPromise = Cache.getCacheKey({ name: sComponentName }, oAppComponent);
			return oGetVariantModelPromise
			.then(function() {
				oAppComponent.setModel(
					{
						getCurrentControlVariantIds: function() {
							return [sControlVariantId];
						},
						getVariantManagementControlIds: function() {
							return [];
						}
					},
					ControlVariantApplyAPI.getVariantModelName()
				);
				return oGetCacheKeyPromise;
			})
			.then(function(sCacheKey) {
				assert.strictEqual(
					sCacheKey,
					"foo-" + sControlVariantId,
					"then the control variant ids are appended to the cache key"
				);
			});
		});

		QUnit.test("when getCacheKey is called and the component is neither an application nor embedded component", function(assert) {
			sandbox.stub(Utils, "isApplicationComponent").returns(false);
			sandbox.stub(Utils, "isEmbeddedComponent").returns(false);
			var oVariantModelSpy = sandbox.spy(ControlVariantApplyAPI, "getVariantModel");

			var mComponentMock = {
				name: sComponentName
			};

			return Cache.getCacheKey(mComponentMock)
			.then(function(sCacheKey) {
				// Component will not receive a variant model, cache must not wait for it
				assert.ok(oVariantModelSpy.notCalled, "then the variant model is not retrieved");
				assert.equal(sCacheKey, Cache.NOTAG, "then cachekey is returned without variant ids");
			});
		});
	});

	QUnit.module("getChangesFillingCache", {
		beforeEach: function() {
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves("response");
			this.oUpdateStub = sandbox.stub(FlexState, "update").resolves();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getChangesFillingCache should call the FlexState and return the StorageResponse", function(assert) {
			return Cache.getChangesFillingCache({name: "name"}, {}, false).then(function(oResponse) {
				assert.equal(oResponse, "response", "the function returns the value of the function");
				assert.equal(this.oUpdateStub.callCount, 0, "the function was not called");
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
				assert.equal(this.oUpdateStub.callCount, 1, "the function was called once");
				assert.equal(this.oUpdateStub.lastCall.args[0], oPropertyBag, "the function was called with the correct parameter");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
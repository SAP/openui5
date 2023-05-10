/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Cache",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/Log"
], function(
	UIComponent,
	Cache,
	FlexState,
	StorageUtils,
	ControlVariantApplyAPI,
	Utils,
	sinon,
	Log
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sComponentName = "testComponent";

	function _createEntryMap(mChangesObject, mVariantObject, mVariantChangeObject) {
		return {
			changes: Object.assign(StorageUtils.getEmptyFlexDataResponse(), {
				changes: [mChangesObject],
				comp: {
					changes: mVariantChangeObject ? [mVariantChangeObject] : [],
					variants: mVariantObject ? [mVariantObject] : [],
					standardVariant: [],
					defaultVariant: []
				}
			})
		};
	}

	QUnit.module("add / update / delete change / remove changes", {
		beforeEach: function() {
			this.oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves(this.oEntry);
			this.oGetFlexObjectsStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oEntry.changes);
			this.oCheckUpdateStub = sandbox.stub();
			sandbox.stub(FlexState, "getFlexObjectsDataSelector").returns({
				checkUpdate: this.oCheckUpdateStub
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addChange", function(assert) {
			var oAddedEntry = {
				something: "3",
				content: {},
				selector: {},
				fileType: "change"
			};
			var oChangesFromFirstCall;

			return Cache.getChangesFillingCache({name: sComponentName}).then(function(oFirstChanges) {
				oChangesFromFirstCall = oFirstChanges;
				Cache.addChange({name: sComponentName}, oAddedEntry);
				assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the selector was updated");
				return Cache.getChangesFillingCache({name: sComponentName});
			}.bind(this)).then(function(oSecondChanges) {
				assert.strictEqual(oChangesFromFirstCall, oSecondChanges);
				assert.equal(oSecondChanges.changes.changes.length, 2);
			});
		});

		QUnit.test("updateChange", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {}
			});
			var oUpdatedEntry = {
				something: "3",
				fileName: "A",
				content: {},
				selector: {},
				fileType: "change"
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.updateChange({name: sComponentName}, oUpdatedEntry);
				assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the selector was updated");
				return Cache.getChangesFillingCache({name: sComponentName});
			}.bind(this)).then(function(mFlexData) {
				assert.equal(mFlexData.changes.changes.length, 1);
				assert.equal(mFlexData.changes.changes[0].something, "3");
			});
		});

		QUnit.test("deleteChange", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {}
			});
			var oDeleteEntry = {
				something: "3",
				fileName: "A",
				content: {},
				selector: {},
				fileType: "change"
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.deleteChange({name: sComponentName}, oDeleteEntry);
				assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the selector was updated");
				return Cache.getChangesFillingCache({name: sComponentName});
			}.bind(this)).then(function(mFlexData) {
				assert.strictEqual(mFlexData.changes.changes.length, 0);
			});
		});

		QUnit.test("remove all addChange changes", function(assert) {
			var oEntry = _createEntryMap([{
				something: "1",
				fileName: "addChange",
				content: {},
				selector: {}
			}, {
				something: "2",
				fileName: "moveChange",
				content: {},
				selector: {},
				fileType: "change"
			}]);

			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			Cache.removeChanges({name: sComponentName}, ["addChange"]);

			assert.strictEqual(oEntry.changes.changes.length, 1);
			assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the selector was updated");
		});

		QUnit.test("remove all moveChange types from the Cache", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "moveChange",
				content: {},
				selector: {},
				fileType: "change"
			});
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			Cache.removeChanges({name: sComponentName}, ["moveChange"]);

			assert.strictEqual(oEntry.changes.changes.length, 0);
			assert.strictEqual(this.oCheckUpdateStub.callCount, 1, "the selector was updated");
		});

		QUnit.test("removeChanges correctly aborts when storage response is undefined", function(assert) {
			this.oGetFlexObjectsStub.returns(undefined);

			Cache.removeChanges({name: sComponentName}, ["moveChange"]);
			assert.strictEqual(this.oCheckUpdateStub.callCount, 0, "the selector was not updated");
		});

		QUnit.test("addChange of an comp variant related change", function(assert) {
			var oAddedEntry = {
				something: "3",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			};

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.addChange({name: sComponentName}, oAddedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(oSecondChanges) {
				assert.equal(oSecondChanges.changes.comp.changes.length, 1);
			});
		});

		QUnit.test("updateChange of an comp variant related change", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {},
				fileType: "change"
			}, {
				fileName: "V",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			}, {
				something: "2",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			});
			var oUpdatedEntry = {
				something: "3",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.updateChange({name: sComponentName}, oUpdatedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(mFlexData) {
				assert.equal(mFlexData.changes.comp.changes.length, 1);
				assert.equal(mFlexData.changes.comp.changes[0].something, "3");
			});
		});

		QUnit.test("deleteChange of an comp variant related change", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {},
				fileType: "change"
			}, {
				fileName: "V",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			}, {
				something: "2",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			});
			var oDeleteEntry = {
				something: "3",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				},
				fileType: "change"
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.deleteChange({name: sComponentName}, oDeleteEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(mFlexData) {
				assert.strictEqual(mFlexData.changes.comp.changes.length, 0);
			});
		});

		QUnit.test("addChange with various different kinds of changes", function(assert) {
			Cache.addChange({name: sComponentName}, {
				fileType: "ctrl_variant"
			});
			Cache.addChange({name: sComponentName}, {
				fileType: "ctrl_variant_change"
			});
			Cache.addChange({name: sComponentName}, {
				fileType: "ctrl_variant_management_change"
			});
			Cache.addChange({name: sComponentName}, {
				fileType: "change",
				variantReference: "foo"
			});

			return Cache.getChangesFillingCache({name: sComponentName}).then(function(mFlexData) {
				assert.strictEqual(mFlexData.changes.changes.length, 1, "only the initial change is present");
				assert.strictEqual(mFlexData.changes.variantDependentControlChanges.length, 1, "a variant related UI change was added");
				assert.strictEqual(mFlexData.changes.variants.length, 1, "a variant was added");
				assert.strictEqual(mFlexData.changes.variantChanges.length, 1, "a variantChange was added");
				assert.strictEqual(mFlexData.changes.variantManagementChanges.length, 1, "a variant management change was added");
			});
		});

		QUnit.test("addChange of an comp variant", function(assert) {
			var oAddedEntry = {
				something: "3",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			};

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.addChange({name: sComponentName}, oAddedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(oSecondChanges) {
				assert.equal(oSecondChanges.changes.comp.variants.length, 1);
			});
		});

		QUnit.test("updateChange of an comp variant", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {}
			}, {
				fileName: "V",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			}, {
				something: "2",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			});
			var oUpdatedEntry = {
				something: "3",
				fileName: "V",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.updateChange({name: sComponentName}, oUpdatedEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(mFlexData) {
				assert.equal(mFlexData.changes.comp.variants.length, 1);
				assert.equal(mFlexData.changes.comp.variants[0].something, "3");
			});
		});

		QUnit.test("deleteChange of an comp variant", function(assert) {
			var oEntry = _createEntryMap({
				something: "1",
				fileName: "A",
				content: {},
				selector: {}
			}, {
				fileName: "V",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			}, {
				something: "2",
				fileName: "B",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			});
			var oDeleteEntry = {
				something: "3",
				fileName: "V",
				fileType: "variant",
				content: {},
				selector: {
					persistencyKey: "something"
				}
			};
			this.oGetStorageResponseStub.resolves(oEntry);
			this.oGetFlexObjectsStub.returns(oEntry.changes);

			return Cache.getChangesFillingCache({name: sComponentName}).then(function() {
				Cache.deleteChange({name: sComponentName}, oDeleteEntry);
				return Cache.getChangesFillingCache({name: sComponentName});
			}).then(function(mFlexData) {
				assert.strictEqual(mFlexData.changes.comp.variants.length, 0);
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

		QUnit.test("getCacheKey is called and cache entry and current variant ids are available", function(assert) {
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			var sControlVariantId1 = "id_1541412437845_176_Copy";
			var sControlVariantId2 = "id_1541412437845_186_Copy";
			var sCacheKeyResult = "<NoTag-" + sControlVariantId1 + "-" + sControlVariantId2 + ">";
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
							return [];
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
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			// etag is returned from backend with double quotes and possibly also with W/ value at the begining
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
			var oWrappedChangeFileContentMock = { cacheKey: sEtag };
			this.oGetStorageResponseStub.resolves(oWrappedChangeFileContentMock);

			return Cache.getCacheKey(mComponentMock, oAppComponentMock)
			.then(function(sCacheKey) {
				assert.ok(sCacheKey, "then cachekey is returned");
				assert.equal(sCacheKey, sCacheKeyResult, "then cachekey is trimmed and extended by control variant id");
			});
		});

		QUnit.test("getCacheKey is called and cache entry and standard + custom variant ids are available", function(assert) {
			sandbox.stub(Utils, "isEmbeddedComponent").returns(true);
			var sControlVariantId1 = "myStandardVariant";
			var sControlVariantId2 = "myCustomVariant";
			var sCacheKeyResult = "<NoTag-" + sControlVariantId2 + ">";
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
			var oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub.resolves(oEntry);

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

			var oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub.resolves(oEntry);

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
					"<NoTag-" + sControlVariantId + ">",
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
			var oEntry = _createEntryMap({something: "1"});
			this.oGetStorageResponseStub.resolves(oEntry);

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
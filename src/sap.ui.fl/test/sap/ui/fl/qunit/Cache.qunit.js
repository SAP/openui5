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

	QUnit.module("setVariantManagementSection", {
		beforeEach: function() {
			this.oEntry = _createEntryMap();
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves(this.oEntry);
			this.oGetFlexObjectsStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oEntry.changes);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when setVariantManagementSection is called with a variant controller file content", function(assert) {
			var oVariantSectionContent = {
				variantManagement: {
					variants: ["variant1"]
				}
			};

			Cache.setVariantManagementSection({name: sComponentName}, oVariantSectionContent);
			assert.deepEqual(this.oEntry.changes.variantSection, oVariantSectionContent, "then the passed variant controller file content was set in the cache entry");
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

	QUnit.module("getPersonalization", {
		beforeEach: function() {
			this.oChangeFromBackend = {};
			this.sContainerKey = "someContainerKey";
			this.sItemName = "someItemName";
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("returns undefined if no personalization is stored for the app", function(assert) {
			var oEntry = {
				changes: {
					changes: [
					],
					ui2personalization: {

					}
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey, this.sItemName).then(
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

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey, this.sItemName).then(
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

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey, this.sItemName).then(
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

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey, this.sItemName).then(
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

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey).then(function(oResponse) {
				assert.strictEqual(oResponse.length, 0);
			});
		});

		QUnit.test("returns the searched personalization item under the container key and item name stored for the app", function(assert) {
			var sItemName = "itemName";
			var oExpectedItem = {itemName: sItemName};

			var aEntries = [{itemName: "someOtherItemName"}, oExpectedItem, {itemName: "someCompletlyDifferentItemName"}];

			var oEntry = {
				changes: {
					changes: [
					],
					ui2personalization: {
						someContainerKey: aEntries
					}
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey, sItemName).then(
				function(oResponse) {
					assert.deepEqual(oResponse, oExpectedItem);
				}
			);
		});

		QUnit.test("returns all personalization items under the container key stored for the app if no item key is provided", function(assert) {
			var aEntries = [{}, {}];

			var oEntry = {
				changes: {
					changes: [
					],
					ui2personalization: {
						someContainerKey: aEntries
					}
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").resolves(oEntry);

			return Cache.getPersonalization(sComponentName, this.sContainerKey).then(
				function(oResponse) {
					assert.deepEqual(oResponse, aEntries);
				}
			);
		});
	});

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.sContainerKey = "someContainerKey";
			this.sItemName = "someItemName";
			this.sToken = "someXcsrfToken";

			this.oEntry = _createEntryMap({});
			this.oGetFlexObjectsStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oEntry.changes);

			this.server = sinon.fakeServer.create();
			this.server.respondWith("HEAD", "/sap/bc/lrep/actions/getcsrftoken/",
				[204, { "x-csrf-token": this.sToken}, ""]);
		},
		afterEach: function() {
			this.server.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("complains about too few parameters (no object passed)", function(assert) {
			return Cache.setPersonalization().catch(function(oError) {
				assert.equal(oError, "not all mandatory properties were provided for the storage of the personalization", "a rejection took place");
			});
		});

		QUnit.test("complains about too few parameters (no properties)", function(assert) {
			return Cache.setPersonalization({}).catch(function(oError) {
				assert.equal(oError, "not all mandatory properties were provided for the storage of the personalization", "a rejection took place");
			});
		});

		QUnit.test("complains about too few parameters (no containerKey)", function(assert) {
			return Cache.setPersonalization({reference: "lala"}).catch(function(oError) {
				assert.equal(oError, "not all mandatory properties were provided for the storage of the personalization", "a rejection took place");
			});
		});

		QUnit.test("complains about too few parameters (no ItemName)", function(assert) {
			return Cache.setPersonalization({reference: "lala", containerKey: "blub"}).catch(function(oError) {
				assert.equal(oError, "not all mandatory properties were provided for the storage of the personalization", "a rejection took place");
			});
		});

		QUnit.test("complains about too few parameters", function(assert) {
			return Cache.setPersonalization({}).catch(function(oError) {
				assert.equal(oError, "not all mandatory properties were provided for the storage of the personalization", "a rejection took place");
			});
		});

		QUnit.test("setPersonalization sends a write to the backend", function(assert) {
			var oPersItem = {
				reference: sComponentName,
				containerKey: this.sContainerKey,
				itemName: this.sItemName,
				content: {}
			};

			this.server.respondWith("PUT", "/sap/bc/lrep/ui2personalization/", [204, {}, ""]);
			this.server.autoRespond = true;

			return Cache.setPersonalization(oPersItem).then(function() {
				assert.equal(this.server.requests.length, 2, " two calls were sent to the backend");
				assert.equal(this.server.requests[0].method, "HEAD", "a token was requested");
				assert.equal(this.server.requests[1].requestBody, JSON.stringify(oPersItem), "the persItem was sent");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey].length, 1, "an entry was written into the container");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey][0], oPersItem, "the written item is in the container");
			}.bind(this));
		});

		QUnit.test("setPersonalization rejects and does not update entries if the call failed", function(assert) {
			var oPersItem = {
				reference: sComponentName,
				containerKey: this.sContainerKey,
				itemName: this.sItemName,
				content: {}
			};

			this.server.respondWith("PUT", "/sap/bc/lrep/ui2personalization/", [500, {}, ""]);
			this.server.autoRespond = true;

			return Cache.setPersonalization(oPersItem).catch(function() {
				assert.equal(this.server.requests.length, 2, " two calls were sent to the backend");
				assert.ok(!this.oEntry.changes.ui2personalization[this.sContainerKey], "no entry was written into the container");
			}.bind(this));
		});
	});

	QUnit.module("deletePersonalization", {
		beforeEach: function() {
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
			this.sExpectedUrl = "/sap/bc/lrep/ui2personalization/?reference=" + sComponentName + "&containerkey=" + this.sContainerKey + "&itemname=" + this.sItemName1;
			this.server.respondWith("DELETE", this.sExpectedUrl,
				[204, {}, ""]);
			this.server.autoRespond = true;

			this.oEntry = _createEntryMap({});
			this.oGetStorageResponseStub = sandbox.stub(FlexState, "getStorageResponse").resolves(this.oEntry);
			this.oGetFlexObjectsStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oEntry.changes);
		},
		afterEach: function() {
			this.server.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("deletePersonalization resolves if a personalization is successful deleted and the entry is gone from the session in all entries", function(assert) {
			this.oItem1 = {
				reference : sComponentName,
				containerKey : this.sContainerKey,
				itemName : this.sItemName1
			};
			this.oItem2 = {
				reference : sComponentName,
				containerKey : this.sContainerKey,
				itemName : this.sItemName2
			};

			Cache._addPersonalizationToEntries(this.oItem1);
			Cache._addPersonalizationToEntries(this.oItem2);
			return Cache.deletePersonalization(sComponentName, this.sContainerKey, this.sItemName1).then(function() {
				assert.equal(this.server.requests.length, 2, " two calls were sent to the backend (1 token, 1 delete)");
				assert.equal(this.server.requests[0].method, "HEAD", "a token was requested");
				assert.equal(this.server.requests[1].method, "DELETE", "a delete was requested");
				assert.equal(this.server.requests[1].url, this.sExpectedUrl, "the delete was sent to the correct url");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey].length, 1, "one entry is in first the container");
				assert.equal(this.oEntry.changes.ui2personalization[this.sContainerKey][0], this.oItem2, "the 'other' item is still in the container");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery('#qunit-fixture').hide();
	});
});
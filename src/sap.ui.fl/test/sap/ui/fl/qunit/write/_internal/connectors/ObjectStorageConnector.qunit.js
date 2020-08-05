/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/ObjectStorageConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/Layer",
	"sap/base/util/values",
	"sap/base/util/restricted/_uniq"
], function(
	merge,
	sinon,
	ObjectStorageConnector,
	SessionStorageWriteConnector,
	JsObjectConnector,
	ObjectStorageUtils,
	Layer,
	values,
	_uniq
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oTestData = {
		oChange1: {
			fileName: "oChange1",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			selector: {
				id: "selector1"
			},
			changeType: "type1"
		},
		oChange2: {
			fileName: "oChange2",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			selector: {
				id: "selector2"
			},
			changeType: "type2"
		},
		oChange3: {
			fileName: "oChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: Layer.USER,
			selector: {
				id: "selector2"
			},
			changeType: "type1"
		},
		oChange4: {
			fileName: "oChange4",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			changeType: "type1"
		},
		oVariant1: {
			fileName: "oVariant1",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		oVariantChange1: {
			fileName: "oVariantChange1",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			selector: {
				id: "oVariant1"
			}
		},
		oVariantManagementChange: {
			fileName: "oVariantManagementChange",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			selector: {
				id: "variantManagement0"
			}
		}
	};

	function saveListWithConnector(oConnector, aList) {
		return oConnector.write({
			flexObjects : aList
		});
	}

	function removeListFromStorage(oStorage, aList) {
		var aPromises = aList.map(function(oFlexObject) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
			return oStorage.removeItem(sKey);
		});

		return Promise.all(aPromises);
	}

	function getFlexObjectFromStorage(oFlexObject, oStorage) {
		var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
		return Promise.resolve(oStorage.getItem(sKey));
	}

	function assertFileWritten(assert, oStorage, oData, sMessage) {
		return values(oData).map(function(oFlexObject) {
			return getFlexObjectFromStorage(oFlexObject, oStorage)
				.then(function(vItem) {
					var oItem = oStorage._itemsStoredAsObjects ? vItem : JSON.parse(vItem);
					assert.ok(!!Date.parse(oItem.creation), "then creation property was set for the flex item");
					assert.deepEqual(oFlexObject, oItem, oItem.fileName + sMessage);
				});
		});
	}

	function getNumberOfFlexObjects(oConnector) {
		var iCount = 0;
		return ObjectStorageUtils.forEachObjectInStorage({storage: oConnector.oStorage}, function() {
			iCount++;
		})
		.then(function() {
			return iCount;
		});
	}

	function parameterizedTest(oConnector, sStorage) {
		QUnit.module("loadFlexData: Given a " + sStorage, {
			afterEach: function() {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("when write is called with various changes", function(assert) {
				return saveListWithConnector(oConnector, values(oTestData))
					.then(function () {
						return Promise.all([assertFileWritten(assert, oConnector.oStorage, oTestData, " was written")]);
					})
					.then(function () {
						// clean up
						return removeListFromStorage(oConnector.oStorage, values(oTestData));
					});
			});

			QUnit.test("when write is called with changes created with the same timestamp", function(assert) {
				var nCurrentTimestamp = Date.now();
				sandbox.stub(Date, "now").returns(nCurrentTimestamp);
				return saveListWithConnector(oConnector, values(oTestData))
					.then(function() {
						var aCreationFields = [];
						return Promise.all([
							values(oTestData)
							.map(function (oFlexObject) {
								return getFlexObjectFromStorage(oFlexObject, oConnector.oStorage)
									.then(function (vItem) {
										aCreationFields.push(oConnector.oStorage._itemsStoredAsObjects ? vItem.creation : JSON.parse(vItem).creation);
									});
							})
						])
							.then(function () {
								var iTotalChanges = aCreationFields.length;
								assert.strictEqual(_uniq(aCreationFields).length, iTotalChanges);
							});
					});
			});

			QUnit.test("when loadFeatures is called", function(assert) {
				return oConnector.loadFeatures().then(function(oFeatures) {
					assert.deepEqual(oFeatures, {
						isKeyUser: true,
						isVariantSharingEnabled: true
					}, "the function resolves with options");
				});
			});

			// TODO: fix the getFlexInfo to take the mandatory reference parameter into account
			QUnit.skip("when getFlexInfo is called without changes present", function(assert) {
				return oConnector.getFlexInfo({storage: oConnector.oStorage}).then(function(oFlexInfo) {
					var oExpectedFlexInfo = {
						isResetEnabled: false
					};
					assert.deepEqual(oFlexInfo, oExpectedFlexInfo, "the function resolves with an empty object");
				});
			});

			QUnit.test("when getFlexInfo is called with changes present", function(assert) {
				return saveListWithConnector(oConnector, [
					oTestData.oChange1
				])
				.then(function() {
					return oConnector.getFlexInfo({storage: oConnector.oStorage}).then(function(oFlexInfo) {
						var oExpectedFlexInfo = {
							isResetEnabled: true
						};
						assert.deepEqual(oFlexInfo, oExpectedFlexInfo, "the function resolves with an empty object");

						return removeListFromStorage(oConnector.oStorage, [
							oTestData.oChange1
						]);
					});
				});
			});
		});

		QUnit.module("loadFlexData: Given some changes in a " + sStorage, {
			beforeEach: function() {
				return saveListWithConnector(oConnector, values(oTestData));
			},
			afterEach: function() {
				return removeListFromStorage(oConnector.oStorage, values(oTestData));
			}
		}, function() {
			QUnit.test("when reset is called", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference : "sap.ui.fl.test.1",
						layer : Layer.USER
					});
				})
				.then(
					getNumberOfFlexObjects.bind(undefined, oConnector)
				)
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with selector ids", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference : "sap.ui.fl.test",
						layer : Layer.CUSTOMER,
						selectorIds : ["selector1"]
					});
				})
				.then(
					getNumberOfFlexObjects.bind(undefined, oConnector)
				)
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with change types", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference : "sap.ui.fl.test",
						layer : Layer.CUSTOMER,
						changeTypes : ["type1"]
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 2, "two change got reset");
				});
			});

			QUnit.test("when reset is called with selectors and change types", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference: "sap.ui.fl.test",
						layer: Layer.CUSTOMER,
						changeTypes: ["type1"],
						selectorIds: ["selector2"]
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 0, "no change got reset");
				});
			});

			QUnit.test("when remove is called with a saved flex object", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.remove({
						flexObject: {
							fileName: oTestData.oChange1.fileName
						}
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got removed");
				});
			});

			QUnit.test("when remove is called with a not existing flex object", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.remove({
						flexObject : {
							fileName : "foo"
						}
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 0, "no change got removed");
				});
			});
		});
	}

	QUnit.module("write: Given a connector where _itemsStoredAsObjects", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("is true when write is called with a change", function(assert) {
			var oObject = {
				fileName: "id123"
			};

			var oSetItemStub = sandbox.stub(JsObjectConnector.oStorage, "setItem");

			return JsObjectConnector.write({
				flexObjects : [oObject]
			})
			.then(function() {
				assert.equal(oSetItemStub.getCall(0).args[1], oObject, "the write was called with the object");
			});
		});

		QUnit.test("is false when write is called with a change", function(assert) {
			var oObject = {
				fileName: "id123"
			};

			var sKey = ObjectStorageUtils.createFlexObjectKey(oObject);
			return SessionStorageWriteConnector.write({
				flexObjects: [oObject]
			})
			.then(function() {
				var sObject = JSON.stringify(oObject);
				assert.strictEqual(SessionStorageWriteConnector.oStorage.getItem(sKey), sObject, "the write was called with the object as string");
			});
		});
	});

	var oAsyncStorage = {
		_itemsStoredAsObjects: true,
		_items: {},
		setItem: function(sKey, vValue) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					oAsyncStorage._items[sKey] = vValue;
					resolve();
				});
			});
		},
		removeItem: function(sKey) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					delete oAsyncStorage._items[sKey];
					resolve();
				});
			});
		},
		clear: function() {
			return new Promise(function(resolve) {
				setTimeout(function() {
					oAsyncStorage._items = {};
					resolve();
				});
			});
		},
		getItem: function(sKey) {
			return Promise.resolve(oAsyncStorage._items[sKey]);
		},
		getItems: function() {
			return Promise.resolve(oAsyncStorage._items);
		}
	};
	var oConnectorWithAsyncStorage = merge({}, ObjectStorageConnector, {
		oStorage: oAsyncStorage
	});

	parameterizedTest(JsObjectConnector, "JsObjectStorage");
	parameterizedTest(SessionStorageWriteConnector, "sessionStorage");
	// WebIDE uses the ObjectStorageConnector with an async storage
	parameterizedTest(oConnectorWithAsyncStorage, "asyncStorage");
	// LocalStorage behaves similar to Session storage and we rely on this to not run into issues with parallel tests interfering in the LocalStorageTests
	// parameterizedTest(LocalStorageWriteConnector, "localStorage");

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});

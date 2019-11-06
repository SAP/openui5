/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	sinon,
	SessionStorageWriteConnector,
	JsObjectConnector,
	ObjectStorageUtils
) {
	"use strict";

	var oTestData = {
		oChange1: {
			fileName: "id_1445501120486_15",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER",
			selector: {
				id: "selector1"
			},
			changeType: "type1"
		},
		oChange2: {
			fileName: "id_1445517849455_16",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER",
			selector: {
				id: "selector2"
			},
			changeType: "type2"
		},
		oChange3: {
			fileName: "oChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "USER",
			selector: {
				id: "selector2"
			},
			changeType: "type1"
		},
		oChange4: {
			fileName: "oChange4",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER",
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
		var aPromises = aList.map(function (oFlexObject) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
			return oStorage.removeItem(sKey);
		});

		return Promise.all(aPromises);
	}

	function assertFileWritten(assert, oStorage, oFlexObject, sMessage) {
		var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
		var vItem = oStorage.getItem(sKey);
		var oItem = oStorage._itemsStoredAsObjects ? vItem : JSON.parse(vItem);
		assert.deepEqual(oFlexObject, oItem, sMessage);
	}

	function getNumberOfFlexObjects(oConnector) {
		var iCount = 0;
		return ObjectStorageUtils.forEachObjectInStorage({storage: oConnector.oStorage}, function() {
			iCount++;
		})
		.then(function () {
			return iCount;
		});
	}

	function parameterizedTest(oConnector, sStorage) {
		QUnit.module("loadFlexData: Given a " + sStorage, {
		}, function () {
			QUnit.test("when write is called with various changes", function (assert) {
				return saveListWithConnector(oConnector, [
					oTestData.oChange1,
					oTestData.oChange2,
					oTestData.oChange3,
					oTestData.oVariant1,
					oTestData.oVariantChange1,
					oTestData.oVariantManagementChange
				])
				.then(function () {
					assertFileWritten(assert, oConnector.oStorage, oTestData.oChange1, "change1 was written");
					assertFileWritten(assert, oConnector.oStorage, oTestData.oChange2, "change2 was written");
					assertFileWritten(assert, oConnector.oStorage, oTestData.oChange3, "change3 was written");
					assertFileWritten(assert, oConnector.oStorage, oTestData.oVariant1, "variant1 was written");
					assertFileWritten(assert, oConnector.oStorage, oTestData.oVariantChange1, "variant change1 was written");
					assertFileWritten(assert, oConnector.oStorage, oTestData.oVariantManagementChange, "variant management change was written");
				})
				.then(function () {
					// clean up
					return removeListFromStorage(oConnector.oStorage, [
						oTestData.oChange1,
						oTestData.oChange2,
						oTestData.oChange3,
						oTestData.oVariant1,
						oTestData.oVariantChange1,
						oTestData.oVariantManagementChange
					]);
				});
			});

			QUnit.test("when loadFeatures is called", function(assert) {
				return oConnector.loadFeatures()
					.then(function(oFeatues) {
						assert.deepEqual(oFeatues, {}, "the function resolves with an empty object");
					});
			});

			// TODO: fix the getFlexInfo to take the mandatory reference parameter into account
			QUnit.skip("when getFlexInfo is called without changes present", function(assert) {
				return oConnector.getFlexInfo({storage: oConnector.oStorage})
					.then(function(oFlexInfo) {
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
				.then(function () {
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
				return saveListWithConnector(oConnector, [
					oTestData.oChange1,
					oTestData.oChange2,
					oTestData.oChange3,
					oTestData.oChange4,
					oTestData.oVariant1,
					oTestData.oVariantChange1,
					oTestData.oVariantManagementChange
				]);
			},
			afterEach: function() {
				return removeListFromStorage(oConnector.oStorage, [
					oTestData.oChange1,
					oTestData.oChange2,
					oTestData.oChange3,
					oTestData.oChange4,
					oTestData.oVariant1,
					oTestData.oVariantChange1,
					oTestData.oVariantManagementChange
				]);
			}
		}, function () {
			QUnit.test("when reset is called", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.reset({
							reference : "sap.ui.fl.test.1",
							layer : "USER"
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
					});
			});

			QUnit.test("when reset is called with selector ids", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.reset({
							reference : "sap.ui.fl.test",
							layer : "CUSTOMER",
							selectorIds : ["selector1"]
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
					});
			});

			QUnit.test("when reset is called with change types", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.reset({
							reference : "sap.ui.fl.test",
							layer : "CUSTOMER",
							changeTypes : ["type1"]
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 2, "two change got reset");
					});
			});

			QUnit.test("when reset is called with selectors and change types", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.reset({
							reference: "sap.ui.fl.test",
							layer: "CUSTOMER",
							changeTypes: ["type1"],
							selectorIds: ["selector2"]
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 0, "no change got reset");
					});
			});

			QUnit.test("when remove is called with a saved flex object", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.remove({
							flexObject: {
								fileName: oTestData.oChange1.fileName
							}
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 1, "one change got removed");
					});
			});

			QUnit.test("when remove is called with a not existing flex object", function (assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector)
					.then(function (iNumberOfChanges) {
						iInitialCount = iNumberOfChanges;
					})
					.then(function () {
						return oConnector.remove({
							flexObject : {
								fileName : "foo"
							}
						});
					})
					.then(
						getNumberOfFlexObjects.bind(undefined, oConnector)
					)
					.then(function (iNewCount) {
						assert.equal(iInitialCount - iNewCount, 0, "no change got removed");
					});
			});
		});
	}

	var sandbox = sinon.sandbox.create();

	QUnit.module("write: Given a connector where _itemsStoredAsObjects", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("is true when write is called with a change", function (assert) {
			var oObject = {
				fileName: "id123"
			};

			var oSetItemStub = sandbox.stub(JsObjectConnector.oStorage, "setItem");

			return JsObjectConnector.write({
				flexObjects : [oObject]
			})
			.then(function () {
				assert.equal(oSetItemStub.getCall(0).args[1], oObject, "the write was called with the object");
			});
		});

		QUnit.test("is false when write is called with a change", function (assert) {
			var oObject = {
				fileName: "id123"
			};

			var sKey = ObjectStorageUtils.createFlexObjectKey(oObject);
			return SessionStorageWriteConnector.write({
				flexObjects: [oObject]
			})
			.then(function () {
				var sObject = JSON.stringify(oObject);
				assert.strictEqual(SessionStorageWriteConnector.oStorage.getItem(sKey), sObject, "the write was called with the object as string");
			});
		});
	});

	parameterizedTest(JsObjectConnector, "JsObjectStorage");
	parameterizedTest(SessionStorageWriteConnector, "sessionStorage");
	// LocalStorage behaves similar to Session storage and we rely on this to not run into issues with parallel tests interfering in the LocalStorageTests
	//parameterizedTest(LocalStorageWriteConnector, "localStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

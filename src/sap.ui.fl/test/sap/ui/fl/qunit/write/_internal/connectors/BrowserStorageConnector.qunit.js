/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils"
], function(
	SessionStorageWriteConnector,
	JsObjectConnector,
	BrowserStorageUtils
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
		oConnector.write({
			flexObjects : aList
		});
	}

	function removeListFromStorage(oStorage, aList) {
		aList.forEach(function (oFlexObject) {
			var sKey = BrowserStorageUtils.createFlexObjectKey(oFlexObject);
			oStorage.removeItem(sKey);
		});
	}

	function assertFileWritten(assert, oStorage, oFlexObject, sMessage) {
		var sKey = BrowserStorageUtils.createFlexObjectKey(oFlexObject);
		var oItem = JSON.parse(oStorage.getItem(sKey));
		assert.deepEqual(oFlexObject, oItem, sMessage);
	}

	function getNumberOfFlexObjects(oConnector) {
		var iCount = 0;
		BrowserStorageUtils.forEachChangeInStorage({storage: oConnector.oStorage}, function() {
			iCount++;
		});
		return iCount;
	}

	function parameterizedTest(oConnector, sStorage) {
		QUnit.module("loadFlexData: Given a " + sStorage, {
		}, function () {
			QUnit.test("when write is called with various changes", function (assert) {
				saveListWithConnector(oConnector, [
					oTestData.oChange1,
					oTestData.oChange2,
					oTestData.oChange3,
					oTestData.oVariant1,
					oTestData.oVariantChange1,
					oTestData.oVariantManagementChange
				]);
				assertFileWritten(assert, oConnector.oStorage, oTestData.oChange1, "change1 was written");
				assertFileWritten(assert, oConnector.oStorage, oTestData.oChange2, "change2 was written");
				assertFileWritten(assert, oConnector.oStorage, oTestData.oChange3, "change3 was written");
				assertFileWritten(assert, oConnector.oStorage, oTestData.oVariant1, "variant1 was written");
				assertFileWritten(assert, oConnector.oStorage, oTestData.oVariantChange1, "variant change1 was written");
				assertFileWritten(assert, oConnector.oStorage, oTestData.oVariantManagementChange, "variant management change was written");

				// clean up
				removeListFromStorage(oConnector.oStorage, [
					oTestData.oChange1,
					oTestData.oChange2,
					oTestData.oChange3,
					oTestData.oVariant1,
					oTestData.oVariantChange1,
					oTestData.oVariantManagementChange
				]);
			});

			QUnit.test("when loadFeatures is called", function(assert) {
				return oConnector.loadFeatures().then(function(oFeatues) {
					assert.deepEqual(oFeatues, {}, "the function resolves with an empty object");
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
				saveListWithConnector(oConnector, [
					oTestData.oChange1
				]);
				return oConnector.getFlexInfo({storage: oConnector.oStorage}).then(function(oFlexInfo) {
					var oExpectedFlexInfo = {
						isResetEnabled: true
					};
					assert.deepEqual(oFlexInfo, oExpectedFlexInfo, "the function resolves with an empty object");

					removeListFromStorage(oConnector.oStorage, [
						oTestData.oChange1
					]);
				});
			});
		});

		QUnit.module("loadFlexData: Given some changes in a " + sStorage, {
			beforeEach: function() {
				saveListWithConnector(oConnector, [
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
				removeListFromStorage(oConnector.oStorage, [
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
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.reset({
					reference: "sap.ui.fl.test.1",
					layer: "USER"
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with selector ids", function (assert) {
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.reset({
					reference: "sap.ui.fl.test",
					layer: "CUSTOMER",
					selectorIds: ["selector1"]
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with change types", function (assert) {
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.reset({
					reference: "sap.ui.fl.test",
					layer: "CUSTOMER",
					changeTypes: ["type1"]
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 2, "two change got reset");
				});
			});

			QUnit.test("when reset is called with selectors and change types", function (assert) {
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.reset({
					reference: "sap.ui.fl.test",
					layer: "CUSTOMER",
					changeTypes: ["type1"],
					selectorIds: ["selector2"]
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 0, "no change got reset");
				});
			});

			QUnit.test("when remove is called with a saved flex object", function (assert) {
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.remove({
					flexObject: {
						fileName: oTestData.oChange1.fileName
					}
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 1, "one change got removed");
				});
			});

			QUnit.test("when remove is called with a not existing flex object", function (assert) {
				var iInitialCount = getNumberOfFlexObjects(oConnector);
				return oConnector.remove({
					flexObject: {
						fileName: "foo"
					}
				}).then(function() {
					var iNewCount = getNumberOfFlexObjects(oConnector);
					assert.equal(iInitialCount - iNewCount, 0, "no change got removed");
				});
			});
		});
	}

	parameterizedTest(JsObjectConnector, "JsObjectStorage");
	parameterizedTest(SessionStorageWriteConnector, "sessionStorage");
	// LocalStorage behaves similar to Session storage and we rely on this to not run into issues with parallel tests interfering in the LocalStorageTests
	//parameterizedTest(LocalStorageWriteConnector, "localStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

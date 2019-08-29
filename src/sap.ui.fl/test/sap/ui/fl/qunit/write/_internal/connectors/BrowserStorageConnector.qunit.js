/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils"
], function(
	SessionStorageWriteConnector,
	LocalStorageWriteConnector,
	BrowserStorageUtils
) {
	"use strict";

	var oTestData = {
		oChange1: {
			fileName: "id_1445501120486_15",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER"
		},
		oChange2: {
			fileName: "id_1445517849455_16",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "USER"
		},
		oChange3: {
			fileName: "oChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER"
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
		aList.forEach(function (oFlexObject) {
			oConnector.write(oFlexObject.fileName, oFlexObject);
		});
	}

	function removeListFromStorage(oStorage, aList) {
		aList.forEach(function (sObjektId) {
			var sKey = BrowserStorageUtils.createChangeKey(sObjektId);
			if (oStorage.removeItem) {
				oStorage.removeItem(sKey);
			} else {
				// function for the JsObjectStorage
				delete oStorage._items[sKey];
			}
		});
	}

	function assertFileWritten(assert, oStorage, oFile, sMessage) {
		var sKey;
		if (oFile.fileType === "ctrl_variant") {
			sKey = BrowserStorageUtils.createVariantKey(oFile.fileName);
		} else {
			sKey = BrowserStorageUtils.createChangeKey(oFile.fileName);
		}
		var oItem = JSON.parse(oStorage.getItem(sKey));
		assert.deepEqual(oFile, oItem, sMessage);
	}

	function parameterizedTest(oConnector, sStorage) {
		QUnit.module("loadFlexData: Given some changes in the " + sStorage, {
			afterEach: function() {
				removeListFromStorage(oConnector.oStorage, [
					oTestData.oChange1.fileName,
					oTestData.oChange2.fileName,
					oTestData.oChange3.fileName,
					oTestData.oVariant1.fileName,
					oTestData.oVariantChange1.fileName,
					oTestData.oVariantManagementChange.fileName
				]);
			}
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
			});
		});
	}

	parameterizedTest(SessionStorageWriteConnector, "sessionStorage");
	parameterizedTest(LocalStorageWriteConnector, "localStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

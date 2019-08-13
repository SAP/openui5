/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/internal/connectors/LocalStorageConnector"
], function(
	SessionStorageWriteConnector,
	LocalStorageWriteConnector
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
			fileName: "id_1445517849455_17",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER"
		},
		oVariant1: {
			fileName: "id_1445501120486_27",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		oVariantChange1: {
			fileName: "id_1507716136285_38_setTitle",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			selector: {
				id: "id_1445501120486_27"
			}
		},
		oVariantManagementChange: {
			fileName: "id_1510920910626_29_setDefault",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			selector: {
				id: "variantManagement0"
			}
		}
	};

	function parameterizedTest(oWriteStorage, sStorage) {
		QUnit.module("loadFlexData: Given some changes in the " + sStorage, {
			before: function() {
				this.oOriginalStorageState = {};
				Object.keys(oWriteStorage.oStorage).forEach(function(sKey) {
					this.oOriginalStorageState[sKey] = oWriteStorage.oStorage[sKey];
				}.bind(this));
				oWriteStorage.oStorage.clear();
			},
			after: function() {
				oWriteStorage.oStorage.clear();
				Object.keys(this.oOriginalStorageState).forEach(function(sKey) {
					oWriteStorage.oStorage.setItem(sKey, this.oOriginalStorageState[sKey]);
				}.bind(this));
			}
		}, function () {
			QUnit.test("when saveChange is called with various changes", function (assert) {
				assert.equal(oWriteStorage.oStorage.length, 0, "initially there are no entries in the storage");

				oWriteStorage.saveChange(oTestData.oChange1.fileName, oTestData.oChange1);
				oWriteStorage.saveChange(oTestData.oChange2.fileName, oTestData.oChange2);
				oWriteStorage.saveChange(oTestData.oChange3.fileName, oTestData.oChange3);
				oWriteStorage.saveChange(oTestData.oVariant1.fileName, oTestData.oVariant1);
				oWriteStorage.saveChange(oTestData.oVariantChange1.fileName, oTestData.oVariantChange1);
				oWriteStorage.saveChange(oTestData.oVariantManagementChange.fileName, oTestData.oVariantManagementChange);

				assert.equal(oWriteStorage.oStorage.length, 6, "6 changes were saved");
			});
		});
	}

	parameterizedTest(SessionStorageWriteConnector, "sessionStorage");
	parameterizedTest(LocalStorageWriteConnector, "localStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

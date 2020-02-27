/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/jquery"
], function(
	ObjectStorageUtils,
	JsObjectConnector,
	SessionStorageConnector,
	StorageUtils,
	JsObjectWriteConnector,
	SessionStorageWriteConnector,
	Layer,
	jQuery
) {
	"use strict";

	QUnit.module("Loading of Connector", {}, function() {
		QUnit.test("given a custom connector is configured", function(assert) {
			return StorageUtils.getApplyConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connector, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].connector, "ObjectStorageConnector", "the ObjectStorageConnector is the second connector");
			});
		});
	});

	var oTestData = {
		change1: {
			fileName: "change1",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			creation: "2019-08-21T13:52:40.4754350Z"
		},
		change2: {
			fileName: "change2",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.USER,
			creation: "2019-08-20T13:52:40.4754350Z"
		},
		change3: {
			fileName: "change3",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		change4: {
			fileName: "change4",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			variantReference: "variant1",
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		variant1: {
			fileName: "variant1",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		variant2: {
			fileName: "variant2",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			creation: "2019-08-20T13:52:40.4754350Z"
		},
		variantChange: {
			fileName: "variantChange",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			reference: "sap.ui.fl.test",
			selector: {
				id: "variant1"
			},
			layer: Layer.CUSTOMER
		},
		variantManagementChange: {
			fileName: "variantManagementChange",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			reference: "sap.ui.fl.test",
			selector: {
				id: "variantManagement0"
			},
			layer: Layer.CUSTOMER
		},
		anotherAppChange1: {
			fileName: "anotherAppChange1",
			fileType: "change",
			reference: "sap.ui.fl.test.another.app",
			layer: Layer.CUSTOMER
		},
		anotherAppChange2: {
			fileName: "anotherAppChange2",
			fileType: "change",
			reference: "sap.ui.fl.test.another.app",
			layer: Layer.USER
		},
		anotherAppChange3: {
			fileName: "anotherAppChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.another.app",
			layer: Layer.CUSTOMER
		},
		anotherAppChange4: {
			fileName: "anotherAppChange4",
			fileType: "change",
			reference: "sap.ui.fl.test.another.app",
			layer: Layer.CUSTOMER,
			variantReference: "anotherAppVariant",
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		anotherAppVariant: {
			fileName: "anotherAppVariant",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0",
			reference: "sap.ui.fl.test.another.app",
			layer: Layer.CUSTOMER
		},
		anotherAppVariantChange: {
			fileName: "anotherAppVariantChange",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			reference: "sap.ui.fl.test.another.app",
			selector: {
				id: "anotherAppVariant"
			},
			layer: Layer.CUSTOMER
		},
		anotherAppVariantManagementChange: {
			fileName: "anotherAppVariantManagementChange",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			reference: "sap.ui.fl.test.another.app",
			selector: {
				id: "variantManagement0"
			},
			layer: Layer.CUSTOMER
		},
		baseChange: {
			fileName: "baseChange",
			fileType: "change",
			reference: "sap.ui.fl.test.module2",
			layer: Layer.BASE,
			creation: "2019-08-21T13:52:40.4754350Z"
		},
		vendorVariant: {
			fileName: "vendorVariant",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0",
			reference: "sap.ui.fl.test.module2",
			layer: Layer.VENDOR,
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		partnerVariantChange: {
			fileName: "partnerVariantChange",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			reference: "sap.ui.fl.test.module2",
			selector: {
				id: "vendorVariant"
			},
			layer: Layer.PARTNER
		},
		customerBaseVariantDependentChange: {
			fileName: "customerBaseVariantDependentChange",
			fileType: "change",
			reference: "sap.ui.fl.test.module2",
			layer: Layer.CUSTOMER_BASE,
			variantReference: "id_1445501120486_27",
			creation: "2019-08-19T13:52:40.4754350Z"
		},
		customerVariantManagementChange: {
			fileName: "customerVariantManagementChange",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			reference: "sap.ui.fl.test.module2",
			selector: {
				id: "variantManagement0"
			},
			layer: Layer.CUSTOMER
		}
	};

	function removeListFromStorage(oStorage, aList) {
		aList.forEach(function (sObjectId) {
			var sKey = ObjectStorageUtils.createFlexKey(sObjectId);
			if (oStorage.removeItem) {
				oStorage.removeItem(sKey);
			} else {
				// function for the JsObjectStorage
				delete oStorage._items[sKey];
			}
		});
	}

	function parameterizedTest(oApplyStorageConnector, oWriteStorageConnector, sStorage) {
		QUnit.module("loadFlexData: Given some changes in the " + sStorage, {
			before: function() {
				oWriteStorageConnector.write({
					flexObjects : [
						oTestData.change1,
						oTestData.change2,
						oTestData.change3,
						oTestData.change4,
						oTestData.variant1,
						oTestData.variant2,
						oTestData.variantChange,
						oTestData.variantManagementChange,
						oTestData.anotherAppChange1,
						oTestData.anotherAppChange2,
						oTestData.anotherAppChange3,
						oTestData.anotherAppChange4,
						oTestData.anotherAppVariant,
						oTestData.anotherAppVariantChange,
						oTestData.anotherAppVariantManagementChange
					]
				});
			},
			after: function () {
				removeListFromStorage(oWriteStorageConnector.oStorage, [
					oTestData.change1.fileName,
					oTestData.change2.fileName,
					oTestData.change3.fileName,
					oTestData.change4.fileName,
					oTestData.variant1.fileName,
					oTestData.variant2.fileName,
					oTestData.variantChange.fileName,
					oTestData.variantManagementChange.fileName,
					oTestData.anotherAppChange1.fileName,
					oTestData.anotherAppChange2.fileName,
					oTestData.anotherAppChange3.fileName,
					oTestData.anotherAppChange4.fileName,
					oTestData.anotherAppVariant.fileName,
					oTestData.anotherAppVariantChange.fileName,
					oTestData.anotherAppVariantManagementChange.fileName
				]);
			}
		}, function () {
			QUnit.test("when loadFlexData is called without filter parameters", function (assert) {
				return oApplyStorageConnector.loadFlexData({reference : "sap.ui.fl.test"}).then(function (vValue) {
					assert.ok(Array.isArray(vValue), "an array is returned");
					assert.equal(vValue.length, 2, "two responses were created");

					var mCustomerLayerData = vValue[0];
					assert.equal(mCustomerLayerData.changes.length, 2, "two CUSTOMER change were returned");
					assert.deepEqual(mCustomerLayerData.changes[0], oTestData.change3, "the first CUSTOMER change was returned");
					assert.deepEqual(mCustomerLayerData.changes[1], oTestData.change1, "the second CUSTOMER change was returned");
					assert.equal(mCustomerLayerData.variantChanges.length, 1, "one CUSTOMER variant change was returned");
					assert.deepEqual(mCustomerLayerData.variantChanges[0], oTestData.variantChange, "the CUSTOMER variant change was returned");
					assert.equal(mCustomerLayerData.variants.length, 2, "two CUSTOMER variants were returned");
					assert.deepEqual(mCustomerLayerData.variants[0], oTestData.variant1, "the first CUSTOMER variant was returned");
					assert.deepEqual(mCustomerLayerData.variants[1], oTestData.variant2, "the second CUSTOMER variant was returned");
					assert.equal(mCustomerLayerData.variantManagementChanges.length, 1, "one CUSTOMER variant change was returned");
					assert.deepEqual(mCustomerLayerData.variantManagementChanges[0], oTestData.variantManagementChange, "the CUSTOMER variant management change was returned");
					assert.equal(mCustomerLayerData.variantDependentControlChanges.length, 1, "one CUSTOMER variant change was returned");
					assert.deepEqual(mCustomerLayerData.variantDependentControlChanges[0], oTestData.change4, "the CUSTOMER variant dependent change was returned");

					var mUserLayerData = vValue[1];
					assert.equal(mUserLayerData.changes.length, 1, "one USER change was returned");
					assert.deepEqual(mUserLayerData.changes[0], oTestData.change2, "the USER change was returned");
					assert.deepEqual(mUserLayerData.variantChanges.length, 0, "no USER variant changes were returned");
					assert.deepEqual(mUserLayerData.variants.length, 0, "no USER variants were returned");
					assert.deepEqual(mUserLayerData.variantManagementChanges.length, 0, "no USER variant management changes were returned");
					assert.deepEqual(mUserLayerData.variantDependentControlChanges.length, 0, "no USER variant dependent control changes were returned");
				});
			});
		});

		QUnit.module("loadFlexData: Given entries were present in different layers " + sStorage, {
			before: function() {
				oWriteStorageConnector.write({
					flexObjects : [
						oTestData.baseChange,
						oTestData.vendorVariant,
						oTestData.partnerVariantChange,
						oTestData.customerBaseVariantDependentChange,
						oTestData.customerVariantManagementChange
					]
				});
			},
			after: function () {
				removeListFromStorage(oWriteStorageConnector.oStorage, [
					oTestData.baseChange.fileName,
					oTestData.vendorVariant.fileName,
					oTestData.partnerVariantChange.fileName,
					oTestData.customerBaseVariantDependentChange.fileName,
					oTestData.customerVariantManagementChange.fileName
				]);
			}
		}, function () {
			QUnit.test("when loadFlexData is called without filter parameters", function (assert) {
				return oApplyStorageConnector.loadFlexData({reference : "sap.ui.fl.test.module2"}).then(function (vValue) {
					assert.ok(Array.isArray(vValue), "an array is returned");
					assert.equal(vValue.length, 5, "five responses are returned");

					assert.equal(vValue[0].changes.length, 1, "one change is included");
					assert.deepEqual(vValue[0].changes[0], oTestData.baseChange, "the BASE change is included");
					assert.equal(vValue[0].variants.length, 0, "no variants are included");
					assert.equal(vValue[0].variantChanges.length, 0, "no variant changes are included");
					assert.equal(vValue[0].variantDependentControlChanges.length, 0, "no variant dependent control changes are included");
					assert.equal(vValue[0].variantManagementChanges.length, 0, "no variant management changes are included");

					assert.equal(vValue[1].changes.length, 0, "no changes are included");
					assert.equal(vValue[1].variants.length, 1, "one variants is included");
					assert.deepEqual(vValue[1].variants[0], oTestData.vendorVariant, "the VENDOR variant is included");
					assert.equal(vValue[1].variantChanges.length, 0, "no variant changes are included");
					assert.equal(vValue[1].variantDependentControlChanges.length, 0, "no variant dependent control changes are included");
					assert.equal(vValue[1].variantManagementChanges.length, 0, "no variant management changes are included");

					assert.equal(vValue[2].changes.length, 0, "no changes are included");
					assert.equal(vValue[2].variants.length, 0, "no variants are included");
					assert.equal(vValue[2].variantChanges.length, 1, "one variant changes is included");
					assert.deepEqual(vValue[2].variantChanges[0], oTestData.partnerVariantChange, "the PARTNER variant change is included");
					assert.equal(vValue[2].variantDependentControlChanges.length, 0, "no variant dependent control changes are included");
					assert.equal(vValue[2].variantManagementChanges.length, 0, "no variant management changes are included");

					assert.equal(vValue[3].changes.length, 0, "no changes are included");
					assert.equal(vValue[3].variants.length, 0, "no variants are included");
					assert.equal(vValue[3].variantChanges.length, 0, "no variant changes are included");
					assert.equal(vValue[3].variantDependentControlChanges.length, 1, "one variant dependent control changes is included");
					assert.deepEqual(vValue[3].variantDependentControlChanges[0], oTestData.customerBaseVariantDependentChange, "the CUSTOMER_BASE variant dependent change is included");
					assert.equal(vValue[3].variantManagementChanges.length, 0, "no variant management changes are included");

					assert.equal(vValue[4].changes.length, 0, "no changes are included");
					assert.equal(vValue[4].variants.length, 0, "no variants are included");
					assert.equal(vValue[4].variantChanges.length, 0, "no variant changes are included");
					assert.equal(vValue[4].variantDependentControlChanges.length, 0, "no variant dependent control changes are included");
					assert.equal(vValue[4].variantManagementChanges.length, 1, "one variant management changes is included");
					assert.deepEqual(vValue[4].variantManagementChanges[0], oTestData.customerVariantManagementChange, "the CUSTOMER variant management change is included");
				});
			});
		});
	}

	parameterizedTest(JsObjectConnector, JsObjectWriteConnector, "JsObjectStorage");
	parameterizedTest(SessionStorageConnector, SessionStorageWriteConnector, "SessionStorage");
	// LocalStorage behaves similar to Session storage and we rely on this to not run into issues with parallel tests interfering in the LocalStorageTests
	//parameterizedTest(LocalStorageConnector, LocalStorageWriteConnector, "LocalStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

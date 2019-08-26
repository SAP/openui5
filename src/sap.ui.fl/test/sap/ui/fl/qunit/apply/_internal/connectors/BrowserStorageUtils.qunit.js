/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function (
	Utils,
	BrowserStorageUtils,
	sinon,
	jQuery
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	var oTestData = {
		change1: {
			fileName: "fileNameChange1",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER",
			creation: new Date('1995-12-17T03:24:00')
		},
		change2: {
			fileName: "fileNameChange2",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "USER"
		},
		change3: {
			fileName: "fileNameChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER",
			creation: new Date('1994-12-17T03:24:00')
		},
		change4: {
			fileName: "fileNameChange4",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER",
			variantReference: "fileNameVariant2",
			creation: new Date('1996-12-17T03:24:00')
		},
		change5: {
			fileName: "fileNameChange5",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			variantReference: "fileNameVariant2",
			layer: "OTHER_LAYER"
		},
		variant1: {
			fileName: "fileNameVariant1",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variant2: {
			fileName: "fileNameVariant2",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variant3: {
			fileName: "fileNameVariant3",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement1",
			variantReference: "variantManagement1"
		},
		variant4: {
			fileName: "fileNameVariant3",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "fileNameVariant2"
		},
		variantChange1: {
			fileName: "id_1507716136285_38_setTitle",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			selector: {
				id: "fileNameVariant1"
			}
		},
		variantManagementChange: {
			fileName: "id_1510920910626_29_setDefault",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			selector: {
				id: "variantManagement0"
			}
		}
	};

	QUnit.module("sortChanges", {
		beforeEach: function() {},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with ui changes", function(assert) {
			var mChangesMap = {
				changes: [oTestData.change1, oTestData.change3, oTestData.change4],
				variants: [],
				variantChanges: [],
				variantDependentControlChanges: [],
				variantManagementChanges: []
			};
			BrowserStorageUtils.sortGroupedFlexObjects(mChangesMap);
			assert.equal(mChangesMap.changes.length, 3, "3 changes are included");
			assert.equal(mChangesMap.changes[0].fileName, "fileNameChange3", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[1].fileName, "fileNameChange1", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[2].fileName, "fileNameChange4", "the changes are in the correct order");
		});

		QUnit.test("sorts all sections", function(assert) {
			var aChanges = [];
			var oChangesStub = sandbox.stub(aChanges, "sort");
			var aVariants = [];
			var oVariantsStub = sandbox.stub(aVariants, "sort");
			var aVariantChanges = [];
			var oVariantChangesStub = sandbox.stub(aVariantChanges, "sort");
			var aVariantDependentControlChanges = [];
			var oVariantDependentControlChangesStub = sandbox.stub(aVariantDependentControlChanges, "sort");
			var aVariantManagementChanges = [];
			var oVariantManagementChangesStub = sandbox.stub(aVariantManagementChanges, "sort");

			var mChangesMap = {
				changes: aChanges,
				variants: aVariants,
				variantChanges: aVariantChanges,
				variantDependentControlChanges: aVariantDependentControlChanges,
				variantManagement: aVariantDependentControlChanges,
				variantManagementChanges: aVariantManagementChanges
			};

			BrowserStorageUtils.sortGroupedFlexObjects(mChangesMap);
			assert.equal(oChangesStub.callCount, 1, "the changes were sorted");
			assert.equal(oVariantsStub.callCount, 1, "the variants were sorted");
			assert.equal(oVariantChangesStub.callCount, 1, "the variant changes were sorted");
			assert.equal(oVariantDependentControlChangesStub.callCount, 1, "the ui changes dependent on variants were sorted");
			assert.equal(oVariantManagementChangesStub.callCount, 1, "the variant management changes were sorted");
		});
	});

	QUnit.module("forEachChangeInStorage / createChangeKey / createVariantKey", {}, function() {
		QUnit.test("forEachChangeInStorage with various changes and variants", function(assert) {
			var sChangeKey1 = BrowserStorageUtils.createChangeKey("id1");
			var sChangeKey2 = BrowserStorageUtils.createChangeKey("id2");
			var sVariantKey1 = BrowserStorageUtils.createVariantKey("id1");
			var sVariantKey2 = BrowserStorageUtils.createVariantKey("id2");
			var oStorage = {};
			oStorage[sChangeKey1] = "change1";
			oStorage[sChangeKey2] = "change2";
			oStorage[sVariantKey1] = "variant1";
			oStorage[sVariantKey2] = "variant2";
			oStorage.foo = "bar";
			oStorage.bar = "foobar";

			BrowserStorageUtils.forEachChangeInStorage(oStorage, function(sKey) {
				oStorage[sKey] = oStorage[sKey] + "called";
			});

			assert.equal(oStorage[sChangeKey1], "change1called", "the callback was called and the value was changed");
			assert.equal(oStorage[sChangeKey2], "change2called", "the callback was called and the value was changed");
			assert.equal(oStorage[sVariantKey1], "variant1called", "the callback was called and the value was changed");
			assert.equal(oStorage[sVariantKey2], "variant2called", "the callback was called and the value was changed");
			assert.equal(oStorage.foo, "bar", "the value was not changed");
			assert.equal(oStorage.bar, "foobar", "the value was not changed");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
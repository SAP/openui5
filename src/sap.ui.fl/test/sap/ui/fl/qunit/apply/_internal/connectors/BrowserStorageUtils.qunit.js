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

	function parseAndAssertProperty(oStorage, sKey, sPropertyName, vValue, sMessage, assert) {
		assert.equal(JSON.parse(oStorage[sKey])[sPropertyName], vValue, sMessage);
	}

	QUnit.module("sortChanges", {
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

	QUnit.module("forEachChangeInStorage / createChangeKey / createVariantKey", {
		beforeEach: function() {
			this.sChangeKey1 = BrowserStorageUtils.createChangeKey("id1");
			this.sChangeKey2 = BrowserStorageUtils.createChangeKey("id2");
			this.sVariantKey1 = BrowserStorageUtils.createVariantKey("id1");
			this.sVariantKey2 = BrowserStorageUtils.createVariantKey("id2");
			this.oStorage = {};
			this.oStorage[this.sChangeKey1] = JSON.stringify({reference: "sap.ui.fl.test", layer: "USER", name: "change1"});
			this.oStorage[this.sChangeKey2] = JSON.stringify({reference: "sap.ui.fl.test.1", layer: "USER", name: "change2"});
			this.oStorage[this.sVariantKey1] = JSON.stringify({reference: "sap.ui.fl.test", layer: "CUSTOMER", name: "variant1"});
			this.oStorage[this.sVariantKey2] = JSON.stringify({reference: "sap.ui.fl.test.1", layer: "CUSTOMER", name: "variant2"});
			this.oStorage.foo = JSON.stringify({name: "bar"});
			this.oStorage.bar = JSON.stringify({name: "foobar"});
		}, afterEach: function() {
			delete this.oStorage;
		}
	}, function() {
		QUnit.test("forEachChangeInStorage with various changes and variants", function(assert) {
			BrowserStorageUtils.forEachChangeInStorage({storage: this.oStorage}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this));

			parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
			parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
		});

		QUnit.test("forEachChangeInStorage with various changes and variants with reference", function(assert) {
			BrowserStorageUtils.forEachChangeInStorage({
				storage: this.oStorage,
				reference: "sap.ui.fl.test"
			}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this));

			parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
			parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
		});

		QUnit.test("forEachChangeInStorage with various changes and variants with layer", function(assert) {
			BrowserStorageUtils.forEachChangeInStorage({
				storage: this.oStorage,
				layer: "USER"
			}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this));

			parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
			parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
		});

		QUnit.test("forEachChangeInStorage with various changes and variants with layer + reference", function(assert) {
			BrowserStorageUtils.forEachChangeInStorage({
				storage: this.oStorage,
				reference: "sap.ui.fl.test",
				layer: "CUSTOMER"
			}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this));

			parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1called", "the callback was called and the value was changed", assert);
			parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
			parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
			parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
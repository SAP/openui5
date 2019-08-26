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

	var mGroupedChanges = {
		uiChanges: [oTestData.change1, oTestData.change2, oTestData.change3, oTestData.change4],
		variants: [oTestData.variant1, oTestData.variant2, oTestData.variant3],
		controlVariantChanges: [oTestData.variantChange1],
		controlVariantManagementChanges: [oTestData.variantManagementChange]
	};

	var mExpectedChangesMapWithoutChanges = {
		changes: [],
		variantSection: {
			variantManagement0: {
				variantManagementChanges: {},
				variants: [
					{
						content: {
							content: {
								title: "Standard"
							},
							fileName: "variantManagement0",
							fileType: "ctrl_variant",
							variantManagementReference: "variantManagement0",
							variantReference: ""
						},
						controlChanges: [],
						variantChanges: {}
					},
					{
						content: oTestData.variant1,
						controlChanges: [],
						variantChanges: {}
					},
					{
						content: oTestData.variant2,
						controlChanges: [],
						variantChanges: {}
					}
				]
			},
			variantManagement1: {
				variantManagementChanges: {},
				variants: [
					{
						content: {
							content: {
								title: "Standard"
							},
							fileName: "variantManagement1",
							fileType: "ctrl_variant",
							variantManagementReference: "variantManagement1",
							variantReference: ""
						},
						controlChanges: [],
						variantChanges: {}
					},
					{
						content: oTestData.variant3,
						controlChanges: [],
						variantChanges: {}
					}
				]
			}
		}
	};

	QUnit.module("createChangesMapWithVariants", {}, function () {
		QUnit.test("without variant", function(assert) {
			var mExpectedResult = {
				changes: [],
				variantSection: {}
			};
			assert.deepEqual(BrowserStorageUtils.createChangesMapWithVariants(), mExpectedResult, "the map was created correctly without variants");
		});

		QUnit.test("with 3 variants, 2 of them belonging to the same variant management controls", function(assert) {
			assert.deepEqual(BrowserStorageUtils.createChangesMapWithVariants([oTestData.variant1, oTestData.variant2, oTestData.variant3]), mExpectedChangesMapWithoutChanges, "the map was created correctly with variants");
		});
	});

	QUnit.module("addChangesToMap", {}, function() {
		QUnit.test("without a complete changes map", function(assert) {
			assert.throws(function() {
				BrowserStorageUtils.addChangesToMap({}, mGroupedChanges);
			}, "with an empty changes map an Error is thrown");

			assert.throws(function() {
				BrowserStorageUtils.addChangesToMap({changes: []}, mGroupedChanges);
			}, "with the variantSection missing an Error is thrown");

			assert.throws(function() {
				BrowserStorageUtils.addChangesToMap({variantSection: {}}, mGroupedChanges);
			}, "with the changes array missing an Error is thrown");
		});

		QUnit.test("with a valid changes map with variants", function(assert) {
			var mChangesMap = BrowserStorageUtils.addChangesToMap(mExpectedChangesMapWithoutChanges, mGroupedChanges);
			// ui changes
			assert.equal(mChangesMap.changes.length, 3, "all 3 ui changes were added");
			assert.equal(mChangesMap.changes[0].fileName, "fileNameChange1", "the fileName is correct");
			assert.equal(mChangesMap.changes[1].fileName, "fileNameChange2", "the fileName is correct");
			assert.equal(mChangesMap.changes[2].fileName, "fileNameChange3", "the fileName is correct");

			// variant specific ui change
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges.length, 1, "a controlChange was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges[0].fileName, "fileNameChange4", "the fileName is correct");

			// controlVariantChanges
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].variantChanges.setTitle.length, 1, "a variantChange was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].variantChanges.setTitle[0].fileName, "id_1507716136285_38_setTitle", "the fileName is correct");

			// controlVariantManagementChanges
			assert.equal(mChangesMap.variantSection.variantManagement0.variantManagementChanges.setDefault.length, 1, "a variantChange was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variantManagementChanges.setDefault[0].fileName, "id_1510920910626_29_setDefault", "the fileName is correct");
		});

		QUnit.test("with a valid changes map without variants", function(assert) {
			var mEmptyChangesMap = BrowserStorageUtils.createChangesMapWithVariants();
			var mChangesMap = BrowserStorageUtils.addChangesToMap(mEmptyChangesMap, mGroupedChanges);

			// ui changes
			assert.equal(mChangesMap.changes.length, 3, "all 3 ui changes were added");
			assert.equal(mChangesMap.changes[0].fileName, "fileNameChange1", "the fileName is correct");
			assert.equal(mChangesMap.changes[1].fileName, "fileNameChange2", "the fileName is correct");
			assert.equal(mChangesMap.changes[2].fileName, "fileNameChange3", "the fileName is correct");

			// variant specific ui change
			assert.equal(mChangesMap.variantSection.fileNameVariant2.variants[0].controlChanges.length, 1, "a controlChange was added");
			assert.equal(mChangesMap.variantSection.fileNameVariant2.variants[0].controlChanges[0].fileName, "fileNameChange4", "the fileName is correct");

			// controlVariantChanges
			assert.equal(mChangesMap.variantSection.fileNameVariant1.variants[0].variantChanges.setTitle.length, 1, "a variantChange was added");
			assert.equal(mChangesMap.variantSection.fileNameVariant1.variants[0].variantChanges.setTitle[0].fileName, "id_1507716136285_38_setTitle", "the fileName is correct");

			// controlVariantManagementChanges
			assert.equal(mChangesMap.variantSection.variantManagement0.variantManagementChanges.setDefault.length, 1, "a variantChange was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variantManagementChanges.setDefault[0].fileName, "id_1510920910626_29_setDefault", "the fileName is correct");
		});
	});

	QUnit.module("sortChanges", {
		beforeEach: function() {
			sandbox.stub(Utils, "getLayerIndex").callsFake(function(sLayer) {
				if (sLayer === "CUSTOMER") {
					return 1;
				} else if (sLayer === "OTHER_LAYER") {
					return 3;
				} else if (sLayer === "USER") {
					return 6;
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with ui changes", function(assert) {
			var mChangesMap = {
				changes: [oTestData.change1, oTestData.change2, oTestData.change3, oTestData.change4, oTestData.change5]
			};
			BrowserStorageUtils.sortChanges(mChangesMap);
			assert.equal(mChangesMap.changes[0].fileName, "fileNameChange3", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[1].fileName, "fileNameChange1", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[2].fileName, "fileNameChange4", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[3].fileName, "fileNameChange5", "the changes are in the correct order");
			assert.equal(mChangesMap.changes[4].fileName, "fileNameChange2", "the changes are in the correct order");
		});

		QUnit.test("with various variant changes", function(assert) {
			var mChangesMap = {
				variantSection: {
					varMngt1: {
						variants: [
							{
								controlChanges: [oTestData.change2, oTestData.change1]
							},
							{
								controlChanges: [oTestData.change4, oTestData.change3]
							}
						]
					},
					varMngt2: {
						variants: [
							{
								controlChanges: [oTestData.change2, oTestData.change4]
							},
							{
								controlChanges: [oTestData.change5, oTestData.change3]
							}
						]
					}
				}
			};
			BrowserStorageUtils.sortChanges(mChangesMap);
			assert.equal(mChangesMap.variantSection.varMngt1.variants[0].controlChanges[0].fileName, "fileNameChange1", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt1.variants[0].controlChanges[1].fileName, "fileNameChange2", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt1.variants[1].controlChanges[0].fileName, "fileNameChange3", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt1.variants[1].controlChanges[1].fileName, "fileNameChange4", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt2.variants[0].controlChanges[0].fileName, "fileNameChange4", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt2.variants[0].controlChanges[1].fileName, "fileNameChange2", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt2.variants[1].controlChanges[0].fileName, "fileNameChange3", "the changes are in the correct order");
			assert.equal(mChangesMap.variantSection.varMngt2.variants[1].controlChanges[1].fileName, "fileNameChange5", "the changes are in the correct order");
		});
	});

	QUnit.module("assignVariantReferenceChanges", {
		beforeEach: function() {
			sandbox.stub(Utils, "getLayerIndex").callsFake(function(sLayer) {
				if (sLayer === "CUSTOMER") {
					return 1;
				} else if (sLayer === "OTHER_LAYER") {
					return 3;
				} else if (sLayer === "USER") {
					return 6;
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a", function(assert) {
			var mChangesMap = {
				variantSection: {
					variantManagement0: {
						variants: [
							{
								content: {
									fileName: "variantManagement0",
									variantManagementReference: "variantManagement0"
								},
								controlChanges: [oTestData.change3]
							},
							{
								content: oTestData.variant2,
								controlChanges: [oTestData.change4, oTestData.change1],
								layer: "OTHER_LAYER"
							},
							{
								content: oTestData.variant4,
								controlChanges: [oTestData.change5],
								layer: "USER"
							}
						]
					}
				}
			};
			BrowserStorageUtils.assignVariantReferenceChanges(mChangesMap);

			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].controlChanges.length, 3, "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].controlChanges[0].fileName, "fileNameChange3", "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].controlChanges[1].fileName, "fileNameChange4", "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[1].controlChanges[2].fileName, "fileNameChange1", "a referenced change was added");

			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges.length, 4, "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges[0].fileName, "fileNameChange3", "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges[1].fileName, "fileNameChange4", "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges[2].fileName, "fileNameChange1", "a referenced change was added");
			assert.equal(mChangesMap.variantSection.variantManagement0.variants[2].controlChanges[3].fileName, "fileNameChange5", "a referenced change was added");
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
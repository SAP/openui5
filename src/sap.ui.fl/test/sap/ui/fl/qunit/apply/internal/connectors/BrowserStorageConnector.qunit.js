/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/BrowserStorageUtils",
	"sap/ui/fl/apply/internal/connectors/SessionStorageConnector",
	"sap/ui/fl/apply/internal/connectors/LocalStorageConnector",
	"sap/ui/fl/apply/internal/connectors/Utils",
	"sap/ui/fl/write/internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/internal/connectors/LocalStorageConnector",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	BrowserStorageUtils,
	SessionStorageConnector,
	LocalStorageConnector,
	ConnectorUtils,
	SessionStorageWriteConnector,
	LocalStorageWriteConnector,
	sinon,
	jQuery
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	QUnit.module("Loading of Connector", {}, function() {
		QUnit.test("given a custom connector is configured", function(assert) {
			return ConnectorUtils.getApplyConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connectorName, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].connectorName, "BrowserStorageConnector", "the BrowserStorageConnector is the second connector");
			});
		});
	});

	var oTestData = {
		change1: {
			fileName: "id_1445501120486_15",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER"
		},
		change2: {
			fileName: "id_1445517849455_16",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "USER"
		},
		change3: {
			fileName: "id_1445517849455_17",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER"
		},
		variant1: {
			fileName: "id_1445501120486_27",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variant2: {
			fileName: "id_1445501120486_28",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variantChange1: {
			fileName: "id_1507716136285_38_setTitle",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			selector: {
				id: "id_1445501120486_27"
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

	function parameterizedTest(oApplyStorage, oWriteStorage, sStorage) {
		QUnit.module("loadFlexData: Given some changes in the " + sStorage, {
			before: function() {
				this.oOriginalStorageState = {};
				Object.keys(oApplyStorage.oStorage).forEach(function(sKey) {
					this.oOriginalStorageState[sKey] = oApplyStorage.oStorage[sKey];
				}.bind(this));
				oApplyStorage.oStorage.clear();

				oWriteStorage.saveChange(oTestData.change1.fileName, oTestData.change1);
				oWriteStorage.saveChange(oTestData.change2.fileName, oTestData.change2);
				oWriteStorage.saveChange(oTestData.change3.fileName, oTestData.change3);
				oWriteStorage.saveChange(oTestData.variant1.fileName, oTestData.variant1);
				oWriteStorage.saveChange(oTestData.variant2.fileName, oTestData.variant2);
				oWriteStorage.saveChange(oTestData.variantChange1.fileName, oTestData.variantChange1);
				oWriteStorage.saveChange(oTestData.variantManagementChange.fileName, oTestData.variantManagementChange);
			},
			beforeEach: function() {
				this.oCreateMapStub = sandbox.stub(BrowserStorageUtils, "createChangesMapWithVariants").returns("returnValue");
				this.oAddChangesStub = sandbox.stub(BrowserStorageUtils, "addChangesToMap");
				this.oSortChangesStub = sandbox.stub(BrowserStorageUtils, "sortChanges");
				this.oAssignReferencedChangesStub = sandbox.stub(BrowserStorageUtils, "assignVariantReferenceChanges");
			},
			after: function() {
				oApplyStorage.oStorage.clear();
				Object.keys(this.oOriginalStorageState).forEach(function(sKey) {
					oApplyStorage.oStorage.setItem(sKey, this.oOriginalStorageState[sKey]);
				}.bind(this));
			},
			afterEach: function() {
				sandbox.restore();
			}
		}, function () {
			QUnit.test("when loadFlexData is called without filter parameters", function(assert) {
				return oApplyStorage.loadFlexData({}).then(function(vValue) {
					var mExpectedGroupedChanges = {
						uiChanges: [oTestData.change1, oTestData.change2, oTestData.change3],
						variants: [oTestData.variant1, oTestData.variant2],
						controlVariantChanges: [oTestData.variantChange1],
						controlVariantManagementChanges: [oTestData.variantManagementChange]
					};
					var oExpectedVariantsArray = [oTestData.variant1, oTestData.variant2];

					assert.equal(vValue, "returnValue", "the return value of the Utils methods is returned");
					assert.equal(this.oCreateMapStub.callCount, 1, "createChangesMapWithVariants was called");
					assert.deepEqual(this.oCreateMapStub.lastCall.args[0], oExpectedVariantsArray);
					assert.equal(this.oAddChangesStub.callCount, 1, "addChangesToMap was called");
					assert.deepEqual(this.oAddChangesStub.lastCall.args[0], "returnValue", "the just created changes map was passed");
					assert.deepEqual(this.oAddChangesStub.lastCall.args[1], mExpectedGroupedChanges, "the changes are correctly grouped");
					assert.equal(this.oSortChangesStub.callCount, 1, "sortChanges was called");
					assert.equal(this.oAssignReferencedChangesStub.callCount, 1, "assignVariantReferenceChanges was called");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a layer", function(assert) {
				return oApplyStorage.loadFlexData({layer: "USER"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");

					return oApplyStorage.loadFlexData({layer: "CUSTOMER"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 2, "2 changes are passed");

					return oApplyStorage.loadFlexData({layer: "VENDOR"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 0, "no changes are passed");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a reference", function(assert) {
				return oApplyStorage.loadFlexData({reference: "sap.ui.fl.test"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 2, "2 changes are passed");

					return oApplyStorage.loadFlexData({reference: "sap.ui.fl.test.1"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");

					return oApplyStorage.loadFlexData({reference: "sap.ui.fl.test.2"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 0, "no changes are passed");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a layer and a reference", function(assert) {
				return oApplyStorage.loadFlexData({layer: "CUSTOMER", reference: "sap.ui.fl.test"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");
				}.bind(this));
			});
		});
	}

	parameterizedTest(SessionStorageConnector, SessionStorageWriteConnector, "sessionStorage");
	parameterizedTest(LocalStorageConnector, LocalStorageWriteConnector, "localStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

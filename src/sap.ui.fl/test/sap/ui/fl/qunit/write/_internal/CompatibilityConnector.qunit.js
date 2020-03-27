/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	CompatibilityConnector,
	JsObjectConnector,
	ObjectStorageUtils,
	WriteStorage,
	Layer,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oTestData = { fileName: "id_1445501120486_25", fileType: "change", changeType: "hideControl", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: {}, selector: { id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }, layer: Layer.CUSTOMER, texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };
	var oTestDataNew = JSON.parse(JSON.stringify(oTestData));
	oTestDataNew.content.isNewContent = true;

	var aTestData = [
		{ fileName: "id_1449484290389_26", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressStreet", index: 1 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: Layer.CUSTOMER, texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_27", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressZipCode", index: 4 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: Layer.CUSTOMER, texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_28", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus", index: 4 }], targetId: "RTADemoAppMD---detail--GroupGeneralData" }, selector: { id: "RTADemoAppMD---detail--GroupDates" }, layer: Layer.CUSTOMER, texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1540450338001_81", fileType: "change", changeType: "appdescr_ui5_addLibraries", moduleName: "", reference: "sap.ui.rta.test.Demo.md", packageName: "$TMP", content: {libraries: {"sap.ui.comp": {minVersion: "1.48", lazy: false}}}, selector: {}, layer: Layer.CUSTOMER, namespace: "apps/sap.ui.rta.test.Demo.md/changes/", projectId: "sap.ui.rta.test.Demo.md", creation: "", originalLanguage: "EN", conditions: {}, context: "", support: {generator: "Change.createInitialFileContent", service: "", user: "", sapui5Version: "1.59.0-SNAPSHOT", sourceChangeFileName: "", compositeCommand: ""}, oDataInformation: {}, dependentSelector: {}, validAppVersions: {creation: "1.0.0", from: "1.0.0"}, jsOnly: false, variantReference: ""}
	];


	function writeTestDataToStorage() {
		var aPromises = aTestData.map(function(oChange) {
			var sKey = ObjectStorageUtils.createFlexKey(oChange.fileName);
			JsObjectConnector.oStorage.setItem(sKey, oChange);
		});

		return Promise.all(aPromises);
	}

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach: function() {
			JsObjectConnector.oStorage.clear();
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when settings are requested", function (assert) {
			return CompatibilityConnector.loadSettings()
			.then(function (mSettings) {
				assert.ok(mSettings, "something is returned");
				//defaults/JsObjectConnector implementation missing so far
				//assert.equal(mSettings.isProductiveSystem, true, "then some settings are returned");
			});
		});

		QUnit.test("when creating single change, update it and then delete it", function (assert) {
			var sId = ObjectStorageUtils.createFlexKey(oTestData.fileName);
			return CompatibilityConnector.create(oTestData)
			.then(function () {
				assert.ok(JsObjectConnector.oStorage.getItem(sId), "JsObjectConnector got the change");
				return CompatibilityConnector.update(oTestDataNew);
			})
			.then(function () {
				assert.ok(JsObjectConnector.oStorage.getItem(sId).content.isNewContent, "the change content got updated");
				return CompatibilityConnector.deleteChange(oTestDataNew);
			})
			.then(function () {
				assert.notOk(JsObjectConnector.oStorage.getItem(sId), "the change got deleted");
			});
		});

		QUnit.test("when creating single change, update it and then delete it with a transport", function (assert) {
			var sId = ObjectStorageUtils.createFlexKey(oTestData.fileName);
			var oSpyStorageWrite = sandbox.spy(WriteStorage, "write");
			var oSpyStorageUpdate = sandbox.spy(WriteStorage, "update");
			var oSpyStorageRemove = sandbox.spy(WriteStorage, "remove");
			return CompatibilityConnector.create(oTestData, "aTransport")
				.then(function () {
					assert.ok(oSpyStorageWrite.calledOnce, "StorageWrite got called");
					assert.equal(oSpyStorageWrite.getCalls()[0].args[0].transport, "aTransport", "with transport info in the parameter");
					assert.ok(JsObjectConnector.oStorage.getItem(sId), "JsObjectConnector got the change");
					return CompatibilityConnector.update(oTestDataNew, "aTransport");
				})
				.then(function () {
					assert.ok(oSpyStorageUpdate.calledOnce, "StorageWrite got called");
					assert.equal(oSpyStorageUpdate.getCalls()[0].args[0].transport, "aTransport", "with transport info in the parameter");
					assert.ok(JsObjectConnector.oStorage.getItem(sId).content.isNewContent, "the change content got updated");
					return CompatibilityConnector.deleteChange(oTestDataNew, "aTransport");
				})
				.then(function () {
					assert.ok(oSpyStorageRemove.calledOnce, "StorageWrite got called");
					assert.equal(oSpyStorageRemove.getCalls()[0].args[0].transport, "aTransport", "with transport info in the parameter");
					assert.notOk(JsObjectConnector.oStorage.getItem(sId), "the change got deleted");
				});
		});

		QUnit.test("when creating multiple changes at once", function (assert) {
			return CompatibilityConnector.create(aTestData)
				.then(function () {
					assert.equal(numberOfChange(), aTestData.length, "then spot-checking that JsObjectConnector got the changes");
					var sId = ObjectStorageUtils.createFlexKey(aTestData[2].fileName);
					assert.ok(JsObjectConnector.oStorage.getItem(sId), "then spot-checking that JsObjectConnector got the changes");
				});
		});

		QUnit.test("when resetting changes", function (assert) {
			return writeTestDataToStorage()
				.then(function () {
					return CompatibilityConnector.resetChanges({
						reference : oTestData.reference,
						layer : Layer.CUSTOMER
					});
				})
				.then(
					numberOfChange
				)
				.then(function (iNumberOfChanges) {
					assert.equal(iNumberOfChanges, 0, "JsObjectConnector is empty afterwards");
				});
		});

		QUnit.test("when resetting specific changes", function (assert) {
			return writeTestDataToStorage()
				.then(function () {
					return CompatibilityConnector.resetChanges({
						reference : oTestData.reference,
						layer : Layer.CUSTOMER,
						changeTypes : ["moveFields"]
					});
				})
				.then(
					numberOfChange
				)
				.then(function (iNumberOfChanges) {
					assert.equal(iNumberOfChanges, 1, "JsObjectConnector is has only the one not moveFields change afterwards");
				});
		});

		QUnit.test("when asking for flex info", function (assert) {
			return CompatibilityConnector.getFlexInfo({
				sReference : oTestData.reference,
				appVersion: "1.0.0",
				layer: Layer.CUSTOMER
			})
			.then(function (mFlexInfo) {
				assert.equal(mFlexInfo.isResetEnabled, false, "value for reset availability is returned");
				assert.equal(mFlexInfo.isPublishEnabled, undefined, "default value for publish availability is returned");
			});
		});
	});

	function numberOfChange() {
		return Object.keys(JsObjectConnector.oStorage.getItems()).length;
	}

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});

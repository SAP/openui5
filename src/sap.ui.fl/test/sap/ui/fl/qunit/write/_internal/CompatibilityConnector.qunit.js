/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	CompatibilityConnector,
	JsObjectConnector,
	ObjectStorageUtils,
	ApplyStorage,
	WriteStorage,
	FakeLrepConnector,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oTestData = { fileName: "id_1445501120486_25", fileType: "change", changeType: "hideControl", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: {}, selector: { id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };
	var oTestDataNew = JSON.parse(JSON.stringify(oTestData));
	oTestDataNew.content.isNewContent = true;

	var aTestData = [
		{ fileName: "id_1449484290389_26", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressStreet", index: 1 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_27", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressZipCode", index: 4 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_28", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus", index: 4 }], targetId: "RTADemoAppMD---detail--GroupGeneralData" }, selector: { id: "RTADemoAppMD---detail--GroupDates" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1540450338001_81", fileType: "change", changeType: "appdescr_ui5_addLibraries", moduleName: "", reference: "sap.ui.rta.test.Demo.md", packageName: "$TMP", content: {libraries: {"sap.ui.comp": {minVersion: "1.48", lazy: false}}}, selector: {}, layer: "CUSTOMER", namespace: "apps/sap.ui.rta.test.Demo.md/changes/", projectId: "sap.ui.rta.test.Demo.md", creation: "", originalLanguage: "EN", conditions: {}, context: "", support: {generator: "Change.createInitialFileContent", service: "", user: "", sapui5Version: "1.59.0-SNAPSHOT", sourceChangeFileName: "", compositeCommand: ""}, oDataInformation: {}, dependentSelector: {}, validAppVersions: {creation: "1.0.0", from: "1.0.0"}, jsOnly: false, variantReference: ""}
	];

	//var sandbox = sinon.sandbox.create();

	function writeTestDataToStorage() {
		var aPromises = aTestData.map(function(oChange) {
			var sKey = ObjectStorageUtils.createFlexKey(oChange.fileName);
			JsObjectConnector.oStorage.setItem(sKey, oChange);
		});

		return Promise.all(aPromises);
	}

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach : function() {
			JsObjectConnector.oStorage.clear();
		}
	}, function() {
		QUnit.test("and static preload when loading flex data", function (assert) {
			// simulate a component-preload
			jQuery.sap.registerPreloadedModules({
				version : "2.0",
				name : "test.app",
				modules : {
					"test/app/changes/changes-bundle.json" : '[{"dummy":true}]'
				}
			})
			;
			return CompatibilityConnector.loadChanges({name: "test.app", appVersion: "1.0.0", appName: "test.app"}).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

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
						layer : "CUSTOMER"
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
						layer : "CUSTOMER",
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
				layer: "CUSTOMER"
			})
			.then(function (mFlexInfo) {
				assert.equal(mFlexInfo.isResetEnabled, false, "value for reset availability is returned");
				assert.equal(mFlexInfo.isPublishEnabled, undefined, "default value for publish availability is returned");
			});
		});
	});

	QUnit.module("Given methods are overwritten by the FakeLrepConnector", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'loadChanges' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.loadChanges = oFunctionStub;
			var oStorageStub = sandbox.stub(ApplyStorage, "loadFlexData");

			return CompatibilityConnector.loadChanges()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'loadSettings' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.loadSettings = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "loadFeatures");

			return CompatibilityConnector.loadSettings()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'create' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.create = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "write");

			return CompatibilityConnector.create()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'update' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.update = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "update");

			return CompatibilityConnector.update()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'deleteChange' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.deleteChange = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "remove");

			return CompatibilityConnector.deleteChange()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'getFlexInfo' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.getFlexInfo = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "getFlexInfo");

			return CompatibilityConnector.getFlexInfo()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
				});
		});

		QUnit.test("when 'resetChanges' is overwritten by the FakeLrepConnector and the function is called", function (assert) {
			var oFunctionStub = sandbox.stub().callsFake(function () {
				assert.equal(this, FakeLrepConnector.prototype, "then the scope is set correct");
				return Promise.resolve();
			});
			FakeLrepConnector.prototype.resetChanges = oFunctionStub;
			var oStorageStub = sandbox.stub(WriteStorage, "reset");

			return CompatibilityConnector.resetChanges()
				.then(function () {
					assert.equal(oFunctionStub.callCount, 1, "and the registered function was called");
					assert.equal(oStorageStub.callCount, 0, "and the Storage function was NOT called");
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

/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils",
	//"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	LrepConnector,
	JsObjectConnector,
	BrowserStorageUtils,
	//sinon,
	jQuery
) {
	"use strict";

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
			var sKey = BrowserStorageUtils.createChangeKey(oChange.fileName);
			JsObjectConnector.oStorage.setItem(sKey, oChange);
		});

		return Promise.all(aPromises);
	}

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach : function() {
			JsObjectConnector.oStorage.clear();
			this.oConnector = LrepConnector.createConnector();
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
			return this.oConnector.loadChanges({name: "test.app", appVersion: "1.0.0", appName: "test.app"}).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("when settings are requested", function (assert) {
			return this.oConnector.loadSettings()
			.then(function (mSettings) {
				assert.ok(mSettings, "something is returned");
				//defaults/JsObjectConnector implementation missing so far
				//assert.equal(mSettings.isProductiveSystem, true, "then some settings are returned");
			});
		});

		QUnit.test("when creating single change, update it and then delete it", function (assert) {
			var sId = BrowserStorageUtils.createChangeKey(oTestData.fileName);
			return this.oConnector.create(oTestData)
			.then(function () {
				assert.ok(JsObjectConnector.oStorage.getItem(sId), "JsObjectConnector got the change");
				return this.oConnector.update(oTestDataNew);
			}.bind(this))
			.then(function () {
				assert.ok(JsObjectConnector.oStorage.getItem(sId).content.isNewContent, "the change content got updated");
				return this.oConnector.deleteChange(oTestDataNew);
			}.bind(this))
			.then(function () {
				assert.notOk(JsObjectConnector.oStorage.getItem(sId), "the change got deleted");
			});
		});

		QUnit.test("when creating multiple changes at once", function (assert) {
			return this.oConnector.create(aTestData)
			.then(function () {
				assert.equal(numberOfChange(), aTestData.length, "then spot-checking that JsObjectConnector got the changes");
				var sId = BrowserStorageUtils.createChangeKey(aTestData[2].fileName);
				assert.ok(JsObjectConnector.oStorage.getItem(sId), "then spot-checking that JsObjectConnector got the changes");
			});
		});

		QUnit.test("when resetting changes", function (assert) {
			return writeTestDataToStorage()
				.then(function () {
					return this.oConnector.resetChanges({
						sReference : oTestData.reference,
						sLayer : "CUSTOMER"
					});
				}.bind(this))
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
					return this.oConnector.resetChanges({
						sReference : oTestData.reference,
						sLayer : "CUSTOMER",
						aChangeTypes : ["moveFields"]
					});
				}.bind(this))
				.then(
					numberOfChange
				)
				.then(function (iNumberOfChanges) {
					assert.equal(iNumberOfChanges, 1, "JsObjectConnector is has only the one not moveFields change afterwards");
				});
		});

		QUnit.test("when asking for flex info", function (assert) {
			return this.oConnector.getFlexInfo({
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

	function numberOfChange() {
		return Object.keys(JsObjectConnector.oStorage.getItems()).length;
	}

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});

/*global QUnit */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/FakeLrepSessionStorage",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	LrepConnector,
	FakeLrepConnectorSessionStorage,
	FakeLrepSessionStorage,
	Cache,
	ChangePersistenceFactory,
	LayerUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oTestData = { fileName: "id_1445501120486_25", fileType: "change", changeType: "hideControl", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: {}, selector: { id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };

	var aTestData = [
		{ fileName: "id_1449484290389_26", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressStreet", index: 1 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_27", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementGeneralDataAddressZipCode", index: 4 }] }, selector: { id: "RTADemoAppMD---detail--GroupGeneralData" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1449484290389_28", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: { moveFields: [{ id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus", index: 4 }], targetId: "RTADemoAppMD---detail--GroupGeneralData" }, selector: { id: "RTADemoAppMD---detail--GroupDates" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.Demo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } },
		{ fileName: "id_1540450338001_81", fileType: "change", changeType: "appdescr_ui5_addLibraries", moduleName: "", reference: "sap.ui.rta.test.Demo.md", packageName: "$TMP", content: {libraries: {"sap.ui.comp": {minVersion: "1.48", lazy: false}}}, selector: {}, layer: "CUSTOMER", namespace: "apps/sap.ui.rta.test.Demo.md/changes/", projectId: "sap.ui.rta.test.Demo.md", creation: "", originalLanguage: "EN", conditions: {}, context: "", support: {generator: "Change.createInitialFileContent", service: "", user: "", sapui5Version: "1.59.0-SNAPSHOT", sourceChangeFileName: "", compositeCommand: ""}, oDataInformation: {}, dependentSelector: {}, validAppVersions: {creation: "1.0.0", from: "1.0.0"}, jsOnly: false, variantReference: ""}
	];

	QUnit.module("Given I use FakeLrepConnectorStorage", {
		beforeEach: function () {
			FakeLrepConnectorSessionStorage.enableFakeConnector();
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
		},
		afterEach: function () {
			this.oFakeLrepConnectorSessionStorage.deleteChanges();
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when in INITAL status", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.loadChanges("sap.ui.fl.qunit.FakeLrepConnector")
			.then(function (oChanges) {
				assert.equal(oChanges.changes.changes.length, 0, "then no changes are available");
			});
		});

		QUnit.test("when settings are requested", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.loadSettings("sap.ui.fl.qunit.FakeLrepConnector")
			.then(function (oSettings) {
				assert.ok(oSettings);
			});
		});

		QUnit.test("when info are requested", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.getFlexInfo("sap.ui.fl.qunit.FakeLrepConnector")
			.then(function (oInfo) {
				assert.equal(oInfo.isPublishEnabled, false, "Default: isPublishEnabled is false");
				assert.equal(oInfo.isResetEnabled, false, "Default: isResetEnabled is false");
			});
		});

		QUnit.test("when calling resetChanges", function (assert) {
			var oForeignTestData = { fileName: "id_1445501120486_45", fileType: "change", changeType: "hideControl", reference: "sap.ui.rta.test.ForeignDemo.md.Component", packageName: "$TMP", content: {}, selector: { id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.ForeignDemo.md.Component", creation: "", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };
			var aMixedTestData = aTestData.concat([oForeignTestData]);
			var mParams = {
				sReference: aTestData[0].reference,
				sAppVersion: "1.0.0",
				sLayer: aTestData[0].layer,
				sGenerator: "Change.createInitialFileContent"
			};
			var fnDeleteChangeSpy = sandbox.spy(FakeLrepSessionStorage, "deleteChange");

			return this.oFakeLrepConnectorSessionStorage.create(aMixedTestData)
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 5, "Local Storage contains five changes in the beginning");
			})
			.then(this.oFakeLrepConnectorSessionStorage.resetChanges.bind(this.oFakeLrepConnectorSessionStorage, mParams))
			.then(function (aResult) {
				assert.equal(aResult.response.length, 4, "4 changes got returned");
				assert.equal(fnDeleteChangeSpy.callCount, 4, "deleteChange of FakeLrepSessionStorage has been called four times");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 1, "Finally one change is in the Local Storage");
				assert.equal(FakeLrepSessionStorage.getChanges()[0].reference, "sap.ui.rta.test.ForeignDemo.md.Component", "and it is the one with a different reference");
			});
		});

		QUnit.test("when calling resetChanges with selector and changeTypes specified", function (assert) {
			var oForeignTestData = { fileName: "id_1445501120486_45", fileType: "change", changeType: "hideControl", reference: "sap.ui.rta.test.ForeignDemo.md.Component", packageName: "$TMP", content: {}, selector: { id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.ForeignDemo.md.Component", creation: "2018-10-16T08:00:07", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };
			var aMixedTestData = aTestData.concat([oForeignTestData]);
			var mParams = {
				sReference: aTestData[0].reference,
				sAppVersion: "1.0.0",
				sLayer: aTestData[0].layer,
				sGenerator: "Change.createInitialFileContent",
				aSelectorIds: ["RTADemoAppMD---detail--GroupElementDatesShippingStatus", "RTADemoAppMD---detail--GroupGeneralData"],
				aChangeTypes: ["moveFields"]
			};

			var fnDeleteChangeSpy = sandbox.spy(FakeLrepSessionStorage, "deleteChange");

			return this.oFakeLrepConnectorSessionStorage.create(aMixedTestData)
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 5, "Local Storage contains five changes in the beginning");
			})
			.then(this.oFakeLrepConnectorSessionStorage.resetChanges.bind(this.oFakeLrepConnectorSessionStorage, mParams))
			.then(function (aResult) {
				assert.equal(aResult.response.length, 2, "2 changes got returned");
				assert.equal(fnDeleteChangeSpy.callCount, 2, "deleteChange of FakeLrepSessionStorage has been called twice");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 3, "Finally three changes are in the Local Storage");
			});
		});

		QUnit.test("when calling resetChanges with selector and changeTypes specified and a variant change (no selector)", function (assert) {
			var oForeignTestData = { fileName: "id_1445501120486_45", fileType: "change", changeType: "moveFields", reference: "sap.ui.rta.test.Demo.md.Component", packageName: "$TMP", content: {}, layer: "CUSTOMER", texts: {}, namespace: "sap.ui.rta.test.ForeignDemo.md.Component", creation: "2018-10-16T08:00:07", originalLanguage: "EN", conditions: {}, support: { generator: "Change.createInitialFileContent", service: "", user: "" }, validAppVersions: { creation: "1.0.0", from: "1.0.0" } };
			var aMixedTestData = aTestData.concat([oForeignTestData]);
			var mParams = {
				sReference: aTestData[0].reference,
				sAppVersion: "1.0.0",
				sLayer: aTestData[0].layer,
				sGenerator: "Change.createInitialFileContent",
				aSelectorIds: ["RTADemoAppMD---detail--GroupElementDatesShippingStatus", "RTADemoAppMD---detail--GroupGeneralData"],
				aChangeTypes: ["moveFields"]
			};

			var fnDeleteChangeSpy = sandbox.spy(FakeLrepSessionStorage, "deleteChange");

			return this.oFakeLrepConnectorSessionStorage.create(aMixedTestData)
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 5, "Local Storage contains five changes in the beginning");
			})
			.then(this.oFakeLrepConnectorSessionStorage.resetChanges.bind(this.oFakeLrepConnectorSessionStorage, mParams))
			.then(function (aResult) {
				assert.equal(aResult.response.length, 2, "2 changes got returned");
				assert.equal(fnDeleteChangeSpy.callCount, 2, "deleteChange of FakeLrepSessionStorage has been called twice");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 3, "Finally three changes are in the Local Storage");
			});
		});

		QUnit.test("when calling resetChanges in CUSTOMER layer and a USER layer change available", function (assert) {
			var oUserLayerChange = jQuery.extend({}, aTestData[0]);
			oUserLayerChange.layer = "USER";
			oUserLayerChange.fileName = "id_1445501120486_45";
			var aMixedTestData = aTestData.concat([oUserLayerChange]);
			var mParams = {
				sReference: aTestData[0].reference,
				sAppVersion: "1.0.0",
				sLayer: aTestData[0].layer,
				sGenerator: "Change.createInitialFileContent"
			};

			var fnDeleteChangeSpy = sandbox.spy(FakeLrepSessionStorage, "deleteChange");

			return this.oFakeLrepConnectorSessionStorage.create(aMixedTestData)
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 5, "Local Storage contains five changes in the beginning");
			})
			.then(this.oFakeLrepConnectorSessionStorage.resetChanges.bind(this.oFakeLrepConnectorSessionStorage, mParams))
			.then(function (aResult) {
				assert.equal(aResult.response.length, 4, "4 changes got returned");
				assert.equal(fnDeleteChangeSpy.callCount, 4, "deleteChange of FakeLrepSessionStorage has been called four times");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 1, "Finally one change is in the Local Storage");
				assert.equal(FakeLrepSessionStorage.getChanges()[0].layer, "USER", "and it is the one with a different layer");
			});
		});

		QUnit.test("when calling resetChanges in USER layer and a USER layer change available", function (assert) {
			var oUserLayerChange = jQuery.extend({}, aTestData[0]);
			oUserLayerChange.layer = "USER";
			oUserLayerChange.fileName = "id_1445501120486_45";
			var aMixedTestData = aTestData.concat([oUserLayerChange]);
			var mParams = {
				sReference: aTestData[0].reference,
				sAppVersion: "1.0.0",
				sLayer: "USER",
				sGenerator: "Change.createInitialFileContent"
			};

			var fnDeleteChangeSpy = sandbox.spy(FakeLrepSessionStorage, "deleteChange");

			return this.oFakeLrepConnectorSessionStorage.create(aMixedTestData)
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 5, "Local Storage contains five changes in the beginning");
			})
			.then(this.oFakeLrepConnectorSessionStorage.resetChanges.bind(this.oFakeLrepConnectorSessionStorage, mParams))
			.then(function (aResult) {
				assert.equal(aResult.response.length, 1, "1 changes got returned");
				assert.equal(fnDeleteChangeSpy.callCount, 1, "deleteChange of FakeLrepSessionStorage has been called four times");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 4, "Finally three changes are in the Local Storage");
				assert.equal(FakeLrepSessionStorage.getChanges()[0].layer, "CUSTOMER", "and it is in a different layer");
				assert.equal(FakeLrepSessionStorage.getChanges()[1].layer, "CUSTOMER", "and it is in a different layer");
				assert.equal(FakeLrepSessionStorage.getChanges()[2].layer, "CUSTOMER", "and it is in a different layer");
				assert.equal(FakeLrepSessionStorage.getChanges()[3].layer, "CUSTOMER", "and it is in a different layer");
			});
		});

		QUnit.test("when calling loadChanges with already existing changes", function(assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			var mSettings = {};
			FakeLrepConnectorSessionStorage.enableFakeConnector(mSettings);
			var oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			var oLoadChangesSpy = sandbox.spy(FakeLrepSessionStorage, "getChanges");

			return oFakeLrepConnectorSessionStorage.loadChanges({name: "sap.ui.rta.test.Demo.md.Component"}, undefined, aTestData)
			.then(function (oChanges) {
				assert.ok(oLoadChangesSpy.lastCall.args[0], "sap.ui.rta.test.Demo.md.Component", "loadChanges was called with the reference as parameter");
				assert.equal(oChanges.changes.changes.length, 4, "then 4 changes are available");
				FakeLrepConnectorSessionStorage.disableFakeConnector();
			});
		});
	});

	QUnit.module("Given I want to create changes", {
		beforeEach: function () {
			FakeLrepConnectorSessionStorage.enableFakeConnector();
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
		},
		afterEach: function () {
			this.oFakeLrepConnectorSessionStorage.deleteChanges();
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when saving a single change", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.create(oTestData)
			.then(function (oResult) {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 1, "then the Local Storage saves one change.");
				assert.deepEqual(oResult.response, oTestData, "and the change definition is returned as response");
				assert.notEqual(oResult.response.creation, "", "then change creation time is updated");
			});
		});

		QUnit.test("when updating a single change", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.create(oTestData)
			.then(function () {
				//any update on change
				oTestData.layer = "USER";

				return this.oFakeLrepConnectorSessionStorage.update(oTestData);
			}.bind(this))
			.then(function (oResult) {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 1, "then the Local Storage still has one change.");
				assert.deepEqual(oResult.response, FakeLrepSessionStorage.getChange(oTestData.fileName), "and the change definition is updated and updated returned");
				assert.notEqual(oResult.response.creation, "", "then change creation time is updated");
			});
		});

		QUnit.test("when saving four changes", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.create(aTestData)
			.then(function (oResult) {
				var aChangeCreationTime = oResult.response.map(function(oReturnedChange) {
					return new Date(oReturnedChange.creation);
				});
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 4, "then the Local Storage saves four changes.");
				assert.deepEqual(oResult.response, aTestData, "and the change definitions are returned");
				assert.ok(aChangeCreationTime[0] < aChangeCreationTime[1], "then change creation time of the second change is greater than the first change");
				assert.ok(aChangeCreationTime[1] < aChangeCreationTime[2], "then change creation time of the third change is greater then the second change");
				assert.ok(aChangeCreationTime[2] < aChangeCreationTime[3], "then change creation time of the fourth change is greater then the third change");
			});
		});

		QUnit.test("when deleting a change", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.create(aTestData)
			.then(function () {
				this.oFakeLrepConnectorSessionStorage.deleteChange({
					sChangeName: aTestData[0].fileName,
					sLayer: aTestData[0].layer,
					sNamespace: aTestData[0].namespace,
					sChangelist: aTestData[0].packageName
				});
			}.bind(this))
			.then(function () {
				assert.equal(FakeLrepSessionStorage.getNumChanges(), aTestData.length - 1, "then the Local Storage has a change less.");
			});
		});

		QUnit.test("when enabled for 2. time", function (assert) {
			FakeLrepConnectorSessionStorage.enableFakeConnector({ foo: 3 });
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			return this.oFakeLrepConnectorSessionStorage.loadChanges("some.component")
			.then(function (mResult) {
				assert.deepEqual(mResult.changes.settings, {
					isKeyUser: true,
					isAtoAvailable: false,
					isProductiveSystem: false
				}, "then still only the default settings are available, you cannot enable without disable the fake connector");
			});
		});

		QUnit.test("when passed different fl settings", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({
				isAtoAvailable: true
			});
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			return this.oFakeLrepConnectorSessionStorage.loadChanges("some.component")
			.then(function (mResult) {
				assert.deepEqual(mResult.changes.settings, {
					isKeyUser: true,
					isAtoAvailable: true,
					isProductiveSystem: false
				}, "then the settings merged together");
			});
		});

		QUnit.test("when enable then disable fake connector without app component data", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			//enable
			FakeLrepConnectorSessionStorage.enableFakeConnector("dummy path");
			var oConnector = LrepConnector.createConnector();
			assert.deepEqual(Cache.getEntries(), {}, "when enable fake connector, the flex cache is empty");
			assert.notEqual(FakeLrepConnectorSessionStorage.enableFakeConnector.original, undefined, "then original connector is stored");
			assert.ok(FakeLrepConnectorSessionStorage._oFakeInstance instanceof FakeLrepConnectorSessionStorage, "then a fake instance is stored");
			assert.ok(oConnector instanceof FakeLrepConnectorSessionStorage, "new connector will be created with fake instance");

			//then disable
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			oConnector = LrepConnector.createConnector();
			assert.deepEqual(Cache.getEntries(), {}, "when disable fake connector, the flex cache is empty");
			assert.equal(FakeLrepConnectorSessionStorage.enableFakeConnector.original, undefined, "then original connector is erased");
			assert.ok(oConnector instanceof LrepConnector, "new connector will be created with real instance");
			assert.equal(FakeLrepConnectorSessionStorage._oFakeInstance, undefined, "and a stored fake instance is erased");
		});

		QUnit.test("when enable then disable fake connector with app component data", function (assert) {
			assert.expect(15);
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			var sAppComponentName = "testComponent";
			var sAppVersion = "1.2.3";
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
			var fnResetMapStub = sinon.stub(oChangePersistence._oVariantController, "resetMap");
			fnResetMapStub.callsFake(function(bResetAtRuntime) {
				assert.strictEqual(bResetAtRuntime, true, "then the correct parameter was passed to reset variant controller map");
				if (fnResetMapStub.callCount === 2) { // once for enable and then for disable
					assert.ok(true, "then map was reset twice both when fake connector was enabled and disabled");
				}
			});
			//enable
			FakeLrepConnectorSessionStorage.enableFakeConnector("dummy path", sAppComponentName, sAppVersion);
			var oConnector = LrepConnector.createConnector();
			assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {}, "when enable fake connector, the flex cache entry is empty");
			assert.ok(FakeLrepConnectorSessionStorage._oBackendInstances[sAppComponentName][sAppVersion] instanceof LrepConnector, "then real connector instance of correspond change persistence is stored");
			assert.ok(oChangePersistence._oConnector instanceof FakeLrepConnectorSessionStorage, "then the fake connector instance is used for correspond change persistence ");
			assert.notEqual(FakeLrepConnectorSessionStorage.enableFakeConnector.original, undefined, "then original connector is stored");
			assert.ok(FakeLrepConnectorSessionStorage._oFakeInstance instanceof FakeLrepConnectorSessionStorage, "then a fake instance is stored");
			assert.ok(oConnector instanceof FakeLrepConnectorSessionStorage, "new connector will be created with a fake instance");

			//then disable
			FakeLrepConnectorSessionStorage.disableFakeConnector(sAppComponentName, sAppVersion);
			oConnector = LrepConnector.createConnector();
			assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {}, "when disable fake connector, the flex cache is empty");
			assert.ok(oChangePersistence._oConnector instanceof LrepConnector, "then the real connector instance of correspond change persistence is restored");
			assert.equal(FakeLrepConnectorSessionStorage._oBackendInstances[sAppComponentName][sAppVersion], undefined, "and the original stored instance of correspond change persistence is erased");
			assert.equal(FakeLrepConnectorSessionStorage.enableFakeConnector.original, undefined, "then original connector is erased");
			assert.ok(oConnector instanceof LrepConnector, "new connector will be created with real instance");
			assert.equal(FakeLrepConnectorSessionStorage._oFakeInstance, undefined, "and a stored fake instance is erased");

			fnResetMapStub.restore();
		});

		QUnit.test("when _createChangesMap is called with a variant and variantSection is not available", function (assert) {
			var aVariants = [
				{
					fileType: "ctrl_variant",
					fileName: "passed_variant",
					variantManagementReference: "idMain1--variantManagementOrdersTable"
				}
			];
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			var mResult = {
				changes: {}
			};
			mResult = this.oFakeLrepConnectorSessionStorage._createChangesMap(mResult, aVariants);
			assert.ok(mResult.changes.variantSection, "then variantSection created");
			assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants.length, 2, "then 2 variants added");
			assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].content.fileName, "idMain1--variantManagementOrdersTable", "then standard variant added");
			assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[1].content.fileName, aVariants[0].fileName, "then passed variant present");
		});

		QUnit.test("when _getVariantStructure is called", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			var oVariant = {
				fileType: "ctrl_variant"
			};
			var aControlChanges = [
				{
					fileType: "change"
				}
			];
			var mVariantChanges = {
				setTitle: [{
					fileType: "ctrl_variant_change"
				}]
			};
			var mExpectedStructure = {
				content: oVariant,
				controlChanges: aControlChanges,
				variantChanges: mVariantChanges
			};
			var mStructure = this.oFakeLrepConnectorSessionStorage._getVariantStructure(oVariant, aControlChanges, mVariantChanges);
			assert.deepEqual(mStructure, mExpectedStructure, "then variant structure returned");
		});

		QUnit.test("when _getVariantManagementStructure is called", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
			var aVariants = [{
				fileType: "ctrl_variant"
			}];
			var mVariantManagementChanges = {
				setDefault: [{
					fileType: "ctrl_variant_management_change"
				}]
			};
			var mExpectedStructure = {
				variants: aVariants,
				variantManagementChanges: mVariantManagementChanges
			};
			var mStructure = this.oFakeLrepConnectorSessionStorage._getVariantManagementStructure(aVariants, mVariantManagementChanges);
			assert.deepEqual(mStructure, mExpectedStructure, "then variant management structure returned");
		});

		QUnit.test("when loadChanges is called with no existing variant management, with two control changes", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();

			var aControlChanges = [
				{
					fileType: "change",
					variantReference: "varMgmt"
				},
				{
					fileType: "change",
					variantReference: "varMgmt2"
				}
			];
			sandbox.stub(FakeLrepSessionStorage, "getChanges").returns(aControlChanges);

			return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.variantSection["varMgmt"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt"].variants[0].content.fileName, aControlChanges[0].variantReference, "then standard variant created with variant reference of control change");
				assert.equal(mResult.changes.variantSection["varMgmt"].variants[0].controlChanges[0], aControlChanges[0], "then control change added to standard variant");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants[0].content.fileName, aControlChanges[1].variantReference, "then standard variant created with variant reference of control change");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants[0].controlChanges[0], aControlChanges[1], "then control change added to standard variant");
			});
		});

		QUnit.test("when loadChanges is called with no existing variant management, with two variant change", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();

			var aVariantChanges = [{
				fileType: "ctrl_variant_change",
				changeType: "setTitle",
				selector: { id: "varMgmt" }
			}, {
				fileType: "ctrl_variant_change",
				changeType: "setTitle",
				selector: { id: "varMgmt2" }
			}];
			sandbox.stub(FakeLrepSessionStorage, "getChanges").returns(aVariantChanges);

			return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.variantSection["varMgmt"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt"].variants[0].content.fileName, aVariantChanges[0].selector.id, "then standard variant created with variant reference of variant change");
				assert.deepEqual(mResult.changes.variantSection["varMgmt"].variants[0].variantChanges.setTitle, [aVariantChanges[0]], "then variant change added to standard variant");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants[0].content.fileName, aVariantChanges[1].selector.id, "then standard variant created with variant reference of variant change");
				assert.deepEqual(mResult.changes.variantSection["varMgmt2"].variants[0].variantChanges.setTitle, [aVariantChanges[1]], "then variant change added to standard variant");
			});
		});

		QUnit.test("when loadChanges is called with no existing variant management, with two variant management change", function (assert) {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			FakeLrepConnectorSessionStorage.enableFakeConnector({}, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();

			var aVariantManagementChanges = [{
				fileType: "ctrl_variant_management_change",
				changeType: "setDefault",
				selector: { id: "varMgmt" }
			}, {
				fileType: "ctrl_variant_management_change",
				changeType: "setDefault",
				selector: { id: "varMgmt2" }
			}];
			sandbox.stub(FakeLrepSessionStorage, "getChanges").returns(aVariantManagementChanges);

			return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.variantSection["varMgmt"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt"].variants[0].content.fileName, aVariantManagementChanges[0].selector.id, "then standard variant created with selector of variant management change");
				assert.deepEqual(mResult.changes.variantSection["varMgmt"].variantManagementChanges.setDefault, [aVariantManagementChanges[0]], "then variant management change added to standard variant");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants.length, 1, "then standard variant added");
				assert.equal(mResult.changes.variantSection["varMgmt2"].variants[0].content.fileName, aVariantManagementChanges[1].selector.id, "then standard variant created with selector of variant management change");
				assert.deepEqual(mResult.changes.variantSection["varMgmt2"].variantManagementChanges.setDefault, [aVariantManagementChanges[1]], "then variant management change added to standard variant");
			});
		});
	});

	QUnit.module("Given JSON data passed during initiailization of FakeLrepConnectorSessionStorage", {
		beforeEach: function () {
			var mSettings = {};
			mSettings.sInitialComponentJsonPath = jQuery.sap.getModulePath("sap.ui.fl.qunit.testResources") + "/TestFakeVariantLrepResponse.json";
			mSettings.isAtoAvailable = false;
			FakeLrepConnectorSessionStorage.enableFakeConnector(mSettings, "json.component", "1.0.1");
			this.oFakeLrepConnectorSessionStorage = sap.ui.fl.LrepConnector.createConnector();
		},
		afterEach: function () {
			this.oFakeLrepConnectorSessionStorage.deleteChanges();
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when changes are loaded from FakeLrepConnectorSessionStorage only from backend/JSON response", function (assert) {
			return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.changes.length, 3, "then three global changes read from the provided JSON file");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants.length, 3, "then three variant found for variantManagement reference 'variantManagementOrdersTable'");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].variantChanges["setTitle"][0].texts.title.value, "New Variant Title", "setTitle with correct value set in the loadChanges response");
				var aControlChanges = mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].controlChanges;
				assert.equal(aControlChanges[0].fileName, "id_1445501120486_41", "controlChanges are sorted by Layer and creation");
				assert.equal(aControlChanges[1].fileName, "id_1445501120486_43", "controlChanges are sorted by Layer and creation");
				assert.equal(aControlChanges[2].fileName, "id_1445501120486_42", "controlChanges are sorted by Layer and creation");
			});
		});

		QUnit.test("when changes are loaded from FakeLrepConnectorSessionStorage from backend/JSON response & local storage", function (assert) {
			var aLocalStorageChanges = [
				{
					fileType: "change",
					fileName: "Change1",
					creation: "2018-10-16T08:00:08",
					layer: "CUSTOMER"
				}, {
					fileType: "change",
					fileName: "vendorChange",
					creation: "2018-10-16T08:00:04",
					layer: "VENDOR"
				}, {
					fileType: "change",
					fileName: "Change3",
					creation: "2018-10-16T08:00:05",
					layer: "CUSTOMER"
				}, {
					fileType: "ctrl_variant_change",
					fileName: "Change1123",
					selector: { id: "variant0" },
					changeType: "setTitle"
				}, {
					fileType: "ctrl_variant",
					fileName: "Change1123123",
					variantManagementReference: "idMain1--variantManagementOrdersTable"
				}
			];
			sandbox.stub(FakeLrepSessionStorage, "getChanges").returns(aLocalStorageChanges);

			return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.changes.length, 6, "then 6 changes available, 3 from JSON and 3 from local storage");
				assert.equal(mResult.changes.changes[0].fileName, "vendorChange", "changes are sorted by layer and creation");
				assert.equal(mResult.changes.changes[1].fileName, "id_1445501120486_27", "changes are sorted by layer and creation");
				assert.equal(mResult.changes.changes[2].fileName, "id_1445501120486_26", "changes are sorted by layer and creation");
				assert.equal(mResult.changes.changes[3].fileName, "Change3", "changes are sorted by layer and creation");
				assert.equal(mResult.changes.changes[4].fileName, "id_1445501120486_25", "changes are sorted by layer and creation");
				assert.equal(mResult.changes.changes[5].fileName, "Change1", "changes are sorted by layer and creation");

				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants.length, 4, "then 4 variants available, 3 from JSON and 1 from local storage");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].variantChanges["setTitle"].length, 2, "then 2 variant changes available, one from JSON and one from local storage");
			});
		});

		QUnit.test("when a variant change with undefined variantManagement is loaded from local storage", function (assert) {
			var aTestChangeWithoutVMRef = [{
				fileName: "id_1449484290389_36",
				fileType: "ctrl_variant",
				layer: "CUSTOMER"
			}];
			return this.oFakeLrepConnectorSessionStorage.create(aTestChangeWithoutVMRef).then(function () {
				return this.oFakeLrepConnectorSessionStorage.loadChanges("test.json.component")
				.then(function (mResult) {
					assert.equal(mResult.changes.changes.length, 4, "then three global changes from JSON and one newly added variant with undefined variantManagement reference");
					assert.equal(mResult.changes.changes[3].fileName, aTestChangeWithoutVMRef[0].fileName, "then newly added variant added to changes");
					assert.equal(Object.keys(mResult.changes.variantSection).length, 2, "then only 2 pre-defined variantManagement references set, none added for the newly added variant,");
				});
			}.bind(this));
		});

		QUnit.test("when _createChangesMap is called with change variant not existing", function (assert) {
			var mResult = {
				changes: {
					variantSection: {
						varMgmt1: {},
						varMgmt2: {}
					}
				}
			};

			var aVariants = [
				{
					variantManagementReference: "varMgmt3",
					fileName: "fileName3"
				}
			];
			assert.notOk(mResult.changes.variantSection["varMgmt3"], "then no variantManagement exists");
			mResult = this.oFakeLrepConnectorSessionStorage._createChangesMap({}, aVariants);
			assert.ok(mResult.changes.variantSection["varMgmt3"], "then the variantManagement exists");
		});

		QUnit.test("when _createChangesMap is called with variant change already existing", function (assert) {
			var mResult = {
				changes: {
					variantSection: {
						varMgmt1: {
							variants: [
								{
									content: {
										fileName: "ExistingVariant1"
									},
									controlChanges: []
								}
							]
						},
						varMgmt2: {}
					}
				}
			};

			var aVariants = [
				{
					variantManagementReference: "varMgmt1",
					fileName: "ExistingVariant1"
				}
			];
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then one variant already exists");
			mResult = this.oFakeLrepConnectorSessionStorage._createChangesMap(mResult, aVariants);
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then variant not added since a duplicate variant already exists");
		});

		QUnit.test("when _createChangesMap is called with variant change not existing", function (assert) {
			var mResult = {
				changes: {
					variantSection: {
						varMgmt1: {
							variants: [
								{
									content: {
										fileName: "ExistingVariant1"
									},
									controlChanges: []
								}
							]
						},
						varMgmt2: {}
					}
				}
			};

			var aVariants = [
				{
					variantManagementReference: "varMgmt1",
					fileName: "ExistingVariant2"
				}
			];
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then one variant already exists");
			mResult = this.oFakeLrepConnectorSessionStorage._createChangesMap(mResult, aVariants);
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 2, "then variant not added since a duplicate variant already exists");
			assert.ok(Array.isArray(mResult.changes.variantSection["varMgmt1"].variants[1].controlChanges), "then the newly added variant contains changes array");
			assert.ok(typeof mResult.changes.variantSection["varMgmt1"].variants[1].variantChanges === 'object', "then the newly added variant contains variant changes object");
			assert.ok(typeof mResult.changes.variantSection["varMgmt1"].variants[1].content === 'object', "then the newly added variant contains a content object");
		});

		QUnit.test("when _addChangesToMap is called with a mix of changes and variants", function (assert) {
			var mResult = {
				changes: {
					changes: [
						{
							fileName: "Change1",
							variantReference: ""
						}
					],
					variantSection: {
						varMgmt1: {
							variantManagementChanges: {},
							variants: [
								{
									content: {
										fileName: "ExistingVariant1"
									},
									controlChanges: [
										{
											fileName: "Change2",
											variantReference: "varMgmt1"
										}
									],
									variantChanges: {}
								}
							]
						},
						varMgmt2: {
							variants: []
						}
					}
				}
			};

			var aChanges = [
				{
					fileName: "Change3",
					variantReference: "ExistingVariant1"
				},
				{
					fileName: "Change4",
					variantReference: ""
				}
			];

			var aVariantChanges = [
				{
					fileName: "Change5",
					selector: { id: "ExistingVariant1" },
					changeType: "setTitle"
				},
				{
					fileName: "Change6",
					selector: { id: "ExistingVariant1" },
					changeType: "setTitle"
				}
			];

			var aVariantManagementChanges = [
				{
					fileName: "Change7",
					selector: { id: "varMgmt1" },
					changeType: "setDefault"
				}
			];

			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges.length, 1, "then only one change in variant ExistingVariant1");
			assert.equal(mResult.changes.changes.length, 1, "then one global change exists");
			mResult = this.oFakeLrepConnectorSessionStorage._addChangesToMap(mResult, aChanges, aVariantChanges, aVariantManagementChanges);
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges.length, 2, "then two changes exist for variant ExistingVariant1");
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"].length, 2, "then two variant changes exist for variant ExistingVariant1");
			assert.ok(mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"][0].fileName === "Change5", "then both variant changes passed as a parameter exist in order");
			assert.ok(mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"][1].fileName === "Change6", "then both variant changes passed as a parameter exist in order");
			assert.equal(mResult.changes.changes.length, 2, "then two global changes exist");
			assert.equal(mResult.changes.variantSection["varMgmt1"].variantManagementChanges.setDefault[0].fileName, "Change7", "then one setDefault variantManagement exist");
		});

		QUnit.test("when _sortChanges is called with a combination of variants and changes", function (assert) {
			var mResult = {
				changes: {
					changes: [
						{
							fileName: "Change1",
							variantReference: ""
						}
					],
					variantSection: {
						varMgmt1: {
							variantManagementChanges: {
								setDefault: [
									{
										layer: "USER",
										creation: "1995-01-02",
										fileName: "setDefault1",
										selector: {id: "varMgmt1"}
									},
									{
										layer: "USER",
										creation: "1995-01-01",
										fileName: "setDefault2",
										selector: {id: "varMgmt1"}
									},
									{
										layer: "CUSTOMER",
										creation: "1995-01-01",
										fileName: "setDefault3",
										selector: {id: "varMgmt1"}
									},
									{
										layer: "VENDOR",
										creation: "1995-01-02",
										fileName: "setDefault4",
										selector: {id: "varMgmt1"}
									}
								]
							},
							variants: [
								{
									content: {
										fileName: "ExistingVariant1"
									},
									controlChanges: [
										{
											fileName: "Change2",
											variantReference: "varMgmt1"
										}
									],
									variantChanges: {
										setTitle: [
											{
												layer: "USER",
												creation: "1995-01-02",
												fileName: "setTitle1",
												selector: {id: "varMgmt1"}
											},
											{
												layer: "USER",
												creation: "1995-01-01",
												fileName: "setTitle2",
												selector: {id: "varMgmt1"}
											},
											{
												layer: "CUSTOMER",
												creation: "1995-01-01",
												fileName: "setTitle3",
												selector: {id: "varMgmt1"}
											},
											{
												layer: "VENDOR",
												creation: "1995-01-02",
												fileName: "setTitle4",
												selector: {id: "varMgmt1"}
											}
										]
									}
								}
							]
						}
					}
				}
			};

			this.oFakeLrepConnectorSessionStorage._sortChanges(mResult);

			// check sorting of variantManagementChanges
			var aVariantManagementChanges = mResult.changes.variantSection["varMgmt1"].variantManagementChanges["setDefault"];
			assert.strictEqual(aVariantManagementChanges[3].fileName, "setDefault1");
			assert.strictEqual(aVariantManagementChanges[2].fileName, "setDefault2");
			assert.strictEqual(aVariantManagementChanges[1].fileName, "setDefault3");
			assert.strictEqual(aVariantManagementChanges[0].fileName, "setDefault4");

			// check sorting of variantChanges
			var aSetTitleChanges = mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"];
			assert.strictEqual(aSetTitleChanges[3].fileName, "setTitle1");
			assert.strictEqual(aSetTitleChanges[2].fileName, "setTitle2");
			assert.strictEqual(aSetTitleChanges[1].fileName, "setTitle3");
			assert.strictEqual(aSetTitleChanges[0].fileName, "setTitle4");
		});

		QUnit.test("when _assignVariantReferenceChanges with _getReferencedChanges is called with a valid variantReference", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns("CUSTOMER");
			var mResult = {
				changes: {
					changes: [
						{
							fileName: "Change1",
							variantReference: ""
						}
					],
					variantSection: {
						varMgmt1: {
							variants: [
								{
									content: {
										fileName: "ExistingVariant1",
										variantReference: "ExistingVariant2",
										variantManagementReference: "varMgmt1"
									},
									controlChanges: [
										{
											fileName: "Change2",
											variantReference: "ExistingVariant1"
										}
									]
								},
								{
									content: {
										fileName: "ExistingVariant2"
									},
									controlChanges: [
										{
											fileName: "Change3",
											variantReference: "ExistingVariant2",
											layer: "VENDOR"
										},
										{
											fileName: "Change4",
											variantReference: "ExistingVariant2",
											layer: "CUSTOMER"
										}
									]
								}
							]
						}
					}
				}
			};
			var fnGetReferencedChangesSpy = sandbox.spy(this.oFakeLrepConnectorSessionStorage, "_getReferencedChanges");
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges.length, 1, "then initially one change available in ExistingVariant1");
			mResult = this.oFakeLrepConnectorSessionStorage._assignVariantReferenceChanges(mResult);
			assert.strictEqual(fnGetReferencedChangesSpy.returnValues[0][0], mResult.changes.variantSection["varMgmt1"].variants[1].controlChanges[0], "then _getReferencedChanges returned the VENDOR layer referenced change");
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges.length, 2, "then two changes available in ExistingVariant1");
			assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges[0].fileName, "Change3", "then referenced change from ExistingVariant1 in the VENDOR layer is inserted before actual variant changes");
			assert.notOk(mResult.changes.variantSection["varMgmt1"].variants[0].controlChanges.some(function (oChange) {
				return oChange.fileName === "Change4";
			}), "then referenced change from ExistingVariant1 in the CUSTOMER layer is not references");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
/*global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory"
], function(LrepConnector,FakeLrepConnector, FakeLrepConnectorLocalStorage, FakeLrepLocalStorage, Cache, ChangePersistenceFactory) {
	"use strict";
	QUnit.start();


	FakeLrepConnectorLocalStorage.enableFakeConnector();

	var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();

	var oTestData = {"fileName":"id_1445501120486_25","fileType":"change","changeType":"hideControl","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{},"selector":{"id":"RTADemoAppMD---detail--GroupElementDatesShippingStatus"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};

	var aTestData = [{"fileName":"id_1449484290389_26","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementGeneralDataAddressStreet","index":1}]},"selector":{"id":"RTADemoAppMD---detail--GroupGeneralData"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}},{"fileName":"id_1449484290389_27","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementGeneralDataAddressZipCode","index":4}]},"selector":{"id":"RTADemoAppMD---detail--GroupGeneralData"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}},{"fileName":"id_1449484290389_28","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementDatesShippingStatus","index":4}],"targetId":"RTADemoAppMD---detail--GroupGeneralData"},"selector":{"id":"RTADemoAppMD---detail--GroupDates"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}}];

	QUnit.module("Given I use SAP RTA Fake Lrep Connector Local Storage", {

		beforeEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		},
		afterEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when in INITAL status", function(assert) {
		return oFakeLrepConnectorLocalStorage.loadChanges("sap.ui.fl.qunit.FakeLrepConnector")
		.then(function (oChanges) {
			assert.equal(oChanges.changes.changes.length, 0, "then no changes are available");
		});
	});


	QUnit.test("when settings are requested", function(assert) {
		return oFakeLrepConnectorLocalStorage.loadSettings("sap.ui.fl.qunit.FakeLrepConnector")
		.then(function (oSettings) {
			assert.ok(oSettings);
		});
	});


	QUnit.module("Give I want to create changes", {

		beforeEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		},
		afterEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when saving a single change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(oTestData)
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 1, "then the Local Storage saves one change.");
			assert.deepEqual(oResult.response, oTestData, "and the change definition is returned as response");
		});
	});

	QUnit.test("when updating a single change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(oTestData)
		.then(function () {
			//any update on change
			oTestData.layer = "USER";

			return oFakeLrepConnectorLocalStorage.update(oTestData);
		})
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 1, "then the Local Storage still has one change.");
			assert.deepEqual(oResult.response, FakeLrepLocalStorage.getChange(oTestData.fileName), "and the change definition is updated and updated returned");
		});
	});

	QUnit.test("when saving three changes", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(aTestData)
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 3, "then the Local Storage saves three changes.");
			assert.deepEqual(oResult.response, aTestData, "and the change definitions are returned");
		});
	});

	QUnit.test("when deleting a change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(aTestData)
		.then(function () {
			oFakeLrepConnectorLocalStorage.deleteChange({
				sChangeName: aTestData[0].fileName,
				sLayer: aTestData[0].layer,
				sNamespace: aTestData[0].namespace,
				sChangelist: aTestData[0].packageName
			});
		})
		.then(function () {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), aTestData.length - 1, "then the Local Storage has a change less.");
		});
	});

	QUnit.test("when enabled for 2. time", function(assert) {
		FakeLrepConnectorLocalStorage.enableFakeConnector({ foo : 3 });
		var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();
		return oFakeLrepConnectorLocalStorage.loadChanges("some.component")
		.then(function (mResult) {
			assert.deepEqual(mResult.changes.settings, {
				"isKeyUser": true,
				"isAtoAvailable": false,
				"isProductiveSystem": false
			}, "then still only the default settings are available, you cannot enable without diable the fake connector");
		});
	});

	QUnit.test("when passed different fl settings", function(assert) {
		FakeLrepConnectorLocalStorage.disableFakeConnector();
		FakeLrepConnectorLocalStorage.enableFakeConnector({
			isAtoAvailable : true
		});
		var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();
		return oFakeLrepConnectorLocalStorage.loadChanges("some.component")
		.then(function (mResult) {
			assert.deepEqual(mResult.changes.settings, {
				"isKeyUser": true,
				"isAtoAvailable": true,
				"isProductiveSystem": false
			}, "then the settings merged together");
		});
	});

	QUnit.test("when enable then disable fake connector without app component data", function(assert) {
		//enable
		FakeLrepConnectorLocalStorage.enableFakeConnector("dummy path");
		var oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when enable fake connector, the flex cache is empty");
		assert.notEqual(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnectorLocalStorage._oFakeInstance instanceof  FakeLrepConnectorLocalStorage, "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnectorLocalStorage , "new connector will be created with fake instance");

		//then disable
		FakeLrepConnectorLocalStorage.disableFakeConnector();
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when disable fake connector, the flex cache is empty");
		assert.equal(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnectorLocalStorage._oFakeInstance, undefined, "and a stored fake instance is erased");
	});

	QUnit.test("when enable then disable fake connector with app component data", function(assert) {
		var sAppComponentName = "testComponent";
		var sAppVersion = "1.2.3";
		//enable
		FakeLrepConnectorLocalStorage.enableFakeConnector("dummy path", sAppComponentName, sAppVersion);
		var oConnector = LrepConnector.createConnector();
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when enable fake connector, the flex cache entry is empty");
		assert.ok(FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion] instanceof LrepConnector , "then real connector instance of correspond change persistence is stored");
		assert.ok(oChangePersistence._oConnector instanceof FakeLrepConnectorLocalStorage , "then the fake connector instance is used for correspond change persistence ");
		assert.notEqual(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnectorLocalStorage._oFakeInstance instanceof  FakeLrepConnectorLocalStorage, "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnectorLocalStorage , "new connector will be created with a fake instance");

		//then disable
		FakeLrepConnectorLocalStorage.disableFakeConnector(sAppComponentName, sAppVersion);
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when disable fake connector, the flex cache is empty");
		assert.ok(oChangePersistence._oConnector instanceof LrepConnector , "then the real connector instance of correspond change persistence is restored");
		assert.equal(FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion], undefined , "and the original stored instance of correspond change persistence is erased");
		assert.equal(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnectorLocalStorage._oFakeInstance, undefined, "and a stored fake instance is erased");
	});

});

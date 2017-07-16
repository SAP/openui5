/*global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory"
], function(LrepConnector,FakeLrepConnector, Cache, ChangePersistenceFactory) {
	"use strict";
	QUnit.start();

	var oFakeLrepConnector = new FakeLrepConnector("Dummy path");

	var oTestData = {"fileName":"id_1445501120486_25","fileType":"change","changeType":"hideControl","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{},"selector":{"id":"RTADemoAppMD---detail--GroupElementDatesShippingStatus"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};

	QUnit.module("Given an instance of FakeLrepConnector", {
		beforeEach : function(assert) {
		},
		afterEach : function(assert) {
		}
	});

	QUnit.test("when create change which is not variant", function(assert) {
		return oFakeLrepConnector.create(oTestData, "testChangeList", false).then(function(result){
			assert.equal(result, undefined , "then nothing returned.");
		});
	});

	QUnit.test("when create change which is variant and no creation date available", function(assert) {
		var oPayload = oTestData;
		oPayload.creation = undefined;
		return oFakeLrepConnector.create(oPayload, "testChangeList", true).then(function(result){
			assert.notEqual(result.response.creation, undefined , "then a new date was created.");
		});
	});

	QUnit.test("when create change which is variant and a creation date available", function(assert) {
		return oFakeLrepConnector.create(oTestData, "testChangeList", true).then(function(result){
			assert.deepEqual(result.response, oTestData , "then an exact payload was returned.");
			assert.equal(result.status, 'success' , "successfully.");
		});
	});

	QUnit.test("when update change which is not variant", function(assert) {
		return oFakeLrepConnector.update(oTestData, "testChangeName", "testChangeList", false).then(function(result){
			assert.equal(result, undefined , "then nothing returned.");
		});
	});

	QUnit.test("when update change which is variant", function(assert) {
		return oFakeLrepConnector.update(oTestData, "testChangeName", "testChangeList", true).then(function(result){
			assert.deepEqual(result.response, oTestData , "then an exact payload was returned.");
			assert.equal(result.status, 'success' , "successfully.");
		});
	});

	QUnit.test("when delete change which is not variant", function(assert) {
		return oFakeLrepConnector.deleteChange("testParams", false).then(function(result){
			assert.equal(result, undefined , "then nothing returned.");
		});
	});

	QUnit.test("when delete change which is variant", function(assert) {
		return oFakeLrepConnector.deleteChange("testParams", true).then(function(result){
			assert.deepEqual(result.response, undefined , "then undefined response was returned.");
			assert.equal(result.status, 'nocontent' , "with nocontent status.");
		});
	});

	QUnit.test("when enable fake connector for an app component change which is variant", function(assert) {
		return oFakeLrepConnector.deleteChange("testParams", true).then(function(result){
			assert.deepEqual(result.response, undefined , "then undefined response was returned.");
			assert.equal(result.status, 'nocontent' , "with nocontent status.");
		});
	});

	QUnit.module("Testing static functions of FakeLrepConnector", {
		beforeEach : function(assert) {
		},
		afterEach : function(assert) {
		}
	});

	QUnit.test("when enable then disable fake connector without app component data", function(assert) {
		//enable
		FakeLrepConnector.enableFakeConnector("dummy path");
		var oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when enable fake connector, the flex cache is empty");
		assert.notEqual(FakeLrepConnector.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnector._oFakeInstance instanceof FakeLrepConnector , "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnector , "new connector will be created with fake instance");

		//then disable
		FakeLrepConnector.disableFakeConnector();
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when disable fake connector, the flex cache is empty");
		assert.equal(FakeLrepConnector.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnector._oFakeInstance, undefined, "and a stored fake instance is erased");
	});

	QUnit.test("when enable then disable fake connector with app component data", function(assert) {
		var sAppComponentName = "testComponent";
		var sAppVersion = "1.2.3";
		//enable
		FakeLrepConnector.enableFakeConnector("dummy path", sAppComponentName, sAppVersion);
		var oConnector = LrepConnector.createConnector();
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when enable fake connector, the flex cache entry is empty");
		assert.ok(FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion] instanceof LrepConnector , "then real connector instance of correspond change persistence is stored");
		assert.ok(oChangePersistence._oConnector instanceof FakeLrepConnector , "then the fake connector instance is used for correspond change persistence ");
		assert.notEqual(FakeLrepConnector.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnector._oFakeInstance instanceof  FakeLrepConnector, "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnector , "new connector will be created with a fake instance");

		//then disable
		FakeLrepConnector.disableFakeConnector(sAppComponentName, sAppVersion);
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when disable fake connector, the flex cache is empty");
		assert.ok(oChangePersistence._oConnector instanceof LrepConnector , "then the real connector instance of correspond change persistence is restored");
		assert.equal(FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion], undefined , "and the original stored instance of correspond change persistence is erased");
		assert.equal(FakeLrepConnector.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnector._oFakeInstance, undefined, "and a stored fake instance is erased");
	});
});

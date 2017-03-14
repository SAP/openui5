/*global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage"
], function(LrepConnector,FakeLrepConnector, FakeLrepConnectorLocalStorage, FakeLrepLocalStorage) {
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
			oFakeLrepConnectorLocalStorage.deleteChange(aTestData[0]);
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

});

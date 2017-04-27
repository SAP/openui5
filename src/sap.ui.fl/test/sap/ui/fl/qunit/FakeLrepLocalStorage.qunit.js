/*global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require(["sap/ui/fl/FakeLrepLocalStorage"], function(FakeLrepLocalStorage){
	"use strict";
	QUnit.start();

	var oTestData = {};

	oTestData.oChange1 = {"fileName":"id_1445501120486_25","fileType":"change","changeType":"hideControl","component":"sap.ui.fl.test.Demo.md.Component","packageName":"$TMP","content":{},"selector":{"id":"FLDemoAppMD---detail--GroupElementDatesShippingStatus"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.fl.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};

	oTestData.oChange2 = {"fileName":"id_1445517849455_16","fileType":"change","changeType":"addField","component":"sap.ui.fl.test.Demo.Component","packageName":"$TMP","content":{"field":{"value":"SalesOrderId","valueProperty":"value","id":"FLDemoApp---detail--GroupDates_SalesOrder_SalesOrderId","jsType":"sap.ui.comp.smartfield.SmartField","index":4}},"selector":{"id":"FLDemoApp---detail--GroupDates"},"layer":"CUSTOMER","texts":{"fieldLabel":{"value":"Sales Order ID","type":"XFLD"}},"namespace":"sap.ui.fl.test.Demo.Component","creation":"","originalLanguage":"DE","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};

	oTestData.sChangeId1 = oTestData.oChange1.fileName;
	oTestData.sChangeId2 = oTestData.oChange2.fileName;

	QUnit.module("Given I use SAP Fake Lrep Local Storage", {
		beforeEach : function() {
			FakeLrepLocalStorage.deleteChanges();
		},
		afterEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when in INITAL status", function(assert) {

		var aInitalChanges = FakeLrepLocalStorage.getChanges();

		assert.equal(aInitalChanges.length, 0, "there are no inital changes");
	});

	QUnit.test("when I want to prefix the change ID", function(assert) {

		var sChangeId = "id_1445501120486_25",
			sPrefixedChangeId = "sap.ui.fl.change.id_1445501120486_25";

		assert.equal(FakeLrepLocalStorage.createChangeKey(sChangeId), sPrefixedChangeId, "the change ID was prefixed");
	});


	QUnit.module("Given I have SAP Lrep local changes...", {
		beforeEach : function() {

			FakeLrepLocalStorage.deleteChanges();

			FakeLrepLocalStorage.saveChange(oTestData.sChangeId1, oTestData.oChange1);
			FakeLrepLocalStorage.saveChange(oTestData.sChangeId2, oTestData.oChange2);
		},
		afterEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when I save and receive changes", function(assert) {

		var oParsedChange1FromGetChange;

		// act
		oParsedChange1FromGetChange = FakeLrepLocalStorage.getChange(oTestData.sChangeId1);

		// assert
		assert.equal(FakeLrepLocalStorage.getNumChanges(), 2, "then after saving there should be 2 changes");
		assert.deepEqual(oTestData.oChange1, oParsedChange1FromGetChange, "then the first saved and retrieved change should be the same");
		assert.equal(FakeLrepLocalStorage.getChanges().length, 2, "then the received change array has 2 entries");
	});

	QUnit.test("when I delete a specific change", function(assert) {

		// act
		FakeLrepLocalStorage.deleteChange(oTestData.sChangeId1);

		// assert
		assert.equal(FakeLrepLocalStorage.getNumChanges(), 1, "then after deleting 1 change, there schould be 1 change");
		assert.equal(FakeLrepLocalStorage.getChange(oTestData.sChangeId1), undefined, "then if I try to get the deleted change it schould be undefined");
	});

	QUnit.test("when I delete all changes", function(assert) {

		// act
		FakeLrepLocalStorage.deleteChanges();

		// assert
		assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "then after deleting everything there schould be 0 changes");
		assert.equal(FakeLrepLocalStorage.getChanges().length, 0, "then after deleting everything the changes array should contain 0 changes");
	});

	QUnit.test("when I attach modify callbacks", function(assert) {
		assert.expect(3);

		var fnDeleteCallback = function(){
			assert.ok(true,"Callback called after delete");
		};
		var fnSaveCallback = function(){
			assert.ok(true,"Callback called after save changes");
		};

		FakeLrepLocalStorage.attachModifyCallback(fnDeleteCallback);
		FakeLrepLocalStorage.deleteChanges();
		FakeLrepLocalStorage.deleteChange();

		FakeLrepLocalStorage.attachModifyCallback(fnSaveCallback);
		FakeLrepLocalStorage.detachModifyCallback(fnDeleteCallback);
		FakeLrepLocalStorage.saveChange(oTestData.sChangeId1, oTestData.oChange1);

		FakeLrepLocalStorage.detachModifyCallback(fnSaveCallback);
	});
});

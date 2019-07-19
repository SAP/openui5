/*global QUnit */

sap.ui.define([
	"sap/ui/fl/FakeLrepSessionStorage",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	FakeLrepSessionStorage,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oTestData = {};
	oTestData.oChange1 = {fileName:"id_1445501120486_25", fileType:"change", changeType:"hideControl", reference:"sap.ui.fl.test.Demo.md", component:"sap.ui.fl.test.Demo.md.Component", packageName:"$TMP", content:{}, selector:{id:"FLDemoAppMD---detail--GroupElementDatesShippingStatus"}, layer:"CUSTOMER", texts:{}, namespace:"sap.ui.fl.test.Demo.md.Component", creation:"", originalLanguage:"EN", conditions:{}, support:{generator:"Change.createInitialFileContent", service:"", user:""}};
	oTestData.oChange2 = {fileName:"id_1445517849455_16", fileType:"change", changeType:"addField", reference:"sap.ui.fl.test.Demo.Component", component:"sap.ui.fl.test.Demo.Component", packageName:"$TMP", content:{field:{value:"SalesOrderId", valueProperty:"value", id:"FLDemoApp---detail--GroupDates_SalesOrder_SalesOrderId", jsType:"sap.ui.comp.smartfield.SmartField", index:4}}, selector:{id:"FLDemoApp---detail--GroupDates"}, layer:"USER", texts:{fieldLabel:{value:"Sales Order ID", type:"XFLD"}}, namespace:"sap.ui.fl.test.Demo.Component", creation:"", originalLanguage:"DE", conditions:{}, support:{generator:"Change.createInitialFileContent", service:"", user:""}};
	oTestData.oChange3 = {fileName:"id_1445517849455_17", fileType:"change", changeType:"addField", reference:"sap.ui.fl.test.Demo", component:"sap.ui.fl.test.Demo.Component", packageName:"$TMP", content:{field:{value:"SalesOrderId", valueProperty:"value", id:"FLDemoApp---detail--GroupDates_SalesOrder_SalesOrderId", jsType:"sap.ui.comp.smartfield.SmartField", index:4}}, selector:{id:"FLDemoApp---detail--GroupDates"}, layer:"CUSTOMER", texts:{fieldLabel:{value:"Sales Order ID", type:"XFLD"}}, namespace:"sap.ui.fl.test.Demo.Component", creation:"", originalLanguage:"DE", conditions:{}, support:{generator:"Change.createInitialFileContent", service:"", user:""}};
	oTestData.oVariant1 = {fileName:"id_1445501120486_27", fileType: "ctrl_variant", variantManagementReference:"dummy"};

	oTestData.sChangeId1 = oTestData.oChange1.fileName;
	oTestData.sChangeId2 = oTestData.oChange2.fileName;
	oTestData.sChangeId3 = oTestData.oChange3.fileName;
	oTestData.sVariantId1 = oTestData.oVariant1.fileName;

	QUnit.module("Given I use SAP Fake Lrep Local Storage", {
		beforeEach : function() {
			FakeLrepSessionStorage.deleteChanges();
		},
		afterEach : function() {
			sandbox.restore();
			FakeLrepSessionStorage.deleteChanges();
		}
	}, function() {
		QUnit.test("when in INITAL status", function(assert) {
			var aInitalChanges = FakeLrepSessionStorage.getChanges();

			assert.equal(aInitalChanges.length, 0, "there are no inital changes");
		});

		QUnit.test("when I want to prefix change and variant IDs", function(assert) {
			var sChangeId = "id_1445501120486_25";
			var sPrefixedChangeId = "sap.ui.fl.change.id_1445501120486_25";
			var sPrefixedVariantId = "sap.ui.fl.variant.id_1445501120486_25";

			assert.equal(FakeLrepSessionStorage.createChangeKey(sChangeId), sPrefixedChangeId, "the change ID was prefixed");
			assert.equal(FakeLrepSessionStorage.createVariantKey(sChangeId), sPrefixedVariantId, "the variant ID was prefixed");
		});
	});

	QUnit.module("Given I have SAP Lrep local changes...", {
		beforeEach : function() {
			FakeLrepSessionStorage.deleteChanges();

			FakeLrepSessionStorage.saveChange(oTestData.sChangeId1, oTestData.oChange1);
			FakeLrepSessionStorage.saveChange(oTestData.sChangeId2, oTestData.oChange2);
			FakeLrepSessionStorage.saveChange(oTestData.sChangeId3, oTestData.oChange3);
			FakeLrepSessionStorage.saveChange(oTestData.sVariantId1, oTestData.oVariant1);
		},
		afterEach : function() {
			sandbox.restore();
			FakeLrepSessionStorage.deleteChanges();
		}
	}, function() {
		QUnit.test("when I save and receive changes", function(assert) {
			var oParsedChange1FromGetChange;
			oParsedChange1FromGetChange = FakeLrepSessionStorage.getChange(oTestData.sChangeId1);

			assert.equal(FakeLrepSessionStorage.getNumChanges(), 4, "then after saving there should be 4 changes");
			assert.deepEqual(oTestData.oChange1, oParsedChange1FromGetChange, "then the first saved and retrieved change should be the same");
			assert.equal(FakeLrepSessionStorage.getChanges().length, 4, "then the received change array has 4 entries");

			assert.equal(FakeLrepSessionStorage.getChanges("sap.ui.fl.test.Demo.Component").length, 2, "then the received change array has 2 entries");
			assert.equal(FakeLrepSessionStorage.getChanges("sap.ui.fl.test.Demo.Component", "USER").length, 1, "then the received change array has 1 entry");
		});

		QUnit.test("when I delete a specific change", function(assert) {
			FakeLrepSessionStorage.deleteChange(oTestData.sChangeId1);

			assert.equal(FakeLrepSessionStorage.getNumChanges(), 3, "then after deleting 1 change, there schould be 3 changes");
			assert.equal(FakeLrepSessionStorage.getChange(oTestData.sChangeId1), undefined, "then if I try to get the deleted change it schould be undefined");
		});

		QUnit.test("when I delete a specific variant change", function(assert) {
			FakeLrepSessionStorage.deleteChange(oTestData.sVariantId1);

			assert.equal(FakeLrepSessionStorage.getNumChanges(), 3, "then after deleting 1 variant change, there schould be 3 changes");
			assert.equal(FakeLrepSessionStorage.getChange(oTestData.sVariantId1), undefined, "then if I try to get the deleted change it schould be undefined");
		});

		QUnit.test("when I delete all changes", function(assert) {
			FakeLrepSessionStorage.deleteChanges();

			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "then after deleting everything there schould be 0 changes");
			assert.equal(FakeLrepSessionStorage.getChanges().length, 0, "then after deleting everything the changes array should contain 0 changes");
		});

		QUnit.test("when I attach modify callbacks", function(assert) {
			assert.expect(3);

			var fnDeleteCallback = function() {
				assert.ok(true, "Callback called after delete");
			};
			var fnSaveCallback = function() {
				assert.ok(true, "Callback called after save changes");
			};

			FakeLrepSessionStorage.attachModifyCallback(fnDeleteCallback);
			FakeLrepSessionStorage.deleteChanges();
			FakeLrepSessionStorage.deleteChange();

			FakeLrepSessionStorage.attachModifyCallback(fnSaveCallback);
			FakeLrepSessionStorage.detachModifyCallback(fnDeleteCallback);
			FakeLrepSessionStorage.saveChange(oTestData.sChangeId1, oTestData.oChange1);

			FakeLrepSessionStorage.detachModifyCallback(fnSaveCallback);
		});

		QUnit.test("when I call saveChange for a change", function(assert) {
			sandbox.stub(FakeLrepSessionStorage, "_callModifyCallbacks");
			var oCreateChangeKeySpy = sandbox.stub(FakeLrepSessionStorage, "createChangeKey");
			FakeLrepSessionStorage.saveChange(oTestData.sChangeId1, oTestData.oChange1);
			assert.ok(oCreateChangeKeySpy.calledOnce, "then createChangeKey called once");
		});

		QUnit.test("when I call saveChange for a variant", function(assert) {
			sandbox.stub(FakeLrepSessionStorage, "_callModifyCallbacks");
			var oCreateVariantKeySpy = sandbox.stub(FakeLrepSessionStorage, "createVariantKey");
			FakeLrepSessionStorage.saveChange(oTestData.sVariantId1, oTestData.oVariant1);
			assert.ok(oCreateVariantKeySpy.calledOnce, "then createVariantKey called once");
		});
	});

	QUnit.module("setStorage", {
		beforeEach: function() {
			FakeLrepSessionStorage.deleteChanges();
		},
		afterEach: function() {
			FakeLrepSessionStorage.deleteChanges();
			// reset to the normal sessionStorage
			FakeLrepSessionStorage.setStorage(window.sessionStorage);
		}
	}, function() {
		QUnit.test("when I call setStorage with a mock Storage", function(assert) {
			assert.expect(1);
			var oMockStorage = {
				getItem: function() {
					assert.ok(true, "the new storage is used");
					return '{"change":"a"}';
				}
			};
			FakeLrepSessionStorage.setStorage(oMockStorage);
			FakeLrepSessionStorage.getChange("change");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});

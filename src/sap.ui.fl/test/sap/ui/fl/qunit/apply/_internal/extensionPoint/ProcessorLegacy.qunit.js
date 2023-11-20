/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/extensionPoint/Registry",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Component,
	ComponentContainer,
	ExtensionPoint,
	ExtensionPointProcessor,
	ExtensionPointRegistry,
	ChangePersistenceFactory,
	AddXMLAtExtensionPoint,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);
	var sandbox = sinon.createSandbox();
	var SYNC = true;
	var ASYNC = false;

	// UI Construction
	var oComponent;
	var oComponentContainer;
	var oSpyApplyExtensionPoint;
	var oSpyAddXMLAtExtensionPointApply;
	var oSpyRegisterExtensionPoint;

	async function createComponentAndContainer(bSync) {
		oSpyApplyExtensionPoint = sandbox.spy(ExtensionPointProcessor, "applyExtensionPoint");
		oSpyAddXMLAtExtensionPointApply = sandbox.spy(AddXMLAtExtensionPoint, "applyChange");
		oSpyRegisterExtensionPoint = sandbox.spy(ExtensionPointRegistry, "registerExtensionPoint");

		if (bSync) {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "sap.ui.fl.qunit.extensionPoint.testApp",
				{changes: createChanges("sap.ui.fl.qunit.extensionPoint.testAppLegacy")});
			oComponent = sap.ui.component({ // legacy-relevant: Sync creation of component
				name: "sap.ui.fl.qunit.extensionPoint.testAppLegacy",
				id: "sap.ui.fl.qunit.extensionPoint.testAppLegacy",
				async: false
			});
			oComponentContainer = new ComponentContainer({
				component: oComponent
			});
			oComponentContainer.placeAt("content");
			return oComponent.getRootControl().byId("async").loaded();
		}

		await FlQUnitUtils.initializeFlexStateWithData(sandbox, "sap.ui.fl.qunit.extensionPoint.testApp",
			{changes: createChanges("sap.ui.fl.qunit.extensionPoint.testAppLegacy.async")});
		oComponent = await Component.create({
			name: "sap.ui.fl.qunit.extensionPoint.testAppLegacy",
			id: "sap.ui.fl.qunit.extensionPoint.testAppLegacy.async",
			componentData: {}
		});
		oComponentContainer = oComponent.runAsOwner(function() {
			return new ComponentContainer({
				component: oComponent
			});
		});
		oComponentContainer.placeAt("content");
		await oComponent.getRootControl().loaded();
		return oComponent.getRootControl().byId("async").loaded();
	}

	function createChanges(sReference) {
		function createPoint(sEpName, sViewName, sLayer, sCreation) {
			return {
				fileName: `${sReference}_${sEpName}_${sViewName}_${sLayer}_addXMLAtExtensionPoint`,
				fileType: "change",
				changeType: "addXMLAtExtensionPoint",
				moduleName: `sap/ui/fl/qunit/extensionPoint/testAppLegacy/fragments/${sEpName}_${sLayer}.fragment.xml`,
				reference: sReference,
				content: {
					fragmentPath: `fragments/${sEpName}_${sLayer}.fragment.xml`
				},
				creation: sCreation || "",
				projectId: "testProject",
				selector: {
					name: sEpName,
					viewSelector: { id: `${sReference}---mainView--${sViewName}`, idIsLocal: false}
				},
				layer: sLayer,
				support: {},
				namespace: "apps/sap.ui.fl.qunit.extensionPoint.testAppLegacy/changes"
			};
		}
		return [
			createPoint("EP1", "sync", "VENDOR", "2018-02-25T15:35:49.705Z"),
			createPoint("EP1", "async", "VENDOR", "2019-02-25T15:35:49.705Z"),
			createPoint("EP3", "sync", "VENDOR", "2022-02-25T15:35:49.705Z"),
			createPoint("EP3", "async", "VENDOR", "2023-02-25T15:35:49.705Z"),
			createPoint("EP4", "sync", "VENDOR", "2024-02-25T15:35:49.705Z"),
			createPoint("EP4", "async", "VENDOR", "2025-02-25T15:35:49.705Z"),
			createPoint("EP5", "sync", "VENDOR", "2026-02-25T15:35:49.705Z"),
			createPoint("EP5", "async", "VENDOR", "2027-02-25T15:35:49.705Z"),
			createPoint("EP8_inner", "sync", "VENDOR", "2028-02-25T15:35:49.705Z"),
			createPoint("EP8_inner", "async", "VENDOR", "2029-02-25T15:35:49.705Z"),
			createPoint("EP10_inner", "sync", "VENDOR", "2030-02-25T15:35:49.705Z"),
			createPoint("EP10_inner", "async", "VENDOR", "2031-02-25T15:35:49.705Z"),
			createPoint("EP1", "sync", "CUSTOMER_BASE", "2020-02-25T15:35:49.705Z"),
			createPoint("EP1", "async", "CUSTOMER_BASE", "2021-02-25T15:35:49.705Z")
		];
	}

	function destroyComponentAndContainer() {
		oComponent.destroy();
		oComponentContainer.destroy();
		sandbox.restore();
	}

	function check(bSync, assert) {
		var done = assert.async();
		var oView = oComponent.getRootControl();
		var sReference = bSync ? "sap.ui.fl.qunit.extensionPoint.testAppLegacy" : "sap.ui.fl.qunit.extensionPoint.testAppLegacy.async";
		var checkView = function(sView) {
			var aPanelContent = oView.byId(sView).byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 27, `ExtensionPoint content added to${sView} view`);
			assert.strictEqual(aPanelContent[0].getId(), `${sReference}---mainView--${sView}--button1`, "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), `${sReference}---mainView--${sView}--testProject.customButton1`, "EP1 content is in correct order"); // EP1_CUSTOMER_BASE
			assert.strictEqual(aPanelContent[2].getId(), `${sReference}---mainView--${sView}--testProject.customButton2`, "EP1 content is in correct order"); // EP1_CUSTOMER_BASE
			assert.strictEqual(aPanelContent[3].getId(), `${sReference}---mainView--${sView}--testProject.customButton3`, "EP1 content is in correct order"); // EP1_VENDOR
			assert.strictEqual(aPanelContent[4].getId(), `${sReference}---mainView--${sView}--testProject.customButton4`, "EP1 content is in correct order"); // EP1_VENDOR
			assert.strictEqual(aPanelContent[5].getId(), `${sReference}---mainView--${sView}--defaultFragment--defaultButton`, "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[6].getId(), `${sReference}---mainView--${sView}--button2`, "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[7].getId(), `${sReference}---mainView--${sView}--testProject.customButton5`, "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[8].getId(), `${sReference}---mainView--${sView}--testProject.customButton6`, "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[9].getId(), `${sReference}---mainView--${sView}--testProject.customButton7`, "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[10].getId(), `${sReference}---mainView--${sView}--button3`, "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[11].getId(), `${sReference}---mainView--${sView}--button4`, "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[12].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint1.customButton8`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[13].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint1.customButton9`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[14].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint1.customButton10`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[15].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint2.customButton8`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[16].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint2.customButton9`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[17].getId(), `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint2.customButton10`, "EP4 content is in correct order"); // EP4_VENDOR
			assert.strictEqual(aPanelContent[18].getId(), `${sReference}---mainView--${sView}--fragmentWithExtensionPoint3--customTable`, "EP5 content is in correct order"); // EP5_VENDOR
			assert.strictEqual(aPanelContent[19].getId(), `${sReference}---mainView--${sView}--button5`, "EP6_outer and EP7_innner content is in correct order"); // EP6_outer EP7_inner
			assert.strictEqual(aPanelContent[20].getId(), `${sReference}---mainView--${sView}--testProject.EP8_inner_Button11`, "EP6_outer and EP7_innner and EP8_inner content is in correct order"); // EP6_outer EP7_inner EP8_inner_VENDOR
			assert.strictEqual(aPanelContent[21].getId(), `${sReference}---mainView--${sView}--testProject.EP8_inner_Button12`, "EP6_outer and EP7_innner and EP8_inner content is in correct order"); // EP6_outer EP7_inner EP8_inner_VENDOR
			assert.strictEqual(aPanelContent[22].getId(), `${sReference}---mainView--${sView}--EPinEPButton8`, "EP6_outer and EP7_innner and EP9_inner content is in correct order"); // EP6_outer EP7_inner EP8_inner_VENDOR
			assert.strictEqual(aPanelContent[23].getId(), `${sReference}---mainView--${sView}--testProject.EP10_inner_Button13`, "EP6_outer and EP7_innner and EP8_inner content is in correct order"); // EP6_outer EP7_inner EP8_inner_VENDOR
			assert.strictEqual(aPanelContent[24].getId(), `${sReference}---mainView--${sView}--testProject.EP10_inner_Button14`, "EP6_outer and EP7_innner and EP8_inner content is in correct order"); // EP6_outer EP7_inner EP8_inner_VENDOR
			assert.strictEqual(aPanelContent[25].getId(), `${sReference}---mainView--${sView}--button7`, "EP6_outer and EP7_innner content is in correct order"); // EP6_outer EP7_inner_VENDOR
			assert.strictEqual(aPanelContent[26].getId(), `${sReference}---mainView--${sView}--button8`, "EP6-outer content is in correct order"); // EP6-outer EP7-inner_VENDOR

			var aTableItems = oView.byId(sView).byId("fragmentWithExtensionPoint3--customTable").getItems();
			var aTableCells = aTableItems[0].getCells();
			assert.strictEqual(aTableCells.length, 2, `ExtensionPoint default content added to${sView} view into aggregation binding template`);
			var sCellPrefix = `${sReference}---mainView--${sView}--testProject.fragmentWithExtensionPoint3.`;
			var sTemplatePrefix = `${sReference}---mainView--${sView}--fragmentWithExtensionPoint3--`;
			assert.strictEqual(aTableCells[0].getId(), `${sTemplatePrefix}customListCellContent-${sTemplatePrefix}customTable-0`, "table item is in correct order"); // Main
			assert.strictEqual(aTableCells[1].getId(), `${sCellPrefix}EP5_FRAGMENT_TEXT_ID-${sTemplatePrefix}customTable-0`, "table item is in correct order"); // Main
		};

		var checkChangesContent = function(sReference) {
			var mChanges = ChangePersistenceFactory._instanceCache["sap.ui.fl.qunit.extensionPoint.testAppLegacy"]._mChangesEntries;
			// Changes on async view carries no ep info
			assert.equal(mChanges[`${sReference}_EP1_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo(), null, "oChange1 carries no extension point info");
			assert.equal(mChanges[`${sReference}_EP3_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo(), null, "oChange3 carries no extension point info");
			assert.equal(mChanges[`${sReference}_EP1_async_CUSTOMER_BASE_addXMLAtExtensionPoint`].getExtensionPointInfo(), null, "oChange9 carries no extension point info");

			// Changes on fragments inside of async view requires ep info
			assert.equal(mChanges[`${sReference}_EP4_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP4", "oChange5 carries EP4 extension point info");
			assert.equal(mChanges[`${sReference}_EP5_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP5", "oChange7 carries EP5 extension point info");
			assert.equal(mChanges[`${sReference}_EP8_inner_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP8_inner", "oChange9 carries EP8_inner extension point info");
			assert.equal(mChanges[`${sReference}_EP10_inner_async_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP10_inner", "oChange10 carries EP10_inner extension point info");

			// Changes on async view requires ep info
			assert.equal(mChanges[`${sReference}_EP1_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP1", "oChange0 carries EP1 extension point info");
			assert.equal(mChanges[`${sReference}_EP3_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP3", "oChange2 carries EP3 extension point info");
			assert.equal(mChanges[`${sReference}_EP1_sync_CUSTOMER_BASE_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP1", "oChange8 carries EP1 extension point info");

			// Changes on fragments inside of async view requires ep info
			assert.equal(mChanges[`${sReference}_EP4_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP4", "oChange4 carries EP4 extension point info");
			assert.equal(mChanges[`${sReference}_EP5_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP5", "oChange6 carries EP5 extension point info");
			assert.equal(mChanges[`${sReference}_EP8_inner_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP8_inner", "oChange9 carries EP8_inner extension point info");
			assert.equal(mChanges[`${sReference}_EP10_inner_sync_VENDOR_addXMLAtExtensionPoint`].getExtensionPointInfo().name, "EP10_inner", "oChange10 carries EP10_inner extension point info");
		};

		var checkApplyOrder = function(bSync) {
			assert.equal(oSpyAddXMLAtExtensionPointApply.callCount, 16, "number of AddXMLAtExtensionPoint changes applied correct");
			var sReference = "sap.ui.fl.qunit.extensionPoint.testAppLegacy.async";
			if (bSync) {
				sReference = "sap.ui.fl.qunit.extensionPoint.testAppLegacy";
			}

			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(0).args[0].getId(),
				`${sReference}_EP5_sync_VENDOR_addXMLAtExtensionPoint`, "first change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(1).args[0].getId(),
				`${sReference}_EP1_sync_VENDOR_addXMLAtExtensionPoint`, "second change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(2).args[0].getId(),
				`${sReference}_EP3_sync_VENDOR_addXMLAtExtensionPoint`, "third change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(3).args[0].getId(),
				`${sReference}_EP4_sync_VENDOR_addXMLAtExtensionPoint`, "fourth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(4).args[0].getSupportInformation().sourceChangeFileName,
				`${sReference}_EP4_sync_VENDOR_addXMLAtExtensionPoint`, "fifth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(5).args[0].getId(),
				`${sReference}_EP8_inner_sync_VENDOR_addXMLAtExtensionPoint`, "sixth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(6).args[0].getId(),
				`${sReference}_EP10_inner_sync_VENDOR_addXMLAtExtensionPoint`, "seventh change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(7).args[0].getId(),
				`${sReference}_EP1_sync_CUSTOMER_BASE_addXMLAtExtensionPoint`, "eight change applied with correct order");

			// 'wrong' order due to xml applying of the EP changes in the view directly,
			// the fragment changes come afterwards - not a EP problem but a general one
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(8).args[0].getId(),
				`${sReference}_EP1_async_VENDOR_addXMLAtExtensionPoint`, "ninth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(9).args[0].getId(),
				`${sReference}_EP3_async_VENDOR_addXMLAtExtensionPoint`, "tenth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(10).args[0].getId(),
				`${sReference}_EP1_async_CUSTOMER_BASE_addXMLAtExtensionPoint`, "eleventh change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(11).args[0].getId(),
				`${sReference}_EP5_async_VENDOR_addXMLAtExtensionPoint`, "twelfth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(12).args[0].getId(),
				`${sReference}_EP4_async_VENDOR_addXMLAtExtensionPoint`, "thirteenth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(13).args[0].getSupportInformation().sourceChangeFileName,
				`${sReference}_EP4_async_VENDOR_addXMLAtExtensionPoint`, "fourteenth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(14).args[0].getId(),
				`${sReference}_EP8_inner_async_VENDOR_addXMLAtExtensionPoint`, "fifteenth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(15).args[0].getId(),
				`${sReference}_EP10_inner_async_VENDOR_addXMLAtExtensionPoint`, "sixteenth change applied with correct order");
		};

		var fnAssert = function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");

			checkView("sync");
			checkView("async");
			checkChangesContent(sReference);
			assert.equal(oSpyApplyExtensionPoint.callCount, 14,
				"number of applyExtensionPoint called correct");
			assert.equal(oSpyRegisterExtensionPoint.callCount, 22,
				"number of registerExtensionPoint called correct in the ExtensionPointRegistry");
			checkApplyOrder(bSync);

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent1 = oView.byId("sync").byId("Panel").getContent();
			if (oView.byId("async").byId("Panel")) {
				var aPanelContent2 = oView.byId("async").byId("Panel").getContent();
				var aCellItems1 = oView.byId("sync").byId("fragmentWithExtensionPoint3--customTable").getItems()[0]
					? oView.byId("sync").byId("fragmentWithExtensionPoint3--customTable").getItems()[0].getCells()
					: [];
				var aCellItems2 = oView.byId("async").byId("fragmentWithExtensionPoint3--customTable").getItems()[0]
					? oView.byId("async").byId("fragmentWithExtensionPoint3--customTable").getItems()[0].getCells()
					: [];
				if (
					aPanelContent1.length === 27
					&& aPanelContent2.length === 27
					&& aCellItems1.length === 2
					&& aCellItems2.length === 2
				) {
					fnAssert();
					clearInterval(iPoll);
				}
			}
		}, 500);
	}

	QUnit.module("ExtensionPoints with sync and async view when component is created sync", {
		beforeEach: createComponentAndContainer.bind(null, SYNC),
		afterEach: destroyComponentAndContainer.bind(null, SYNC)
	}, function() {
		QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
			check(SYNC, assert);
		});
	});

	QUnit.module("ExtensionPoints with sync and async view when component is created async", {
		beforeEach: createComponentAndContainer.bind(null, ASYNC),
		afterEach: destroyComponentAndContainer.bind(null, ASYNC)
	}, function() {
		QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
			check(ASYNC, assert);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
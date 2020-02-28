sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	ExtensionPoint,
	ExtensionPointRegistry,
	ExtensionPointProcessor,
	Loader,
	ChangePersistenceFactory,
	AddXMLAtExtensionPoint,
	sinon
) {
	"use strict";
	/*global QUnit */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);
	var sandbox = sinon.sandbox.create();

	// UI Construction
	var oComponent;
	var oComponentContainer;
	var oSpyApplyExtensionPoint;
	var oSpyAddXMLAtExtensionPointApply;
	var oSpyRegisterExtensionPoints;

	function createComponentAndContainer(bSync) {
		oSpyApplyExtensionPoint = sandbox.spy(ExtensionPointProcessor, "applyExtensionPoint");
		oSpyAddXMLAtExtensionPointApply = sandbox.spy(AddXMLAtExtensionPoint, "applyChange");
		oSpyRegisterExtensionPoints = sandbox.spy(ExtensionPointRegistry.getInstance(), "registerExtensionPoints");
		if (bSync) {
			sandbox.stub(Loader, "loadFlexData").resolves({changes: {changes: createChanges("sap.ui.fl.qunit.extensionPoint.testApp")}});
			oComponent = sap.ui.component({
				name: "sap.ui.fl.qunit.extensionPoint.testApp",
				id: "sap.ui.fl.qunit.extensionPoint.testApp",
				async: false
			});
			oComponentContainer = new ComponentContainer({
				component: oComponent
			});
			oComponentContainer.placeAt("content");
			sap.ui.getCore().applyChanges();
		} else {
			sandbox.stub(Loader, "loadFlexData").resolves({changes: {changes: createChanges("sap.ui.fl.qunit.extensionPoint.testApp.async")}});
			return Component.create({
				name: "sap.ui.fl.qunit.extensionPoint.testApp",
				id: "sap.ui.fl.qunit.extensionPoint.testApp.async"
			}).then(function(_oComp) {
				oComponent = _oComp;
				oComponentContainer = oComponent.runAsOwner(function() {
					return new ComponentContainer({
						component: oComponent
					});
				});
				oComponentContainer.placeAt("content");
				return oComponent.getRootControl().loaded();
			}).then(function() {
				sap.ui.getCore().applyChanges();
			});
		}
	}

	function createChanges(sReference) {
		function createPoint(sEpName, sViewName, sLayer, sCreation) {
			return {
				fileName: sReference + "_" + sEpName + "_" + sViewName + "_" + sLayer + "_addXMLAtExtensionPoint",
				fileType: "change",
				changeType: "addXMLAtExtensionPoint",
				moduleName: "sap/ui/fl/qunit/extensionPoint/testApp/fragments/" + sEpName + "_" + sLayer + ".fragment.xml",
				reference: sReference,
				content: {
					fragmentPath: "fragments/" + sEpName + "_" + sLayer + ".fragment.xml"
				},
				creation:sCreation || "",
				selector: {
					name: sEpName,
					viewSelector: { id: sReference + "---mainView--" + sViewName, idIsLocal : false}
				},
				layer: sLayer,
				namespace: "apps/sap.ui.fl.qunit.extensionPoint.testApp/changes"
			};
		}
		return [
			createPoint("EP1", "sync", "VENDOR", "2018-02-25T15:35:49.705Z"),
			createPoint("EP1", "async", "VENDOR", "2019-02-25T15:35:49.705Z"),
			createPoint("EP3", "sync", "VENDOR", "2022-02-25T15:35:49.705Z"),
			createPoint("EP3", "async", "VENDOR", "2023-02-25T15:35:49.705Z"),
			createPoint("EP1", "sync", "CUSTOMER_BASE", "2020-02-25T15:35:49.705Z"),
			createPoint("EP1", "async", "CUSTOMER_BASE", "2021-02-25T15:35:49.705Z")
		];
	}

	function destroyComponentAndContainer() {
		Loader.loadFlexData.restore();
		oComponent.destroy();
		oComponentContainer.destroy();
		sandbox.restore();
	}

	function check(bSync, assert) {
		var sReference = bSync ? "sap.ui.fl.qunit.extensionPoint.testApp" : "sap.ui.fl.qunit.extensionPoint.testApp.async";
		var checkView = function(sView) {
			var aPanelContent = oView.byId(sView).byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 12, "ExtensionPoint content added to" + sView + " view");
			assert.strictEqual(aPanelContent[0].getId(), sReference + "---mainView--" + sView + "--button1", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), sReference + "---mainView--" + sView + "--undefined.customButton1", "EP1 content is in correct order"); // EP1_CUSTOMER_BASE
			assert.strictEqual(aPanelContent[2].getId(), sReference + "---mainView--" + sView + "--undefined.customButton2", "EP1 content is in correct order"); // EP1_CUSTOMER_BASE
			assert.strictEqual(aPanelContent[3].getId(), sReference + "---mainView--" + sView + "--undefined.customButton3", "EP1 content is in correct order"); // EP1_VENDOR
			assert.strictEqual(aPanelContent[4].getId(), sReference + "---mainView--" + sView + "--undefined.customButton4", "EP1 content is in correct order"); // EP1_VENDOR
			assert.strictEqual(aPanelContent[5].getId(), sReference + "---mainView--" + sView + "--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[6].getId(), sReference + "---mainView--" + sView + "--button2", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[7].getId(), sReference + "---mainView--" + sView + "--undefined.customButton5", "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[8].getId(), sReference + "---mainView--" + sView + "--undefined.customButton6", "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[9].getId(), sReference + "---mainView--" + sView + "--undefined.customButton7", "EP3 content is in correct order"); // EP3_VENDOR
			assert.strictEqual(aPanelContent[10].getId(), sReference + "---mainView--" + sView + "--button3", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[11].getId(), sReference + "---mainView--" + sView + "--button4", "view content is in correct order"); // Main
		};

		var checkChangesContent = function(sReference) {
			var mChanges = ChangePersistenceFactory._instanceCache["sap.ui.fl.qunit.extensionPoint.testApp.Component"]["1.0.0"]._mChangesEntries;
			//Changes on async view carries no ep info
			assert.equal(mChanges[sReference + "_EP1_async_VENDOR_addXMLAtExtensionPoint"].getExtensionPointInfo(), null, "oChange2 carries no extension point info");
			assert.equal(mChanges[sReference + "_EP3_async_VENDOR_addXMLAtExtensionPoint"].getExtensionPointInfo(), null, "oChange4 carries no extension point info");
			assert.equal(mChanges[sReference + "_EP1_async_CUSTOMER_BASE_addXMLAtExtensionPoint"].getExtensionPointInfo(), null, "oChange6 carries no extension point info");

			//Changes on async view carries no ep info
			assert.equal(mChanges[sReference + "_EP1_sync_VENDOR_addXMLAtExtensionPoint"].getExtensionPointInfo().name, "EP1", "oChange1 carries EP1 extension point info");
			assert.equal(mChanges[sReference + "_EP3_sync_VENDOR_addXMLAtExtensionPoint"].getExtensionPointInfo().name, "EP3", "oChange3 carries EP3 extension point info");
			assert.equal(mChanges[sReference + "_EP1_sync_CUSTOMER_BASE_addXMLAtExtensionPoint"].getExtensionPointInfo().name, "EP1", "oChange5 carries EP1 extension point info");
		};

		var checkApplyOrder = function(bSync) {
			assert.equal(oSpyAddXMLAtExtensionPointApply.callCount, 6, "number of AddXMLAtExtensionPoint changes applied correct");
			var sReference = "sap.ui.fl.qunit.extensionPoint.testApp.async";
			if (bSync) {
				sReference = "sap.ui.fl.qunit.extensionPoint.testApp";
			}

			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(0).args[0].getId(), sReference + "_EP1_sync_VENDOR_addXMLAtExtensionPoint", "first change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(1).args[0].getId(), sReference + "_EP3_sync_VENDOR_addXMLAtExtensionPoint", "second change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(2).args[0].getId(), sReference + "_EP1_sync_CUSTOMER_BASE_addXMLAtExtensionPoint", "third change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(3).args[0].getId(), sReference + "_EP1_async_VENDOR_addXMLAtExtensionPoint", "fourth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(4).args[0].getId(), sReference + "_EP3_async_VENDOR_addXMLAtExtensionPoint", "fifth change applied with correct order");
			assert.equal(oSpyAddXMLAtExtensionPointApply.getCall(5).args[0].getId(), sReference + "_EP1_async_CUSTOMER_BASE_addXMLAtExtensionPoint", "sixth change applied with correct order");
		};

		var done = assert.async();
		var oView = oComponent.getRootControl();

		var fnAssert = function() {
			assert.ok(ExtensionPoint._sExtensionProvider, "ExtensionPointProvider added");

			checkView("sync");
			checkView("async");
			checkChangesContent(sReference);
			assert.equal(oSpyApplyExtensionPoint.callCount, 6, "number of applyExtensionPoint called correct");
			assert.equal(oSpyRegisterExtensionPoints.callCount, 6, "number of registerExtensionPoints called correct in the ExtensionPointRegistry");
			checkApplyOrder(bSync);

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent1 = oView.byId("sync").byId("Panel").getContent();
			var aPanelContent2 = oView.byId("async").byId("Panel").getContent();
			if (aPanelContent1.length === 12 && aPanelContent2.length === 12) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);
	}
	QUnit.module("ExtensionPoints with sync and async view when component is created sync", {
		before: createComponentAndContainer.bind(null, true),
		after: destroyComponentAndContainer.bind(null, true)
	});

	QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
		check(true, assert);
	});

	QUnit.module("ExtensionPoints with sync and async view when component is created async", {
		before: createComponentAndContainer.bind(null, false),
		after: destroyComponentAndContainer.bind(null, false)
	});

	QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
		check(false, assert);
	});
});
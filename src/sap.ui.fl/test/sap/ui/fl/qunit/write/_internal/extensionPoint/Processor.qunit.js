/* global QUnit */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/write/_internal/extensionPoint/Registry",
	"sap/ui/fl/write/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	ExtensionPoint,
	ExtensionPointRegistry,
	ExtensionPointWriteProcessor,
	ExtensionPointApplyProcessor,
	ManifestUtils,
	sinon
) {
	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);
	var sandbox = sinon.createSandbox();

	// UI Construction
	var oComponent;
	var oComponentContainer;
	var oSpyApplyProcessorExtensionPoint;
	var oSpyWriteProcessorExtensionPoint;
	var oSpyRegisterExtensionPoint;

	async function createComponentAndContainer() {
		oSpyApplyProcessorExtensionPoint = sandbox.spy(ExtensionPointApplyProcessor, "applyExtensionPoint");
		oSpyWriteProcessorExtensionPoint = sandbox.spy(ExtensionPointWriteProcessor, "applyExtensionPoint");
		oSpyRegisterExtensionPoint = sandbox.spy(ExtensionPointRegistry, "registerExtensionPoint");
		oComponent = await Component.create({
			name: "sap.ui.fl.qunit.extensionPoint.testApp",
			id: "sap.ui.fl.qunit.extensionPoint.testApp.async",
			componentData: {}
		});
		oComponentContainer = oComponent.runAsOwner(function() {
			return new ComponentContainer({
				component: oComponent
			});
		});
		oComponentContainer.placeAt("content");
		await oComponent.getRootControl().loaded();
		await oComponent.getRootControl().byId("async").loaded();
	}

	function destroyComponentAndContainer() {
		oComponent.destroy();
		oComponentContainer.destroy();
		sandbox.restore();
	}

	function baseCheck(assert) {
		var sReference = "sap.ui.fl.qunit.extensionPoint.testApp.async";
		var done = assert.async();
		var oView = oComponent.getRootControl();

		var checkView = function(sView) {
			var aPanelContent = oView.byId(sView).byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 15, "ExtensionPoint content added to" + sView + " view");
			assert.strictEqual(aPanelContent[0].getId(), sReference + "---mainView--" + sView + "--button1", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), sReference + "---mainView--" + sView + "--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[2].getId(), sReference + "---mainView--" + sView + "--button2", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), sReference + "---mainView--" + sView + "--button3", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[4].getId(), sReference + "---mainView--" + sView + "--button4", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[5].getId(), sReference + "---mainView--" + sView + "--fragmentWithExtensionPoint1--defaultButton1", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[6].getId(), sReference + "---mainView--" + sView + "--fragmentWithExtensionPoint2--defaultButton1", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[7].getId(), sReference + "---mainView--" + sView + "--fragmentWithExtensionPoint3--customTable"); // Main
			assert.strictEqual(aPanelContent[8].getId(), sReference + "---mainView--" + sView + "--button5", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[9].getId(), sReference + "---mainView--" + sView + "--EPinEPButton6", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[10].getId(), sReference + "---mainView--" + sView + "--EPinEPButton7", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[11].getId(), sReference + "---mainView--" + sView + "--EPinEPButton8", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[12].getId(), sReference + "---mainView--" + sView + "--EPinEPButton9", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[13].getId(), sReference + "---mainView--" + sView + "--button7", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[14].getId(), sReference + "---mainView--" + sView + "--button8", "view content is in correct order"); // Main

			var aTableItems = oView.byId(sView).byId("fragmentWithExtensionPoint3--customTable").getItems();
			var aTableCells = aTableItems[0].getCells();
			assert.strictEqual(aTableCells.length, 1, "ExtensionPoint default content added to" + sView + " view into aggregation binding template");
			var sTemplatePrefix = sReference + "---mainView--" + sView + "--fragmentWithExtensionPoint3--";
			var sCellPrefix = sTemplatePrefix;
			assert.strictEqual(aTableCells[0].getId(), sCellPrefix + "customListCellContent" + "-" + sTemplatePrefix + "customTable-0", "table item is in correct order"); // Main
		};

		var fnAssert = function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");
			checkView("async");
			assert.equal(oSpyApplyProcessorExtensionPoint.callCount, 0, "applyExtensionPoint of the apply proceesor is not called");
			assert.equal(oSpyWriteProcessorExtensionPoint.callCount, 7, "number of applyExtensionPoint called correct");
			assert.equal(oSpyRegisterExtensionPoint.callCount, 11, "number of registerExtensionPoint called correct in the ExtensionPointRegistry");

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent = oView.byId("async").byId("Panel").getContent();
			var aTableCells = oView.byId("async").byId("fragmentWithExtensionPoint3--customTable").getItems()[0].getCells();
			if (
				aPanelContent.length === 15
				&& aTableCells.length === 1
			) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);
	}

	QUnit.module("ExtensionPoints with async view when component is created async with 'flexExtensionPointEnabled: false'", {
		beforeEach: function() {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			return createComponentAndContainer();
		},
		afterEach: destroyComponentAndContainer
	}, function() {
		QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
			baseCheck(assert);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
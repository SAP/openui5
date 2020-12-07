sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/extensionPoint/BaseProcessor",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	ExtensionPoint,
	ExtensionPointRegistry,
	ExtensionPointProcessor,
	ExtensionPointBaseProcessor,
	Loader,
	ManifestUtils,
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
	var SYNC = true;
	var ASYNC = false;

	// UI Construction
	var oComponent;
	var oComponentContainer;
	var oSpyApplyExtensionPoint;
	var oSpyRegisterExtensionPoints;

	function createComponentAndContainer(bSync) {
		oSpyApplyExtensionPoint = sandbox.spy(ExtensionPointProcessor, "applyExtensionPoint");
		oSpyRegisterExtensionPoints = sandbox.spy(ExtensionPointRegistry.getInstance(), "registerExtensionPoints");
		if (bSync) {
			sandbox.stub(Loader, "loadFlexData").resolves({changes: {changes: []}});
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
			sandbox.stub(Loader, "loadFlexData").resolves({changes: {changes: []}});
			return Component.create({
				name: "sap.ui.fl.qunit.extensionPoint.testApp",
				id: "sap.ui.fl.qunit.extensionPoint.testApp.async",
				componentData: {}
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

	function destroyComponentAndContainer() {
		Loader.loadFlexData.restore();
		oComponent.destroy();
		oComponentContainer.destroy();
		sandbox.restore();
	}

	function baseCheck(bSync, assert) {
		var sReference = bSync ? "sap.ui.fl.qunit.extensionPoint.testApp" : "sap.ui.fl.qunit.extensionPoint.testApp.async";
		var done = assert.async();
		var oView = oComponent.getRootControl();

		var checkView = function(sView) {
			var aPanelContent = oView.byId(sView).byId("Panel").getContent();
			assert.strictEqual(aPanelContent.length, 7, "ExtensionPoint content added to " + sView + " view");
			assert.strictEqual(aPanelContent[0].getId(), sReference + "---mainView--" + sView + "--button1", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[1].getId(), sReference + "---mainView--" + sView + "--defaultFragment--defaultButton", "EP2 default content is in correct order"); // EP2
			assert.strictEqual(aPanelContent[2].getId(), sReference + "---mainView--" + sView + "--button2", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[3].getId(), sReference + "---mainView--" + sView + "--button3", "view content is in correct order"); // Main
			assert.strictEqual(aPanelContent[4].getId(), sReference + "---mainView--" + sView + "--button4", "view content is in correct order"); // Main
		};

		var fnAssert = function() {
			assert.ok(ExtensionPoint._fnExtensionProvider, "ExtensionPointProvider added");
			checkView("sync");
			checkView("async");
			assert.equal(oSpyApplyExtensionPoint.callCount, 0, "number of applyExtensionPoint called correct");
			assert.equal(oSpyRegisterExtensionPoints.callCount, 10, "number of registerExtensionPoints called correct in the ExtensionPointRegistry");

			done();
		};

		// we poll for the panels aggregation content until all ExtensionPoints have been resolved
		var iPoll = setInterval(function() {
			var aPanelContent1 = oView.byId("sync").byId("Panel").getContent();
			var aPanelContent2 = oView.byId("async").byId("Panel").getContent();
			if (aPanelContent1.length === 7 && aPanelContent2.length === 7) {
				fnAssert();
				clearInterval(iPoll);
			}
		}, 500);
	}

	QUnit.module("ExtensionPoints with sync and async view when component is created sync with 'flexExtensionPointEnabled: false'", {
		before: function () {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			return createComponentAndContainer(SYNC);
		},
		after: destroyComponentAndContainer.bind(null, SYNC)
	});

	QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
		baseCheck(SYNC, assert);
	});

	QUnit.module("ExtensionPoints with sync and async view when component is created async with 'flexExtensionPointEnabled: false'", {
		before: function () {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			return createComponentAndContainer(ASYNC);
		},
		after: destroyComponentAndContainer.bind(null, ASYNC)
	});

	QUnit.test("When EPs and addXMLAtExtensionPoint are available in one sync views and one async view", function(assert) {
		baseCheck(ASYNC, assert);
	});
});
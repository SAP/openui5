/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/util/IFrame",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	UIChangesState,
	SupportAPI,
	IFrame,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("When the SupportAPI is called with the app running in an iframe", {
		async beforeEach() {
			this.oIFrame = new IFrame({
				url: "support/api/testPage.html",
				title: "myIFrame",
				id: "application-semanticObject-action"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						getIntent: () => {
							return {
								semanticObject: "semanticObject",
								action: "action"
							};
						}
					};
				}
			});
			await this.oIFrame.waitForInit();

			// wait for the app inside the iframe to be ready
			let bReady = false;
			do {
				if (this.oIFrame.getDomRef()?.contentWindow?.flSupportTestAppReady) {
					await this.oIFrame.getDomRef().contentWindow.flSupportTestAppReady;
					bReady = true;
				} else {
					await new Promise((resolve) => {
						setTimeout(resolve, 16);
					});
				}
			} while (!bReady);

			// stub the modules inside the iframe
			const oInsideIFrameModules = await new Promise((resolve) => {
				this.oIFrame.getDomRef().contentWindow.sap.ui.require([
					"sap/ui/fl/Utils",
					"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
					"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState"
				], (FlUtils, ManifestUtils, UIChangesState) => {
					resolve({FlUtils, ManifestUtils, UIChangesState});
				});
			});
			sandbox.stub(oInsideIFrameModules.FlUtils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: {
							oContainer: {
								getComponentInstance: () => {
									return "myInsideIFrameComponentInstance";
								}
							}
						}
					};
				}
			});
			sandbox.stub(oInsideIFrameModules.ManifestUtils, "getFlexReferenceForControl").returns("myInsideIFrameFlexReference");
			sandbox.stub(oInsideIFrameModules.UIChangesState, "getAllUIChanges").resolves(["myInsideIFrameChange"]);
		},
		afterEach() {
			sandbox.restore();
			this.oIFrame.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.deepEqual(aAllChanges, ["myInsideIFrameChange"], "then the change from the iFrame is returned");
		});
	});

	QUnit.module("When the SupportAPI is called with a standalone app without iframe", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(false);
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const oGetAllChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns(["myChange"]);
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(oGetAllChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myChange"], "then the change is returned");
		});
	});

	QUnit.module("When the SupportAPI is called with an app embedded in a FLP sandbox", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: oComponent
					};
				}
			});
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const oGetAllChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns(["myFlpChange"]);
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(oGetAllChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myFlpChange"], "then the change is returned");
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

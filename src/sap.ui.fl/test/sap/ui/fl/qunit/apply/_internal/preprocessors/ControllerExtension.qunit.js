/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/mvc/View",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/ControllerExtension",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	ManagedObject,
	ViewType,
	View,
	ComponentContainer,
	Component,
	VariantManagementState,
	ManifestUtils,
	ControllerExtension,
	Layer,
	Utils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";

	function createCodeExtChangeContent(oInput) {
		return Object.assign({
			fileName: "id_1436877480596_108",
			namespace: "ui.s2p.mm.purchorder.approve",
			fileType: "change",
			layer: Layer.CUSTOMER,
			creation: "20150720131919",
			changeType: "codeExt",
			reference: "<sap-app-id> or <component name>",
			selector: {
				controllerName: sControllerName
			},
			conditions: {},
			support: {
				generator: "WebIde",
				user: "VIOL"
			}
		}, oInput);
	}

	QUnit.module("sap.ui.fl.ControllerExtension", {
		beforeEach() {
			sandbox.stub(VariantManagementState, "getInitialChanges").returns([]);
			this.oExtensionProvider = new ControllerExtension();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When an sync view is processed", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("<sap-app-id> or <component name>");

			// check sync case
			var spy = sandbox.spy(Log, "warning");
			var aEmptyCodeExtensionSync = this.oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", false);
			// should return empty array and log warning
			assert.ok(Array.isArray(aEmptyCodeExtensionSync), "Then an array is returned");
			assert.equal(aEmptyCodeExtensionSync.length, 0, "which is empty");
			assert.equal(spy.callCount, 1, "and a warning log is written");
			assert.equal(spy.getCall(0).args[0], "Synchronous extensions are not supported via UI5 Flexibility",
				"with the correct message.");
		});

		QUnit.test("When no component id is provided", function(assert) {
			var spy = sandbox.spy(Log, "warning");

			var oEmptyCodeExtensionPromise = this.oExtensionProvider.getControllerExtensions(sControllerName, "", true);

			return oEmptyCodeExtensionPromise.then(function(aEmpty) {
				assert.ok(Array.isArray(aEmpty), "Then an array is returned");
				assert.equal(aEmpty.length, 0, "which is empty");
				assert.equal(spy.callCount, 1, "and a warning log is written");
				assert.equal(spy.getCall(0).args[0], "No component ID for determining the anchor of the code extensions was passed.",
					"with the correct message.");
			});
		});

		/**
		 * @deprecated Since version 1.58 due to <code>sap.ui.base.Metadata.getPublicMethods</code> deprecation
		 */
		QUnit.test("When a component id is provided and one code extension with two methods is present", async function(assert) {
			var sModuleName = "sap/ui/fl/qunit/ControllerExtension/1.0.0/codeExtensions/firstCodeExt";
			sap.ui.define(sModuleName, ["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) { // legacy-relevant: simulates a loaded code extension. no option to replace this regarding legacy free coding
				return ControllerExtension.extend("ui.s2p.mm.purchorder.approve.Extension1", {
					extHookOnInit() {},
					onInit() {}
				});
			});
			var oChange = createCodeExtChangeContent({
				moduleName: sModuleName,
				content: {
					codeRef: "myCodeRef.js"
				}
			});

			var oAppComponent = {
				getManifest() {
					return {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							}
						},
						getEntry() {
							return {
								type: "application"
							};
						}
					};
				},
				getManifestObject() {
					return {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							}
						},
						getEntry() {
							return {
								type: "application"
							};
						}
					};
				},
				getManifestEntry() {}
			};
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "ui.s2p.mm.purchorder.approve.view.S2", {changes: [oChange]});
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sControllerName);

			var oCodeExtensionsPromise = this.oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);

			return oCodeExtensionsPromise.then(function(aCodeExtensions) {
				assert.equal(aCodeExtensions.length, 1, "one code extension should be returned");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods().length, 2, "then two methods were extended");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods()[0], "extHookOnInit", "of which one is extHookOnInit");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods()[1], "onInit", "and the other is onInit");
			});
		});

		/**
		 * @deprecated Since version 1.58 due to <code>sap.ui.base.Metadata.getAllPublicMethods</code> deprecation
		 */
		QUnit.test("apply multiple changes on different controllers", async function(assert) {
			// expect both extensions to be called
			var done1 = assert.async();
			var done2 = assert.async();

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("<sap-app-id> or <component name>");
			sandbox.stub(Utils, "isApplication").returns(true);
			ManagedObject._sOwnerId = "<component name>";

			// perparation of the changes
			var sModuleName1 = "sap/ui/fl/qunit/ControllerExtension/1.0.0/codeExtensions/secondCodeExt";
			var oCodingChange1 = createCodeExtChangeContent({
				fileName: "myFileName1",
				moduleName: sModuleName1,
				content: {
					codeRef: "myCodeRef1.js"
				},
				selector: {
					controllerName: "sap.ui.fl.ControllerExtension.testResources.view1"
				}
			});
			sap.ui.define(sModuleName1, ["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) { // legacy-relevant: simulates a loaded code extension. no option to replace this regarding legacy free coding
				return ControllerExtension.extend("ui.s2p.mm.purchorder.approve.Extension2", {
					overrides: {
						onInit() {
							assert.strictEqual(this.base.getView().getId(), "testView1", "View1 is available and ID of View1 is correct");
							done1();
						}
					}
				});
			});

			var sModuleName2 = "sap/ui/fl/qunit/ControllerExtension/1.0.0/codeExtensions/thirdCodeExt";
			var oCodingChange2 = createCodeExtChangeContent({
				fileName: "myFileName2",
				moduleName: sModuleName2,
				content: {
					codeRef: "myCodeRef2.js"
				},
				selector: {
					controllerName: "sap.ui.fl.ControllerExtension.testResources.view2"
				}
			});
			sap.ui.define(sModuleName2, ["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) { // legacy-relevant: simulates a loaded code extension. no option to replace this regarding legacy free coding
				return ControllerExtension.extend("ui.s2p.mm.purchorder.approve.Extension3", {
					overrides: {
						onInit() {
							assert.strictEqual(this.base.getView().getId(), "testView2", "View2 is available and ID of View2 is correct");
							done2();
						}
					}
				});
			});

			var oOtherChange1 = {
				fileName: "id_1436877480126_1",
				fileType: "change",
				changeType: "notCodeExt"
			};
			var oOtherChange2 = {
				fileName: "id_1436812380596_101",
				fileType: "change",
				changeType: "notCodeExt"
			};
			var oFileContent = {
				changes: [oOtherChange1, oCodingChange1, oOtherChange2, oCodingChange2]
			};
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "<sap-app-id> or <component name>", oFileContent);

			// view, controller and component definition

			function createView(sViewName, sId, sText, oComponent) {
				return View.create({
					viewName: sViewName,
					id: sId,
					type: ViewType.XML,
					viewData: {
						component: oComponent
					}
				}).then(function() {
					assert.ok(true, `the extension of the ${sText} controller was applied and executed`);
				});
			}

			return Component.create({
				name: "sap.ui.fl.ControllerExtension.testResources",
				manifest: false
			}).then(function(oComponent) {
				sandbox.stub(Component, "getComponentById").returns(oComponent);
				var oCompCont = new ComponentContainer({
					component: oComponent
				});
				oCompCont.placeAt("qunit-fixture");
				return Promise.all([
					createView("sap.ui.fl.ControllerExtension.testResources.view1", "testView1", "first", oComponent),
					createView("sap.ui.fl.ControllerExtension.testResources.view2", "testView2", "second", oComponent)
				]);
			});
		});

		QUnit.test("make sure requests are only sent if app component is defined", function(assert) {
			var done = assert.async();
			var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			var oExtensionProvider = new ControllerExtension();

			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);
			var spy = sandbox.spy(Log, "warning");

			oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true).then(
				function(aCodeExtensions) {
					assert.ok(Array.isArray(aCodeExtensions), "Then an array is returned");
					assert.equal(aCodeExtensions.length, 0, "which is empty");
					assert.equal(spy.callCount, 1, "and a warning log is written");
					assert.equal(spy.getCall(0).args[0], "No application component for determining the anchor of the code extensions was identified.",
						"with the correct message.");
					done();
				}
			);
		});

		QUnit.test("make sure requests are only sent for app components", function(assert) {
			var done = assert.async();
			var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			var oExtensionProvider = new ControllerExtension();

			var oComponent = {
				getManifestObject() {
					return {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							},
							type: "component"
						}
					};
				},
				getManifest() {
					return {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							},
							type: "component"
						}
					};
				},
				getManifestEntry() {}
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true).then(
				function(aCodeExtensions) {
					assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
					done();
				}
			);
		});

		QUnit.test("make sure requests are only sent for app components (even without manifest)", function(assert) {
			var done = assert.async();
			var oExtensionProvider = new ControllerExtension();

			var oComponent = {
				getManifest() {
					return undefined;
				},
				getManifestObject() {
					return undefined;
				},
				getManifestEntry() {}
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true).then(
				function(aCodeExtensions) {
					assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
					done();
				}
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/ControllerExtension",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	ManifestUtils,
	ControllerExtension,
	Layer,
	Utils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "<sap-app-id> or <component name>";

	const sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";

	function createCodeExtChangeContent(oInput) {
		return Object.assign({
			fileName: "id_1436877480596_108",
			namespace: "ui.s2p.mm.purchorder.approve",
			fileType: "change",
			layer: Layer.CUSTOMER,
			creation: "20150720131919",
			changeType: "codeExt",
			reference: sReference,
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
			this.oExtensionProvider = new ControllerExtension();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When an sync view is processed", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

			// check sync case
			var aEmptyCodeExtensionSync = this.oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", false);
			assert.ok(Array.isArray(aEmptyCodeExtensionSync), "Then an array is returned");
			assert.equal(aEmptyCodeExtensionSync.length, 0, "which is empty");
		});

		QUnit.test("When no component id is provided", function(assert) {
			var oEmptyCodeExtensionPromise = this.oExtensionProvider.getControllerExtensions(sControllerName, "", true);

			return oEmptyCodeExtensionPromise.then(function(aEmpty) {
				assert.ok(Array.isArray(aEmpty), "Then an array is returned");
				assert.equal(aEmpty.length, 0, "which is empty");
			});
		});

		QUnit.test("When a component id is provided and one code extension with two methods is present", async function(assert) {
			var sModuleName = "sap/ui/fl/qunit/ControllerExtension/1.0.0/codeExtensions/firstCodeExt";
			FlQUnitUtils.stubSapUiRequire(sandbox, [{
				name: [sModuleName],
				stub: "foo"
			}]);
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
			// Don't await the initialization here because in real apps the getControllerExtensions flow
			// might be called before the FlexState is fully initialized and thus should be able to take
			// care of waiting for it
			FlQUnitUtils.initializeFlexStateWithData(sandbox, "ui.s2p.mm.purchorder.approve.view.S2", {changes: [oChange]});
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sControllerName);

			const aCodeExtensions = await this.oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);
			assert.strictEqual(aCodeExtensions.length, 1, "one code extension should be returned");
			assert.strictEqual(aCodeExtensions[0], "foo", "the correct module is returned");
		});

		QUnit.test("make sure requests are only sent if app component is defined", async function(assert) {
			var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			var oExtensionProvider = new ControllerExtension();

			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);

			const aCodeExtensions = await oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);
			assert.ok(Array.isArray(aCodeExtensions), "Then an array is returned");
			assert.equal(aCodeExtensions.length, 0, "which is empty");
		});

		QUnit.test("make sure requests are only sent for app components", async function(assert) {
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

			const aCodeExtensions = await oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);
			assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
		});

		QUnit.test("make sure requests are only sent for app components (even without manifest)", async function(assert) {
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

			const aCodeExtensions = await oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);
			assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
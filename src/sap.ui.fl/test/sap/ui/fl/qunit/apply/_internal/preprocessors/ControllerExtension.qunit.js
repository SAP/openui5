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
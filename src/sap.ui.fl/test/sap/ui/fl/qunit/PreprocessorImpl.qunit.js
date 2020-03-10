/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/PreprocessorImpl",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
],
function(
	PreprocessorImpl,
	Component,
	ComponentContainer,
	ManagedObject,
	Cache,
	Layer,
	Utils,
	Log,
	VariantManagementState,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.PreprocessorImpl", {
		beforeEach: function() {
			sandbox.stub(VariantManagementState, "loadInitialChanges").returns([]);
			this.sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			this.oExtensionProvider = new PreprocessorImpl();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When an sync view is processed", function(assert) {
			sandbox.stub(Utils, "getAppComponentClassNameForComponent").returns("<sap-app-id> or <component name>");

			//check sync case
			var spy = sandbox.spy(Log, "warning");
			var aEmptyCodeExtensionSync = this.oExtensionProvider.getControllerExtensions(this.sControllerName, "<component ID>", false);
			//should return empty array and log warning
			assert.ok(Array.isArray(aEmptyCodeExtensionSync), "Then an array is returned");
			assert.equal(aEmptyCodeExtensionSync.length, 0, "which is empty");
			assert.equal(spy.callCount, 1, "and a warning log is written");
			assert.equal(spy.getCall(0).args[0], "Synchronous extensions are not supported by sap.ui.fl.PreprocessorImpl",
				"with the correct message.");
		});

		QUnit.test("When no component id is provided", function(assert) {
			var spy = sandbox.spy(Log, "warning");

			var oEmptyCodeExtensionPromise = this.oExtensionProvider.getControllerExtensions(this.sControllerName, "", true);

			return oEmptyCodeExtensionPromise.then(function(aEmpty) {
				assert.ok(Array.isArray(aEmpty), "Then an array is returned");
				assert.equal(aEmpty.length, 0, "which is empty");
				assert.equal(spy.callCount, 1, "and a warning log is written");
				assert.equal(spy.getCall(0).args[0], "No component ID for determining the anchor of the code extensions was passed.",
					"with the correct message.");
			});
		});

		QUnit.test("When a component id is provided and one code extension with two methods is present", function(assert) {
			var sModuleName = "sap/ui/fl/qunit/PreprocessorImpl/1.0.0/codeExtensions/firstCodeExt";
			sap.ui.predefine(sModuleName, ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) {
				return ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension1', {
					extHookOnInit:function() {},
					onInit: function() {}
				});
			});
			var oChange = {
				fileName: "id_1436877480596_108",
				namespace: "ui.s2p.mm.purchorder.approve.Component",
				fileType: "change",
				layer: Layer.CUSTOMER,
				creation: "20150720131919",
				changeType: "codeExt",
				moduleName: sModuleName,
				reference: "<sap-app-id> or <component name>",
				content: {
					codeRef: "myCodeRef.js"
				},
				selector: {
					controllerName: this.sControllerName
				},
				conditions: {},
				support: {
					generator: "WebIde",
					user: "VIOL"
				}
			};

			var oFileContent = {
				changes: {
					changes: [oChange]
				}
			};

			var oChangesFillingCachePromise = new Promise(
				function (resolve) {
					resolve(oFileContent);
				}
			);

			var oAppComponent = {
				getManifest: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							}
						},
						getEntry: function () {
							return {
								type: "application"
							};
						}
					};
				},
				getManifestObject: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							}
						},
						getEntry: function () {
							return {
								type: "application"
							};
						}
					};
				},
				getManifestEntry: function () {}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(Utils, "getComponentName").returns(this.sControllerName);

			var oCodeExtensionsPromise = this.oExtensionProvider.getControllerExtensions(this.sControllerName, "<component ID>", true);

			return oCodeExtensionsPromise.then(function (aCodeExtensions) {
				assert.equal(aCodeExtensions.length, 1, "one code extension should be returned");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods().length, 2, "then two methods were extended");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods()[0], "extHookOnInit", "of which one is extHookOnInit");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods()[1], "onInit", "and the other is onInit");
			});
		});

		QUnit.test("apply multiple changes on different controllers", function (assert) {
			// expect both extensions to be called
			assert.expect(2);
			var done1 = assert.async();
			var done2 = assert.async();

			sandbox.stub(Utils, "getAppComponentClassNameForComponent").returns("<sap-app-id> or <component name>");
			sandbox.stub(Utils, "isApplication").returns(true);
			ManagedObject._sOwnerId = "<component name>";

			// perparation of the changes
			var sModuleName1 = "sap/ui/fl/qunit/PreprocessorImpl/1.0.0/codeExtensions/secondCodeExt";
			var oCodingChange1 = {
				fileName: "id_1436877480596_108",
				namespace: "ui.s2p.mm.purchorder.approve.Component",
				fileType: "change",
				layer: Layer.CUSTOMER,
				creation: "20150720131919",
				changeType: "codeExt",
				reference: "<sap-app-id> or <component name>",
				moduleName: sModuleName1,
				content: {
					codeRef: "myCodeRef1.js"
				},
				selector: {
					controllerName: "sap.ui.fl.PreprocessorImpl.testResources.view1"
				},
				conditions: {},
				support: {
					generator: "WebIde",
					user: "VIOL"
				}
			};
			sap.ui.predefine(sModuleName1, ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) {
				return ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension2', {
					override: {
						onInit: function () {
							this.base.getView().callDone();
						}
					}
				});
			});

			var sModuleName2 = "sap/ui/fl/qunit/PreprocessorImpl/1.0.0/codeExtensions/thirdCodeExt";
			sap.ui.predefine(sModuleName2, ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) {
				return ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension3', {
					override: {
						onInit: function () {
							this.base.getView().callDone();
						}
					}
				});
			});
			var oCodingChange2 = {
				fileName: "id_1436877480596_109",
				namespace: "ui.s2p.mm.purchorder.approve.Component",
				fileType: "change",
				layer: Layer.CUSTOMER,
				creation: "20150720131919",
				changeType: "codeExt",
				reference: "<sap-app-id> or <component name>",
				moduleName: sModuleName2,
				content: {
					codeRef: "myCodeRef2.js"
				},
				selector: {
					controllerName: "sap.ui.fl.PreprocessorImpl.testResources.view2"
				},
				conditions: {},
				support: {
					generator: "WebIde",
					user: "VIOL"
				}
			};

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
				changes: {
					changes: [oOtherChange1, oCodingChange1, oOtherChange2, oCodingChange2]
				}
			};

			var oChangesFillingCachePromise = new Promise(
				function (resolve) {
					resolve(oFileContent);
				}
			);
			sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);

			// view, controller and component definition

			var oComponent = sap.ui.component({
				name: "sap.ui.fl.PreprocessorImpl.testResources"
			});
			sandbox.stub(sap.ui, "component").returns(oComponent);
			sandbox.stub(Component, "get").returns(oComponent);

			var view1 = sap.ui.view({
				viewName: "sap.ui.fl.PreprocessorImpl.testResources.view1",
				type: sap.ui.core.mvc.ViewType.XML,
				async: true,
				viewData: {
					component: oComponent
				}
			});
			view1.callDone = function () {
				assert.ok(true, "the extension of the first controller was applied and executed");
				done1();
			};

			var view2 = sap.ui.view({
				viewName: "sap.ui.fl.PreprocessorImpl.testResources.view2",
				type: sap.ui.core.mvc.ViewType.XML,
				async: true,
				viewData: {
					component: oComponent
				}
			});
			view2.callDone = function () {
				assert.ok(true, "the extension of the second controller was applied and executed");
				done2();
			};

			var oCompCont = new ComponentContainer({
				component: oComponent
			});
			oCompCont.placeAt("qunit-fixture");
		});

		QUnit.test("make sure requests are only sent for app components", function (assert) {
			var done = assert.async();
			var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			var oExtensionProvider = new PreprocessorImpl();

			var oComponent = {
				getManifestObject: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							},
							type: "component"
						}
					};
				},
				getManifest: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							},
							type: "component"
						}
					};
				},
				getManifestEntry: function () {}
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true).then(
				function (aCodeExtensions) {
					assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
					done();
				}
			);
		});

		QUnit.test("make sure requests are only sent for app components (even without manifest)", function (assert) {
			var done = assert.async();
			var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
			var oExtensionProvider = new PreprocessorImpl();

			var oComponent = {
				getManifest: function () {
					return undefined;
				},
				getManifestObject: function () {
					return undefined;
				},
				getManifestEntry: function () {}
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true).then(
				function (aCodeExtensions) {
					assert.equal(aCodeExtensions.length, 0, "No extensions were returned.");
					done();
				}
			);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
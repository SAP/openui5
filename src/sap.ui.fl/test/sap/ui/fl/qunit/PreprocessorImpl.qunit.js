/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/PreprocessorImpl",
	"sap/ui/core/Component",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
],
function(
	PreprocessorImpl,
	Component,
	ManagedObject,
	FlexControllerFactory,
	Cache,
	ChangePersistenceFactory,
	ChangePersistence,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var controls = [];

	QUnit.module("sap.ui.fl.PreprocessorImpl", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
			controls.forEach(function(control) {
				control.destroy();
			});
			controls = [];
		}
	});

	QUnit.test("convert coding extensions back and forth", function(assert) {

		var done = assert.async();

		var sControllerName = "ui.s2p.mm.purchorder.approve.view.S2";
		sandbox.stub(Utils, "getAppComponentClassNameForComponent").returns("<sap-app-id> or <component name>");

		// encode
		var sCodeContent = "sap.ui.define('ui.s2p.mm.purchorder.approve.Extension', ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) { \n'use strict'; \nreturn ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension1', {extHookOnInit:function(){ \n// Place your hook implementation code here \nalert(\"S2controllerhookextension-oninit\"); \n}, \nonInit: function() { \nalert(\"This is onInit on S2\"); \n}});});";
		var sAsciiCodeContent = sap.ui.fl.Utils.stringToAscii(sCodeContent);
		var oChange = {
			fileName: "id_1436877480596_108",
			namespace: "ui.s2p.mm.purchorder.approve.Component",
			fileType: "change",
			layer: "CUSTOMER",
			creation: "20150720131919",
			changeType: "codeExt",
			reference: "<sap-app-id> or <component name>",
			content: {
				code: sAsciiCodeContent,
				extensionName: "ui.s2p.mm.purchorder.approve.Extension"
			},
			selector: {
				controllerName: sControllerName
			},
			conditions: {},
			support: {
				generator: "WebIde",
				user: "VIOL"
			}
		};

		var oFileContent = {
			"changes": {
				"changes": [oChange]
			}
		};

		var oChangesFillingCachePromise = new Promise(
			function (resolve, reject) {
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
					}
				};
			},
			getManifestEntry: function () {}
		};
		sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
		sandbox.stub(Utils, "getComponentName").returns("ui.s2p.mm.purchorder.approve.Component");

		// decode
		var oExtensionProvider = new PreprocessorImpl();

		//check sync case
		var spy = sandbox.spy(jQuery.sap.log, "warning");
		var aEmptyCodeExtensionSync = oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", false);
		//should return empty array and log warning
		assert.ok(Array.isArray(aEmptyCodeExtensionSync), "Calling PreprocessorImpl in sync mode should return an array");
		assert.equal(aEmptyCodeExtensionSync.length, 0, "Calling PreprocessorImpl in sync mode should return an empty array");
		assert.equal(spy.callCount, 1, "Warning should be logged in sync case");

		//check for error case, no component id
		var oEmptyCodeExtensionPromise = oExtensionProvider.getControllerExtensions(sControllerName, "", true);
		var oCodeExtensionsPromise = oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);

		oEmptyCodeExtensionPromise.then(function(aEmpty) {
			assert.equal(aEmpty.length, 0, "empty code extension returned empty array in promise");
			assert.equal(spy.callCount, 2, "Warning should be logged in case no componentId was passed");
			spy.restore();
			oCodeExtensionsPromise.then(function (aCodeExtensions) {
				assert.equal(aCodeExtensions.length, 1, "one code extension should be returned");
				// assert.ok(aCodeExtensions[0].onInit, "onInit is in the code extension");
				// assert.ok(typeof aCodeExtensions[0].onInit === "function", "onInit is a function");
				assert.equal(aCodeExtensions[0].getMetadata().getPublicMethods()[0], "extHookOnInit", "extHookOnInit is in the code extension");
				// assert.ok(typeof aCodeExtensions[0].extHookOnInit === "function", "extHookOnInit is a function");
				done();
			});
		});

	});

	QUnit.test("apply multiple changes on different controllers", function (assert) {
		// expect both extensions to be called
		assert.expect( 2 );
		var done1 = assert.async();
		var done2 = assert.async();
		sandbox.stub(Utils, "getAppComponentClassNameForComponent").returns("<sap-app-id> or <component name>");
		ManagedObject._sOwnerId = "<component name>";

		// perparation of the changes
		var sCodeContent1 = "sap.ui.define('sap.ui.fl.PreprocessorImpl.testResources.Extension1', ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) { \n'use strict'; \nreturn ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension1', {\nonInit: function() {\nthis.base.getView().callDone();\n}\n});\n});";
		var sAsciiCodeContent1 = sap.ui.fl.Utils.stringToAscii(sCodeContent1);
		var oCodingChange1 = {
			fileName: "id_1436877480596_108",
			namespace: "ui.s2p.mm.purchorder.approve.Component",
			fileType: "change",
			layer: "CUSTOMER",
			creation: "20150720131919",
			changeType: "codeExt",
			reference: "<sap-app-id> or <component name>",
			content: {
				code: sAsciiCodeContent1,
				extensionName: "sap.ui.fl.PreprocessorImpl.testResources.Extension1"
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

		var sCodeContent2 = "sap.ui.define('sap.ui.fl.PreprocessorImpl.testResources.Extension2', ['sap/ui/core/mvc/ControllerExtension'], function(ControllerExtension) { \n'use strict'; \nreturn ControllerExtension.extend('ui.s2p.mm.purchorder.approve.Extension2', {\nonInit: function() {\nthis.base.getView().callDone();\n}\n});\n});";
		var sAsciiCodeContent2 = sap.ui.fl.Utils.stringToAscii(sCodeContent2);
		var oCodingChange2 = {
			fileName: "id_1436877480596_109",
			namespace: "ui.s2p.mm.purchorder.approve.Component",
			fileType: "change",
			layer: "CUSTOMER",
			creation: "20150720131919",
			changeType: "codeExt",
			reference: "<sap-app-id> or <component name>",
			content: {
				code: sAsciiCodeContent2,
				extensionName: "sap.ui.fl.PreprocessorImpl.testResources.Extension2"
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

		var oFileContent = {
			"changes": {
				"changes": [oCodingChange1, oCodingChange2]
			}
		};

		var oChangesFillingCachePromise = new Promise(
			function (resolve, reject) {
				resolve(oFileContent);
			}
		);
		sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);

		// view, controller and component definition

		var oComp = sap.ui.component({
			name: "sap.ui.fl.PreprocessorImpl.testResources"
		});
		sandbox.stub(sap.ui, "component").returns(oComp);

		var view1 = sap.ui.view({
			viewName: "sap.ui.fl.PreprocessorImpl.testResources.view1",
			type: sap.ui.core.mvc.ViewType.XML,
			async: true,
			viewData: {
				component: oComp
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
				component: oComp
			}
		});
		view2.callDone = function () {
			assert.ok(true, "the extension of the second controller was applied and executed");
			done2();
		};

		var oCompCont = new sap.ui.core.ComponentContainer({
			component: oComp
		});
		oCompCont.placeAt("qunit-fixture");
	});

	QUnit.start();
});
/*global QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.PreprocessorImpl");
jQuery.sap.require("sap.ui.core.Component");
jQuery.sap.require("sap.ui.base.ManagedObject");
jQuery.sap.require("sap.ui.fl.FlexControllerFactory");
jQuery.sap.require("sap.ui.fl.Cache");
jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.ChangePersistence");
jQuery.sap.require("sap.ui.fl.Utils");

(function(PreprocessorImpl, Component, ManagedObject, FlexControllerFactory, Cache, ChangePersistenceFactory, ChangePersistence, Utils) {
	"use strict";
	sinon.config.useFakeTimers = false;

	jQuery.sap.registerModulePath("sap.ui.fl.PreprocessorImpl.testResources", "./testResources");

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
		var sCodeContent = "{extHookOnInit:function(){ \n// Place your hook implementation code here \nalert(\"S2controllerhookextension-oninit\"); \n}, \nonInit: function() { \nalert(\"This is onInit on S2\"); \n}}";
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
				code: sAsciiCodeContent
			},
			selector: {
				id: sControllerName
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
				assert.ok(aCodeExtensions[0].onInit, "onInit is in the code extension");
				assert.ok(typeof aCodeExtensions[0].onInit === "function", "onInit is a function");
				assert.ok(aCodeExtensions[0].extHookOnInit, "extHookOnInit is in the code extension");
				assert.ok(typeof aCodeExtensions[0].extHookOnInit === "function", "extHookOnInit is a function");
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
		var sCodeContent1 = "{onInit: function() { \nassert.ok(this.getView().getViewName() === \"sap.ui.fl.PreprocessorImpl.testResources.view1\", \"the extension of the first controller was applied and executed\"); \nthis.getView().callDone();}}";
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
				code: sAsciiCodeContent1
			},
			selector: {
				id: "sap.ui.fl.PreprocessorImpl.testResources.view1"
			},
			conditions: {},
			support: {
				generator: "WebIde",
				user: "VIOL"
			}
		};

		var sCodeContent2 = "{onInit: function() { \nassert.ok(this.getView().getViewName() === \"sap.ui.fl.PreprocessorImpl.testResources.view2\", \"the extension of the second controller was applied and executed\"); \nthis.getView().callDone(); \n}}";
		var sAsciiCodeContent2 = sap.ui.fl.Utils.stringToAscii(sCodeContent2);
		var oCodingChange2 = {
			fileName: "id_1436877480596_108",
			namespace: "ui.s2p.mm.purchorder.approve.Component",
			fileType: "change",
			layer: "CUSTOMER",
			creation: "20150720131919",
			changeType: "codeExt",
			reference: "<sap-app-id> or <component name>",
			content: {
				code: sAsciiCodeContent2
			},
			selector: {
				id: "sap.ui.fl.PreprocessorImpl.testResources.view2"
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
			done2();
		};

		var oCompCont = new sap.ui.core.ComponentContainer({
			component: oComp
		});
		oCompCont.placeAt("content");
	});

}(sap.ui.fl.PreprocessorImpl, sap.ui.core.Component, sap.ui.base.ManagedObject, sap.ui.fl.FlexControllerFactory, sap.ui.fl.Cache, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.ChangePersistence, sap.ui.fl.Utils));

/*globals QUnit, sinon*/
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
	var mProperties = {
		componentId: "preprocessorTest.Component"
	};

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

	QUnit.test("process shall resolve, after processView resolved successfully", function() {
		sandbox.stub(sap.ui.getCore(), "getComponent").returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "preprocessorTest.Component";
					}
				};
			},
			getManifestEntry: function () {
				return undefined;
			}
		});
		sandbox.stub(Component, "getOwnerIdFor").returns("preprocessorTest.Component");
		var flexController = FlexControllerFactory.create("preprocessorTest.Component");
		sandbox.stub(flexController, "processView").returns(Promise.resolve());

		var oControl = new sap.ui.core.Control("Id4711");
		controls.push(oControl);

		//Call CUT
		return PreprocessorImpl.process(oControl, mProperties).then(function() {
			sinon.assert.called(flexController.processView);
		});
	});

	QUnit.test("processView shall resolve, even if an exception occours, as long as the caller does not handle promises", function() {
		sandbox.stub(sap.ui.getCore(), "getComponent").throws(new Error("Issue getting component"));
		sandbox.stub(Component, "getOwnerIdFor").returns("preprocessorTest.Component");
		var flexController = FlexControllerFactory.create("preprocessorTest.Component");
		sandbox.stub(flexController, "processView").returns(Promise.resolve());
		sandbox.spy(jQuery.sap.log, "info");

		var oControl = new sap.ui.core.Control("Id4711");
		controls.push(oControl);

		//Call CUT
		return PreprocessorImpl.process(oControl, mProperties).then(function() {
			sinon.assert.called(jQuery.sap.log.info);
		});
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

		sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);


		// decode
		var oExtensionProvider = new PreprocessorImpl();
		var oCodeExtensionsPromise = oExtensionProvider.getControllerExtensions(sControllerName, "<component ID>", true);

		oCodeExtensionsPromise.then(function (aCodeExtensions) {
			assert.equal(aCodeExtensions.length, 1, "one code extension should be returned");
			assert.ok(aCodeExtensions[0].onInit, "onInit is in the code extension");
			assert.ok(typeof aCodeExtensions[0].onInit === "function", "onInit is a function");
			assert.ok(aCodeExtensions[0].extHookOnInit, "extHookOnInit is in the code extension");
			assert.ok(typeof aCodeExtensions[0].extHookOnInit === "function", "extHookOnInit is a function");

			done();
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

		sandbox.stub(sap.ui, "component");
		sandbox.stub(Cache, "getChangesFillingCache").returns(oChangesFillingCachePromise);

		// view, controller and component definition

		var oComp = sap.ui.component({
			name: "sap.ui.fl.PreprocessorImpl.testResources"
		});

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

/*global QUnit */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/util/XMLHelper",
	"sap/base/future",
	"sap/ui/base/DesignTime"
], function(coreLibrary, XMLTemplateProcessor, View, XMLView, XMLHelper, future, DesignTime) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;


	const sView =
		'<mvc:View height="100%" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" id="view" ' +
			'xmlns:dt="sap.ui.dt" displayBlock="true" unknownProperty="true">' +
			'<Panel id="panel">' +
				'<content>' +
					'<Button text="Button" id="button"></Button>' +
					'<Button text="Button With Designtime Data" id="buttonWithDTData" dt:test="testvalue"></Button>' +
					'<Button text="Button using core:require" id="buttonRequire" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="Button using Designtime Data and core:require" id="buttonWithDTDataAndRequire" dt:test="testvalue2" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="StashedButton" id="stashedButton" stashed="true"></Button>' +
					'<Button text="Wrong Type value" id="brokenButton" type="somethingInvalid"></Button>' +
					'<core:ExtensionPoint name="extension">' +
						'<Button text="ExtensionButton" id="extensionButton"></Button>' +
					'</core:ExtensionPoint>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>';
	const sView2 =
		'<mvc:View height="100%" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" ' +
			'xmlns:dt="sap.ui.dt" displayBlock="true" >' +
			'<Panel id="panel">' +
				'<content>' +
					'<Button text="Button" id="button"></Button>' +
					'<Button text="Button With Designtime Data" id="buttonWithDTData" dt:test="testvalue"></Button>' +
					'<Button text="Button using core:require" id="buttonRequire" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="Button using Designtime Data and core:require" id="buttonWithDTDataAndRequire" dt:test="testvalue2" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="StashedButton" id="stashedButton" stashed="true"></Button>' +
					'<Button text="Wrong Type value" id="brokenButton"></Button>' +
					'<core:ExtensionPoint name="extension">' +
						'<Button text="ExtensionButton" id="extensionButton"></Button>' +
					'</core:ExtensionPoint>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>';

	const sView3 =
		'<mvc:View height="100%" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" ' +
			'xmlns:dt="sap.ui.dt" displayBlock="true" >' +
			'<Panel id="panel">' +
				'<content>' +
					'<Button text="Button" id="button"></Button>' +
					'<Button text="Button With Designtime Data" id="buttonWithDTData" dt:test="testvalue"></Button>' +
					'<Button text="Button using core:require" id="buttonRequire" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="Button using Designtime Data and core:require" id="buttonWithDTDataAndRequire" dt:test="testvalue2" core:require="{Link:\'sap/m/Link\'}"></Button>' +
					'<Button text="StashedButton" id="stashedButton" stashed="true"></Button>' +
					'<Button text="Wrong Type value" id="brokenButton" type="somethingInvalid"></Button>' +
					'<Button text="Wrong Type value" id="brokenButton"></Button>' +
					'<core:ExtensionPoint name="extension">' +
						'<Button text="ExtensionButton" id="extensionButton"></Button>' +
					'</core:ExtensionPoint>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>';

	QUnit.module("parseScalarType (future=true)", {});

	QUnit.test("Error Logging of invalid type values", async function (assert) {
		future.active = true;
		const oView = XMLView.create({
			definition: sView3
		});
		assert.rejects(oView);
		await oView.catch((err) => {
			assert.ok(err.message.includes("Value 'somethingInvalid' is not valid for type 'sap.m.ButtonType'.", "View creation rejected with type error"));
		});
	});

	QUnit.module("General");

	QUnit.test("on design mode create Controls and fragment with correct declarativeSourceInfo", function (assert) {
		var fnOrigIsDesignModeEnabled = DesignTime.isDesignModeEnabled;
		DesignTime.isDesignModeEnabled = function () {
			return true;
		};

		return View.create({
			viewName: "my.View",
			type: ViewType.XML
		}).then(function(oView) {
			DesignTime.isDesignModeEnabled = fnOrigIsDesignModeEnabled;

			var oButton = oView.byId("button");
			assert.ok(oButton, "button control is created");
			assert.equal(oButton._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "Button");
			var xmlRootNode = oButton._sapui_declarativeSourceInfo.xmlRootNode;
			assert.equal(xmlRootNode.getAttribute("controllerName"), "my.View");
			var oLabel = oView.byId("namedName");
			assert.equal(oLabel._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "{named>name}");
			assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.fragmentName, "my.Fragment");
			assert.equal(oLabel._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);
			assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);
			oView.destroy();
		});
	});

	QUnit.test("on regular mode create Controls and fragment with no declarativeSourceInfo", function (assert) {
		return View.create({
			viewName: "my.View",
			type: ViewType.XML
		}).then(function (oView) {
			var oButton = oView.byId("button");
			assert.ok(oButton, "button control is created");
			assert.notOk(oButton.hasOwnProperty("_sapui_declarativeSourceInfo"));
			var oLabel = oView.byId("namedName");
			assert.notOk(oLabel.hasOwnProperty("_sapui_declarativeSourceInfo"));
			oView.destroy();
		});
	});

	QUnit.module("Metadata Contexts");

	QUnit.test("On regular controls with metadataContexts the XMLTemplateProcessor._preprocessMetadataContexts is called", function (assert) {
		var mMetadataContexts = {};

		XMLTemplateProcessor._preprocessMetadataContexts = function(sClassName, mSettings, oContext) {
			mMetadataContexts = mSettings.metadataContexts;
		};

		return View.create({
			viewName: "my.View",
			type: ViewType.XML
		}).then(function (oView) {
			assert.ok(mMetadataContexts,"XMLTemplateProcessor._preprocessMetadataContexts is called");
			oView.destroy();
			XMLTemplateProcessor._preprocessMetadataContexts = null;
		});
	});

	QUnit.test("The named model map is built correctly", function (assert) {
		var sError,mMap = XMLTemplateProcessor._calculatedModelMapping("{/path}",null,true);

		assert.ok(mMap,"The map is build for {/path}");
		assert.ok(mMap[undefined],"The map contains an entry keyed by the undefined model");
		assert.equal(mMap[undefined].length,1,"The keyed model is an array of length one");
		assert.equal(mMap[undefined][0].path,'/path',"The resulting path is '/path'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model>/path}",null,true);

		assert.ok(mMap,"The map is build for {model>/path}");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].length,1,"The keyed model is an array of length one");
		assert.equal(mMap["model"][0].path,'/path',"The resulting path is '/path'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}",null,true);

		assert.ok(mMap,"The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} allowing multiple contexts");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].length,1,"The keyed 'model' model is an array of length one");
		assert.equal(mMap["model"][0].path,'/path',"The 'model' resulting path is '/path'");
		assert.equal(mMap[undefined].length,2,"The 'undefined' model entry is an array of length two");
		assert.equal(mMap[undefined][0].path,'/path',"The resulting path is '/path'");
		assert.equal(mMap[undefined][0].name,'context1',"The resulting context name is 'context1'");
		assert.equal(mMap[undefined][1].path,'/any',"The resulting path is '/any'");
		assert.equal(mMap[undefined][1].name,'context2',"The resulting context name is 'context2'");

		mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}",null,false);

		assert.ok(mMap,"The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} not allowing multiple contexts");
		assert.ok(mMap["model"],"The map contains an entry keyed by the 'model' model");
		assert.equal(mMap["model"].path,'/path',"The 'model' resulting path is '/path'");
		assert.ok(mMap[undefined],"The 'undefined' model entry is an object");
		assert.equal(mMap[undefined].path,'/any',"The resulting path is '/any', i.e. the first binding gets overrulled");
		assert.equal(mMap[undefined].name,'context2',"The resulting context name is 'context2', i.e. the first binding gets overrulled");

		try {
			mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}",null,false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Wrong delimiter in {model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
		sError = null;

		try {
			mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}",null,false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Missing , in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
		sError = null;

		try {
			mMap = XMLTemplateProcessor._calculatedModelMapping("huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}",null,false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Not starting with binding in huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} detected");
		sError = null;

		try {
			mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}uhuhuh",null,false);
		} catch (e) {
			sError = e.message;
		}

		assert.ok(sError,"Not ending with binding in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}huhuhuh is detected");
	});

	QUnit.module("Custom Settings",{
		beforeEach: function() {
			this.pView = XMLView.create({
				definition: sView2,
				id: "view"
			});
			this.xml = XMLHelper.parse(sView);
		},
		afterEach: function() {
			this.pView.then(function(oView) {
				oView.destroy();
			});
		}
	});

	QUnit.test("Adding and cloning of sap-ui-custom-settings from xml namespaced attributes", function (assert) {
		return this.pView.then(function(oView) {
			var oButton = oView.byId("buttonWithDTData"),
				mCustomSettings = oButton.data("sap-ui-custom-settings");
			assert.ok(mCustomSettings != null,"Custom Settings available for button with namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"].test === "testvalue","Custom Settings test available for button in namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"] !== null,"Custom Settings available for button with namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"]["test"] === "testvalue","Custom Settings available for button in namespace sap.ui.dt/test");
			assert.ok(mCustomSettings["notexisting"] === undefined,"Custom Settings available for button with not existing namespace");

			var oClone = oButton.clone(),
				mCustomSettingsClone = oClone.data("sap-ui-custom-settings");
			assert.ok(mCustomSettingsClone !== null,"Custom Settings available for clone with namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"].test === "testvalue","Custom Settings test available for clone in namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"] === mCustomSettings["sap.ui.dt"],"Custom Settings available for clone with namespace sap.ui.dt and is a reference");
			assert.ok(mCustomSettingsClone["sap.ui.dt"] != null,"Custom Settings available for clone with namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"]["test"] === "testvalue","Custom Settings available for clone in namespace sap.ui.dt/test");
			assert.ok(mCustomSettingsClone["notexisting"] === undefined,"Custom Settings available for clone with not existing namespace");
		});
	});
});

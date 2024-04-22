/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/util/XMLHelper",
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/base/DesignTime",
	"sap/ui/thirdparty/jquery"
], function (coreLibrary, XMLTemplateProcessor, View, XMLView, XMLHelper, future, Log, DesignTime, jQuery) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	var sRootView =
		'<mvc:View height="100%" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
		'</mvc:View>';


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

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.module("parseViewAttributes");

	QUnit.test("return value - legacy factory API", function(assert) {
		var oView = sap.ui.xmlview({
			viewContent: sRootView
		});

		var oSpy = this.spy(oView, "applySettings");

		var xmlNode = XMLHelper.parse(sView).documentElement;
		XMLTemplateProcessor.parseTemplate(xmlNode, oView);

		assert.strictEqual(oSpy.callCount, 1, "applySettings is called once within the parsing process");
		var mSettings = oSpy.getCall(0).args[0];

		assert.strictEqual(mSettings.displayBlock, true, "displayBlock is parsed");
		assert.strictEqual(mSettings.height, "100%", "height is parsed");
		assert.notOk(mSettings.hasOwnProperty("unknownProperty"), "unknownProperty should be ignored");
	});

	QUnit.test("return value", function(assert) {
		return XMLView.create({
			definition: sRootView
		}).then(function(oView) {
			var oSpy = this.spy(oView, "applySettings");

			var xmlNode = XMLHelper.parse(sView).documentElement;
			XMLTemplateProcessor.parseTemplate(xmlNode, oView);

			assert.strictEqual(oSpy.callCount, 1, "applySettings is called once within the parsing process");
			var mSettings = oSpy.getCall(0).args[0];

			assert.strictEqual(mSettings.displayBlock, true, "displayBlock is parsed");
			assert.strictEqual(mSettings.height, "100%", "height is parsed");
			assert.notOk(mSettings.hasOwnProperty("unknownProperty"), "unknownProperty should be ignored");
		}.bind(this));
	});

	/**
	 * @deprecated
	 */
	QUnit.module("parseScalarType (future=false)", {
		beforeEach: function() {
			future.active = false;
			this.oLogSpy = sinon.spy(Log, "error");
			this.pViewLoaded = XMLView.create({
				definition: sView
			});
			return this.pViewLoaded;
		},
		afterEach: function() {
			return this.pViewLoaded.then(function (oView) {
				this.oLogSpy.restore();
				oView.destroy();
				future.active = undefined;
			}.bind(this));
		}
	});

	QUnit.test("Error Logging of invalid type values", function (assert) {
		assert.ok(this.oLogSpy.calledOnce, "Log.error was only called once");
		assert.ok(this.oLogSpy.calledWith(sinon.match(/Value 'somethingInvalid' is not valid for type 'sap.m.ButtonType'./)), "Log.error spy was called");
	});

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

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.module("enrichTemplateIds - legacy factory API", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview({
				viewContent: sRootView,
				id: "root",
				async: true
			});
			this.xml = XMLHelper.parse(sView);
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("create IDs", function(assert) {
		return this.oView.loaded().then(function() {
			assert.ok(jQuery.isXMLDoc(this.xml), "valid xml document as input");
			var xml = XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, this.oView);
			assert.ok(jQuery.isXMLDoc(xml), "valid xml document returned");
			assert.strictEqual(xml.parentNode, this.xml, "no copying");
			var node = jQuery(this.xml).find("#root--button")[0];
			assert.ok(node, "control was found by full id");
			assert.equal(node.nodeName, "Button", "button is a button");
			assert.equal(node.getAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id"), "true", "full id flag is set to true");
		}.bind(this));
	});

	QUnit.test("create Controls", function(assert) {
		return this.oView.loaded().then(function() {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, this.oView);
			assert.ok(!this.oView.byId("button"), "no control has been created yet");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, this.oView);
			assert.ok(this.oView.byId("button"), "button control is created");
		}.bind(this));
	});

	QUnit.test("do not create stashed Controls", function(assert) {
		return this.oView.loaded().then(function() {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, this.oView);
			assert.ok(!this.oView.byId("stashedButton"), "no stashed control has been created yet");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, this.oView);
			assert.ok(this.oView.byId("stashedButton"), "stashed button control is created");
		}.bind(this));
	});

	QUnit.test("do not process ExtensionPoints", function(assert) {
		return this.oView.loaded().then(function() {
			// Preferrably we should test with a spy on "ExtensionPoint", but due
			// to the AMD module handling it is not possible to place one
			var node = jQuery(this.xml).find("#extensionButton")[0];
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, this.oView);
			assert.equal(node.getAttribute("id"), "extensionButton", "id was not enriched");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, this.oView);
			assert.ok(this.oView.byId("extensionButton"), "extension button is created");
		}.bind(this));
	});

	QUnit.test("do not collect known namespaces as custom settings", function(assert) {
		var oXMLSerializer = new XMLSerializer();
		return this.oView.loaded().then(function() {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, this.oView);
			// serialize and deserialize the XML to enforce the namespaced attributes
			this.xml = XMLHelper.parse(
				oXMLSerializer.serializeToString(this.xml.documentElement)
			);
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, this.oView);
			// no custom settings for known namespaces at all
			assert.equal(
				this.oView.data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (view)");
			assert.equal(
				this.oView.byId("panel").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (panel)");
			assert.equal(
				this.oView.byId("button").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (button)");
			assert.equal(
				this.oView.byId("buttonRequire").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (button with core:require)");
			// only custom settings for unknown namespaces, e.g. dt
			// but no additional settings for known namespaces
			assert.deepEqual(
				this.oView.byId("buttonWithDTDataAndRequire").data("sap-ui-custom-settings"),
				{
					"sap.ui.dt": {
						"test": "testvalue2"
					}
				},
				"custom setting should have been collected only for unknown namespaces (button with dt:test & core:require)");

		}.bind(this));
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.module("enrichTemplateIds", {
		beforeEach: function() {
			this.pView = XMLView.create({
				definition: sRootView,
				id: "root",
				async: true
			});
			this.xml = XMLHelper.parse(sView);
		},
		afterEach: function() {
			this.pView.then(function(oView) {
				oView.destroy();
			});
		}
	});

	QUnit.test("create IDs", function(assert) {
		return this.pView.then(function(oView) {
			assert.ok(jQuery.isXMLDoc(this.xml), "valid xml document as input");
			var xml = XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, oView);
			assert.ok(jQuery.isXMLDoc(xml), "valid xml document returned");
			assert.strictEqual(xml.parentNode, this.xml, "no copying");
			var node = jQuery(this.xml).find("#root--button")[0];
			assert.ok(node, "control was found by full id");
			assert.equal(node.nodeName, "Button", "button is a button");
			assert.equal(node.getAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id"), "true", "full id flag is set to true");
		}.bind(this));
	});

	QUnit.test("create Controls", function(assert) {
		return this.pView.then(function(oView) {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, oView);
			assert.ok(!oView.byId("button"), "no control has been created yet");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, oView);
			assert.ok(oView.byId("button"), "button control is created");
		}.bind(this));
	});

	QUnit.test("do not create stashed Controls", function(assert) {
		return this.pView.then(function(oView) {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, oView);
			assert.ok(!oView.byId("stashedButton"), "no stashed control has been created yet");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, oView);
			assert.ok(oView.byId("stashedButton"), "stashed button control is created");
		}.bind(this));
	});

	QUnit.test("do not process ExtensionPoints", function(assert) {
		return this.pView.then(function(oView) {
			// Preferrably we should test with a spy on "ExtensionPoint", but due
			// to the AMD module handling it is not possible to place one
			var node = jQuery(this.xml).find("#extensionButton")[0];
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, oView);
			assert.equal(node.getAttribute("id"), "extensionButton", "id was not enriched");
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, oView);
			assert.ok(oView.byId("extensionButton"), "extension button is created");
		}.bind(this));
	});

	QUnit.test("do not collect known namespaces as custom settings", function(assert) {
		var oXMLSerializer = new XMLSerializer();
		return this.pView.then(function(oView) {
			XMLTemplateProcessor.enrichTemplateIds(this.xml.documentElement, oView);
			// serialize and deserialize the XML to enforce the namespaced attributes
			this.xml = XMLHelper.parse(
				oXMLSerializer.serializeToString(this.xml.documentElement)
			);
			XMLTemplateProcessor.parseTemplate(this.xml.documentElement, oView);
			// no custom settings for known namespaces at all
			assert.equal(
				oView.data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (view)");
			assert.equal(
				oView.byId("panel").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (panel)");
			assert.equal(
				oView.byId("button").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (button)");
			assert.equal(
				oView.byId("buttonRequire").data("sap-ui-custom-settings"), null,
					"no custom setting should have been collected (button with core:require)");
			// only custom settings for unknown namespaces, e.g. dt
			// but no additional settings for known namespaces
			assert.deepEqual(
				oView.byId("buttonWithDTDataAndRequire").data("sap-ui-custom-settings"),
					{
						"sap.ui.dt": {
							"test": "testvalue2"
						}
					},
					"custom setting should have been collected only for unknown namespaces (button with dt:test & core:require)");

		}.bind(this));
	});

	QUnit.module("General");

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("on design mode create Controls and fragment with correct declarativeSourceInfo (legacy factory API)", function (assert) {
		var fnOrigIsDesignModeEnabled = DesignTime.isDesignModeEnabled;
		DesignTime.isDesignModeEnabled = function () {
			return true;
		};
		var oView = sap.ui.view({
			viewName: "my.View",
			type: ViewType.XML
		});
		DesignTime.isDesignModeEnabled = fnOrigIsDesignModeEnabled;
		return oView.loaded().then(function () {
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

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("on regular mode create Controls and fragment with no declarativeSourceInfo (legacy factory API)", function (assert) {
		return sap.ui.view({
			viewName: "my.View",
			type: ViewType.XML
		}).loaded().then(function (oView) {
			var oButton = oView.byId("button");
			assert.ok(oButton, "button control is created");
			assert.notOk(oButton.hasOwnProperty("_sapui_declarativeSourceInfo"));
			var oLabel = oView.byId("namedName");
			assert.notOk(oLabel.hasOwnProperty("_sapui_declarativeSourceInfo"));
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

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("On regular controls with metadataContexts the XMLTemplateProcessor._preprocessMetadataContexts is called (legacy factory API)", function (assert) {
		var mMetadataContexts = {};

		XMLTemplateProcessor._preprocessMetadataContexts = function(sClassName, mSettings, oContext) {
			mMetadataContexts = mSettings.metadataContexts;
		};

		return sap.ui.view({
			viewName: "my.View",
			type: ViewType.XML
		}).loaded().then(function (oView) {
			assert.ok(mMetadataContexts,"XMLTemplateProcessor._preprocessMetadataContexts is called");
			oView.destroy();
			XMLTemplateProcessor._preprocessMetadataContexts = null;
		});
	});

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

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.module("Custom Settings - legacy factory API", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview({
				viewContent: sView,
				id: "view",
				async: true
			});
			this.xml = XMLHelper.parse(sView);
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Adding and cloning of sap-ui-custom-settings from xml namespaced attributes", function (assert) {
		return this.oView.loaded().then(function () {
			var oButton = this.oView.byId("buttonWithDTData"),
				mCustomSettings = oButton.data("sap-ui-custom-settings");
			assert.ok(mCustomSettings != null, "Custom Settings available for button with namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"].test === "testvalue", "Custom Settings test available for button in namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"] !== null, "Custom Settings available for button with namespace sap.ui.dt");
			assert.ok(mCustomSettings["sap.ui.dt"]["test"] === "testvalue", "Custom Settings available for button in namespace sap.ui.dt/test");
			assert.ok(mCustomSettings["notexisting"] === undefined, "Custom Settings available for button with not existing namespace");

			var oClone = oButton.clone(),
				mCustomSettingsClone = oClone.data("sap-ui-custom-settings");
			assert.ok(mCustomSettingsClone !== null, "Custom Settings available for clone with namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"].test === "testvalue", "Custom Settings test available for clone in namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"] === mCustomSettings["sap.ui.dt"], "Custom Settings available for clone with namespace sap.ui.dt and is a reference");
			assert.ok(mCustomSettingsClone["sap.ui.dt"] != null, "Custom Settings available for clone with namespace sap.ui.dt");
			assert.ok(mCustomSettingsClone["sap.ui.dt"]["test"] === "testvalue", "Custom Settings available for clone in namespace sap.ui.dt/test");
			assert.ok(mCustomSettingsClone["notexisting"] === undefined, "Custom Settings available for clone with not existing namespace");
		}.bind(this));
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

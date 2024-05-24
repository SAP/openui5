/* global sinon QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Component",
	"sap/ui/core/Fragment",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/Controller",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/jquery",
	"testdata/fragments_legacyAPIs/TypedView"
], function (Log, qutils, Component, Fragment, XMLTemplateProcessor, Panel, Button, HorizontalLayout, JSONModel, createAndAppendDiv, nextUIUpdate, Element, View, XMLView, Controller, LoaderExtensions, jQuery, TypedView) {
	"use strict";

	createAndAppendDiv(["content1", "content2", "content3", "content4", "binding"]);

	var DATABOUND_TEXT = "Text from Databinding";
	var DATABOUND_GLOBAL_TEXT_IN_DIALOG = "Text from global Model";

	var data = {
		someText: DATABOUND_TEXT,
		dialogText: DATABOUND_GLOBAL_TEXT_IN_DIALOG
	};

	var oModel = new JSONModel();
	oModel.setData(data);
	sap.ui.getCore().setModel(oModel);

	// inline JS Fragment definition

	sap.ui.jsfragment("example.fragment_legacyAPIs.jstest", {
		createContent: function(oController) {
			var oJSFragBtn = new Button("jsfragbtn", {
				text: "This is a JS Fragment",
				press: oController.doSomething
			});
			return oJSFragBtn;
		}
	});

	// View definition
	sap.ui.jsview("example.fragment_legacyAPIs.test", {

		getControllerName: function() {
			return "example.fragment_legacyAPIs.test";
		},

		createContent: function(oController) {
			var oPanel = new Panel(this.createId("myPanel"));

			var oJsFragment = sap.ui.fragment("example.fragment_legacyAPIs.jstest", "JS", oController);
			oPanel.addContent(oJsFragment);

			var myXml = '<Button xmlns="sap.m" id="xmlfragbtn" text="This is an XML Fragment" press="doSomething"></Button>';
			var oXmlFragment = sap.ui.xmlfragment({
				fragmentContent: myXml
			}, oController);
			oPanel.addContent(oXmlFragment);

			var myHtml = '<div id="htmlfragbtn" data-sap-ui-type="sap.m.Button" data-text="This is an HTML Fragment" data-press="doSomething"></div>';
			var oHtmlFragment = sap.ui.htmlfragment({
				fragmentContent: myHtml
			}, oController);
			oPanel.addContent(oHtmlFragment);

			return [oPanel];
		}
	});

	// Controller definition
	sap.ui.controller("example.fragment_legacyAPIs.test", {

		onInit: function() {},

		doSomething: function(oEvent) {
			QUnit.config.current.assert.ok(true, "Controller method 'doSomething' called");
		}

	});

	function triggerClickEvent(sId) {
		qutils.triggerEvent("mousedown", sId);
		qutils.triggerEvent("mouseup", sId);
		qutils.triggerEvent("click", sId);
	}

	// TESTS

	QUnit.module("External Fragments", {
		beforeEach: function(assert) {
			this.oDummyController = {
				doSomething: function() {
					assert.ok(true, "Dummy Controller method 'doSomething' called");
				}
			};
		}
	});



	QUnit.test("XML Fragment loaded from file", async function(assert) {
		var oFragment = sap.ui.xmlfragment("testdata.fragments_legacyAPIs.XMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "XML Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "btnInXmlFragment", "Button with given ID should have exactly this ID");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Element.getElementById("btnInXmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID", async function(assert) {
		var oFragment = sap.ui.xmlfragment("myXmlFrag", "testdata.fragments_legacyAPIs.XMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "XML Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "myXmlFrag--btnInXmlFragment", "Button with given ID should have this ID with Fragment ID prefix");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Fragment.byId("myXmlFrag", "btnInXmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID and root control ID", async function(assert) {
		var oFragment = sap.ui.xmlfragment("myXmlFrag1", "testdata.fragments_legacyAPIs.XMLTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.equal(id, "myXmlFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = Fragment.byId("myXmlFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});


	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment loaded from file", async function(assert) {
		var oFragment = sap.ui.htmlfragment("testdata.fragments_legacyAPIs.HTMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "HTML Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "btnInHtmlFragment", "Button with given ID should have exactly this ID");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Element.getElementById("btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment loaded from file with given Fragment ID", async function(assert) {
		var oFragment = sap.ui.htmlfragment("myHtmlFrag", "testdata.fragments_legacyAPIs.HTMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "HTML Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "myHtmlFrag--btnInHtmlFragment", "Button with given ID should have this ID with Fragment ID prefix");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Fragment.byId("myHtmlFrag", "btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});


	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment loaded from file with given Fragment ID and root control ID", async function(assert) {
		var oFragment = sap.ui.htmlfragment("myHtmlFrag1", "testdata.fragments_legacyAPIs.HTMLTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.equal(id, "myHtmlFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = Fragment.byId("myHtmlFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});



	QUnit.test("JS Fragment loaded from file", async function(assert) {
		var oFragment = sap.ui.jsfragment("testdata.fragments_legacyAPIs.JSTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "JS Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "btnInJsFragment", "Button with given ID should have exactly this ID");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Element.getElementById("btnInJsFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID", async function(assert) {
		var oFragment = sap.ui.jsfragment("myJsFrag", "testdata.fragments_legacyAPIs.JSTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();

		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
		assert.ok(document.getElementById(id), "JS Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		var btn2 = aContent[1];
		assert.equal(btn1.getId(), "myJsFrag--btnInJsFragment", "Button with given ID should have this ID with Fragment ID prefix");
		assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		// Data binding
		assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

		// find controls by ID
		var btn = Fragment.byId("myJsFrag", "btnInJsFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});


	QUnit.test("JS Fragment loaded from file with given Fragment ID and root control ID", async function(assert) {
		var oFragment = sap.ui.jsfragment("myJsFrag1", "testdata.fragments_legacyAPIs.JSTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.equal(id, "myJsFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = Fragment.byId("myJsFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});


	QUnit.module("Inline Fragments");

	QUnit.test("Inline Fragments within JSView", async function(assert) {
		assert.expect(10); // incl. Button click handler

		// Inline Fragments preconditions
		assert.ok(!document.getElementById("jsfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("xmlfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("htmlfragbtn"), "Fragment should not be rendered");

		// JSView creation with Fragments used inside
		var oViewWithFragments = sap.ui.jsview("myView", "example.fragment_legacyAPIs.test");
		oViewWithFragments.placeAt("content2");
		await nextUIUpdate();
		assert.ok(document.getElementById("myView"), "JSView should be rendered");

		// Inline JS Fragment
		assert.ok(document.getElementById("jsfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("jsfragbtn");

		// Inline XML Fragment
		assert.ok(document.getElementById("xmlfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("xmlfragbtn");

		// Inline HTML Fragment
		assert.ok(document.getElementById("htmlfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("htmlfragbtn");

		oViewWithFragments.destroy();
	});

	QUnit.test("Inline Fragments within synchronous Typed View", async function(assert) {
		assert.expect(10); // incl. Button click handler

		// Inline Fragments preconditions
		assert.ok(!document.getElementById("jsfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("xmlfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("htmlfragbtn"), "Fragment should not be rendered");

		// JSView creation with Fragments used inside
		var oViewWithFragments = new TypedView("myView");

		oViewWithFragments.placeAt("content2");
		await nextUIUpdate();
		assert.ok(document.getElementById("myView"), "JSView should be rendered");

		// Inline JS Fragment
		assert.ok(document.getElementById("jsfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("jsfragbtn");

		// Inline XML Fragment
		assert.ok(document.getElementById("xmlfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("xmlfragbtn");

		// Inline HTML Fragment
		assert.ok(document.getElementById("htmlfragbtn"), "Fragment should be rendered");
		// Fragment knows Controller, Fragment calling Controller methods
		triggerClickEvent("htmlfragbtn");

		oViewWithFragments.destroy();
	});

	QUnit.test("Inline Fragments within asynchronous Typed View", function(assert) {
		assert.expect(10); // incl. Button click handler

		// Inline Fragments preconditions
		assert.ok(!document.getElementById("jsfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("xmlfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("htmlfragbtn"), "Fragment should not be rendered");

		// JSView creation with Fragments used inside
		return View.create({
			id: "myView",
			viewName: "module:testdata/fragments_legacyAPIs/TypedView"
		}).then(async function (oViewWithFragments) {
			oViewWithFragments.placeAt("content2");
			await nextUIUpdate();
			assert.ok(document.getElementById("myView"), "JSView should be rendered");

			// Inline JS Fragment
			assert.ok(document.getElementById("jsfragbtn"), "Fragment should be rendered");
			// Fragment knows Controller, Fragment calling Controller methods
			triggerClickEvent("jsfragbtn");

			// Inline XML Fragment
			assert.ok(document.getElementById("xmlfragbtn"), "Fragment should be rendered");
			// Fragment knows Controller, Fragment calling Controller methods
			triggerClickEvent("xmlfragbtn");

			// Inline HTML Fragment
			assert.ok(document.getElementById("htmlfragbtn"), "Fragment should be rendered");
			// Fragment knows Controller, Fragment calling Controller methods
			triggerClickEvent("htmlfragbtn");

			oViewWithFragments.destroy();
		});
	});

	QUnit.module("Fragments referenced from XMLViews");

	var oXmlView, oXmlFragmentInXmlView, oXmlFragmentWithIdInXmlView, oHtmlFragmentInXmlView,
		oHtmlFragmentWithIdInXmlView, oJsFragmentInXmlView, oJsFragmentWithIdInXmlView;

	var DATABOUND_TEXT_IN_VIEW = "Text from Databinding in View";

	QUnit.test("XMLView Rendering", async function(assert) {
		oXmlView = sap.ui.xmlview("testdata.fragments_legacyAPIs.XMLViewWithFragments");
		oXmlView.placeAt("content3");
		await nextUIUpdate();

		var data = {
			someText: DATABOUND_TEXT_IN_VIEW
		};

		var oModel = new JSONModel();
		oModel.setData(data);
		oXmlView.setModel(oModel);

		await nextUIUpdate(); // update data binding in DOM

		var aContent = oXmlView.getContent();
		oXmlFragmentInXmlView = aContent[0];
		oXmlFragmentWithIdInXmlView = aContent[1];

		oJsFragmentInXmlView = aContent[2];
		oJsFragmentWithIdInXmlView = aContent[3];

		oHtmlFragmentInXmlView = aContent[4];
		oHtmlFragmentWithIdInXmlView = aContent[5];


		assert.ok(oXmlView.getDomRef(), "XMLView should be rendered");
	});


	QUnit.test("XML Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oXmlFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "XML Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oXmlFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--btnInXmlFragment", "static Control ID inside Fragment should be prefixed by View ID");
		triggerClickEvent(btn1id);

		var btn2 = oXmlFragmentInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId("btnInXmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("XML Fragment in XMLView with given Fragment ID", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oXmlFragmentWithIdInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oXmlFragmentWithIdInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--xmlInXml--btnInXmlFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		triggerClickEvent(btn1id);

		var btn2 = oXmlFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(Fragment.createId("xmlInXml", "btnInXmlFragment"));
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});



	QUnit.test("JS Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oJsFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oJsFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--btnInJsFragment", "static Control ID inside Fragment should be prefixed by View ID");
		triggerClickEvent(btn1id);

		var btn2 = oJsFragmentInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId("btnInJsFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("JS Fragment in XMLView with given Fragment ID", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oJsFragmentWithIdInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oJsFragmentWithIdInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--jsInXml--btnInJsFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		triggerClickEvent(btn1id);

		var btn2 = oJsFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(Fragment.createId("jsInXml", "btnInJsFragment"));
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});


	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oHtmlFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oHtmlFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--btnInHtmlFragment", "static Control ID inside Fragment should be prefixed by View ID");
		triggerClickEvent(btn1id);

		var btn2 = oHtmlFragmentInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId("btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment in XMLView with given Fragment ID", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oHtmlFragmentWithIdInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oHtmlFragmentWithIdInXmlView.getContent()[0].getId();
		assert.equal(btn1id, oXmlView.getId() + "--htmlInXml--btnInHtmlFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		triggerClickEvent(btn1id);

		var btn2 = oHtmlFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(Fragment.createId("htmlInXml", "btnInHtmlFragment"));
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});



	QUnit.module("Dialog Fragments");

	var DATABOUND_TEXT_IN_DIALOG = "Text from Databinding in Dialog";

	var data = {
		dialogText: DATABOUND_TEXT_IN_DIALOG
	};

	var oDialogModel = new JSONModel();
	oDialogModel.setData(data);


	QUnit.test("JS Fragment as Dialog", function(assert) {
		var done = assert.async();
		var oDialog = sap.ui.jsfragment("testdata.fragments_legacyAPIs.JSFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("jsDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("jsDialog"), "Fragment should be rendered now");

		window.setTimeout(async function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#jsDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			await nextUIUpdate();
			assert.equal(jQuery("#jsDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			triggerClickEvent("jsDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});


	QUnit.test("XML Fragment as Dialog", function(assert) {
		var done = assert.async();
		var oDialog = sap.ui.xmlfragment("testdata.fragments_legacyAPIs.XMLFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("xmlDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("xmlDialog"), "Fragment should be rendered now");

		window.setTimeout(async function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#xmlDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			await nextUIUpdate();
			assert.equal(jQuery("#xmlDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			triggerClickEvent("xmlDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});


	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment as Dialog", function(assert) {
		var done = assert.async();
		var oDialog = sap.ui.htmlfragment("testdata.fragments_legacyAPIs.HTMLFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("htmlDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("htmlDialog"), "Fragment should be rendered now");

		window.setTimeout(async function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#htmlDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			await nextUIUpdate();
			assert.equal(jQuery("#htmlDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			triggerClickEvent("htmlDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment as Dialog Template", function(assert) {
		assert.expect(6);
		var done = assert.async();
		var oDialog = sap.ui.htmlfragment("testdata.fragments_legacyAPIs.HTMLFragmentDialogTemplate", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.strictEqual(oDialog.getId(), "myHtmlDialog", "HTMLDialog has the correct ID");
		assert.strictEqual(oDialog.getContent().length, 2, "HTMLDialog has two controls in content aggregation");
		assert.notOk(oDialog.getDomRef(), "HTMLDialog has no DomRef");

		oDialog.attachAfterOpen(function (oEvent) {
			assert.deepEqual(oDialog, oEvent.getSource(), "Dialog open");
			assert.ok(oDialog.getDomRef(), "HTMLDialog has a DomRef");

			oDialog.attachAfterClose(function () {
				assert.notOk(oDialog.getDomRef(), "HTMLDialog has no DomRef");

				oDialog.destroy();
				done();
			});

			triggerClickEvent("htmlDialogBtn"); // close it
		});

		oDialog.open();
	});



	QUnit.module("Fragments with no Controller");

	QUnit.test("XML Fragment loaded from file", async function(assert) {
		assert.expect(2);
		var oFragment = sap.ui.xmlfragment("testdata.fragments_legacyAPIs.XMLTestFragmentNoController");
		oFragment.placeAt("content4");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		oFragment.destroy();
	});

	QUnit.test("JS Fragment loaded from file", async function(assert) {
		assert.expect(3); // including one check in the View' createContent method
		var oFragment = sap.ui.jsfragment("testdata.fragments_legacyAPIs.JSTestFragmentNoController");
		oFragment.placeAt("content4");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		oFragment.destroy();
	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment loaded from file", async function(assert) {
		assert.expect(2);
		var oFragment = sap.ui.htmlfragment("testdata.fragments_legacyAPIs.HTMLTestFragmentNoController");
		oFragment.placeAt("content4");
		await nextUIUpdate();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

		oFragment.destroy();
	});

	QUnit.module("DataBinding", {
		beforeEach: function() {
		},

		afterEach: function() {
			jQuery("#binding").empty();
		}
	});

	QUnit.test("Unnamed Model", async function(assert) {
		sap.ui.xmlview("unnamedView", "my.UnnamedView").placeAt("binding");
		await nextUIUpdate();

		var oLabel = Element.getElementById("unnamedView--unnamedName");
		assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'name'");
		oLabel = Element.getElementById("unnamedView--unnamedPhone");
		assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'phone'");

	});

	QUnit.test("Named Model", async function(assert) {
		sap.ui.xmlview("namedView", "my.View").placeAt("binding");
		await nextUIUpdate();

		var oLabel = Element.getElementById("namedView--namedName");
		assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'name'");
		oLabel = Element.getElementById("namedView--namedPhone");
		assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'phone'");
	});

	QUnit.module("Fragment.load API", {
		beforeEach: function(assert) {
			this.oDummyController = {
				doSomething: function() {
					assert.ok(true, "Dummy Controller method 'doSomething' called");
				}
			};
			this.loadTemplatePromiseSpy = this.spy(XMLTemplateProcessor, "loadTemplatePromise");
			this.parseTemplatePromiseSpy = this.spy(XMLTemplateProcessor, "parseTemplatePromise");
			this.loadResourceSpy = this.spy(LoaderExtensions, "loadResource");
			this.requireSpy = this.spy(sap.ui, "require");
		},
		afterEach: function(assert) {
		}
	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("HTML Fragment loaded from file", function(assert) {
		assert.expect(2);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.HTMLTestFragmentNoController",
			type: "HTML"
		}).then(async function(oFragment) {
			oFragment.placeAt("content4");
			await nextUIUpdate();

			var id = oFragment.getId();
			assert.ok(document.getElementById(id), "Fragment should be rendered");

			var aContent = oFragment.getContent();
			var btn1 = aContent[0];
			assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

			oFragment.destroy();
		});
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID", function(assert) {
		assert.expect(8);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.JSTestFragment",
			type: "JS",
			id: "myJsFragLoadApi",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			await nextUIUpdate();

			var id = oFragment.getId();

			assert.equal(id.substr(0,8), "__layout", "Fragment ID should be generated");
			assert.ok(document.getElementById(id), "JS Fragment should be rendered");

			var aContent = oFragment.getContent();
			var btn1 = aContent[0];
			var btn2 = aContent[1];
			assert.equal(btn1.getId(), "myJsFragLoadApi--btnInJsFragment", "Button with given ID should have this ID with Fragment ID prefix");
			assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
			triggerClickEvent(btn1.getId());

			// Data binding
			assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

			// find controls by ID
			var btn = Fragment.byId("myJsFragLoadApi", "btnInJsFragment");
			assert.ok(btn, "Button should be found by ID");
			assert.ok(btn instanceof Button, "Button should be found by ID");

			oFragment.destroy();
		});
	});

	QUnit.test("XML Fragment from string", function(assert) {
		assert.expect(3);
		var myXml = '<Button xmlns="sap.m" id="xmlfragbtn2" text="This is an XML Fragment" press="doSomething"></Button>';
		return Fragment.load({
			definition: myXml,
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			await nextUIUpdate();

			var id = oFragment.getId();
			assert.ok(document.getElementById(id), "XML Fragment should be rendered");
			assert.equal(id, "xmlfragbtn2", "Content should have given ID");

			triggerClickEvent(id);

			oFragment.destroy();
		});
	});

	QUnit.test("Load XML Fragment from file", function (assert) {
		assert.expect(3);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.XMLTestFragmentNoController"
		}).then(function (oFragment) {
			assert.ok(oFragment, "Fragment should be loaded");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 1, "XMLTemplateProcessor.loadTemplatePromise should be called once");
			assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

			oFragment.destroy();
		}.bind(this));
	});

	QUnit.test("Fragment.load with properties 'name' and 'definition' provided at the same time", function (assert) {
		var myXml = '<Button xmlns="sap.m" id="xmlfragbtn2" text="This is an XML Fragment" press="doSomething"></Button>';
		var oLogErrorSpy = this.spy(Log, "error");
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.XMLTestFragmentNoController",
			definition: myXml
		}).then(function (oFragment) {
			assert.ok(oFragment, "Fragment should be loaded");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 0, "XMLTemplateProcessor.loadTemplatePromise shouldn't be called. Fragment constructor is called");
			assert.equal(oLogErrorSpy.callCount, 1, "Error message should be logged");
			sinon.assert.calledWith(oLogErrorSpy, "The properties 'name' and 'definition' shouldn't be provided at the same time. The fragment definition will be used instead of the name. Fragment name was: testdata.fragments_legacyAPIs.XMLTestFragmentNoController");
			oFragment.destroy();
		}.bind(this));
	});

	QUnit.test("Load XML Fragment from file with nested fragments and a nested view containing fragments of type 'JS', 'HTML' and 'XML'", function (assert) {
		assert.expect(9);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.nested.XMLFragment_Level0"
		}).then(function (oFragment) {
			assert.ok(oFragment, "Fragment should be loaded");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 5, "XMLTemplateProcessor.loadTemplatePromise should be called three times");
			assert.equal(this.parseTemplatePromiseSpy.callCount, 6, "XMLTemplateProcessor.loadTemplatePromise should be called six times");
			assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "First call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
			assert.ok(this.parseTemplatePromiseSpy.getCall(1).args[2], "Second call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
			assert.ok(this.parseTemplatePromiseSpy.getCall(2).args[2], "Third call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
			assert.ok(this.parseTemplatePromiseSpy.getCall(3).args[2], "Fourth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
			assert.ok(this.parseTemplatePromiseSpy.getCall(4).args[2], "Fifth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
			assert.ok(this.parseTemplatePromiseSpy.getCall(5).args[2], "Sixth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

			oFragment.destroy();
		}.bind(this));
	});

	QUnit.test("Load XML View from file with nested fragments of type 'JS', 'HTML' and 'XML'", function (assert) {
		assert.expect(25);
		return XMLView.create({
			viewName: "testdata.fragments_legacyAPIs.nested.XMLViewWithFragments"
		}).then(function (oView) {
			return oView.loaded().then(function () {
				assert.equal(this.loadTemplatePromiseSpy.callCount, 2, "XMLTemplateProcessor.loadTemplatePromise should be called two times (only for the nested XML fragments)");

				assert.equal(this.parseTemplatePromiseSpy.callCount, 3, "XMLTemplateProcessor.loadTemplatePromise should be called three times (for the XML View and the nested XML Fragments)");
				assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "First call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
				assert.ok(this.parseTemplatePromiseSpy.getCall(1).args[2], "Second call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
				assert.ok(this.parseTemplatePromiseSpy.getCall(2).args[2], "Third call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

				assert.equal(this.loadResourceSpy.callCount, 5, "LoaderExtension.loadResource should be called five times (for the XML View, the nested XML Fragments and the nested HTML fragments)");
				assert.ok(this.loadResourceSpy.getCall(0).args[1].async, "First call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(1).args[1].async, "Second call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(2).args[1].async, "Third call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(3).args[1].async, "Fourth call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(4).args[1].async, "Fifth call of LoaderExtension.loadResource should be called with async=true");

				var aCalls = this.requireSpy.getCalls().filter(function (oCall) {return oCall.args.length === 3 && oCall.args[0][0].endsWith("fragment");});
				assert.equal(aCalls.length, 4, "sap.ui.require should be called two times with 3 arguments (for the JS fragment require)");
				assert.equal(aCalls[0].args[0][0], "testdata/fragments_legacyAPIs/JSTestFragment.fragment", "First call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/JSTestFragment.fragment'");
				assert.equal(aCalls[1].args[0][0], "testdata/fragments_legacyAPIs/JSTestFragment.fragment", "Second call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/JSTestFragment.fragment'");
				assert.equal(aCalls[2].args[0][0], "testdata/fragments_legacyAPIs/nested/JSFragment_Level0.fragment", "Third call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/nested/JSFragment_Level0.fragment'");
				assert.equal(aCalls[3].args[0][0], "testdata/fragments_legacyAPIs/nested/JSFragment_Level1.fragment", "Fourth call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/nested/JSFragment_Level1.fragment'");

				// Spot check
				assert.equal(oView.getContent().length, 8, "oView should contain 8 controls (6 layouts, 1 Button and 1 dialog)");
				assert.ok(oView.getContent()[0].getContent()[0].getId().endsWith("btnInXmlFragment"), "oView contains a XML fragment without ID containing a button with ID");
				assert.ok(oView.getContent()[1].getContent()[0].getId().endsWith("xmlInXml--btnInXmlFragment"), "oView contains a XML fragment with ID containing a button with ID");
				assert.ok(oView.getContent()[2].getContent()[0].getId().endsWith("btnInHtmlFragment"), "oView contains a HTML fragment without ID containing a button with ID");
				assert.ok(oView.getContent()[3].getContent()[0].getId().endsWith("htmlInXml--btnInHtmlFragment"), "oView contains a HTML fragment with ID containing a button with ID");
				assert.ok(oView.getContent()[4].getContent()[0].getId().endsWith("btnInJsFragment"), "oView contains a JS fragment without ID containing a button with ID");
				assert.ok(oView.getContent()[5].getContent()[0].getId().endsWith("jsInXml--btnInJsFragment"), "oView contains a JS fragment with ID containing a button with ID");

				assert.ok(oView.getContent()[6].isA("sap.m.Dialog"), "oView contains a Dialog");
				assert.ok(oView.getContent()[7].isA("sap.m.Button"), "oView contains a Button");

				oView.destroy();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Load different JS fragments using Fragment.load function", function (assert) {
		assert.expect(3);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.nested.JSFragment_Level0",
			type: "JS"
		}).then(function (aFragmentContent) {
			var aCalls = this.requireSpy.getCalls().filter(function (oCall) {return oCall.args.length === 3 && oCall.args[0][0].endsWith("fragment");});
			assert.equal(aCalls.length, 2, "sap.ui.require should be called three two with 3 arguments (for the JS fragment require)");
			assert.equal(aCalls[0].args[0][0], "testdata/fragments_legacyAPIs/nested/JSFragment_Level0.fragment", "First call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/nested/JSFragment_Level0.fragment'");
			assert.equal(aCalls[1].args[0][0], "testdata/fragments_legacyAPIs/nested/JSFragment_Level1.fragment", "Second call of sap.ui.require should be called with fragment name 'testdata/fragments_legacyAPIs/nested/JSFragment_Level1.fragment'");

			aFragmentContent[0].destroy();
			aFragmentContent[1].destroy();
		}.bind(this));
	});

	QUnit.test("Propagate owner component to Fragment (XML)", function(assert) {
		sap.ui.define("myComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("myComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "myComponent"
						}
					}
				}
			});
		});

		return Component.create({
			id: "myComponent",
			name: "myComponent",
			manifest: false
		}).then(function(oComponent) {
			return oComponent.runAsOwner(function() {
				return Fragment.load({
					name: "testdata.fragments_legacyAPIs.ownerPropagation.XMLFragmentWithNestedView",
					type: "XML"
				}).then(function(oFragment) {
					// the nested View inside the fragment tries to access the owner component. Without it the test would crash.
					assert.ok(oFragment, "Fragment is loaded.");
					assert.ok(oFragment.getController().getOwnerComponent(), "Owner component should be propagated correctly.");
					assert.equal(oFragment.getController().getOwnerComponent().getId(), "myComponent", "Owner component should be propagated correctly.");

					oFragment.destroy();
					oComponent.destroy();
				});
			});
		});
	});

	QUnit.test("Propagate owner component to Fragment (JS)", function(assert) {
		sap.ui.define("myComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("myComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "myComponent"
						}
					}
				}
			});
		});

		return Component.create({
			id: "myComponent",
			name: "myComponent",
			manifest: false
		}).then(function(oComponent) {
			return oComponent.runAsOwner(function() {
				return Fragment.load({
					name: "testdata.fragments_legacyAPIs.ownerPropagation.JSFragmentWithNestedXMLView",
					type: "JS"
				}).then(function(oFragment) {
					// the nested View inside the fragment tries to access the owner component. Without it the test would crash.
					assert.ok(oFragment, "Fragment is loaded.");
					assert.ok(oFragment.getController().getOwnerComponent(), "Owner component should be propagated correctly.");
					assert.equal(oFragment.getController().getOwnerComponent().getId(), "myComponent", "Owner component should be propagated correctly.");

					oFragment.destroy();
					oComponent.destroy();
				});
			});
		});
	});

	/**
	 * @deprecated Since version 1.108
	 */
	QUnit.test("Propagate owner component to Fragment (HTML)", function(assert) {
		sap.ui.define("myComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("myComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "myComponent"
						}
					}
				}
			});
		});

		return Component.create({
			id: "myComponent",
			name: "myComponent",
			manifest: false
		}).then(function(oComponent) {
			return oComponent.runAsOwner(function() {
				return Fragment.load({
					name: "testdata.fragments_legacyAPIs.ownerPropagation.HTMLFragmentWithNestedXMLView",
					type: "HTML"
				}).then(function(oFragment) {
					// the nested View inside the fragment tries to access the owner component. Without it the test would crash.
					assert.ok(oFragment, "Fragment is loaded.");
					assert.ok(oFragment.getController().getOwnerComponent(), "Owner component should be propagated correctly.");
					assert.equal(oFragment.getController().getOwnerComponent().getId(), "myComponent", "Owner component should be propagated correctly.");

					oFragment.destroy();
					oComponent.destroy();
				});
			});
		});
	});

	QUnit.test("Load fragment using own fragment type", function(assert) {
		Fragment.registerType("CUSTOM", {
			init: function () {
				assert.ok("Fragment.init was called");
				return Fragment.getType("XML").init.apply(this, arguments);
			},
			load: function () {
				assert.ok("Fragment.load was called");
				return Fragment.getType("XML").load.apply(this, arguments);
			}
		});

		return Fragment.load({
			type: "CUSTOM",
			name: "testdata.fragments_legacyAPIs.XMLTestFragmentNoController"
		}).then(function (oControl) {
			assert.ok(oControl.isA("sap.ui.layout.HorizontalLayout"), "Correct fragment content loaded");
		});
	});

	QUnit.test("Try to load non existing XML Fragment", function (assert) {
		assert.expect(3);
		return Fragment.load({
			name: "testdata.fragments_legacyAPIs.NonExistingXMLFragment"
		}).catch(function (oError) {
			assert.ok(oError instanceof Error, "Error should be thrown");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 1, "XMLTemplateProcessor.loadTemplatePromise should be called once");
			assert.equal(this.parseTemplatePromiseSpy.callCount, 0, "XMLTemplateProcessor.parseTemplatePromise shouldn't be called");
		}.bind(this));
	});

	QUnit.module("Error handling", {
		beforeEach: function() {
			this.logSpy = this.spy(Log, "error");
		},
		afterEach: function() {
			this.logSpy.restore();
		}
	});

	QUnit.test("Asynchronous XML Fragment from string with binding error", function(assert) {
		return Fragment.load({
			id: "asyncFragment",
			definition:
				'<Panel id="panel" xmlns="sap.m">'
				+ '<Button id="button1"/>'
				+ '<Button id="button2" text="{This should cause a parse error"/>'
				+ '<Button id="button3"/>'
				+ '</Panel>'
		}).then(function() {
			assert.ok(false, "should not succeed");
		}, function(err) {
			assert.strictEqual(
				err.message,
				"Error found in Fragment (id: 'asyncFragment').\n" +
				"XML node: '<Button xmlns=\"sap.m\" id=\"button2\" text=\"{This should cause a parse error\"/>':\n" +
				"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0"
			);
			// The following asserts currently fail: older siblings and grand children are not cleaned up (button 1 in this case).
			// In the async case if we encounter an error during XML processing, the processing is stopped (forcefully).
			// We do not (yet) have a way to clean up any controls which have been created until the exception was raised.
			/*
			assert.equal(Element.getElementById("panel"), null);
			assert.equal(Element.getElementById("button1"), null);
			assert.equal(Element.getElementById("button2"), null);
			assert.equal(Element.getElementById("button3"), null);
			*/
		});
	});

	QUnit.test("Sync XML Fragment from string with binding error", function(assert) {
		var oFrag = sap.ui.xmlfragment({
			id: "syncFragment",
			fragmentContent:
				'<Panel id="panel" xmlns="sap.m">'
				+ '<Button id="button4"/>'
				+ '<Button id="button5" text="{This should cause a parse error"/>'
				+ '<Button id="button6"/>'
				+ '</Panel>'
		});

		// check for error log
		assert.ok(this.logSpy.calledOnce);
		assert.deepEqual(
			this.logSpy.getCall(0).args[0].message,
			"Error found in Fragment (id: 'syncFragment').\n" +
			"XML node: '<Button xmlns=\"sap.m\" id=\"button5\" text=\"{This should cause a parse error\"/>':\n" +
			"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
			"Correct SyntaxError is logged"
		);

		// broken controls created via the sync factory should still be available (for compatibility)
		assert.equal(oFrag.getContent()[1].getId(), "syncFragment--button5", "Button with broken binding string is still available");

		// clean up panel
		oFrag.destroy();
	});

	QUnit.test("Asynchronous XML Fragment from string with duplicate id error", function(assert) {
		return Fragment.load({
			id: "asyncFragment",
			definition:
				'<Panel id="panel" xmlns="sap.m">'
				+ '<Button id="button4"/>'
				+ '<Button id="button4" text="text"/>'
				+ '</Panel>'
		}).then(function() {
			assert.ok(false, "should not succeed");
		}, function(err) {
			assert.strictEqual(
				err.message,
				"Error: adding element with duplicate id 'asyncFragment--button4'",
				"Correct error is logged"
			);
		});
	});
});

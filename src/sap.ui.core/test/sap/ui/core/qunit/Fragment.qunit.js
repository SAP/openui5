/* global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/JSView",
	"sap/ui/commons/Panel",
	"sap/ui/commons/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.dom"
], function(qutils, Fragment, JSView, Panel, Button, HorizontalLayout, JSONModel, createAndAppendDiv) {
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

	sap.ui.jsfragment("example.fragment.jstest", {
		createContent: function(oController) {
			var oJSFragBtn = new Button("jsfragbtn", {
				text: "This is a JS Fragment",
				press: oController.doSomething
			});
			return oJSFragBtn;
		}
	});

	// View definition
	sap.ui.jsview("example.fragment.test", {

		getControllerName: function() {
			return "example.fragment.test";
		},

		createContent: function(oController) {
			var oPanel = new Panel(this.createId("myPanel"));

			var oJsFragment = sap.ui.fragment("example.fragment.jstest", "JS", oController);
			oPanel.addContent(oJsFragment);

			var myXml = '<Button xmlns="sap.ui.commons" id="xmlfragbtn" text="This is an XML Fragment" press="doSomething"></Button>';
			var oXmlFragment = sap.ui.xmlfragment({
				fragmentContent: myXml
			}, oController);
			oPanel.addContent(oXmlFragment);

			var myHtml = '<div id="htmlfragbtn" data-sap-ui-type="sap.ui.commons.Button" data-text="This is an HTML Fragment" data-press="doSomething"></div>';
			var oHtmlFragment = sap.ui.htmlfragment({
				fragmentContent: myHtml
			}, oController);
			oPanel.addContent(oHtmlFragment);

			return [oPanel];
		}
	});

	// Controller definition
	sap.ui.controller("example.fragment.test", {

		onInit: function() {},

		doSomething: function(oEvent) {
			QUnit.config.current.assert.ok(true, "Controller method 'doSomething' called");
		}

	});

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



	QUnit.test("XML Fragment loaded from file", function(assert) {
		var oFragment = sap.ui.xmlfragment("testdata.fragments.XMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.getCore().byId("btnInXmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID", function(assert) {
		var oFragment = sap.ui.xmlfragment("myXmlFrag", "testdata.fragments.XMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.core.Fragment.byId("myXmlFrag", "btnInXmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID and root control ID", function(assert) {
		var oFragment = sap.ui.xmlfragment("myXmlFrag1", "testdata.fragments.XMLTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.equal(id, "myXmlFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = sap.ui.core.Fragment.byId("myXmlFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});


	QUnit.test("HTML Fragment loaded from file", function(assert) {
		var oFragment = sap.ui.htmlfragment("testdata.fragments.HTMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.getCore().byId("btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("HTML Fragment loaded from file with given Fragment ID", function(assert) {
		var oFragment = sap.ui.htmlfragment("myHtmlFrag", "testdata.fragments.HTMLTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.core.Fragment.byId("myHtmlFrag", "btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});


	QUnit.test("HTML Fragment loaded from file with given Fragment ID and root control ID", function(assert) {
		var oFragment = sap.ui.htmlfragment("myHtmlFrag1", "testdata.fragments.HTMLTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.equal(id, "myHtmlFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = sap.ui.core.Fragment.byId("myHtmlFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});



	QUnit.test("JS Fragment loaded from file", function(assert) {
		var oFragment = sap.ui.jsfragment("testdata.fragments.JSTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.getCore().byId("btnInJsFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID", function(assert) {
		var oFragment = sap.ui.jsfragment("myJsFrag", "testdata.fragments.JSTestFragment", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

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
		var btn = sap.ui.core.Fragment.byId("myJsFrag", "btnInJsFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});


	QUnit.test("JS Fragment loaded from file with given Fragment ID and root control ID", function(assert) {
		var oFragment = sap.ui.jsfragment("myJsFrag1", "testdata.fragments.JSTestFragmentWithId", this.oDummyController);
		oFragment.placeAt("content1");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.equal(id, "myJsFrag1--layout", "Root control ID should be prefixed");

		// find controls by ID
		var oLayout = sap.ui.core.Fragment.byId("myJsFrag1", "layout");
		assert.ok(oLayout, "Layout should be found by ID");
		assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
	});


	QUnit.module("Inline Fragments");

	var oViewWithFragments;

	QUnit.test("Inline Fragments preconditions", function(assert) {
		assert.ok(!document.getElementById("jsfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("xmlfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("htmlfragbtn"), "Fragment should not be rendered");
	});

	QUnit.test("JSView creation with Fragments used inside", function(assert) {
		oViewWithFragments = sap.ui.jsview("myView", "example.fragment.test");
		oViewWithFragments.placeAt("content2");
		sap.ui.getCore().applyChanges();

		assert.ok(document.getElementById("myView"), "JSView should be rendered");
	});

	QUnit.test("Inline JS Fragment", function(assert) {
		assert.expect(2); // incl. Button click handler

		assert.ok(document.getElementById("jsfragbtn"), "Fragment should be rendered");

		// Fragment knows Controller, Fragment calling Controller methods
		qutils.triggerEvent("click", "jsfragbtn");
	});

	QUnit.test("Inline XML Fragment", function(assert) {
		assert.expect(2); // incl. Button click handler

		assert.ok(document.getElementById("xmlfragbtn"), "Fragment should be rendered");

		// Fragment knows Controller, Fragment calling Controller methods
		qutils.triggerEvent("click", "xmlfragbtn");
	});

	QUnit.test("Inline HTML Fragment", function(assert) {
		assert.expect(2); // incl. Button click handler

		assert.ok(document.getElementById("htmlfragbtn"), "Fragment should be rendered");

		// Fragment knows Controller, Fragment calling Controller methods
		qutils.triggerEvent("click", "htmlfragbtn");
	});



	QUnit.module("Fragments referenced from XMLViews");

	var oXmlView, oXmlFragmentInXmlView, oXmlFragmentWithIdInXmlView, oHtmlFragmentInXmlView,
		oHtmlFragmentWithIdInXmlView, oJsFragmentInXmlView, oJsFragmentWithIdInXmlView;

	var DATABOUND_TEXT_IN_VIEW = "Text from Databinding in View";

	QUnit.test("XMLView Rendering", function(assert) {
		oXmlView = sap.ui.xmlview("testdata.fragments.XMLViewWithFragments");
		oXmlView.placeAt("content3");
		sap.ui.getCore().applyChanges();

		var data = {
			someText: DATABOUND_TEXT_IN_VIEW
		};

		var oModel = new JSONModel();
		oModel.setData(data);
		oXmlView.setModel(oModel);

		sap.ui.getCore().applyChanges(); // update data binding in DOM

		var aContent = oXmlView.getContent();
		oXmlFragmentInXmlView = aContent[1];
		oXmlFragmentWithIdInXmlView = aContent[2];

		oJsFragmentInXmlView = aContent[4];
		oJsFragmentWithIdInXmlView = aContent[5];

		oHtmlFragmentInXmlView = aContent[7];
		oHtmlFragmentWithIdInXmlView = aContent[8];


		assert.ok(document.getElementById(oXmlView.getId()), "XMLView should be rendered");
	});


	QUnit.test("XML Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oXmlFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "XML Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oXmlFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, "__xmlview0--btnInXmlFragment", "static Control ID inside Fragment should be prefixed by View ID");
		qutils.triggerEvent("click", btn1id);

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
		assert.equal(btn1id, "__xmlview0--xmlInXml--btnInXmlFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		qutils.triggerEvent("click", btn1id);

		var btn2 = oXmlFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(sap.ui.core.Fragment.createId("xmlInXml", "btnInXmlFragment"));
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});



	QUnit.test("JS Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oJsFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oJsFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, "__xmlview0--btnInJsFragment", "static Control ID inside Fragment should be prefixed by View ID");
		qutils.triggerEvent("click", btn1id);

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
		assert.equal(btn1id, "__xmlview0--jsInXml--btnInJsFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		qutils.triggerEvent("click", btn1id);

		var btn2 = oJsFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(sap.ui.core.Fragment.createId("jsInXml", "btnInJsFragment"));
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});



	QUnit.test("HTML Fragment in XMLView", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oHtmlFragmentInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oHtmlFragmentInXmlView.getContent()[0].getId();
		assert.equal(btn1id, "__xmlview0--btnInHtmlFragment", "static Control ID inside Fragment should be prefixed by View ID");
		qutils.triggerEvent("click", btn1id);

		var btn2 = oHtmlFragmentInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId("btnInHtmlFragment");
		assert.ok(btn, "Button should be found by ID");
		assert.ok(btn instanceof Button, "Button should be found by ID");
	});

	QUnit.test("HTML Fragment in XMLView with given Fragment ID", function(assert) {
		assert.expect(8); // incl. Controller function on press

		var id = oHtmlFragmentWithIdInXmlView.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");
		assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated, with no View prefix");

		var btn1id = oHtmlFragmentWithIdInXmlView.getContent()[0].getId();
		assert.equal(btn1id, "__xmlview0--htmlInXml--btnInHtmlFragment", "static Control ID inside Fragment should be prefixed by View ID and Fragment ID");
		qutils.triggerEvent("click", btn1id);

		var btn2 = oHtmlFragmentWithIdInXmlView.getContent()[1];
		assert.equal(btn2.getId().substr(0, 8), "__button", "Second Button ID should be generated, with no View prefix");
		assert.equal(btn2.$().text(), DATABOUND_TEXT_IN_VIEW, "Second Button should have text from data binding");

		// find controls by ID
		var btn = oXmlView.byId(sap.ui.core.Fragment.createId("htmlInXml", "btnInHtmlFragment"));
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
		var oDialog = sap.ui.jsfragment("testdata.fragments.JSFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("jsDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("jsDialog"), "Fragment should be rendered now");

		window.setTimeout(function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#jsDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			sap.ui.getCore().applyChanges();
			assert.equal(jQuery("#jsDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			qutils.triggerEvent("click", "jsDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});


	QUnit.test("XML Fragment as Dialog", function(assert) {
		var done = assert.async();
		var oDialog = sap.ui.xmlfragment("testdata.fragments.XMLFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("xmlDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("xmlDialog"), "Fragment should be rendered now");

		window.setTimeout(function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#xmlDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			sap.ui.getCore().applyChanges();
			assert.equal(jQuery("#xmlDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			qutils.triggerEvent("click", "xmlDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});


	QUnit.test("HTML Fragment as Dialog", function(assert) {
		var done = assert.async();
		var oDialog = sap.ui.htmlfragment("testdata.fragments.HTMLFragmentDialog", {
			closeDialog: function() {
				oDialog.close();
			}
		});

		assert.ok(!document.getElementById("htmlDialog"), "Fragment should not yet be rendered");
		oDialog.open();
		assert.ok(document.getElementById("htmlDialog"), "Fragment should be rendered now");

		window.setTimeout(function() {
			assert.ok(oDialog.isOpen(), "Dialog should be open now");

			assert.equal(jQuery("#htmlDialogTxt").text(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
			oDialog.setModel(oDialogModel);
			sap.ui.getCore().applyChanges();
			assert.equal(jQuery("#htmlDialogTxt").text(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

			qutils.triggerEvent("click", "htmlDialogBtn"); // close it

			window.setTimeout(function() {
				assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
				oDialog.destroy();

				done();
			}, 600);
		}, 600);

	});



	QUnit.module("Fragments with no Controller");

	QUnit.test("XML Fragment loaded from file", function(assert) {
		assert.expect(2);
		var oFragment = sap.ui.xmlfragment("testdata.fragments.XMLTestFragmentNoController");
		oFragment.placeAt("content4");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
	});

	QUnit.test("JS Fragment loaded from file", function(assert) {
		assert.expect(3); // including one check in the View' createContent method
		var oFragment = sap.ui.jsfragment("testdata.fragments.JSTestFragmentNoController");
		oFragment.placeAt("content4");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
	});

	QUnit.test("HTML Fragment loaded from file", function(assert) {
		assert.expect(2);
		var oFragment = sap.ui.htmlfragment("testdata.fragments.HTMLTestFragmentNoController");
		oFragment.placeAt("content4");
		sap.ui.getCore().applyChanges();

		var id = oFragment.getId();
		assert.ok(document.getElementById(id), "Fragment should be rendered");

		var aContent = oFragment.getContent();
		var btn1 = aContent[0];
		assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
	});

	QUnit.module("DataBinding", {
		beforeEach: function() {},

		afterEach: function() {
			jQuery("#binding").empty();
		}
	});

	QUnit.test("Unnamed Model", function(assert) {
		sap.ui.xmlview("unnamedView", "my.UnnamedView").placeAt("binding");
		sap.ui.getCore().applyChanges();

		var oLabel = sap.ui.getCore().byId("unnamedView--unnamedName");
		assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'name'");
		oLabel = sap.ui.getCore().byId("unnamedView--unnamedPhone");
		assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'phone'");

	});

	QUnit.test("Named Model", function(assert) {
		sap.ui.xmlview("namedView", "my.View").placeAt("binding");
		sap.ui.getCore().applyChanges();

		var oLabel = sap.ui.getCore().byId("namedView--namedName");
		assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'name'");
		oLabel = sap.ui.getCore().byId("namedView--namedPhone");
		assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'phone'");
	});

	QUnit.module("Fragment.load API", {
		beforeEach: function(assert) {
			this.oDummyController = {
				doSomething: function() {
					assert.ok(true, "Dummy Controller method 'doSomething' called");
				}
			};
		}
	});

	QUnit.test("HTML Fragment loaded from file", function(assert) {
		assert.expect(2);
		return Fragment.load({
			name: "testdata.fragments.HTMLTestFragmentNoController",
			type: "HTML"
		}).then(function(oFragment) {
			oFragment.placeAt("content4");
			sap.ui.getCore().applyChanges();

			var id = oFragment.getId();
			assert.ok(document.getElementById(id), "Fragment should be rendered");

			var aContent = oFragment.getContent();
			var btn1 = aContent[0];
			assert.equal(btn1.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
		});
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID", function(assert) {
		assert.expect(8);
		return Fragment.load({
			name: "testdata.fragments.JSTestFragment",
			type: "JS",
			id: "myJsFragLoadApi",
			controller: this.oDummyController
		}).then(function(oFragment) {
			oFragment.placeAt("content1");
			sap.ui.getCore().applyChanges();

			var id = oFragment.getId();

			assert.equal(id.substr(0,8), "__layout", "Fragment ID should be generated");
			assert.ok(document.getElementById(id), "JS Fragment should be rendered");

			var aContent = oFragment.getContent();
			var btn1 = aContent[0];
			var btn2 = aContent[1];
			assert.equal(btn1.getId(), "myJsFragLoadApi--btnInJsFragment", "Button with given ID should have this ID with Fragment ID prefix");
			assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");
			qutils.triggerEvent("click", btn1.getId());

			// Data binding
			assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

			// find controls by ID
			var btn = Fragment.byId("myJsFragLoadApi", "btnInJsFragment");
			assert.ok(btn, "Button should be found by ID");
			assert.ok(btn instanceof sap.ui.commons.Button, "Button should be found by ID");
		});
	});

	QUnit.test("XML Fragment from string", function(assert) {
		assert.expect(3);
		var myXml = '<Button xmlns="sap.ui.commons" id="xmlfragbtn2" text="This is an XML Fragment" press="doSomething"></Button>';
		return Fragment.load({
			definition: myXml,
			controller: this.oDummyController
		}).then(function(oFragment) {
			oFragment.placeAt("content1");
			sap.ui.getCore().applyChanges();

			var id = oFragment.getId();
			assert.ok(document.getElementById(id), "XML Fragment should be rendered");
			assert.equal(id, "xmlfragbtn2", "Content should have given ID");

			qutils.triggerEvent("click", id);
		});
	});

});


/* global sinon QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/core/Component",
	"sap/ui/core/Fragment",
	"sap/ui/core/Element",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/jquery"
], function (Log, qutils, Core, Component, Fragment, Element, XMLTemplateProcessor, Button, HorizontalLayout, JSONModel, createAndAppendDiv, nextUIUpdate, View, ViewType, LoaderExtensions, jQuery) {
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
	/**
	 * @deprecated As of version 1.118, the use of Core.js as a model container is deprecated
	 */
	Core.setModel(oModel);

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

	// Keep this test run as the first test in this file because it's needed to check whether the module
	// "sap/ui/core/mvc/XMLView" is required correctly
	//
	// There are later further tests which load this module, therefore this test should run before the other tests.
	QUnit.test("XML Fragment loaded from file with nested XMLView", function(assert) {
		/**
		 * @deprecated
		 */
		var oRequireSyncSpy = this.spy(sap.ui, "requireSync");
		assert.notOk(sap.ui.require("sap/ui/core/mvc/XMLView"), "XMLView module isn't loaded yet");
		return Fragment.load({
			fragmentName: "testdata.fragments.XMLTestFragmentWithXMLView",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			assert.ok(sap.ui.require("sap/ui/core/mvc/XMLView"), "XMLView module is loaded");
			/**
			 * @deprecated
			 */
			assert.notOk(oRequireSyncSpy.called, "sap.ui.requireSync shouldn't be called");

			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
			await nextUIUpdate();

			var id = oFragment.getId();

			assert.equal(id.substr(0, 8), "__layout", "Fragment ID should be generated");
			assert.ok(document.getElementById(id), "XML Fragment should be rendered");

			var aContent = oFragment.getContent();
			var btn1 = aContent[0];
			var btn2 = aContent[1];
			assert.equal(btn1.getId(), "btn1InXmlFragment", "Button with given ID should have exactly this ID");
			assert.equal(btn2.getId().substr(0, 8), "__button", "Button with no given ID should have a generated ID");

			// Data binding
			assert.equal(btn2.$().text(), DATABOUND_TEXT, "Second Button should have text from data binding");

			// find controls by ID
			var btn = Element.getElementById("btn1InXmlFragment");
			assert.ok(btn, "Button should be found by ID");
			assert.ok(btn instanceof Button, "Button should be found by ID");

			var view = aContent[2];
			assert.ok(view.isA("sap.ui.core.mvc.XMLView"), "XMLView instance is created");

			oFragment.destroy();
		});
	});

	QUnit.test("XML Fragment loaded from file", function(assert) {
		return Fragment.load({
			fragmentName: "testdata.fragments.XMLTestFragment",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
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
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID", function(assert) {
		return Fragment.load({
			id: "myXmlFrag",
			fragmentName: "testdata.fragments.XMLTestFragment",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
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
	});

	QUnit.test("XML Fragment loaded from file with given Fragment ID and root control ID", function(assert) {
		return Fragment.load({
			id: "myXmlFrag1",
			fragmentName: "testdata.fragments.XMLTestFragmentWithId",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			await nextUIUpdate();

			var id = oFragment.getId();
			assert.equal(id, "myXmlFrag1--layout", "Root control ID should be prefixed");

			// find controls by ID
			var oLayout = Fragment.byId("myXmlFrag1", "layout");
			assert.ok(oLayout, "Layout should be found by ID");
			assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
		});
	});

	QUnit.test("JS Fragment loaded from file", function(assert) {
		return Fragment.load({
			fragmentName: "testdata.fragments.JSTestFragment",
			type: "JS",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
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
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID", function(assert) {
		return Fragment.load({
			fragmentName: "testdata.fragments.JSTestFragment",
			id: "myJsFrag",
			type: "JS",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
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
	});

	QUnit.test("JS Fragment loaded from file with given Fragment ID and root control ID", function(assert) {
		return Fragment.load({
			fragmentName: "testdata.fragments.JSTestFragmentWithId",
			id: "myJsFrag1",
			type: "JS",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
			await nextUIUpdate();

			var id = oFragment.getId();
			assert.equal(id, "myJsFrag1--layout", "Root control ID should be prefixed");

			// find controls by ID
			var oLayout = Fragment.byId("myJsFrag1", "layout");
			assert.ok(oLayout, "Layout should be found by ID");
			assert.ok(oLayout instanceof HorizontalLayout, "Found object should be instance of layout");
		});
	});


	QUnit.module("Inline Fragments");

	QUnit.test("Inline Fragments within Typed View", function(assert) {
		assert.expect(7); // incl. Button click handler

		// Inline Fragments preconditions
		assert.ok(!document.getElementById("jsfragbtn"), "Fragment should not be rendered");
		assert.ok(!document.getElementById("xmlfragbtn"), "Fragment should not be rendered");

		// JSView creation with Fragments used inside
		return View.create({
			id: "myView",
			viewName: "module:my/TypedView"
		}).then(async function (oViewWithFragments) {
			oViewWithFragments.placeAt("content2");
			oViewWithFragments.getUIArea().setModel(oModel);
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

			oViewWithFragments.destroy();
		});
	});

	QUnit.module("Fragments referenced from XMLViews");

	var oXmlView, oXmlFragmentInXmlView, oXmlFragmentWithIdInXmlView,
		oJsFragmentInXmlView, oJsFragmentWithIdInXmlView;

	var DATABOUND_TEXT_IN_VIEW = "Text from Databinding in View";

	QUnit.test("XMLView Rendering", function(assert) {
		return View.create({
			viewName: "testdata.fragments.XMLViewWithFragments",
			type: ViewType.XML
		}).then(async function(oResult) {
			oXmlView = oResult;

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

			assert.ok(oXmlView.getDomRef(), "XMLView should be rendered");
		});
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

	QUnit.module("Dialog Fragments");

	var DATABOUND_TEXT_IN_DIALOG = "Text from Databinding in Dialog";

	var data = {
		dialogText: DATABOUND_TEXT_IN_DIALOG
	};

	var oDialogModel = new JSONModel();
	oDialogModel.setData(data);


	QUnit.test("JS Fragment as Dialog", function(assert) {
		var done = assert.async();

		var pDialog = Fragment.load({
			fragmentName: "testdata.fragments.JSFragmentDialog",
			type: "JS",
			controller: {
				closeDialog: function() {
					Element.getElementById("jsDialog").close();
				}
			}
		});

		return pDialog.then(function(oDialog) {
			assert.ok(!document.getElementById("jsDialog"), "Fragment should not yet be rendered");
			oDialog.open();
			assert.ok(document.getElementById("jsDialog"), "Fragment should be rendered now");

			window.setTimeout(function() {
				assert.ok(oDialog.isOpen(), "Dialog should be open now");

				/**
				 * @deprecated As of version 1.118, the use of Core.js as a model container is deprecated
				 */
				assert.equal(oDialog.getContent()[0].getText(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
				oDialog.setModel(oDialogModel);
				assert.equal(oDialog.getContent()[0].getText(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

				triggerClickEvent("jsDialogBtn"); // close it

				window.setTimeout(function() {
					assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
					oDialog.destroy();

					done();
				}, 600);
			}, 600);
		});
	});


	QUnit.test("XML Fragment as Dialog", function(assert) {
		var done = assert.async();

		var pDialog = Fragment.load({
			fragmentName: "testdata.fragments.XMLFragmentDialog",
			controller: {
				closeDialog: function() {
					Element.getElementById("xmlDialog").close();
				}
			}
		});

		return pDialog.then(function(oDialog){
			assert.ok(!document.getElementById("xmlDialog"), "Fragment should not yet be rendered");
			oDialog.open();
			assert.ok(document.getElementById("xmlDialog"), "Fragment should be rendered now");

			window.setTimeout(async function() {
				assert.ok(oDialog.isOpen(), "Dialog should be open now");

				/**
				 * @deprecated As of version 1.118, the use of Core.js as a model container is deprecated
				 */
				assert.equal(oDialog.getContent()[0].getText(), DATABOUND_GLOBAL_TEXT_IN_DIALOG, "TextView should have text from global data binding");
				oDialog.setModel(oDialogModel);
				await nextUIUpdate();
				assert.equal(oDialog.getContent()[0].getText(), DATABOUND_TEXT_IN_DIALOG, "TextView should have text from Dialog data binding");

				triggerClickEvent("xmlDialogBtn"); // close it

				window.setTimeout(function() {
					assert.ok(!oDialog.isOpen(), "Dialog should be closed now");
					oDialog.destroy();

					done();
				}, 600);
			}, 600);
		});
	});

	QUnit.module("Fragments with no Controller");

	QUnit.test("XML Fragment loaded from file", function(assert) {
		assert.expect(2);
		return Fragment.load({
			fragmentName: "testdata.fragments.XMLTestFragmentNoController"
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

	QUnit.test("JS Fragment loaded from file", function(assert) {
		assert.expect(3); // including one check in the View' createContent method
		return Fragment.load({
			fragmentName: "testdata.fragments.JSTestFragmentNoController",
			type: "JS"
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

	QUnit.module("DataBinding", {
		beforeEach: function() {
		},

		afterEach: function() {
			jQuery("#binding").empty();
		}
	});

	QUnit.test("Unnamed Model", function(assert) {
		return View.create({
			id: "unnamedView",
			viewName: "my.UnnamedView",
			type: ViewType.XML
		}).then(async function(oView) {
			oView.placeAt("binding");
			await nextUIUpdate();

			var oLabel = Element.getElementById("unnamedView--unnamedName");
			assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'name'");
			oLabel = Element.getElementById("unnamedView--unnamedPhone");
			assert.ok(oLabel.getText().indexOf("<Named>") == -1, "Binding of unnamed model set for 'phone'");
		});
	});

	QUnit.test("Named Model", function(assert) {
		return View.create({
			id: "namedView",
			viewName: "my.View",
			type: ViewType.XML
		}).then(async function(oView) {
			oView.placeAt("binding");
			await nextUIUpdate();

			var oLabel = Element.getElementById("namedView--namedName");
			assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'name'");
			oLabel = Element.getElementById("namedView--namedPhone");
			assert.ok(oLabel.getText().indexOf("<Named>") > -1, "Binding of named model set for 'phone'");
		});
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

	QUnit.test("JS Fragment loaded from file with given Fragment ID", function(assert) {
		assert.expect(8);
		return Fragment.load({
			name: "testdata.fragments.JSTestFragment",
			type: "JS",
			id: "myJsFragLoadApi",
			controller: this.oDummyController
		}).then(async function(oFragment) {
			oFragment.placeAt("content1");
			oFragment.getUIArea().setModel(oModel);
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
			name: "testdata.fragments.XMLTestFragmentNoController"
		}).then(function (oFragment) {
			assert.ok(oFragment, "Fragment should be loaded");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 1, "XMLTemplateProcessor.loadTemplatePromise should be called once");
			assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

			oFragment.destroy();
		}.bind(this));
	});

	QUnit.test("Fragment.load with properties 'name' and 'definition' provided at the same time", function (assert) {
		var myXml = '<Button xmlns="sap.m" id="xmlfragbtn2" text="This is an XML Fragment"></Button>';
		var oLogErrorSpy = this.spy(Log, "error");
		return Fragment.load({
			name: "testdata.fragments.XMLTestFragmentNoController",
			definition: myXml
		}).then(function (oFragment) {
			assert.ok(oFragment, "Fragment should be loaded");
			assert.equal(this.loadTemplatePromiseSpy.callCount, 0, "XMLTemplateProcessor.loadTemplatePromise shouldn't be called. Fragment constructor is called");
			assert.equal(oLogErrorSpy.callCount, 1, "Error message should be logged");
			sinon.assert.calledWith(oLogErrorSpy, "The properties 'name' and 'definition' shouldn't be provided at the same time. The fragment definition will be used instead of the name. Fragment name was: testdata.fragments.XMLTestFragmentNoController");
			oFragment.destroy();
		}.bind(this));
	});

	QUnit.test("Load XML Fragment from file with nested fragments and a nested async view containing fragments of type 'JS' and 'XML'", async function (assert) {
		assert.expect(8);
		const oView = await Fragment.load({
			name: "testdata.fragments.nested.XMLFragment_Level0"
		});

		assert.ok(oView, "Deepest nested View in Fragment chain should be created");

		// wait for nested view to finish
		await oView.loaded();

		// expectations of template processor calls
		assert.equal(this.parseTemplatePromiseSpy.callCount, 6, "XMLTemplateProcessor.loadTemplatePromise should be called six times");
		assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "First call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
		assert.ok(this.parseTemplatePromiseSpy.getCall(1).args[2], "Second call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
		assert.ok(this.parseTemplatePromiseSpy.getCall(2).args[2], "Third call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
		assert.ok(this.parseTemplatePromiseSpy.getCall(3).args[2], "Fourth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
		assert.ok(this.parseTemplatePromiseSpy.getCall(4).args[2], "Fifth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
		assert.ok(this.parseTemplatePromiseSpy.getCall(5).args[2], "Sixth call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

		oView.destroy();
	});

	QUnit.test("Load XML View from file with nested fragments of type 'JS' and 'XML'", function (assert) {
		assert.expect(21);
		return View.create({
			viewName: "testdata.fragments.nested.XMLViewWithFragments",
			type: ViewType.XML
		}).then(function (oView) {
			return oView.loaded().then(function () {
				assert.equal(this.loadTemplatePromiseSpy.callCount, 2, "XMLTemplateProcessor.loadTemplatePromise should be called two times (only for the nested XML fragments)");

				assert.equal(this.parseTemplatePromiseSpy.callCount, 3, "XMLTemplateProcessor.loadTemplatePromise should be called three times (for the XML View and the nested XML Fragments)");
				assert.ok(this.parseTemplatePromiseSpy.getCall(0).args[2], "First call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
				assert.ok(this.parseTemplatePromiseSpy.getCall(1).args[2], "Second call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");
				assert.ok(this.parseTemplatePromiseSpy.getCall(2).args[2], "Third call of XMLTemplateProcessor.parseTemplatePromise should be called with async=true");

				assert.equal(this.loadResourceSpy.callCount, 3, "LoaderExtension.loadResource should be called five times (for the XML View, the nested XML Fragments)");
				assert.ok(this.loadResourceSpy.getCall(0).args[1].async, "First call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(1).args[1].async, "Second call of LoaderExtension.loadResource should be called with async=true");
				assert.ok(this.loadResourceSpy.getCall(2).args[1].async, "Third call of LoaderExtension.loadResource should be called with async=true");

				var aCalls = this.requireSpy.getCalls().filter(function (oCall) {return oCall.args.length === 3 && oCall.args[0][0].endsWith("fragment");});
				assert.equal(aCalls.length, 4, "sap.ui.require should be called two times with 3 arguments (for the JS fragment require)");
				assert.equal(aCalls[0].args[0][0], "testdata/fragments/JSTestFragment.fragment", "First call of sap.ui.require should be called with fragment name 'testdata/fragments/JSTestFragment.fragment'");
				assert.equal(aCalls[1].args[0][0], "testdata/fragments/JSTestFragment.fragment", "Second call of sap.ui.require should be called with fragment name 'testdata/fragments/JSTestFragment.fragment'");
				assert.equal(aCalls[2].args[0][0], "testdata/fragments/nested/JSFragment_Level0.fragment", "Third call of sap.ui.require should be called with fragment name 'testdata/fragments/nested/JSFragment_Level0.fragment'");
				assert.equal(aCalls[3].args[0][0], "testdata/fragments/nested/JSFragment_Level1.fragment", "Fourth call of sap.ui.require should be called with fragment name 'testdata/fragments/nested/JSFragment_Level1.fragment'");

				// Spot check
				assert.equal(oView.getContent().length, 6, "oView should contain 8 controls (6 layouts, 1 Button and 1 dialog)");
				assert.ok(oView.getContent()[0].getContent()[0].getId().endsWith("btnInXmlFragment"), "oView contains a XML fragment without ID containing a button with ID");
				assert.ok(oView.getContent()[1].getContent()[0].getId().endsWith("xmlInXml--btnInXmlFragment"), "oView contains a XML fragment with ID containing a button with ID");
				assert.ok(oView.getContent()[2].getContent()[0].getId().endsWith("btnInJsFragment"), "oView contains a JS fragment without ID containing a button with ID");
				assert.ok(oView.getContent()[3].getContent()[0].getId().endsWith("jsInXml--btnInJsFragment"), "oView contains a JS fragment with ID containing a button with ID");

				assert.ok(oView.getContent()[4].isA("sap.m.Dialog"), "oView contains a Dialog");
				assert.ok(oView.getContent()[5].isA("sap.m.Button"), "oView contains a Button");

				oView.destroy();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Load different JS fragments using Fragment.load function", function (assert) {
		assert.expect(3);
		return Fragment.load({
			name: "testdata.fragments.nested.JSFragment_Level0",
			type: "JS"
		}).then(function (aFragmentContent) {
			var aCalls = this.requireSpy.getCalls().filter(function (oCall) {return oCall.args.length === 3 && oCall.args[0][0].endsWith("fragment");});
			assert.equal(aCalls.length, 2, "sap.ui.require should be called three two with 3 arguments (for the JS fragment require)");
			assert.equal(aCalls[0].args[0][0], "testdata/fragments/nested/JSFragment_Level0.fragment", "First call of sap.ui.require should be called with fragment name 'testdata/fragments/nested/JSFragment_Level0.fragment'");
			assert.equal(aCalls[1].args[0][0], "testdata/fragments/nested/JSFragment_Level1.fragment", "Second call of sap.ui.require should be called with fragment name 'testdata/fragments/nested/JSFragment_Level1.fragment'");

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
					name: "testdata.fragments.ownerPropagation.XMLFragmentWithNestedView",
					type: "XML"
				}).then(function(oFragment) {
					// the nested View inside the fragment tries to access the owner component. Without it the test would crash.
					return oFragment.loaded().then(function() {
						assert.ok(oFragment, "Fragment is loaded.");
						assert.ok(oFragment.getController().getOwnerComponent(), "Owner component should be propagated correctly.");
						assert.equal(oFragment.getController().getOwnerComponent().getId(), "myComponent", "Owner component should be propagated correctly.");
						oFragment.destroy();
						oComponent.destroy();
					});
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
					name: "testdata.fragments.ownerPropagation.JSFragmentWithNestedXMLView",
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
			name: "testdata.fragments.XMLTestFragmentNoController"
		}).then(function (oControl) {
			assert.ok(oControl.isA("sap.ui.layout.HorizontalLayout"), "Correct fragment content loaded");
		});
	});

	QUnit.test("Try to load non existing XML Fragment", function (assert) {
		assert.expect(3);
		return Fragment.load({
			name: "testdata.fragments.NonExistingXMLFragment"
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

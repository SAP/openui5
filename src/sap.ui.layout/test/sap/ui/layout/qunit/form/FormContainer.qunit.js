/* global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/core/Title",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Label", // to make FormHelper could load all modules
	"sap/m/Text", // to make FormHelper could load all modules
	// to make FormHelper could load all modules
	"sap/m/Button",
	"sap/ui/core/theming/Parameters"
	],
	function(
			Element,
			FormContainer,
			FormElement,
			Title,
			mLibrary,
			Toolbar,
			Label,
			Text,
			Button,
			Parameters
	) {
	"use strict";

	var oFormContainer;

	function initTest() {
		oFormContainer = new FormContainer("FC1");
	}

	function afterTest() {
		if (oFormContainer) {
			oFormContainer.destroy();
			oFormContainer = undefined;
		}
	}

	QUnit.module("Instance", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oFormContainer, "FormContainer is created");
	});

	QUnit.module("visible", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("isVisible / getVisible", function(assert) {
		assert.ok(oFormContainer.getVisible(), "FormContainer visible per default");
		assert.ok(oFormContainer.isVisible(), "FormContainer is visible for rendering");

		oFormContainer.setVisible(false);

		assert.notOk(oFormContainer.getVisible(), "FormContainer not visible");
		assert.notOk(oFormContainer.isVisible(), "FormContainer not visible for rendering");
	});

	QUnit.module("Expander", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	function expanderCreated(assert) {
		var oButton = oFormContainer.getAggregation("_expandButton");
		assert.ok(oButton, "expander created");
		assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
		oFormContainer.setExpandable(false);
		var oButton2 = oButton = oFormContainer.getAggregation("_expandButton");
		assert.ok(oButton, "Expand button still exist");
		oFormContainer.setExpandable(true);
		oButton = oFormContainer.getAggregation("_expandButton");
		assert.deepEqual(oButton, oButton2, "Expand button reused");
	}

	QUnit.test("Expander created", function(assert) {
		oFormContainer.setExpandable(true);

		expanderCreated(assert);
	});

	QUnit.test("Expander created async", function(assert) {
		var fnResolve;
		oFormContainer._oInitPromise = new Promise(function(fResolve, fReject) { // fake async loading
			fnResolve = fResolve;
		});

		oFormContainer.setExpandable(true);
		var oButton = oFormContainer.getAggregation("_expandButton");
		assert.notOk(oButton, "expander not created");

		var fnDone = assert.async();
		fnResolve();

		setTimeout(function() {
			expanderCreated(assert);

			fnDone();
		}, 0);
	});

	QUnit.test("Expander default", function(assert) {
		// test default after button is loaded, otherwise the button ciuld be empty because of async loading
		var oButton = oFormContainer.getAggregation("_expandButton");
		assert.notOk(oButton, "No expander created per default");
	});

	function expanderDestroyButton(assert) {
		var oButton = oFormContainer.getAggregation("_expandButton");
		var sButtonId = oButton.getId();

		oFormContainer.destroy();
		oFormContainer = undefined;
		assert.notOk(Element.getElementById(sButtonId), "Button destroyed");

		initTest();
	}

	QUnit.test("destroy button", function(assert) {
		oFormContainer.setExpandable(true);
		expanderDestroyButton(assert);
	});

	function expanderIcon(assert) {
		var oButton = oFormContainer.getAggregation("_expandButton");

		const mExpandIcons = Parameters.get({
			name: ["_sap_ui_layout_Form_FormContainerExpImageURL", "_sap_ui_layout_Form_FormContainerColImageURL"],
			_restrictedParseUrls: true
		});

		assert.equal(oButton.getIcon(), mExpandIcons['_sap_ui_layout_Form_FormContainerExpImageURL'], "Expander Icon");
		assert.equal(oButton.getTooltip(), "Expand", "Expander Tooltip");

		oFormContainer.setExpanded(true);
		assert.equal(oButton.getIcon(), mExpandIcons['_sap_ui_layout_Form_FormContainerColImageURL'], "Expander Icon");
		assert.equal(oButton.getTooltip(), "Collapse", "Expander Tooltip");
	}

	QUnit.test("Expander icon", function(assert) {
		oFormContainer.setExpanded(false);
		oFormContainer.setExpandable(true);
		expanderIcon(assert);
	});

	function expanderPress(assert) {
		var oButton = oFormContainer.getAggregation("_expandButton");
		var bCalled = false;
		var oForm = {
				toggleContainerExpanded: function() {
					bCalled = true;
				}
		};

		// simulate Form
		this.stub(oFormContainer, "getParent").callsFake(function() {return oForm;});

		// simulate button click
		oButton.firePress();
		assert.ok(bCalled, "toggleContainerExpanded called on Form");
		assert.notOk(oFormContainer.getExpanded(), "FormContainer not expanded");
	}

	QUnit.test("Expander press", function(assert) {
		oFormContainer.setExpandable(true);

		expanderPress.call(this, assert);
	});

	QUnit.module("Title", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Title as string", function(assert) {
		oFormContainer.setTitle("Test");
		assert.equal(oFormContainer.getTitle(), "Test", "Title set");

		oFormContainer.destroyTitle();
		assert.notOk(oFormContainer.getTitle(), "no Title set");
	});

	QUnit.test("Title as object", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		oFormContainer.setTitle(oTitle);
		assert.equal(oFormContainer.getTitle(), oTitle, "Title set");

		oFormContainer.destroyTitle();
		assert.notOk(oFormContainer.getTitle(), "no Title set");
	});

	QUnit.module("Toolbar", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Toolbar set", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oFormContainer.setToolbar(oToolbar);
		assert.equal(oFormContainer.getToolbar(), oToolbar, "Toolbar set");
		assert.equal(oToolbar.getActiveDesign(), mLibrary.ToolbarDesign.Transparent, "Toolbar Auto-design set");
		assert.equal(oToolbar.getDesign(), mLibrary.ToolbarDesign.Auto, "Toolbar design not changed");
	});

	QUnit.module("FormElements", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("addFormElement", function(assert) {
		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.addFormElement(oFormElement1);
		oFormContainer.addFormElement(oFormElement2);
		var aFormElements = oFormContainer.getFormElements();

		assert.equal(aFormElements.length, 2, "2 FormElements added");
		assert.equal(aFormElements[0].getId(), "FE1", "first FormElement");
		assert.equal(aFormElements[1].getId(), "FE2", "second FormElement");
		assert.equal(oFormContainer.indexOfFormElement(oFormElement2), 1, "Index of FormElement");
	});

	QUnit.test("insertFormElement", function(assert) {
		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.insertFormElement(oFormElement1, 0);
		oFormContainer.insertFormElement(oFormElement2, 0);
		var aFormElements = oFormContainer.getFormElements();

		assert.equal(aFormElements.length, 2, "2 FormElements added");
		assert.equal(aFormElements[0].getId(), "FE2", "first FormElement");
		assert.equal(aFormElements[1].getId(), "FE1", "second FormElement");
		assert.equal(oFormContainer.indexOfFormElement(oFormElement2), 0, "Index of FormElement");
	});

	QUnit.test("removeFormElement", function(assert) {
		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.addFormElement(oFormElement1);
		oFormContainer.addFormElement(oFormElement2);
		var oRemoved = oFormContainer.removeFormElement(oFormElement1);
		var aFormElements = oFormContainer.getFormElements();

		assert.equal(aFormElements.length, 1, "1 FormElement assigned");
		assert.equal(oRemoved, oFormElement1, "Removed FormElement");
		oFormElement1.destroy();
	});

	QUnit.test("removeAllFormElements", function(assert) {
		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.addFormElement(oFormElement1);
		oFormContainer.addFormElement(oFormElement2);
		var aRemoved = oFormContainer.removeAllFormElements();
		var aFormElements = oFormContainer.getFormElements();

		assert.equal(aFormElements.length, 0, "0 FormElement assigned");
		assert.equal(aRemoved.length, 2, "2 FormElements removed");
		oFormElement1.destroy();
		oFormElement2.destroy();
	});

	QUnit.test("destroyFormElements", function(assert) {
		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.addFormElement(oFormElement1);
		oFormContainer.addFormElement(oFormElement2);
		oFormContainer.destroyFormElements();
		var aFormElements = oFormContainer.getFormElements();

		assert.equal(aFormElements.length, 0, "0 FormElement assigned");
		assert.notOk(Element.getElementById("FE1"), "FormElement1 destroyed");
		assert.notOk(Element.getElementById("FE2"), "FormElement2 destroyed");
	});

	QUnit.test("getVisibleFormElements", function(assert) {
		var oFormElement1 = new FormElement("FE1", {visible: false});
		var oFormElement2 = new FormElement("FE2");
		oFormContainer.addFormElement(oFormElement1);
		oFormContainer.addFormElement(oFormElement2);

		var aFormElements = oFormContainer.getVisibleFormElements();
		assert.equal(aFormElements.length, 1, "1 visible FormElement returned");
		assert.equal(aFormElements[0].getId(), "FE2", "second FormElement returned");

		oFormElement1.setVisible(true);
		aFormElements = oFormContainer.getVisibleFormElements();
		assert.equal(aFormElements.length, 2, "2 visible FormElements returned");
	});

	QUnit.module("other functions", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("_checkProperties", function(assert) {
		oFormContainer.setExpandable(true);
		assert.equal(oFormContainer._checkProperties(), 1, "error found");

		oFormContainer.setTitle("Test");
		assert.equal(oFormContainer._checkProperties(), 0, "no error found");
		oFormContainer.destroyTitle();

		var oToolbar = new Toolbar("TB1");
		oFormContainer.setToolbar(oToolbar);
		assert.equal(oFormContainer._checkProperties(), 1, "error found");
	});

	QUnit.test("onLayoutDataChange", function(assert) {
		var bCalled = false;
		var oForm = {
				onLayoutDataChange: function() {
					bCalled = true;
				}
		};

		// simulate Form
		this.stub(oFormContainer, "getParent").callsFake(function() {return oForm;});

		oFormContainer.onLayoutDataChange();
		assert.ok(bCalled, "onLayoutDataChange called on Form");
	});

	QUnit.test("contentOnAfterRendering", function(assert) {
		var bCalled = false;
		var oFormElement;
		var oControl;
		var oForm = {
				contentOnAfterRendering: function(oFE, oC) {
					bCalled = true;
					oFormElement = oFE;
					oControl = oC;
				}
		};

		// simulate Form
		this.stub(oFormContainer, "getParent").callsFake(function() {return oForm;});

		oFormContainer.contentOnAfterRendering("1", "2");
		assert.ok(bCalled, "contentOnAfterRendering called on Form");
		assert.equal(oFormElement, "1", "used FormElement");
		assert.equal(oControl, "2", "used Control");
	});

	QUnit.test("getRenderedDomRef", function(assert) {
		assert.notOk(oFormContainer.getRenderedDomRef(), "no DOMRef as not asigned to Container");

		var oForm = {
				getContainerRenderedDomRef: function() {
					return "X";
				}
		};

		// simulate Form
		this.stub(oFormContainer, "getParent").callsFake(function() {return oForm;});

		assert.equal(oFormContainer.getRenderedDomRef(), "X", "Value returned from Form");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		assert.notOk(oFormContainer.getElementRenderedDomRef(), "no DOMRef as not asigned to Container");

		var oForm = {
				getElementRenderedDomRef: function() {
					return "X";
				}
		};

		// simulate Form
		this.stub(oFormContainer, "getParent").callsFake(function() {return oForm;});

		assert.equal(oFormContainer.getElementRenderedDomRef(), "X", "Value returned from Form");
	});

	QUnit.test("_setEditable", function(assert) {
		assert.notOk(oFormContainer.getProperty("_editable"), "Default: not editable");

		var oFormElement1 = new FormElement("FE1");
		var oFormElement2 = new FormElement("FE2");
		this.spy(oFormElement1, "_setEditable");
		this.spy(oFormElement2, "_setEditable");

		oFormContainer.addFormElement(oFormElement1);

		oFormContainer._setEditable(true);
		assert.ok(oFormContainer.getProperty("_editable"), "Default: editable set");
		assert.ok(oFormElement1._setEditable.calledWith(true), "_setEditable on FormElement1");

		oFormContainer.addFormElement(oFormElement2);
		assert.ok(oFormElement2._setEditable.calledWith(true), "_setEditable on FormElement2");
	});

});
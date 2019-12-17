/* global QUnit, sinon */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/GridData",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/core/library",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/core/Title",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Input"
	],
	function(
		jQuery,
		qutils,
		KeyCodes,
		library,
		Form,
		FormLayout,
		FormContainer,
		FormElement,
		GridData,
		ResponsiveFlowLayoutData,
		coreLibrary,
		VariantLayoutData,
		Title,
		mLibrary,
		Toolbar,
		Label,
		Input
	) {
	"use strict";

	var oForm;
	var oFormLayout;

	function initTest() {
		oFormLayout = new FormLayout("FL1");
		oForm = new Form("F1", {
			layout: oFormLayout
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	}

	function afterTest() {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			oFormLayout = undefined;
		}
	}

	QUnit.module("Form", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oForm, "Form is created");
		assert.ok(oFormLayout, "FormLayout is created");
		assert.equal(oForm.getLayout().getId(), "FL1", "getLayout() returns layout.");
	});

	QUnit.test("Rendering", function(assert) {
		assert.ok(window.document.getElementById("F1"), "Form is rendered");
		assert.ok(window.document.getElementById("FL1"), "Layout is rendered");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set");
	});

	QUnit.test("Width", function(assert) {
		oForm.setWidth("300px");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#F1").width(), 300, "Form rendered width 300px");
	});

	QUnit.test("Tooltip", function(assert) {
		assert.notOk(jQuery("#F1").attr("title"), "no tooltip rendered per default");

		oForm.setTooltip("Test");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("title"), "Test", "tooltip rendered");
	});

	QUnit.test("Title as string", function(assert) {
		oForm.setTitle("Test");
		sap.ui.getCore().applyChanges();
		assert.equal(oForm.getTitle(), "Test", "Title set");
		assert.ok(window.document.getElementById("F1--title"), "Title rendered");
		assert.equal(jQuery("#F1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#F1--title").is("h4"), "Title is rendered as H4 as default");
		assert.ok(!jQuery("#F1--title").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.equal(jQuery("#F1--title").width(), parseInt(jQuery("#F1").children().first().innerWidth()), "Title rendered as large as the Layout");
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "F1--title", "aria-labelledby points to Title");

		oForm.destroyTitle();
		sap.ui.getCore().applyChanges();
		assert.notOk(oForm.getTitle(), "no Title set");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Title as object", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		sap.ui.getCore().applyChanges();

		assert.equal(oForm.getTitle(), oTitle, "Title set");
		assert.ok(window.document.getElementById("T1"), "Title rendered");
		assert.equal(jQuery("#T1").text(), "Test", "Title rendered");
		assert.ok(jQuery("#T1").is("h4"), "Title is rendered as H4 as default");
		assert.notOk(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.notOk(jQuery("#T1").attr("title"), "Title: no tooltip rendered per default");
		assert.notOk(window.document.getElementById("T1-ico"), "Title no image is rendered");
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");

		oTitle.setIcon("../../images/controls/sap.ui.layout.form.Form.gif");
		oTitle.setTooltip("Test");
		oTitle.setEmphasized(true);
		oTitle.setLevel(coreLibrary.TitleLevel.H1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#T1").attr("title"), "Test", "Title: tooltip rendered");
		assert.ok(jQuery("#T1").is("h1"), "Title is rendered as H1");
		assert.ok(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered as emphasized");
		assert.ok(window.document.getElementById("T1-ico"), "Title image is rendered");
		assert.ok(jQuery("#T1-ico").is("img"), "Icon is rendered as image");
		assert.equal(jQuery("#T1-ico").attr("src"), "../../images/controls/sap.ui.layout.form.Form.gif", "Image URL");

		oForm.destroyTitle();
		sap.ui.getCore().applyChanges();
		assert.notOk(oForm.getTitle(), "no Title set");
		assert.notOk(window.document.getElementById("T1"), "no Title rendered");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oForm.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.equal(oForm.getToolbar(), oToolbar, "Toolbar set");
		assert.equal(oToolbar.getActiveDesign(), mLibrary.ToolbarDesign.Transparent, "Toolbar Auto-design set");
		assert.equal(oToolbar.getDesign(), mLibrary.ToolbarDesign.Auto, "Toolbar design not changed");
		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");

		oForm.destroyToolbar();
		sap.ui.getCore().applyChanges();
		assert.notOk(oForm.getToolbar(), "no Toolbar set");
		assert.notOk(window.document.getElementById("TB1"), "no Toolbar rendered");
	});

	QUnit.test("Title and Toolbar", function(assert) {
		oForm.setTitle("Test");
		var oToolbar = new Toolbar("TB1");
		oForm.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
	});

	QUnit.test("ariaLabelledBy", function(assert) {
		oForm.addAriaLabelledBy("X");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X", "aria-labelledby points to AriaLabel");

		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X T1", "aria-labelledby points to Title and AriaLabel");
	});

	QUnit.test("_suggestTitleId", function(assert) {
		oForm._suggestTitleId("ID1");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "ID1", "aria-labelledby points to TitleID");

		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");

		oForm.addAriaLabelledBy("X");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X T1", "aria-labelledby points to AriaLabel and Title");
	});

	QUnit.module("FormContainer", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("addFormContainer", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		sinon.spy(oFormContainer1, "_setEditable");
		sinon.spy(oFormContainer2, "_setEditable");

		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		sap.ui.getCore().applyChanges();
		var aFormContainers = oForm.getFormContainers();

		assert.ok(oFormContainer1._setEditable.calledWith(false), "_setEditable on FormContainer1");
		assert.ok(oFormContainer2._setEditable.calledWith(false), "_setEditable on FormContainer2");
		assert.equal(aFormContainers.length, 2, "2 FormContainers added");
		assert.equal(aFormContainers[0].getId(), "FC1", "first FormContainer");
		assert.equal(aFormContainers[1].getId(), "FC2", "second FormContainer");
		assert.equal(oForm.indexOfFormContainer(oFormContainer2), 1, "Index of FormContainer");
		assert.ok(window.document.getElementById("FC1"), "Container1 is rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");
	});

	QUnit.test("insertFormContainer", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		sinon.spy(oFormContainer1, "_setEditable");
		sinon.spy(oFormContainer2, "_setEditable");

		oForm.insertFormContainer(oFormContainer1, 0);
		oForm.insertFormContainer(oFormContainer2, 0);
		sap.ui.getCore().applyChanges();
		var aFormContainers = oForm.getFormContainers();

		assert.ok(oFormContainer1._setEditable.calledWith(false), "_setEditable on FormContainer1");
		assert.ok(oFormContainer2._setEditable.calledWith(false), "_setEditable on FormContainer2");
		assert.equal(aFormContainers.length, 2, "2 FormContainers added");
		assert.equal(aFormContainers[0].getId(), "FC2", "first FormContainer");
		assert.equal(aFormContainers[1].getId(), "FC1", "second FormContainer");
		assert.equal(oForm.indexOfFormContainer(oFormContainer2), 0, "Index of FormContainer");
		assert.ok(window.document.getElementById("FC1"), "Container1 is rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");
	});

	QUnit.test("removeFormContainer", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		var oRemoved = oForm.removeFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(oRemoved, oFormContainer1, "FormContainer1 removed");
		assert.equal(aFormContainers.length, 1, "1 FormContainers assigned");
		assert.equal(aFormContainers[0].getId(), "FC2", "first FormContainer");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");
		oFormContainer1.destroy();
	});

	QUnit.test("removeAllFormContainers", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		var aRemoved = oForm.removeAllFormContainers();
		sap.ui.getCore().applyChanges();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(aRemoved.length, 2, "2 FormContainers removed");
		assert.equal(aFormContainers.length, 0, "no FormContainers assigned");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.notOk(window.document.getElementById("FC2"), "Container2 is not rendered");
		oFormContainer1.destroy();
		oFormContainer2.destroy();
	});

	QUnit.test("destroyFormContainers", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		oForm.destroyFormContainers();
		sap.ui.getCore().applyChanges();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(aFormContainers.length, 0, "no FormContainers assigned");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.notOk(window.document.getElementById("FC2"), "Container2 is not rendered");
		assert.notOk(sap.ui.getCore().byId("FC1"), "FormContainer1 destroyed");
		assert.notOk(sap.ui.getCore().byId("FC2"), "FormContainer2 destroyed");
	});

	QUnit.test("visibility", function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {visible: false});
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		sap.ui.getCore().applyChanges();

		assert.equal(oForm.getVisibleFormContainers().length, 1, "getVisibleFormContainers returns only one container");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");

		oFormContainer1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(oForm.getVisibleFormContainers().length, 2, "getVisibleFormContainers returns two containers");
		assert.ok(window.document.getElementById("FC1"), "Container1 is rendered");
	});

	// just check rendering, because API is tested in FormContainer qUnit test
	QUnit.test("Tooltip", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#FC1").attr("title"), "no tooltip rendered per default");

		oFormContainer1.setTooltip("Test");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#FC1").attr("title"), "Test", "tooltip rendered");
	});

	QUnit.test("Title  as string", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.setTitle("Test");
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("FC1--title"), "Title rendered");
		assert.equal(jQuery("#FC1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#FC1--title").is("h4"), "Title is rendered as H4 as default");
		assert.ok(!jQuery("#FC1--title").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set");
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "FC1--title", "aria-labelledby points to Title");

		oFormContainer1.destroyTitle();
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("FC1--title"), "no Title rendered");
		assert.notOk(jQuery("#FC1").attr("role"), "role \"form\" not set");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Title  as object", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oTitle = new Title("T1", {text: "Test"});
		oFormContainer1.setTitle(oTitle);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("T1"), "Title rendered");
		assert.equal(jQuery("#T1").text(), "Test", "Title rendered");
		assert.ok(jQuery("#T1").is("h4"), "Title is rendered as H4 as default");
		assert.notOk(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.notOk(jQuery("#T1").attr("title"), "Title: no tooltip rendered per default");
		assert.notOk(window.document.getElementById("T1-ico"), "Title no image is rendered");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set");
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");

		oTitle.setIcon("sap-icon://sap-ui5");
		oTitle.setTooltip("Test");
		oTitle.setEmphasized(true);
		oTitle.setLevel(coreLibrary.TitleLevel.H1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#T1").attr("title"), "Test", "Title: tooltip rendered");
		assert.ok(jQuery("#T1").is("h1"), "Title is rendered as H1");
		assert.ok(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered as emphasized");
		assert.ok(window.document.getElementById("T1-ico"), "Title image is rendered");
		assert.ok(jQuery("#T1-ico").is("span"), "Icon is rendered as span");

		oFormContainer1.destroyTitle();
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("T1"), "no Title rendered");
		assert.notOk(jQuery("#FC1").attr("role"), "role \"form\" not set");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Toolbar", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.equal(oToolbar.getActiveDesign(), mLibrary.ToolbarDesign.Transparent, "Toolbar Auto-design set");
		assert.equal(oToolbar.getDesign(), mLibrary.ToolbarDesign.Auto, "Toolbar design not changed");
		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");

		oFormContainer1.destroyToolbar();
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("TB1"), "no Toolbar rendered");
	});

	QUnit.test("Title and Toolbar", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.setTitle("Test");
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
	});

	QUnit.test("ariaLabelledBy", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.addAriaLabelledBy("X");
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "X", "aria-labelledby points to property");

		var oTitle = new Title("T1", {text: "Test"});
		oFormContainer1.setTitle(oTitle);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "X T1", "aria-labelledby points to Title and property");
	});

	QUnit.test("Expander", function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {title: "Test"});
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.notOk(window.document.getElementById("FC1--Exp"), "no Expander rendered");

		oFormContainer1.setExpandable(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("FC1--Exp"), "Expander rendered");
		assert.ok(window.document.getElementById("FC1-content"), "Container content area is rendered");
		assert.ok(jQuery("#FC1-content").is(":visible"), "Container content area is visible");

		qutils.triggerEvent("tap", "FC1--Exp");
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");

		// test not expanded in FormRenderer
		oForm.invalidate();
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");
	});

	QUnit.test("getRenderedDomRef", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.equal(oFormContainer1.getRenderedDomRef().id, "FC1", "getRenderedDomRef returns DOM");

		oForm.setLayout();
		sap.ui.getCore().applyChanges();
		assert.notOk(oFormContainer1.getRenderedDomRef(), "getRenderedDomRef return nothing if no Layout");

		oForm.setLayout(oFormLayout);
		assert.notOk(oFormContainer1.getRenderedDomRef(), "getRenderedDomRef return nothing if not rendered");
	});

	QUnit.module("FormElement", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	// for FormElements and Fields just test rendering as API is tested in other qUnit tests
	QUnit.test("Rendering", function(assert) {
		sinon.spy(oFormLayout, "contentOnAfterRendering");

		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		var oFormElement2 = new FormElement("FE2");
		var oField2 = new Input("I2");
		oFormElement2.addField(oField2);
		var oFormElement3 = new FormElement("FE3");
		var oLabel = new Label("L3", {text: "Test"});
		oFormElement3.setLabel(oLabel);
		var oField3 = new Input("I3");
		var oField4 = new Input("I4");
		oFormElement3.addField(oField3);
		oFormElement3.addField(oField4);
		oFormContainer1.addFormElement(oFormElement1);
		oFormContainer1.addFormElement(oFormElement2);
		oFormContainer1.insertFormElement(oFormElement3, 0);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("FE1"), "FormElement1 is rendered");
		assert.ok(oFormElement1.getLabelControl().getDomRef(), "FormElement1 label is rendered");
		assert.ok(window.document.getElementById("I1"), "FormElement1 field is rendered");
		assert.equal(jQuery("#I1-inner").attr("aria-labelledby"), oFormElement1.getLabelControl().getId(), "Field1 aria-labelledby points to label");
		assert.ok(window.document.getElementById("FE2"), "FormElement2 is rendered");
		assert.ok(window.document.getElementById("I2"), "FormElement2 field is rendered");
		assert.notOk(jQuery("#I2-inner").attr("aria-labelledby"), "Field2 no aria-labelledby");
		assert.ok(window.document.getElementById("FE3"), "FormElement3 is rendered");
		assert.ok(window.document.getElementById("L3"), "FormElement3 label is rendered");
		assert.ok(window.document.getElementById("I3"), "FormElement3 field1 is rendered");
		assert.equal(jQuery("#I3-inner").attr("aria-labelledby"), "L3", "Field3 aria-labelledby points to label");
		assert.ok(window.document.getElementById("I4"), "FormElement3 field2 is rendered");
		assert.equal(jQuery("#I4-inner").attr("aria-labelledby"), "L3", "Field4 aria-labelledby points to label");
		assert.equal(oFormLayout.contentOnAfterRendering.callCount, 4, "contentOnAfterRendering called on Layout");
	});

	QUnit.test("visibility", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1", {visible: false});
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.notOk(window.document.getElementById("FE1"), "FormElement1 is not rendered");
		assert.notOk(oFormElement1.getLabelControl().getDomRef(), "FormElement1 label is not rendered");
		assert.notOk(window.document.getElementById("I1"), "FormElement1 field is not rendered");

		oFormElement1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("FE1"), "FormElement1 is rendered");
		assert.ok(oFormElement1.getLabelControl().getDomRef(), "FormElement1 label is rendered");
		assert.ok(window.document.getElementById("I1"), "FormElement1 field is rendered");
	});

	QUnit.test("getRenderedDomRef", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		assert.equal(oFormElement1.getRenderedDomRef().id, "FE1", "getRenderedDomRef returns DOM");

		oForm.setLayout();
		sap.ui.getCore().applyChanges();
		assert.notOk(oFormElement1.getRenderedDomRef(), "getRenderedDomRef return nothing if no Layout");

		oForm.setLayout(oFormLayout);
		assert.notOk(oFormElement1.getRenderedDomRef(), "getRenderedDomRef return nothing if not rendered");
	});

	QUnit.module("Form", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Editable", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		sap.ui.getCore().applyChanges();

		assert.notOk(oForm.getEditable(), "editable not set per default");
		assert.notOk(jQuery("#F1").hasClass("sapUiFormEdit"), "Form not editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");

		sinon.spy(oFormContainer1, "_setEditable");
		sinon.spy(oFormContainer2, "_setEditable");

		oForm.setEditable(true);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#F1").hasClass("sapUiFormEdit"), "Form editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");
		assert.ok(oFormContainer1._setEditable.calledWith(true), "_setEditable on FormContainer1");
		assert.ok(oFormContainer2._setEditable.calledWith(true), "_setEditable on FormContainer2");

		// test if editable rendered by renderer
		oForm.invalidate();
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#F1").hasClass("sapUiFormEdit"), "Form editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");

		oForm.setEditable(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#F1").hasClass("sapUiFormEdit"), "Form not editable rendered");
		assert.ok(jQuery("#F1").attr("aria-readonly"), "aria-readonly set");
	});

	QUnit.test("onLayoutDataChange", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oGD = new GridData("GD1");
		var oField1 = new Input("I1", {layoutData: oGD});
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();

		sinon.spy(oForm, "onLayoutDataChange");
		oGD.setSpan("XL12 L12 M12 S12");
		assert.ok(oForm.onLayoutDataChange.called, "LayoutDataChanged calles on Form");
	});

	QUnit.module("FormLayout", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("backgroundDesign", function(assert) {
		assert.equal(oFormLayout.getBackgroundDesign(), library.BackgroundDesign.Translucent, "Background design default");
		assert.ok(jQuery("#FL1").hasClass("sapUiFormBackgrTranslucent"), "translucent design per default rendered");

		oFormLayout.setBackgroundDesign(library.BackgroundDesign.Solid);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#FL1").hasClass("sapUiFormBackgrSolid"), "solid design rendered");

		oFormLayout.setBackgroundDesign(library.BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#FL1").hasClass("sapUiFormBackgrSolid"), "solid design not rendered");
		assert.notOk(jQuery("#FL1").hasClass("sapUiFormBackgrTranslucent"), "translucent design not rendered");
	});

	QUnit.test("getLayoutDataForElement", function(assert) {
		var oField = new Input("I1");
		var oGD = new GridData("GD1");
		var oRD = new ResponsiveFlowLayoutData("RD1");
		var oVD = new VariantLayoutData("VD1");

		assert.notOk(oFormLayout.getLayoutDataForElement(oField, "sap.ui.layout.GridData"), "no LayoutData");

		oField.setLayoutData(oRD);
		assert.notOk(oFormLayout.getLayoutDataForElement(oField, "sap.ui.layout.GridData"), "no LayoutData");

		oField.setLayoutData(oGD);
		assert.equal(oFormLayout.getLayoutDataForElement(oField, "sap.ui.layout.GridData"), oGD, "LayoutData found");

		oField.setLayoutData(oVD);
		oVD.addMultipleLayoutData(oRD);
		oVD.addMultipleLayoutData(oGD);
		assert.equal(oFormLayout.getLayoutDataForElement(oField, "sap.ui.layout.GridData"), oGD, "LayoutData found");

		oField.destroy();
	});

	QUnit.test("Keyboard: Expander", function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {title: "Test"});
		oForm.addFormContainer(oFormContainer1);
		oFormContainer1.setExpandable(true);
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(jQuery("#FC1--Exp").get(0), KeyCodes.NUMPAD_MINUS, false, false, false);
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");

		qutils.triggerKeydown(jQuery("#FC1--Exp").get(0), KeyCodes.NUMPAD_PLUS, false, false, false);
		assert.ok(jQuery("#FC1-content").is(":visible"), "Container content area is visible");
	});

	QUnit.test("Keyboard: F6", function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		var oFormElement2 = new FormElement("FE2");
		oFormElement2.setLabel("Test2");
		var oField2 = new Input("I2");
		oFormElement2.addField(oField2);
		oFormContainer1.addFormElement(oFormElement1);
		oFormContainer1.addFormElement(oFormElement2);
		var oFormContainer2 = new FormContainer("FC2");
		var oFormElement3 = new FormElement("FE3");
		oFormElement3.setLabel("Test3");
		var oField3 = new Input("I3");
		oFormElement3.addField(oField3);
		var oFormElement4 = new FormElement("FE4");
		oFormElement4.setLabel("Test4");
		var oField4 = new Input("I4");
		oFormElement4.addField(oField4);
		oFormContainer2.addFormElement(oFormElement3);
		oFormContainer2.addFormElement(oFormElement4);
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);

		var oUiArea = oForm.getParent();
		var oFieldBefore = new Input("I-B");
		oUiArea.insertContent(oFieldBefore, 0);
		var oFieldAfter = new Input("I-A");
		oUiArea.addContent(oFieldAfter);
		sap.ui.getCore().applyChanges();

		jQuery("#I-B").focus();
		qutils.triggerKeydown(jQuery("#I-B").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I1-inner", "Container1 focused after F6 on content before");

		jQuery("#I1").focus();
		qutils.triggerKeydown(jQuery("#I1").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I3-inner", "Container2 focused after F6 on Container1");

		jQuery("#I3").focus();
		qutils.triggerKeydown(jQuery("#I3").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I-A-inner", "Content after Form focused after Shift+F6 on Container2");

		jQuery("#I-A").focus();
		qutils.triggerKeydown(jQuery("#I-A").get(0), KeyCodes.F6, true, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I3-inner", "Container2 focused after Shift+F6 on content after Form");

		jQuery("#I3").focus();
		qutils.triggerKeydown(jQuery("#I3").get(0), KeyCodes.F6, true, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I1-inner", "Container1 focused after Shift+F6 on Container2");

		oFieldBefore.destroy();
		oFieldAfter.destroy();
	});

});
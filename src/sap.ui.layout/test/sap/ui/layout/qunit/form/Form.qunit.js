/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
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
	'sap/ui/core/theming/Parameters',
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/qunit/utils/nextUIUpdate"
],
	function(
		Element,
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
		Parameters,
		mLibrary,
		Toolbar,
		mTitle,
		Label,
		Input,
		nextUIUpdate
	) {
	"use strict";

	var oForm;
	var oFormLayout;

	async function initTest() {
		oFormLayout = new FormLayout("FL1");
		oForm = new Form("F1", {
			layout: oFormLayout
		}).placeAt("qunit-fixture");
		await nextUIUpdate();
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

	QUnit.test("Width", async function(assert) {
		oForm.setWidth("300px");
		await nextUIUpdate();

		assert.equal(jQuery("#F1").width(), 300, "Form rendered width 300px");
	});

	QUnit.test("Tooltip", async function(assert) {
		assert.notOk(jQuery("#F1").attr("title"), "no tooltip rendered per default");

		oForm.setTooltip("Test");
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("title"), "Test", "tooltip rendered");
	});

	/* eslint-disable no-console */
	QUnit.test("Title as string", async function(assert) {
		this.spy(console, "assert");
		oForm.setTitle("Test");
		await nextUIUpdate();
		assert.equal(oForm.getTitle(), "Test", "Title set");
		assert.ok(window.document.getElementById("F1--title"), "Title rendered");
		assert.equal(jQuery("#F1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#F1--title").is("h4"), "Title is rendered as H4 as default");
		assert.ok(!jQuery("#F1--title").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.equal(jQuery("#F1--title").width(), parseInt(jQuery("#F1").children().first().innerWidth()), "Title rendered as large as the Layout");
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "F1--title", "aria-labelledby points to Title");
		assert.ok(console.assert.neverCalledWith(sinon.match.falsy), "no assertion should have failed");

		oForm.destroyTitle();
		await nextUIUpdate();
		assert.notOk(oForm.getTitle(), "no Title set");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Title as object", async function(assert) {
		this.spy(console, "assert"); // eslint-disable-line no-console
		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		await nextUIUpdate();

		assert.equal(oForm.getTitle(), oTitle, "Title set");
		assert.ok(window.document.getElementById("T1"), "Title rendered");
		assert.equal(jQuery("#T1").text(), "Test", "Title rendered");
		assert.ok(jQuery("#T1").is("h4"), "Title is rendered as H4 as default");
		assert.notOk(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.notOk(jQuery("#T1").attr("title"), "Title: no tooltip rendered per default");
		assert.notOk(window.document.getElementById("T1-ico"), "Title no image is rendered");
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");
		assert.ok(console.assert.neverCalledWith(sinon.match.falsy), "no assertion should have failed");

		oTitle.setIcon("../../images/controls/sap.ui.layout.form.Form.gif");
		oTitle.setTooltip("Test");
		oTitle.setEmphasized(true);
		oTitle.setLevel(coreLibrary.TitleLevel.H1);
		await nextUIUpdate();
		assert.equal(jQuery("#T1").attr("title"), "Test", "Title: tooltip rendered");
		assert.ok(jQuery("#T1").is("h1"), "Title is rendered as H1");
		assert.ok(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered as emphasized");
		assert.ok(window.document.getElementById("T1-ico"), "Title image is rendered");
		assert.ok(jQuery("#T1-ico").is("img"), "Icon is rendered as image");
		assert.equal(jQuery("#T1-ico").attr("src"), "../../images/controls/sap.ui.layout.form.Form.gif", "Image URL");

		oForm.destroyTitle();
		await nextUIUpdate();
		assert.notOk(oForm.getTitle(), "no Title set");
		assert.notOk(window.document.getElementById("T1"), "no Title rendered");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");
	});
	/* eslint-enable no-console */

	QUnit.test("Toolbar", async function(assert) {
		var oToolbar = new Toolbar("TB1");
		oForm.setToolbar(oToolbar);
		await nextUIUpdate();

		assert.equal(oForm.getToolbar(), oToolbar, "Toolbar set");
		assert.equal(oToolbar.getActiveDesign(), mLibrary.ToolbarDesign.Transparent, "Toolbar Auto-design set");
		assert.equal(oToolbar.getDesign(), mLibrary.ToolbarDesign.Auto, "Toolbar design not changed");
		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "TB1", "aria-labelledby points to Toolbar");

		oForm.destroyToolbar();
		await nextUIUpdate();
		assert.notOk(oForm.getToolbar(), "no Toolbar set");
		assert.notOk(window.document.getElementById("TB1"), "no Toolbar rendered");
		assert.notOk(jQuery("#F1").attr("aria-labelledby"), "no aria-labelledby");

		oToolbar = new Toolbar("TB1", {content: [new mTitle("T1", {text: "Test"})]});
		oForm.setToolbar(oToolbar);
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");
	});

	QUnit.test("Title and Toolbar", async function(assert) {
		oForm.setTitle("Test");
		var oToolbar = new Toolbar("TB1");
		oForm.setToolbar(oToolbar);
		await nextUIUpdate();

		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
	});

	QUnit.test("Title with async Theme-Parameter loading", async function(assert) {
		var fnCallback;
		this.stub(Parameters, "get").callsFake(function(vName, oElement) {
			if (vName instanceof Object && !Array.isArray(vName) && Array.isArray(vName.name) && vName.name[0] === 'sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize') {
				fnCallback = vName.callback;
				return undefined;
			} else {
				return Parameters.get.wrappedMethod(arguments);
			}
		});

		oForm.setTitle("Test");
		await nextUIUpdate();
		assert.ok(window.document.getElementById("F1--title"), "Title rendered");
		assert.equal(jQuery("#F1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#F1--title").is("h4"), "Title is rendered as H4 as default");

		fnCallback({
			"sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize": "H1",
			"sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize": "H2"
		});

		await nextUIUpdate();
		assert.ok(window.document.getElementById("F1--title"), "Title rendered");
		assert.equal(jQuery("#F1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#F1--title").is("h1"), "Title is rendered as H1");
	});

	QUnit.test("ariaLabelledBy", async function(assert) {
		oForm.addAriaLabelledBy("X");
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X", "aria-labelledby points to AriaLabel");

		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X T1", "aria-labelledby points to Title and AriaLabel");
	});

	QUnit.test("_suggestTitleId", async function(assert) {
		oForm._suggestTitleId("ID1");
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "ID1", "aria-labelledby points to TitleID");

		var oTitle = new Title("T1", {text: "Test"});
		oForm.setTitle(oTitle);
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");

		oForm.addAriaLabelledBy("X");
		await nextUIUpdate();
		assert.equal(jQuery("#F1").attr("aria-labelledby"), "X T1", "aria-labelledby points to AriaLabel and Title");
	});

	QUnit.module("FormContainer", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("addFormContainer", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		this.spy(oFormContainer1, "_setEditable");
		this.spy(oFormContainer2, "_setEditable");

		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		await nextUIUpdate();
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

	QUnit.test("insertFormContainer", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		this.spy(oFormContainer1, "_setEditable");
		this.spy(oFormContainer2, "_setEditable");

		oForm.insertFormContainer(oFormContainer1, 0);
		oForm.insertFormContainer(oFormContainer2, 0);
		await nextUIUpdate();
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

	QUnit.test("removeFormContainer", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		var oRemoved = oForm.removeFormContainer(oFormContainer1);
		await nextUIUpdate();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(oRemoved, oFormContainer1, "FormContainer1 removed");
		assert.equal(aFormContainers.length, 1, "1 FormContainers assigned");
		assert.equal(aFormContainers[0].getId(), "FC2", "first FormContainer");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");
		oFormContainer1.destroy();
	});

	QUnit.test("removeAllFormContainers", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		var aRemoved = oForm.removeAllFormContainers();
		await nextUIUpdate();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(aRemoved.length, 2, "2 FormContainers removed");
		assert.equal(aFormContainers.length, 0, "no FormContainers assigned");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.notOk(window.document.getElementById("FC2"), "Container2 is not rendered");
		oFormContainer1.destroy();
		oFormContainer2.destroy();
	});

	QUnit.test("destroyFormContainers", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		oForm.destroyFormContainers();
		await nextUIUpdate();
		var aFormContainers = oForm.getFormContainers();

		assert.equal(aFormContainers.length, 0, "no FormContainers assigned");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.notOk(window.document.getElementById("FC2"), "Container2 is not rendered");
		assert.notOk(Element.getElementById("FC1"), "FormContainer1 destroyed");
		assert.notOk(Element.getElementById("FC2"), "FormContainer2 destroyed");
	});

	QUnit.test("visibility", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {visible: false});
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		await nextUIUpdate();

		assert.equal(oForm.getVisibleFormContainers().length, 1, "getVisibleFormContainers returns only one container");
		assert.notOk(window.document.getElementById("FC1"), "Container1 is not rendered");
		assert.ok(window.document.getElementById("FC2"), "Container2 is rendered");

		oFormContainer1.setVisible(true);
		await nextUIUpdate();
		assert.equal(oForm.getVisibleFormContainers().length, 2, "getVisibleFormContainers returns two containers");
		assert.ok(window.document.getElementById("FC1"), "Container1 is rendered");
	});

	// just check rendering, because API is tested in FormContainer qUnit test
	QUnit.test("Tooltip", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();
		assert.notOk(jQuery("#FC1").attr("title"), "no tooltip rendered per default");

		oFormContainer1.setTooltip("Test");
		await nextUIUpdate();
		assert.equal(jQuery("#FC1").attr("title"), "Test", "tooltip rendered");
	});

	QUnit.test("Title  as string", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.setTitle("Test");
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();
		assert.ok(window.document.getElementById("FC1--title"), "Title rendered");
		assert.equal(jQuery("#FC1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#FC1--title").is("h5"), "Title is rendered as H5 as default");
		assert.ok(!jQuery("#FC1--title").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set on Container");
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "FC1--title", "aria-labelledby points to Title");

		oFormContainer1.destroyTitle();
		await nextUIUpdate();
		assert.notOk(window.document.getElementById("FC1--title"), "no Title rendered");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set on Form");
		assert.notOk(jQuery("#FC1").attr("role"), "no role set on Container");
		assert.notOk(jQuery("#FC1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Title  as object", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oTitle = new Title("T1", {text: "Test"});
		oFormContainer1.setTitle(oTitle);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.ok(window.document.getElementById("T1"), "Title rendered");
		assert.equal(jQuery("#T1").text(), "Test", "Title rendered");
		assert.ok(jQuery("#T1").is("h5"), "Title is rendered as H5 as default");
		assert.notOk(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered not emphasized");
		assert.notOk(jQuery("#T1").attr("title"), "Title: no tooltip rendered per default");
		assert.notOk(window.document.getElementById("T1-ico"), "Title no image is rendered");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set on Container");
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");

		oTitle.setIcon("sap-icon://sap-ui5");
		oTitle.setTooltip("Test");
		oTitle.setEmphasized(true);
		oTitle.setLevel(coreLibrary.TitleLevel.H1);
		await nextUIUpdate();
		assert.equal(jQuery("#T1").attr("title"), "Test", "Title: tooltip rendered");
		assert.ok(jQuery("#T1").is("h1"), "Title is rendered as H1");
		assert.ok(jQuery("#T1").hasClass("sapUiFormTitleEmph"), "Title rendered as emphasized");
		assert.ok(window.document.getElementById("T1-ico"), "Title image is rendered");
		assert.ok(jQuery("#T1-ico").is("span"), "Icon is rendered as span");

		oFormContainer1.destroyTitle();
		await nextUIUpdate();
		assert.notOk(window.document.getElementById("T1"), "no Title rendered");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set on Form");
		assert.notOk(jQuery("#FC1").attr("role"), "no role set on Container");
		assert.notOk(jQuery("#FC1").attr("aria-labelledby"), "no aria-labelledby");
	});

	QUnit.test("Toolbar", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.equal(oToolbar.getActiveDesign(), mLibrary.ToolbarDesign.Transparent, "Toolbar Auto-design set");
		assert.equal(oToolbar.getDesign(), mLibrary.ToolbarDesign.Auto, "Toolbar design not changed");
		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "TB1", "aria-labelledby points to Toolbar");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set on Container");

		oFormContainer1.destroyToolbar();
		await nextUIUpdate();
		assert.notOk(window.document.getElementById("TB1"), "no Toolbar rendered");
		assert.notOk(jQuery("#FC1").attr("aria-labelledby"), "no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set on Form");
		assert.notOk(jQuery("#FC1").attr("role"), "no role set on Container");

		oToolbar = new Toolbar("TB1", {content: [new mTitle("T1", {text: "Test"})]});
		oFormContainer1.setToolbar(oToolbar);
		await nextUIUpdate();
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "T1", "aria-labelledby points to Title");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		assert.equal(jQuery("#FC1").attr("role"), "form", "role \"form\" set on Container");
	});

	QUnit.test("Title and Toolbar", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.setTitle("Test");
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.ok(window.document.getElementById("TB1"), "Toolbar rendered");
		assert.notOk(window.document.getElementById("F1--title"), "no Title rendered");
	});

	QUnit.test("Title with async Theme-Parameter loading", async function(assert) {
		var fnCallback;
		this.stub(Parameters, "get").callsFake(function(vName, oElement) {
			if (vName instanceof Object && !Array.isArray(vName) && Array.isArray(vName.name) && vName.name[0] === 'sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize') {
				fnCallback = vName.callback;
				return undefined;
			} else {
				return Parameters.get.wrappedMethod(arguments);
			}
		});

		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.setTitle("Test");
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();
		assert.ok(window.document.getElementById("FC1--title"), "Title rendered");
		assert.equal(jQuery("#FC1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#FC1--title").is("h5"), "Title is rendered as H5 as default");

		fnCallback({
			"sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize": "H1",
			"sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize": "H2"
		});

		await nextUIUpdate();
		assert.ok(window.document.getElementById("FC1--title"), "Title rendered");
		assert.equal(jQuery("#FC1--title").text(), "Test", "Title rendered");
		assert.ok(jQuery("#FC1--title").is("h2"), "Title is rendered as H2");
	});

	QUnit.test("ariaLabelledBy", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oFormContainer1.addAriaLabelledBy("X");
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "X", "aria-labelledby points to property");

		var oTitle = new Title("T1", {text: "Test"});
		oFormContainer1.setTitle(oTitle);
		await nextUIUpdate();
		assert.equal(jQuery("#FC1").attr("aria-labelledby"), "X T1", "aria-labelledby points to Title and property");
	});

	QUnit.test("Expander", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {title: "Test"});
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.notOk(window.document.getElementById("FC1--Exp"), "no Expander rendered");

		oFormContainer1.setExpandable(true);
		await nextUIUpdate();
		assert.ok(window.document.getElementById("FC1--Exp"), "Expander rendered");
		assert.ok(window.document.getElementById("FC1-content"), "Container content area is rendered");
		assert.ok(jQuery("#FC1-content").is(":visible"), "Container content area is visible");

		qutils.triggerEvent("tap", "FC1--Exp");
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");

		// test not expanded in FormRenderer
		oForm.invalidate();
		await nextUIUpdate();
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");
	});

	QUnit.test("getRenderedDomRef", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.equal(oFormContainer1.getRenderedDomRef().id, "FC1", "getRenderedDomRef returns DOM");

		oForm.setLayout();
		await nextUIUpdate();
		assert.notOk(oFormContainer1.getRenderedDomRef(), "getRenderedDomRef return nothing if no Layout");

		oForm.setLayout(oFormLayout);
		assert.notOk(oFormContainer1.getRenderedDomRef(), "getRenderedDomRef return nothing if not rendered");
	});

	QUnit.module("FormElement", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	// for FormElements and Fields just test rendering as API is tested in other qUnit tests
	QUnit.test("Rendering", async function(assert) {
		this.spy(oFormLayout, "contentOnAfterRendering");

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
		await nextUIUpdate();

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

	QUnit.test("visibility", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1", {visible: false});
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.notOk(window.document.getElementById("FE1"), "FormElement1 is not rendered");
		assert.notOk(oFormElement1.getLabelControl().getDomRef(), "FormElement1 label is not rendered");
		assert.notOk(window.document.getElementById("I1"), "FormElement1 field is not rendered");

		oFormElement1.setVisible(true);
		await nextUIUpdate();
		assert.ok(window.document.getElementById("FE1"), "FormElement1 is rendered");
		assert.ok(oFormElement1.getLabelControl().getDomRef(), "FormElement1 label is rendered");
		assert.ok(window.document.getElementById("I1"), "FormElement1 field is rendered");
	});

	QUnit.test("getRenderedDomRef", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oField1 = new Input("I1");
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		assert.equal(oFormElement1.getRenderedDomRef().id, "FE1", "getRenderedDomRef returns DOM");

		oForm.setLayout();
		await nextUIUpdate();
		assert.notOk(oFormElement1.getRenderedDomRef(), "getRenderedDomRef return nothing if no Layout");

		oForm.setLayout(oFormLayout);
		assert.notOk(oFormElement1.getRenderedDomRef(), "getRenderedDomRef return nothing if not rendered");
	});

	QUnit.module("Form", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Editable", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormContainer2 = new FormContainer("FC2");
		oForm.addFormContainer(oFormContainer1);
		oForm.addFormContainer(oFormContainer2);
		await nextUIUpdate();

		assert.notOk(oForm.getEditable(), "editable not set per default");
		assert.notOk(jQuery("#F1").hasClass("sapUiFormEdit"), "Form not editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");

		this.spy(oFormContainer1, "_setEditable");
		this.spy(oFormContainer2, "_setEditable");

		oForm.setEditable(true);
		await nextUIUpdate();
		assert.ok(jQuery("#F1").hasClass("sapUiFormEdit"), "Form editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");
		assert.ok(oFormContainer1._setEditable.calledWith(true), "_setEditable on FormContainer1");
		assert.ok(oFormContainer2._setEditable.calledWith(true), "_setEditable on FormContainer2");

		// test if editable rendered by renderer
		oForm.invalidate();
		await nextUIUpdate();
		assert.ok(jQuery("#F1").hasClass("sapUiFormEdit"), "Form editable rendered");
		assert.notOk(jQuery("#F1").attr("aria-readonly"), "aria-readonly not set");

		oForm.setEditable(false);
		await nextUIUpdate();
		assert.notOk(jQuery("#F1").hasClass("sapUiFormEdit"), "Form not editable rendered");
		assert.ok(jQuery("#F1").attr("aria-readonly"), "aria-readonly set");
	});

	QUnit.test("onLayoutDataChange", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1");
		var oFormElement1 = new FormElement("FE1");
		oFormElement1.setLabel("Test1");
		var oGD = new GridData("GD1");
		var oField1 = new Input("I1", {layoutData: oGD});
		oFormElement1.addField(oField1);
		oFormContainer1.addFormElement(oFormElement1);
		oForm.addFormContainer(oFormContainer1);
		await nextUIUpdate();

		this.spy(oForm, "onLayoutDataChange");
		oGD.setSpan("XL12 L12 M12 S12");
		assert.ok(oForm.onLayoutDataChange.called, "LayoutDataChanged calles on Form");
	});

	QUnit.module("FormLayout", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("backgroundDesign", async function(assert) {
		assert.equal(oFormLayout.getBackgroundDesign(), library.BackgroundDesign.Translucent, "Background design default");
		assert.ok(jQuery("#FL1").hasClass("sapUiFormBackgrTranslucent"), "translucent design per default rendered");

		oFormLayout.setBackgroundDesign(library.BackgroundDesign.Solid);
		await nextUIUpdate();
		assert.ok(jQuery("#FL1").hasClass("sapUiFormBackgrSolid"), "solid design rendered");

		oFormLayout.setBackgroundDesign(library.BackgroundDesign.Transparent);
		await nextUIUpdate();
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

	QUnit.test("Keyboard: Expander", async function(assert) {
		var oFormContainer1 = new FormContainer("FC1", {title: "Test"});
		oForm.addFormContainer(oFormContainer1);
		oFormContainer1.setExpandable(true);
		await nextUIUpdate();

		qutils.triggerKeydown(jQuery("#FC1--Exp").get(0), KeyCodes.NUMPAD_MINUS, false, false, false);
		assert.notOk(jQuery("#FC1-content").is(":visible"), "Container content area is not visible");

		qutils.triggerKeydown(jQuery("#FC1--Exp").get(0), KeyCodes.NUMPAD_PLUS, false, false, false);
		assert.ok(jQuery("#FC1-content").is(":visible"), "Container content area is visible");
	});

	QUnit.test("Keyboard: F6", async function(assert) {
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
		await nextUIUpdate();

		jQuery("#I-B").trigger("focus");
		qutils.triggerKeydown(jQuery("#I-B").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I1-inner", "Container1 focused after F6 on content before");

		jQuery("#I1").trigger("focus");
		qutils.triggerKeydown(jQuery("#I1").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I3-inner", "Container2 focused after F6 on Container1");

		jQuery("#I3").trigger("focus");
		qutils.triggerKeydown(jQuery("#I3").get(0), KeyCodes.F6, false, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I-A-inner", "Content after Form focused after Shift+F6 on Container2");

		jQuery("#I-A").trigger("focus");
		qutils.triggerKeydown(jQuery("#I-A").get(0), KeyCodes.F6, true, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I3-inner", "Container2 focused after Shift+F6 on content after Form");

		jQuery("#I3").trigger("focus");
		qutils.triggerKeydown(jQuery("#I3").get(0), KeyCodes.F6, true, false, false);
		assert.equal(document.activeElement.getAttribute("id"), "I1-inner", "Container1 focused after Shift+F6 on Container2");

		oFieldBefore.destroy();
		oFieldAfter.destroy();
	});

	QUnit.test("renderControlsForSemanticElement", function(assert) {
		assert.notOk(oFormLayout.renderControlsForSemanticElement(), "no control rendering supported");
	});

});
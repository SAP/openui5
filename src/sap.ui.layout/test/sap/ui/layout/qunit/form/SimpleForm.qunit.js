/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 5]*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/layout/GridData",
	"sap/ui/core/VariantLayoutData"
	],
	function(
		SimpleForm,
		Title,
		Toolbar,
		Label,
		Input,
		GridData,
		VariantLayoutData
	) {
	"use strict";

	// use no check with instanceof for layout or LayoutData to let the SimpleForm load the
	// files async

	QUnit.start();

	var oSimpleForm;
	var oForm;
	var oFormLayout;

	// if some test breaks internal controls of test may not destroyed
	// what leads to duplicate ID errors in next test
	function cleanupControls(sId) {
		var oControl = sap.ui.getCore().byId(sId);
		if (oControl) {
			oControl.destroy();
		}
	}

	function initTestWithoutContent() {
		oSimpleForm = new SimpleForm("SF1");
		oForm = oSimpleForm.getAggregation("form");
		oFormLayout = oForm.getLayout();
	}

	function initTestWithContent(sLayout) {
		oSimpleForm = new SimpleForm("SF1", {
			layout: sLayout,
			editable: true,
			content: [
			          new Title("T1", {text: "Test"}),
			          new Label("L1", {text: "Test"}),
			          new Input("I1"),
			          new Input("I2"),
			          new Title("T2", {text: "Test"}),
			          new Label("L2", {text: "Test"}),
			          new Input("I3"),
			          new Label("L3", {text: "Test"}),
			          new Input("I4"),
			          new Input("I5"),
			          new Input("I6")
			          ]
		}).placeAt("content");
		sap.ui.getCore().applyChanges();
		oForm = oSimpleForm.getAggregation("form");
		oFormLayout = oForm.getLayout();
	}

	function initTestWithContentRL() {
		initTestWithContent("ResponsiveLayout");
		jQuery.sap.require("sap.ui.layout.ResponsiveFlowLayoutData");
	}

	function initTestWithContentRGL() {
		initTestWithContent("ResponsiveGridLayout");
	}

	function initTestWithContentGL() {
		initTestWithContent("GridLayout");
	}

	function initTestWithContentCL() {
		initTestWithContent("ColumnLayout");
	}

	function afterTest() {
		if (oSimpleForm) {
			oSimpleForm.destroy();
			oSimpleForm = undefined;
			oForm = undefined;
			oFormLayout = undefined;
		}
		cleanupControls("L1");
		cleanupControls("L2");
		cleanupControls("L3");
		cleanupControls("I1");
		cleanupControls("I2");
		cleanupControls("I3");
		cleanupControls("T1");
		cleanupControls("T2");
		cleanupControls("T3");
		cleanupControls("TB1");
		cleanupControls("TB2");
		cleanupControls("TB3");
	}

	function asyncLayoutTest(assert, sLayout, fnTest) {
		if (oFormLayout) {
			fnTest(assert);
		} else {
			// wait until Layout is loaded
			var fnDone = assert.async();
			sap.ui.require([sLayout], function() {
				oFormLayout = oForm.getLayout();
				fnTest(assert);
				fnDone();
			});
		}
	}

	QUnit.module("Form", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	function layoutAfterRendering(assert) {
		assert.ok(oFormLayout, "FormLayout is created after rendering if no Layout is set");
	}

	QUnit.test("initial state", function(assert) {
		assert.ok(oSimpleForm, "SimpleForm is created");
		assert.ok(oForm, "internal Form is created");
		assert.notOk(oFormLayout, "no FormLayout is created before rendering if no Layout is set");
		assert.equal(oSimpleForm.getLayout(), sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout, "ResponsiveLayout is default");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainers");

		oSimpleForm.placeAt("content");
		sap.ui.getCore().applyChanges();
		oFormLayout = oForm.getLayout();

		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", layoutAfterRendering);
	});

	QUnit.test("width", function(assert) {
		oSimpleForm.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.ok(!/width:/.test(oSimpleForm.$().attr("style")), "SimpleForm2: no width set");

		oSimpleForm.setWidth("100%");
		sap.ui.getCore().applyChanges();
		assert.ok(/width:/.test(oSimpleForm.$().attr("style")) && /100%/.test(oSimpleForm.$().attr("style")), "SimpleForm1: width set");
	});

	QUnit.test("Editabale", function(assert) {
		assert.notOk(oSimpleForm.getEditable(), "SimpleForm not ediatable per default");
		assert.notOk(oForm.getEditable(), "Form not ediatable");

		oSimpleForm.setEditable(true);
		assert.ok(oSimpleForm.getEditable(), "SimpleForm is ediatable");
		assert.ok(oForm.getEditable(), "Form is ediatable");
	});

	QUnit.test("Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		oSimpleForm.setTitle(oTitle);

		assert.equal(oSimpleForm.getTitle().getId(), "T1", "SimpleForm getTitle");
		assert.equal(oForm.getTitle().getId(), "T1", "Form getTitle");
		assert.equal(oTitle.getParent().getId(), "SF1", "SimpleForm still parent of Title");

		oSimpleForm.destroyTitle();
		assert.notOk(!!oSimpleForm.getTitle(), "SimpleForm getTitle");
		assert.notOk(!!oForm.getTitle(), "Form getTitle");
	});

	QUnit.test("Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oSimpleForm.setToolbar(oToolbar);

		assert.equal(oSimpleForm.getToolbar().getId(), "TB1", "SimpleForm getToolbar");
		assert.equal(oForm.getToolbar().getId(), "TB1", "Form getToolbar");

		oSimpleForm.destroyToolbar();
		assert.notOk(!!oSimpleForm.getToolbar(), "SimpleForm getToolbar");
		assert.notOk(!!oForm.getToolbar(), "Form getToolbar");
	});

	QUnit.test("AriaLabelledBy", function(assert) {
		oSimpleForm.addAriaLabelledBy("XXX");
		oSimpleForm.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oForm.getAriaLabelledBy(), "XXX", "Form getAriaLabelledBy");
		assert.equal(jQuery("#SF1--Form").attr("aria-labelledby"), "XXX", "aria-labelledby");
	});

	QUnit.module("addContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	QUnit.test("Title as first content", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		oSimpleForm.addContent(oTitle);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content element");
		assert.equal(aContent[0].getId(), "T1", "SimpleForm Title as content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.equal(aFormContainers[0].getTitle().getId(), "T1", "FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "FormContainer has no FormElements");
	});

	QUnit.test("Toolbar as first content", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oSimpleForm.addContent(oToolbar);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content element");
		assert.equal(aContent[0].getId(), "TB1", "SimpleForm Toolbar as content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.equal(aFormContainers[0].getToolbar().getId(), "TB1", "FormContainer has Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "FormContainer has no FormElements");
	});

	QUnit.test("Label as first content", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oSimpleForm.addContent(oLabel);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content element");
		assert.equal(aContent[0].getId(), "L1", "SimpleForm Label as content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.notOk(aFormContainers[0].getTitle(), "FormContainer has no Title set");
		assert.notOk(aFormContainers[0].getToolbar(), "FormContainer has no Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "FormElement has no Fields");
	});

	QUnit.test("Field as first content", function(assert) {
		var oField = new Input("I1");
		oSimpleForm.addContent(oField);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content element");
		assert.equal(aContent[0].getId(), "I1", "SimpleForm Field as content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.notOk(aFormContainers[0].getTitle(), "FormContainer has no Title set");
		assert.notOk(aFormContainers[0].getToolbar(), "FormContainer has no Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.notOk(aFormElements[0].getLabel(), "FormElement has no Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I1", "FormElement has Field assigned");
	});

	function testAddTitleAfter(assert, oControl) {
		var oTitle = new Title("T2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.addContent(oTitle);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[1].getId(), "T2", "SimpleForm Title as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getTitle().getId(), "T2", "2. FormContainer has Title set");
		var aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 0, "2. FormContainer has no FormElements");
	}

	QUnit.test("Title after Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testAddTitleAfter(assert, oTitle);
	});

	QUnit.test("Title after Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testAddTitleAfter(assert, oToolbar);
	});

	QUnit.test("Title after Label", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testAddTitleAfter(assert, oLabel);
	});

	QUnit.test("Title after Field", function(assert) {
		var oField = new Input("I1");
		testAddTitleAfter(assert, oField);
	});

	function testAddToolbarAfter(assert, oControl) {
		var oToolbar = new Toolbar("TB2");
		oSimpleForm.addContent(oControl);
		oSimpleForm.addContent(oToolbar);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[1].getId(), "TB2", "SimpleForm Toolbar as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getToolbar().getId(), "TB2", "2. FormContainer has Toolbar set");
		var aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 0, "2. FormContainer has no FormElements");
	}

	QUnit.test("Toolbar after Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testAddToolbarAfter(assert, oTitle);
	});

	QUnit.test("Toolbar after Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testAddToolbarAfter(assert, oToolbar);
	});

	QUnit.test("Toolbar after Title", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testAddToolbarAfter(assert, oLabel);
	});

	QUnit.test("Toolbar after Title", function(assert) {
		var oField = new Input("I1");
		testAddToolbarAfter(assert, oField);
	});

	function testAddLabelAfterHeader(assert, oControl) {
		var oLabel = new Label("L2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.addContent(oLabel);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 1 content elements");
		assert.equal(aContent[1].getId(), "L2", "SimpleForm Label as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L2", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "FormElement has no Fields");
	}

	QUnit.test("Label after Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testAddLabelAfterHeader(assert, oTitle);
	});

	QUnit.test("Label after Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testAddLabelAfterHeader(assert, oToolbar);
	});

	function testAddLabelAfterRow(assert, oControl) {
		var oLabel = new Label("L2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.addContent(oLabel);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 1 content elements");
		assert.equal(aContent[1].getId(), "L2", "SimpleForm Label as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has Label set");
		var aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 0, "2. FormElement has no Fields");
	}

	QUnit.test("Label after Label", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testAddLabelAfterRow(assert, oLabel);
	});

	QUnit.test("Label after Field", function(assert) {
		var oField = new Input("I1");
		testAddLabelAfterRow(assert, oField);
	});

	function testAddFieldAfterHeader(assert, oControl) {
		var oField = new Input("I2");
		oSimpleForm.addContent(oControl);
		oSimpleForm.addContent(oField);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[1].getId(), "I2", "SimpleForm Field as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I2", "FormElement has Field assigned");
	}

	QUnit.test("Field after Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testAddFieldAfterHeader(assert, oTitle);
	});

	QUnit.test("Field after Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testAddFieldAfterHeader(assert, oToolbar);
	});

	QUnit.test("Field after Label", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testAddFieldAfterHeader(assert, oLabel);
	});

	QUnit.test("Field after Field", function(assert) {
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[1].getId(), "I2", "SimpleForm Field as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 2, "FormElement has 2 Fields");
		assert.equal(aFields[1].getId(), "I2", "FormElement has second Field assigned");
	});

	QUnit.test("already added Field", function(assert) {
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oField1);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[1].getId(), "I1", "Field1 is second content element");
	});

	QUnit.module("InsertContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	function testInsertTitleBeforeHeader(assert, oControl) {
		var oTitle = new Title("T2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.insertContent(oTitle, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "T2", "SimpleForm Title as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[0].getTitle().getId(), "T2", "1. FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "1. FormContainer has no FormElements");
	}

	QUnit.test("Title before Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testInsertTitleBeforeHeader(assert, oTitle);
	});

	QUnit.test("Title before Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testInsertTitleBeforeHeader(assert, oToolbar);
	});

	function testInsertTitleBeforeContent(assert, oControl) {
		var oTitle = new Title("T2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.insertContent(oTitle, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "T2", "SimpleForm Title as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.equal(aFormContainers[0].getTitle().getId(), "T2", "FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
	}

	QUnit.test("Title before Label", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testInsertTitleBeforeContent(assert, oLabel);
	});

	QUnit.test("Title before Field", function(assert) {
		var oField = new Input("I1");
		testInsertTitleBeforeContent(assert, oField);
	});

	function testInsertToolbarBeforeHeader(assert, oControl) {
		var oToolbar = new Toolbar("TB2");
		oSimpleForm.addContent(oControl);
		oSimpleForm.insertContent(oToolbar, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "TB2", "SimpleForm Toolbar as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[0].getToolbar().getId(), "TB2", "1. FormContainer has Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "1. FormContainer has no FormElements");
	}

	QUnit.test("Toolbar before Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testInsertToolbarBeforeHeader(assert, oTitle);
	});

	QUnit.test("Toolbar before Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testInsertToolbarBeforeHeader(assert, oToolbar);
	});

	function testInsertToolbarBeforeContent(assert, oControl) {
		var oToolbar = new Toolbar("TB2");
		oSimpleForm.addContent(oControl);
		oSimpleForm.insertContent(oToolbar, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "TB2", "SimpleForm Toolbar as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.equal(aFormContainers[0].getToolbar().getId(), "TB2", "FormContainer has Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
	}

	QUnit.test("Toolbar before Label", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		testInsertToolbarBeforeContent(assert, oLabel);
	});

	QUnit.test("Toolbar before Field", function(assert) {
		var oField = new Input("I1");
		testInsertToolbarBeforeContent(assert, oField);
	});

	function testInsertLabelBeforeHeader(assert, oControl) {
		var oLabel = new Label("L2", {text: "Test"});
		oSimpleForm.addContent(oControl);
		oSimpleForm.insertContent(oLabel, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "L2", "SimpleForm Label as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.notOk(aFormContainers[0].getTitle(), "1. FormContainer has no Title set");
		assert.notOk(aFormContainers[0].getToolbar(), "1. FormContainer has no Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L2", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "FormElement has no Fields");
	}

	QUnit.test("Label before Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		testInsertLabelBeforeHeader(assert, oTitle);
	});

	QUnit.test("Label before Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		testInsertLabelBeforeHeader(assert, oToolbar);
	});

	QUnit.test("Label before Label", function(assert) {
		var oLabel1 = new Label("L1", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test"});
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.insertContent(oLabel2, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "L2", "SimpleForm Label as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L2", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "FormElement has no Fields");
	});

	QUnit.test("Label before Field", function(assert) {
		var oField = new Input("I1");
		var oLabel = new Label("L2", {text: "Test"});
		oSimpleForm.addContent(oField);
		oSimpleForm.insertContent(oLabel, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "L2", "SimpleForm Label as first content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L2", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
	});

	QUnit.test("at the end", function(assert) {
		// check if addContent is used. So no special test for every combination is needed
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I2");
		oSimpleForm.addContent(oLabel);
		sinon.spy(oSimpleForm, "addContent");
		oSimpleForm.insertContent(oField, 9);
		assert.ok(oSimpleForm.addContent.called, "AddContent is used to insert at the end");
		assert.ok(oSimpleForm.addContent.calledWith(oField), "AddContent is called with field");
	});

	//not needed to check every possible combination, just one kind of similar cases
	function testInsertTitleBetweenHeaders(assert, oControl1, oControl2) {
		var oTitle = new Title("T3", {text: "Test"});
		oSimpleForm.addContent(oControl1);
		oSimpleForm.addContent(oControl2);
		oSimpleForm.insertContent(oTitle, 1);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 3, "SimpleForm has 3 content elements");
		assert.equal(aContent[1].getId(), "T3", "SimpleForm Title as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 3, "Form has 3 FormContainers");
		assert.equal(aFormContainers[1].getTitle().getId(), "T3", "2. FormContainer has Title set");
		var aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 0, "2. FormContainer has no FormElements");
	}

	QUnit.test("Title between Title and Title", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oTitle2 = new Title("T2", {text: "Test"});
		testInsertTitleBetweenHeaders(assert, oTitle1, oTitle2);
	});

	QUnit.test("Title between Title and Toolbar", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oToolbar = new Toolbar("TB2");
		testInsertTitleBetweenHeaders(assert, oTitle, oToolbar);
	});

	QUnit.test("Title between Title and Label", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		var oTitle2 = new Title("T2", {text: "Test"});
		oSimpleForm.insertContent(oTitle2, 1);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 4, "SimpleForm has 4 content elements");
		assert.equal(aContent[1].getId(), "T2", "SimpleForm Title as second content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getTitle().getId(), "T2", "2. FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "1. FormContainer has no FormElements");
		aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 1, "2. FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
	});

	QUnit.test("Title between Label and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		var oTitle2 = new Title("T2", {text: "Test"});
		oSimpleForm.insertContent(oTitle2, 2);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 4, "SimpleForm has 4 content elements");
		assert.equal(aContent[2].getId(), "T2", "SimpleForm Title as 3. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getTitle().getId(), "T2", "2. FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "1. FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "1. FormElement has no Field");
		aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 1, "2. FormContainer has 1 FormElement");
		assert.notOk(aFormElements[0].getLabel(), "2. FormElement has no Label set");
		aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
	});

	QUnit.test("Title between Field and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		var oTitle2 = new Title("T2", {text: "Test"});
		oSimpleForm.insertContent(oTitle2, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		assert.equal(aContent[3].getId(), "T2", "SimpleForm Title as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getTitle().getId(), "T2", "2. FormContainer has Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "1. FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 1, "2. FormContainer has 1 FormElement");
		assert.notOk(aFormElements[0].getLabel(), "2. FormElement has no Label set");
		aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
	});

	// just one check for Toolbar to proov the same logic like for Title is used
	QUnit.test("Toolbar between Field and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		var oToolbar = new Toolbar("TB2");
		oSimpleForm.insertContent(oToolbar, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		assert.equal(aContent[3].getId(), "TB2", "SimpleForm Toolbar as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		assert.equal(aFormContainers[1].getToolbar().getId(), "TB2", "2. FormContainer has Toolbar set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "1. FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 1, "2. FormContainer has 1 FormElement");
		assert.notOk(aFormElements[0].getLabel(), "2. FormElement has no Label set");
		aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
	});

	// just check once to add a FormElement at the end of a FormContainer
	QUnit.test("Label between Field and Title", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		var oTitle2 = new Title("T2", {text: "Test"});
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		oSimpleForm.addContent(oTitle2);
		var oLabel2 = new Label("L2", {text: "Test"});
		oSimpleForm.insertContent(oLabel2, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		assert.equal(aContent[3].getId(), "L2", "SimpleForm Label as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "1. FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1st Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 0, "2. FormElement has 0 Field");
	});

	QUnit.test("Label between Label and Field", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		var oLabel2 = new Label("L2", {text: "Test"});
		oSimpleForm.insertContent(oLabel2, 2);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 4, "SimpleForm has 4 content elements");
		assert.equal(aContent[2].getId(), "L2", "SimpleForm Label as 2. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1st Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "1. FormElement has 0 Field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 1, "2. FormElement has 1 Field");
	});

	QUnit.test("Label between Field and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		var oLabel2 = new Label("L2", {text: "Test"});
		oSimpleForm.insertContent(oLabel2, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		assert.equal(aContent[3].getId(), "L2", "SimpleForm Label as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1st Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 1, "2. FormElement has 1 Field");
	});

	QUnit.test("Field between Field and Label", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField2);
		var oField3 = new Input("I3");
		oSimpleForm.insertContent(oField3, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 6, "SimpleForm has 6 content elements");
		assert.equal(aContent[3].getId(), "I3", "SimpleForm Field as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1st Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 2, "1. FormElement has 2 Fields");
		assert.equal(aFields[1].getId(), "I3", "1. FormElement has new second field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has second Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 1, "3. FormElement has 1 Field");
	});

	QUnit.test("Field between Label and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField2);
		var oField3 = new Input("I3");
		oSimpleForm.insertContent(oField3, 2);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 6, "SimpleForm has 6 content elements");
		assert.equal(aContent[2].getId(), "I3", "SimpleForm Field as 3. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1st Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 2, "1. FormElement has 2 Fields");
		assert.equal(aFields[0].getId(), "I3", "1. FormElement has new first field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has second Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 1, "2. FormElement has 1 Field");
	});

	QUnit.test("Field before first Label", function(assert) {
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.insertContent(oField1, 0);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "I1", "SimpleForm Field as 1. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElements");
		assert.notOk(aFormElements[0].getLabel(), "1. FormElement has no Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Fields");
		assert.equal(aFields[0].getId(), "I1", "1. FormElement has new field");
		assert.equal(aFormElements[1].getLabel().getId(), "L1", "2. FormElement has Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 0, "2. FormElement has no Field");
	});

	QUnit.test("Field between Field and Field", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		var oField3 = new Input("I3");
		oSimpleForm.insertContent(oField3, 3);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		assert.equal(aContent[3].getId(), "I3", "SimpleForm Field as 4. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElements");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 3, "FormElement has 3 Fields");
		assert.equal(aFields[1].getId(), "I3", "FormElement has new second field");
	});

	QUnit.test("Field before first Title", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.insertContent(oField1, 0);
		oSimpleForm.insertContent(oField2, 1);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 3, "SimpleForm has 3 content elements");
		assert.equal(aContent[0].getId(), "I1", "SimpleForm Field as 1. content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElements");
		assert.notOk(aFormElements[0].getLabel(), "1. FormElement has no Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 2, "FormElement has 2 Fields");
		assert.equal(aFields[0].getId(), "I1", "FormElement has Field1 as first field");
	});

	QUnit.test("already added Field", function(assert) {
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.insertContent(oField2, -1);

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		assert.equal(aContent[0].getId(), "I2", "Field2 is first content element");
	});

	QUnit.module("removeContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	QUnit.test("Title as first content", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		oSimpleForm.addContent(oTitle);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		var oRemoved = oSimpleForm.removeContent(oTitle);

		assert.equal(oRemoved.getId(), "T1", "Title removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		assert.notOk(aFormContainers[0].getTitle(), "FormContainer has no Title set");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I1", "1. FormElement has field");

		oTitle.destroy();
	});

	QUnit.test("Title as only content", function(assert) {
		var oTitle = new Title("T1", {text: "Test"});
		oSimpleForm.addContent(oTitle);
		var oRemoved = oSimpleForm.removeContent(oTitle);

		assert.equal(oRemoved.getId(), "T1", "Title removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainers");

		oTitle.destroy();
	});

	QUnit.test("Title before Label", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oTitle2 = new Title("T2", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oTitle2);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField2);
		var oRemoved = oSimpleForm.removeContent(oTitle2);

		assert.equal(oRemoved.getId(), "T2", "Title2 removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1. Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I1", "1. FormElement has 1. field");
		assert.equal(aFormElements[1].getLabel().getId(), "L2", "2. FormElement has 2. Label set");
		aFields = aFormElements[1].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I2", "1. FormElement has 2. field");

		oTitle2.destroy();
	});

	QUnit.test("Title before Field", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oTitle2 = new Title("T2", {text: "Test"});
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oTitle2);
		oSimpleForm.addContent(oField2);
		var aFormContainers = oForm.getFormContainers();
		var sContainerId = aFormContainers[1].getId();
		var oRemoved = oSimpleForm.removeContent(3);

		assert.equal(oRemoved.getId(), "T2", "Title2 removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 4, "SimpleForm has 4 content elements");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "FormElement has Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 2, "FormElement has 2 Fields");
		assert.equal(aFields[0].getId(), "I1", "FormElement has 1. field");
		assert.equal(aFields[1].getId(), "I2", "FormElement has 2. field");
		assert.notOk(sap.ui.getCore().byId(sContainerId), "old FormContainer destroyed");

		oTitle2.destroy();
	});

	QUnit.test("Label as first content", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		var oField = new Input("I1");
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oField);
		var oRemoved = oSimpleForm.removeContent("L1");

		assert.equal(oRemoved.getId(), "L1", "Label removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content elements");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.notOk(aFormElements[0].getLabel(), "FormElement has no Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I1", "FormElement has field");

		oLabel.destroy();
	});

	QUnit.test("Label as only content", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oSimpleForm.addContent(oLabel);
		var oRemoved = oSimpleForm.removeContent("L1");

		assert.equal(oRemoved.getId(), "L1", "Label removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainers");

		oLabel.destroy();
	});

	QUnit.test("Label before Title", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel = new Label("L1", {text: "Test"});
		var oTitle2 = new Title("T2", {text: "Test"});
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oTitle2);
		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		var sElementId = aFormElements[0].getId();
		var oRemoved = oSimpleForm.removeContent(oLabel);

		assert.equal(oRemoved.getId(), "L1", "Label removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 2, "SimpleForm has 2 content elements");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 2, "Form has 2 FormContainers");
		aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "1. FormContainer has no FormElements");
		assert.notOk(sap.ui.getCore().byId(sElementId), "old FormElement destroyed");

		oLabel.destroy();
	});

	QUnit.test("Label before Field", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField2 = new Input("I2");
		var oField3 = new Input("I3");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oField3);
		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		var sElementId = aFormElements[1].getId();
		var oRemoved = oSimpleForm.removeContent(oLabel2);

		assert.equal(oRemoved.getId(), "L2", "Label removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 1, "FormContainer has 1 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "FormElement has 1. Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 3, "FormElement has 3 Fields");
		assert.equal(aFields[0].getId(), "I1", "FormElement has 1. field");
		assert.equal(aFields[1].getId(), "I2", "FormElement has 2. field");
		assert.equal(aFields[2].getId(), "I3", "FormElement has 3. field");
		assert.notOk(sap.ui.getCore().byId(sElementId), "old FormElement destroyed");

		oLabel2.destroy();
	});

	QUnit.test("Field as first content", function(assert) {
		var oField = new Input("I1");
		var oTitle = new Title("T1", {text: "Test"});
		oSimpleForm.addContent(oField);
		oSimpleForm.addContent(oTitle);
		var aFormContainers = oForm.getFormContainers();
		var sContainerId = aFormContainers[0].getId();
		var oRemoved = oSimpleForm.removeContent("I1");

		assert.equal(oRemoved.getId(), "I1", "Field removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content elements");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 0, "FormContainer has no FormElement");
		assert.notOk(sap.ui.getCore().byId(sContainerId), "old FormContainer destroyed");

		oField.destroy();
	});

	QUnit.test("Field as only content", function(assert) {
		var oField = new Input("I1");
		oSimpleForm.addContent(oField);
		var aFormContainers = oForm.getFormContainers();
		var sContainerId = aFormContainers[0].getId();
		var oRemoved = oSimpleForm.removeContent(oField);

		assert.equal(oRemoved.getId(), "I1", "Field removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainers");
		assert.notOk(sap.ui.getCore().byId(sContainerId), "old FormContainer destroyed");

		oField.destroy();
	});

	QUnit.test("Field before Label", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField2);
		var oRemoved = oSimpleForm.removeContent(oField1);

		assert.equal(oRemoved.getId(), "I1", "Field removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 4, "SimpleForm has 4 content elements");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1. Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 0, "1. FormElement has no Field");

		oField1.destroy();
	});

	QUnit.test("Field before Field", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField3 = new Input("I3");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField3);
		var oRemoved = oSimpleForm.removeContent(oField1);

		assert.equal(oRemoved.getId(), "I1", "Field removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 5, "SimpleForm has 5 content elements");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainer");
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormElements.length, 2, "FormContainer has 2 FormElement");
		assert.equal(aFormElements[0].getLabel().getId(), "L1", "1. FormElement has 1. Label set");
		var aFields = aFormElements[0].getFields();
		assert.equal(aFields.length, 1, "1. FormElement has 1 Field");
		assert.equal(aFields[0].getId(), "I2", "1. FormElement has 2. field");

		oField1.destroy();
	});

	QUnit.test("not existing content", function(assert) {
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oField1);
		var oRemoved = oSimpleForm.removeContent(oField2);

		assert.notOk(oRemoved, "nothing removed");

		oRemoved = oSimpleForm.removeContent(99);

		assert.notOk(oRemoved, "nothing removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 1, "SimpleForm has 1 content element");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 1, "Form has 1 FormContainers");

		oField2.destroy();
	});

	QUnit.module("removeAllContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	QUnit.test("empty Form", function(assert) {
		var aRemoved = oSimpleForm.removeAllContent();

		assert.equal(aRemoved.length, 0, "nothing removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainer");
	});

	QUnit.test("Form with content", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		var oTitle2 = new Title("T2", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField3 = new Input("I3");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oTitle2);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField3);
		var aFormContainers = oForm.getFormContainers();
		var sContainerId = aFormContainers[0].getId();
		var aRemoved = oSimpleForm.removeAllContent();

		assert.equal(aRemoved.length, 7, "elements removed");
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainer");
		assert.notOk(sap.ui.getCore().byId(sContainerId), "old FormContainer destroyed");
	});

	QUnit.module("destroyContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	QUnit.test("empty Form", function(assert) {
		oSimpleForm.destroyContent();

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		var aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainer");
	});

	QUnit.test("Form with content", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		var oTitle2 = new Title("T2", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField3 = new Input("I3");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oTitle2);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField3);
		var aFormContainers = oForm.getFormContainers();
		var sContainerId = aFormContainers[0].getId();
		oSimpleForm.destroyContent();

		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 0, "SimpleForm has no content");
		aFormContainers = oForm.getFormContainers();
		assert.equal(aFormContainers.length, 0, "Form has no FormContainer");
		assert.notOk(sap.ui.getCore().byId(sContainerId), "old FormContainer destroyed");
		assert.notOk(sap.ui.getCore().byId("T1"), "Title1 destroyed");
		assert.notOk(sap.ui.getCore().byId("T2"), "Title2 destroyed");
		assert.notOk(sap.ui.getCore().byId("L1"), "Label1 destroyed");
		assert.notOk(sap.ui.getCore().byId("L2"), "Label2 destroyed");
		assert.notOk(sap.ui.getCore().byId("I1"), "Field1 destroyed");
		assert.notOk(sap.ui.getCore().byId("I2"), "Field2 destroyed");
		assert.notOk(sap.ui.getCore().byId("I3"), "Field3 destroyed");
	});

	QUnit.module("indexOfContent", {
		beforeEach: initTestWithoutContent,
		afterEach: afterTest
	});

	QUnit.test("not existing content", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);

		assert.equal(oSimpleForm.indexOfContent(oField2), -1, "Index of Field2");
		oField2.destroy();
	});

	QUnit.test("existing content", function(assert) {
		var oTitle1 = new Title("T1", {text: "Test"});
		var oLabel1 = new Label("L1", {text: "Test"});
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		var oTitle2 = new Title("T2", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test"});
		var oField3 = new Input("I3");
		oSimpleForm.addContent(oTitle1);
		oSimpleForm.addContent(oLabel1);
		oSimpleForm.addContent(oField1);
		oSimpleForm.addContent(oField2);
		oSimpleForm.addContent(oTitle2);
		oSimpleForm.addContent(oLabel2);
		oSimpleForm.addContent(oField3);

		assert.equal(oSimpleForm.indexOfContent(oLabel1), 1, "Index of Label1");
		assert.equal(oSimpleForm.indexOfContent(oField3), 6, "Index of Field3");
	});

	QUnit.module("ResponsiveLayout", {
		beforeEach: initTestWithContentRL,
		afterEach: afterTest
	});

	function RlUsedLayout(assert) {
		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.ResponsiveLayout", "ResponsiveLayout used");
	}

	QUnit.test("used Layout", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlUsedLayout);
	});

	function defaultLayoutDataOnContent(assert) {
		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		var oField = sap.ui.getCore().byId("I1");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.equal(oLayoutData.getWeight(), 3, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I2");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "Field LayoutData weight");

		oLabel = sap.ui.getCore().byId("L2");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		oField = sap.ui.getCore().byId("I3");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "Field LayoutData weight");

		oLabel = sap.ui.getCore().byId("L3");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		oField = sap.ui.getCore().byId("I4");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I5");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 2, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I6");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "Field LayoutData weight");
	}

	QUnit.test("default LayoutData on content", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", defaultLayoutDataOnContent);
	});

	function customLayoutDataOnContent(assert) {
		var oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("LD2", {linebreak: true, weight: 8});
		var oField = sap.ui.getCore().byId("I2");
		oField.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var oLabel = sap.ui.getCore().byId("L1");
		oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		oField = sap.ui.getCore().byId("I1");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I2");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "LD2", "Field custom LayoutData set");
		assert.equal(oLayoutData.getWeight(), 8, "Field LayoutData weight");

		oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("LD4", {weight: 3});
		oField = sap.ui.getCore().byId("I4");
		oField.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "LD4", "Field custom LayoutData set");
		assert.equal(oLayoutData.getWeight(), 3, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I5");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I6");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 1, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I4");
		oField.destroyLayoutData();
		oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("LD5", {linebreak: true, weight: 3});
		oField = sap.ui.getCore().byId("I5");
		oField.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		oField = sap.ui.getCore().byId("I4");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I5");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "LD5", "Field custom LayoutData set");
		assert.equal(oLayoutData.getWeight(), 3, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I6");
		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getWeight(), 5, "Field LayoutData weight");

		oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("LD3", {linebreak: true, weight: 8});
		oField = sap.ui.getCore().byId("I3");
		oField.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "LD3", "Field custom LayoutData set");
		assert.equal(oLayoutData.getWeight(), 8, "Field LayoutData weight");

		oField = sap.ui.getCore().byId("I6");
		oSimpleForm.removeContent(oField);
		oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("LD6", {linebreak: true, weight: 8});
		oField.setLayoutData(oLayoutData);
		oSimpleForm.addContent(oField);
		sap.ui.getCore().applyChanges();

		oLayoutData = oField.getLayoutData();
		assert.ok(oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "LD6", "Field custom LayoutData set");
		assert.equal(oLayoutData.getWeight(), 8, "Field LayoutData weight");
	}

	QUnit.test("custom LayoutData on content", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", customLayoutDataOnContent);
	});

	function RlDefaultLayoutDataRemovedIfContentRemoved(assert){
		var oLabel = sap.ui.getCore().byId("L1");
		oSimpleForm.removeContent(oLabel);
		var oLayoutData = oLabel.getLayoutData();
		assert.notOk(oLayoutData, "Label has no LayoutData");
		oLabel.destroy();

		var oField = sap.ui.getCore().byId("I1");
		oSimpleForm.removeContent(oField);
		oLayoutData = oField.getLayoutData();
		assert.notOk(oLayoutData, "Field has no LayoutData");
		oField.destroy();

		var aRemoved = oSimpleForm.removeAllContent();
		for (var i = 0; i < aRemoved.length; i++) {
			oLayoutData = aRemoved[i].getLayoutData();
			assert.notOk(oLayoutData, "Field has no LayoutData");
			aRemoved[i].destroy();
		}
	}

	QUnit.test("default LayoutData removed if content removed", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlDefaultLayoutDataRemovedIfContentRemoved);
	});

	function RlDefaultLayoutDataOnFormContainer(assert) {
		var oTitle = new Title("T3", {text: "Test"});
		oSimpleForm.addContent(oTitle);
		sap.ui.getCore().applyChanges();

		var aFormContainers = oForm.getFormContainers();
		var oLayoutData = aFormContainers[0].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.equal(oLayoutData.getMinWidth(), 280, "LayoutData minWidth");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");

		oLayoutData = aFormContainers[1].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.equal(oLayoutData.getMinWidth(), 280, "LayoutData minWidth");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");

		oLayoutData = aFormContainers[2].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.equal(oLayoutData.getMinWidth(), 280, "LayoutData minWidth");
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak");
	}

	QUnit.test("default LayoutData on FormContainer", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlDefaultLayoutDataOnFormContainer);
	});

	function RlDefaultLayoutDataOnFormElement(assert) {
		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		var oLayoutData = aFormElements[0].getLayoutData();
		assert.ok(oLayoutData, "FormElement has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak");
		assert.notOk(oLayoutData.getMargin(), "LayoutData margin");
	}

	QUnit.test("default LayoutData on FormElement", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlDefaultLayoutDataOnFormElement);
	});

	function RlMaxContainerCols(assert) {
		assert.equal(oSimpleForm.getMaxContainerCols(), 2, "default value");

		oSimpleForm.setMaxContainerCols(3);
		var oTitle = new Title("T3", {text: "Test"});
		oSimpleForm.addContent(oTitle);
		sap.ui.getCore().applyChanges();

		var aFormContainers = oForm.getFormContainers();
		var oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");
		oLayoutData = aFormContainers[1].getLayoutData();
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");
		oLayoutData = aFormContainers[2].getLayoutData();
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");

		oSimpleForm.setMaxContainerCols(1);
		sap.ui.getCore().applyChanges();

		oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");
		oLayoutData = aFormContainers[1].getLayoutData();
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak");
		oLayoutData = aFormContainers[2].getLayoutData();
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak");
	}

	QUnit.test("maxContainerCols", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlMaxContainerCols);
	});

	function RlMinWidth(assert) {
		assert.equal(oSimpleForm.getMinWidth(), -1, "default value");

		oSimpleForm.setMinWidth(5000);
		sap.ui.getCore().applyChanges();

		var aFormContainers = oForm.getFormContainers();
		var oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak");
		oLayoutData = aFormContainers[1].getLayoutData();
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak");
	}

	QUnit.test("minWidth", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlMinWidth);
	});

	function RlLabelMinWidth(assert) {
		assert.equal(oSimpleForm.getLabelMinWidth(), 192, "default value");

		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.equal(oLayoutData.getMinWidth(), 192, "Label LayoutData minWidth");

		oSimpleForm.setLabelMinWidth(200);
		sap.ui.getCore().applyChanges();
		assert.equal(oLayoutData.getMinWidth(), 200, "Label LayoutData minWidth");
	}

	QUnit.test("labelMinWidth", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlLabelMinWidth);
	});

	function RlBackgroundDesign(assert) {
		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "default value");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "value on Layout");

		oSimpleForm.setBackgroundDesign(sap.ui.layout.BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on SimpleForm");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on Layout");
	}

	QUnit.test("backgroundDesign", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", RlBackgroundDesign);
	});

	QUnit.module("GridLayout", {
		beforeEach: initTestWithContentGL,
		afterEach: afterTest
	});

	function GlUsedLayout(assert) {
		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.GridLayout", "GridLayout used");
	}

	QUnit.test("used Layout", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/GridLayout", GlUsedLayout);
	});

	function GlNoDefaultLayoutData(assert) {
		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.notOk(oLayoutData, "Label has no LayoutData");

		var oField = sap.ui.getCore().byId("I1");
		oLayoutData = oField.getLayoutData();
		assert.notOk(oLayoutData, "Field has no LayoutData");

		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		oLayoutData = aFormElements[0].getLayoutData();
		assert.notOk(oLayoutData, "FormElement has no LayoutData");
	}

	QUnit.test("no default LayoutData", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/GridLayout", GlNoDefaultLayoutData);
	});

	function GlDefaultLayoutDataOnFormContauiner(assert) {
		var aFormContainers = oForm.getFormContainers();
		var oLayoutData = aFormContainers[0].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.form.GridContainerData", "sap.ui.layout.form.GridContainerData used");
		assert.ok(oLayoutData.getHalfGrid(), "LayoutData halfGrid");

		oLayoutData = aFormContainers[1].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.ok(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
	}

	QUnit.test("default LayoutData on FormContauiner", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/GridLayout", GlDefaultLayoutDataOnFormContauiner);
	});

	function GlMaxContainerCols(assert) {
		oSimpleForm.setMaxContainerCols(1);
		var oTitle = new Title("T3", {text: "Test"});
		oSimpleForm.addContent(oTitle);
		sap.ui.getCore().applyChanges();

		var aFormContainers = oForm.getFormContainers();
		var oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
		oLayoutData = aFormContainers[1].getLayoutData();
		assert.notOk(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
		oLayoutData = aFormContainers[2].getLayoutData();
		assert.notOk(oLayoutData.getHalfGrid(), "LayoutData halfGrid");

		oSimpleForm.setMaxContainerCols(2);
		sap.ui.getCore().applyChanges();

		oLayoutData = aFormContainers[0].getLayoutData();
		assert.ok(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
		oLayoutData = aFormContainers[1].getLayoutData();
		assert.ok(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
		oLayoutData = aFormContainers[2].getLayoutData();
		assert.notOk(oLayoutData.getHalfGrid(), "LayoutData halfGrid");
	}

	QUnit.test("maxContainerCols", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/GridLayout", GlMaxContainerCols);
	});

	function GlBackgroundDesign(assert) {
		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "default value");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "value on Layout");

		oSimpleForm.setBackgroundDesign(sap.ui.layout.BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on SimpleForm");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on Layout");
	}

	QUnit.test("backgroundDesign", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/GridLayout", GlBackgroundDesign);
	});

	QUnit.module("ResponsiveGridLayout", {
		beforeEach: initTestWithContentRGL,
		afterEach: afterTest
	});

	function RGlUsedLayout(assert) {
		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.ResponsiveGridLayout", "ResponsiveGridLayout used");
	}

	QUnit.test("used Layout", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveGridLayout", RGlUsedLayout);
	});

	function RGlNoDefaultLayoutData(assert) {
		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.notOk(oLayoutData, "Label has no LayoutData");

		var oField = sap.ui.getCore().byId("I1");
		oLayoutData = oField.getLayoutData();
		assert.notOk(oLayoutData, "Field has no LayoutData");

		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData, "FormContainer has no LayoutData");
		oLayoutData = aFormElements[0].getLayoutData();
		assert.notOk(oLayoutData, "FormElement has no LayoutData");
	}

	QUnit.test("no default LayoutData", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveGridLayout", RGlNoDefaultLayoutData);
	});

	function RGlBackgroundDesign(assert) {
		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "default value");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "value on Layout");

		oSimpleForm.setBackgroundDesign(sap.ui.layout.BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on SimpleForm");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on Layout");
	}

	QUnit.test("backgroundDesign", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveGridLayout", RGlBackgroundDesign);
	});

	function RGlOtherPropertiesDefaults(assert) {
		assert.equal(oSimpleForm.getLabelSpanXL(), -1, "LabelSpanXL: default value");
		assert.equal(oFormLayout.getLabelSpanXL(), -1, "LabelSpanXL: on Layout");
		assert.equal(oSimpleForm.getLabelSpanL(), 4, "LabelSpanL: default value");
		assert.equal(oFormLayout.getLabelSpanL(), 4, "LabelSpanL: on Layout");
		assert.equal(oSimpleForm.getLabelSpanM(), 2, "LabelSpanM: default value");
		assert.equal(oFormLayout.getLabelSpanM(), 2, "LabelSpanM: on Layout");
		assert.equal(oSimpleForm.getLabelSpanS(), 12, "LabelSpanS: default value");
		assert.equal(oFormLayout.getLabelSpanS(), 12, "LabelSpanS: on Layout");
		assert.ok(oSimpleForm.getAdjustLabelSpan(), "AdjustLabelSpan: default value");
		assert.ok(oFormLayout.getAdjustLabelSpan(), "AdjustLabelSpan: on Layout");
		assert.equal(oSimpleForm.getEmptySpanXL(), -1, "EmptySpanXL: default value");
		assert.equal(oFormLayout.getEmptySpanXL(), -1, "EmptySpanXL: on Layout");
		assert.equal(oSimpleForm.getEmptySpanL(), 0, "EmptySpanL: default value");
		assert.equal(oFormLayout.getEmptySpanL(), 0, "EmptySpanL: on Layout");
		assert.equal(oSimpleForm.getEmptySpanM(), 0, "EmptySpanM: default value");
		assert.equal(oFormLayout.getEmptySpanM(), 0, "EmptySpanM: on Layout");
		assert.equal(oSimpleForm.getEmptySpanS(), 0, "EmptySpanS: default value");
		assert.equal(oFormLayout.getEmptySpanS(), 0, "EmptySpanS: on Layout");
		assert.equal(oSimpleForm.getColumnsXL(), -1, "ColumnsXL: default value");
		assert.equal(oFormLayout.getColumnsXL(), -1, "ColumnsXL: on Layout");
		assert.equal(oSimpleForm.getColumnsL(), 2, "ColumnsL: default value");
		assert.equal(oFormLayout.getColumnsL(), 2, "ColumnsL: on Layout");
		assert.equal(oSimpleForm.getColumnsM(), 1, "ColumnsM: default value");
		assert.equal(oFormLayout.getColumnsM(), 1, "ColumnsM: on Layout");
		assert.ok(oSimpleForm.getSingleContainerFullSize(), "SingleContainerFullSize: default value");
		assert.ok(oFormLayout.getSingleContainerFullSize(), "SingleContainerFullSize: on Layout");
		assert.equal(oSimpleForm.getBreakpointXL(), 1440, "BreakpointXL: default value");
		assert.equal(oFormLayout.getBreakpointXL(), 1440, "BreakpointXL: on Layout");
		assert.equal(oSimpleForm.getBreakpointL(), 1024, "BreakpointL: default value");
		assert.equal(oFormLayout.getBreakpointL(), 1024, "BreakpointL: on Layout");
		assert.equal(oSimpleForm.getBreakpointM(), 600, "BreakpointM: default value");
		assert.equal(oFormLayout.getBreakpointM(), 600, "BreakpointM: on Layout");
	}

	QUnit.test("other properties defaults", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveGridLayout", RGlOtherPropertiesDefaults);
	});

	function RGlOtherPropertiesSet(assert) {
		oSimpleForm.setLabelSpanXL(6);
		oSimpleForm.setLabelSpanL(5);
		oSimpleForm.setLabelSpanM(4);
		oSimpleForm.setLabelSpanS(3);
		oSimpleForm.setAdjustLabelSpan(false);
		oSimpleForm.setEmptySpanXL(4);
		oSimpleForm.setEmptySpanL(3);
		oSimpleForm.setEmptySpanM(2);
		oSimpleForm.setEmptySpanS(1);
		oSimpleForm.setColumnsXL(4);
		oSimpleForm.setColumnsL(3);
		oSimpleForm.setColumnsM(2);
		oSimpleForm.setSingleContainerFullSize(false);
		oSimpleForm.setBreakpointXL(2000);
		oSimpleForm.setBreakpointL(1000);
		oSimpleForm.setBreakpointM(500);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getLabelSpanXL(), 6, "LabelSpanXL: on SimpleForm");
		assert.equal(oFormLayout.getLabelSpanXL(), 6, "LabelSpanXL: on Layout");
		assert.equal(oSimpleForm.getLabelSpanL(), 5, "LabelSpanL: on SimpleForm");
		assert.equal(oFormLayout.getLabelSpanL(), 5, "LabelSpanL: on Layout");
		assert.equal(oSimpleForm.getLabelSpanM(), 4, "LabelSpanM: on SimpleForm");
		assert.equal(oFormLayout.getLabelSpanM(), 4, "LabelSpanM: on Layout");
		assert.equal(oSimpleForm.getLabelSpanS(), 3, "LabelSpanS: on SimpleForm");
		assert.equal(oFormLayout.getLabelSpanS(), 3, "LabelSpanS: on Layout");
		assert.notOk(oSimpleForm.getAdjustLabelSpan(), "AdjustLabelSpan: on SimpleForm");
		assert.notOk(oFormLayout.getAdjustLabelSpan(), "AdjustLabelSpan: on Layout");
		assert.equal(oSimpleForm.getEmptySpanXL(), 4, "EmptySpanXL: on SimpleForm");
		assert.equal(oFormLayout.getEmptySpanXL(), 4, "EmptySpanXL: on Layout");
		assert.equal(oSimpleForm.getEmptySpanL(), 3, "EmptySpanL: on SimpleForm");
		assert.equal(oFormLayout.getEmptySpanL(), 3, "EmptySpanL: on Layout");
		assert.equal(oSimpleForm.getEmptySpanM(), 2, "EmptySpanM: on SimpleForm");
		assert.equal(oFormLayout.getEmptySpanM(), 2, "EmptySpanM: on Layout");
		assert.equal(oSimpleForm.getEmptySpanS(), 1, "EmptySpanS: on SimpleForm");
		assert.equal(oFormLayout.getEmptySpanS(), 1, "EmptySpanS: on Layout");
		assert.equal(oSimpleForm.getColumnsXL(), 4, "ColumnsXL: on SimpleForm");
		assert.equal(oFormLayout.getColumnsXL(), 4, "ColumnsXL: on Layout");
		assert.equal(oSimpleForm.getColumnsL(), 3, "ColumnsL: on SimpleForm");
		assert.equal(oFormLayout.getColumnsL(), 3, "ColumnsL: on Layout");
		assert.equal(oSimpleForm.getColumnsM(), 2, "ColumnsM: on SimpleForm");
		assert.equal(oFormLayout.getColumnsM(), 2, "ColumnsM: on Layout");
		assert.notOk(oSimpleForm.getSingleContainerFullSize(), "SingleContainerFullSize: on SimpleForm");
		assert.notOk(oFormLayout.getSingleContainerFullSize(), "SingleContainerFullSize: on Layout");
		assert.equal(oSimpleForm.getBreakpointXL(), 2000, "BreakpointXL: on SimpleForm");
		assert.equal(oFormLayout.getBreakpointXL(), 2000, "BreakpointXL: on Layout");
		assert.equal(oSimpleForm.getBreakpointL(), 1000, "BreakpointL: on SimpleForm");
		assert.equal(oFormLayout.getBreakpointL(), 1000, "BreakpointL: on Layout");
		assert.equal(oSimpleForm.getBreakpointM(), 500, "BreakpointM: on SimpleForm");
		assert.equal(oFormLayout.getBreakpointM(), 500, "BreakpointM: on Layout");
	}

	QUnit.test("other properties set", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveGridLayout", RGlOtherPropertiesSet);
	});

	QUnit.module("ColumnLayout", {
		beforeEach: initTestWithContentCL,
		afterEach: afterTest
	});

	function ClUsedLayout(assert) {
		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.ColumnLayout", "ColumnLayout used");
	}

	QUnit.test("used Layout", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ColumnLayout", ClUsedLayout);
	});

	function ClNoDefaultLayoutData(assert) {
		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.notOk(oLayoutData, "Label has no LayoutData");

		var oField = sap.ui.getCore().byId("I1");
		oLayoutData = oField.getLayoutData();
		assert.notOk(oLayoutData, "Field has no LayoutData");

		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(oLayoutData, "FormContainer has no LayoutData");
		oLayoutData = aFormElements[0].getLayoutData();
		assert.notOk(oLayoutData, "FormElement has no LayoutData");
	}

	QUnit.test("no default LayoutData", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ColumnLayout", ClNoDefaultLayoutData);
	});

	function ClBackgroundDesign(assert) {
		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "default value");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Translucent, "value on Layout");

		oSimpleForm.setBackgroundDesign(sap.ui.layout.BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on SimpleForm");
		assert.equal(oFormLayout.getBackgroundDesign(), sap.ui.layout.BackgroundDesign.Transparent, "value on Layout");
	}

	QUnit.test("backgroundDesign", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ColumnLayout", ClBackgroundDesign);
	});

	function ClOtherPropertiesDefaults(assert) {
		assert.equal(oSimpleForm.getLabelSpanL(), 4, "LabelSpanL: default value");
		assert.equal(oFormLayout.getLabelCellsLarge(), 4, "LabelCellsLarge: on Layout");
		assert.equal(oSimpleForm.getEmptySpanL(), 0, "EmptySpanL: default value");
		assert.equal(oFormLayout.getEmptyCellsLarge(), 0, "EmptyCellsLarge: on Layout");
		assert.equal(oSimpleForm.getColumnsXL(), -1, "ColumnsXL: default value");
		assert.equal(oFormLayout.getColumnsXL(), 2, "ColumnsXL: on Layout");
		assert.equal(oSimpleForm.getColumnsL(), 2, "ColumnsL: default value");
		assert.equal(oFormLayout.getColumnsL(), 2, "ColumnsL: on Layout");
		assert.equal(oSimpleForm.getColumnsM(), 1, "ColumnsM: default value");
		assert.equal(oFormLayout.getColumnsM(), 1, "ColumnsM: on Layout");
	}

	QUnit.test("other properties defaults", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ColumnLayout", ClOtherPropertiesDefaults);
	});

	function ClOtherPropertiesSet(assert) {
		oSimpleForm.setLabelSpanL(5);
		oSimpleForm.setEmptySpanL(3);
		oSimpleForm.setColumnsXL(4);
		oSimpleForm.setColumnsL(3);
		oSimpleForm.setColumnsM(2);
		sap.ui.getCore().applyChanges();

		assert.equal(oSimpleForm.getLabelSpanL(), 5, "LabelSpanL: on SimpleForm");
		assert.equal(oFormLayout.getLabelCellsLarge(), 5, "LabelCellsLarge: on Layout");
		assert.equal(oSimpleForm.getEmptySpanL(), 3, "EmptySpanL: on SimpleForm");
		assert.equal(oFormLayout.getEmptyCellsLarge(), 3, "EmptyCellsLarge: on Layout");
		assert.equal(oSimpleForm.getColumnsXL(), 4, "ColumnsXL: on SimpleForm");
		assert.equal(oFormLayout.getColumnsXL(), 4, "ColumnsXL: on Layout");
		assert.equal(oSimpleForm.getColumnsL(), 3, "ColumnsL: on SimpleForm");
		assert.equal(oFormLayout.getColumnsL(), 3, "ColumnsL: on Layout");
		assert.equal(oSimpleForm.getColumnsM(), 2, "ColumnsM: on SimpleForm");
		assert.equal(oFormLayout.getColumnsM(), 2, "ColumnsM: on Layout");
	}

	QUnit.test("other properties set", function(assert) {
		asyncLayoutTest(assert, "sap/ui/layout/form/ColumnLayout", ClOtherPropertiesSet);
	});

	QUnit.module("other", {
		beforeEach: initTestWithContentRGL,
		afterEach: afterTest
	});

	function changeLayout(assert, oOldLayout) {
		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.ResponsiveLayout", "ResponsiveLayout used");
		assert.ok(oOldLayout._bIsBeingDestroyed, "old layout destroyed");

		var oLabel = sap.ui.getCore().byId("L1");
		var oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.equal(oLayoutData.getWeight(), 3, "Label LayoutData weight");

		var aFormContainers = oForm.getFormContainers();
		oLayoutData = aFormContainers[0].getLayoutData();
		assert.ok(oLayoutData, "FormContainer has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");

		oOldLayout = oFormLayout;
		oSimpleForm.setLayout("ResponsiveGridLayout");
		sap.ui.getCore().applyChanges();
		oFormLayout = oForm.getLayout();

		assert.equal(oFormLayout.getMetadata().getName(), "sap.ui.layout.form.ResponsiveGridLayout", "ResponsiveGridLayout used");
		assert.ok(oOldLayout._bIsBeingDestroyed, "old layout destroyed");
		oLayoutData = oLabel.getLayoutData();
		assert.notOk(!!oLayoutData, "Label has no LayoutData");
		oLayoutData = aFormContainers[0].getLayoutData();
		assert.notOk(!!oLayoutData, "FormContainer has no LayoutData");
	}

	QUnit.test("change Layout", function(assert) {
		var oOldLayout;
		var fnDone;
		if (oFormLayout) {
			oOldLayout = oFormLayout;
			oSimpleForm.setLayout("ResponsiveLayout");
			sap.ui.getCore().applyChanges();
			oFormLayout = oForm.getLayout();
			if (oFormLayout) {
				changeLayout(assert, oOldLayout);
			} else {
				fnDone = assert.async();
				sap.ui.require(["sap/ui/layout/form/ResponsiveLayout"], function() {
					oFormLayout = oForm.getLayout();
					changeLayout(assert, oOldLayout);
					fnDone();
				});
			}
		} else {
			// wait until Layout is loaded
			fnDone = assert.async();
			sap.ui.require(["sap/ui/layout/form/ResponsiveGridLayout"], function() {
				oFormLayout = oForm.getLayout();
				oOldLayout = oFormLayout;
				oSimpleForm.setLayout("ResponsiveLayout");
				sap.ui.getCore().applyChanges();
				oFormLayout = oForm.getLayout();

				if (oFormLayout) {
					changeLayout(assert, oOldLayout);
					fnDone();
				} else {
					sap.ui.require(["sap/ui/layout/form/ResponsiveLayout"], function() {
						oFormLayout = oForm.getLayout();
						changeLayout(assert, oOldLayout);
						fnDone();
					});
				}
			});
		}
	});

	QUnit.test("visibility of FormElement", function(assert) {
		var aFormContainers = oForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		assert.ok(aFormElements[0].isVisible(), "FormElement visible");

		sinon.spy(aFormElements[0], "invalidate");
		var oField1 = sap.ui.getCore().byId("I1");
		var oField2 = sap.ui.getCore().byId("I2");
		oField1.setVisible(false);
		assert.ok(aFormElements[0].isVisible(), "FormElement still visible");
		assert.ok(aFormElements[0].invalidate.called, "FormElement invalidated");

		oField2.setVisible(false);
		assert.notOk(aFormElements[0].isVisible(), "FormElement not visible");

		oField1.setVisible(true);
		assert.ok(aFormElements[0].isVisible(), "FormElement again visible");
	});

	QUnit.test("destroy of field", function(assert) {
		var oField = sap.ui.getCore().byId("I2");
		oField.destroy();
		var aContent = oSimpleForm.getContent();
		assert.equal(aContent.length, 10, "SimpleForm has 10 content elements");
		var bFound = false;
		for (var i = 0; i < aContent.length; i++) {
			if (oField === aContent[i]) {
				bFound = true;
			}
		}
		assert.notOk(bFound, "Field is not assigned to SimpleForm");
	});

	function clone(assert) {
		var oClone = oSimpleForm.clone("MyClone");
		oClone.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aContent = oClone.getContent();
		var oCloneForm = oClone.getAggregation("form");
		assert.equal(aContent.length, 13, "Clone has 13 content elements");
		var aFormContainers = oCloneForm.getFormContainers();
		var aFormElements = aFormContainers[0].getFormElements();
		assert.equal(aFormContainers.length, 3, "Clone-Form has 3 FormContainers");
		assert.equal(aFormContainers[0].getTitle().getId(), "T1-MyClone", "1. FormContainer has Title set");
		assert.equal(aFormElements.length, 1, "1. FormContainer has 1 FormElement");
		aFormElements = aFormContainers[1].getFormElements();
		assert.equal(aFormElements.length, 2, "2. FormContainer has 2 FormElements");
		aFormElements = aFormContainers[2].getFormElements();
		assert.equal(aFormElements.length, 1, "3. FormContainer has 1 FormElement");

		var oLabel = aContent[1];
		var oLayoutData = oLabel.getLayoutData();
		assert.ok(oLayoutData, "Clone-Label has LayoutData");
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.layout.ResponsiveFlowLayoutData", "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.equal(oLayoutData.getWeight(), 3, "Clone-Label LayoutData weight");
		var oField = aContent[12];
		oLayoutData = oField.getLayoutData();
		assert.equal(oLayoutData.getMetadata().getName(), "sap.ui.core.VariantLayoutData", "sap.ui.core.VariantLayoutData used");
		var aLayoutData = oLayoutData.getMultipleLayoutData();
		assert.equal(aLayoutData.length, 2, "2 layoutData used");
		var oGD;
		var oRD;
		for (var i = 0; i < aLayoutData.length; i++) {
			if (aLayoutData[i].getMetadata().getName() == "sap.ui.layout.ResponsiveFlowLayoutData") {
				oRD = aLayoutData[i];
			} else if (aLayoutData[i].getMetadata().getName() == "sap.ui.layout.GridData") {
				oGD = aLayoutData[i];
			}
		}
		assert.ok(oRD, "sap.ui.layout.ResponsiveFlowLayoutData used");
		assert.ok(oGD, "sap.ui.layout.GridData used");
		assert.equal(oRD.getWeight(), 8, "Clone-Field LayoutData weight");
		assert.equal(oClone._aLayouts.length, 10, "Clone has own LayoutData");

		//visibility change
		oField = sap.ui.getCore().byId("I3");
		aFormElements = aFormContainers[1].getFormElements();
		oField.setVisible(false);
		assert.ok(aFormElements[0].isVisible(), "FormElement on Clone still visible");
		oField.setVisible(true);

		var oCloneField = sap.ui.getCore().byId("I3-MyClone");
		oCloneField.setVisible(false);
		assert.notOk(aFormElements[0].isVisible(), "FormElement on Clone not visible");
		aFormContainers = oForm.getFormContainers();
		aFormElements = aFormContainers[1].getFormElements();
		assert.ok(aFormElements[0].isVisible(), "FormElement on Original still visible");

		oClone.destroy();
	}

	QUnit.test("clone", function(assert) {
		oSimpleForm.setLayout("ResponsiveLayout");
		var oToolbar = new Toolbar("TB1");
		oSimpleForm.addContent(oToolbar);

		var oGD = new GridData("GD1");
		var oVD = new VariantLayoutData("VD1", {multipleLayoutData: [oGD]});
		var oField = new Input("I7", {layoutData: oVD});
		oSimpleForm.addContent(oField);
		sap.ui.getCore().applyChanges();

		asyncLayoutTest(assert, "sap/ui/layout/form/ResponsiveLayout", clone);
	});

	QUnit.test("resize", function(assert) {
		oSimpleForm.setLayout("ResponsiveLayout");
		sap.ui.getCore().applyChanges();
		sinon.spy(oSimpleForm, "_applyLinebreaks");

		var fnDone = assert.async();

		setTimeout( function(){ // to wait for rendeing
			jQuery("#content").attr("style", "width: 50%");
			setTimeout( function(){ // to wait for resize handler
				assert.ok(oSimpleForm._applyLinebreaks.called, "linebreaks calculation called");
				jQuery("#content").removeAttr("style");
				fnDone();
			}, 500);
		}, 10);
	});

});

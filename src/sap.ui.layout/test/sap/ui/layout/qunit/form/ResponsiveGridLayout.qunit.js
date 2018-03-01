/* global QUnit */

// Test only the things relevant for ResponsiveGridLayout. The basic Form functionality
// is tested in Form, FormContainer and FormElement qUnit tests.

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/layout/GridData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Link"
	],
	function(
		jQuery,
		Form,
		ResponsiveGridLayout,
		FormContainer,
		FormElement,
		VariantLayoutData,
		GridData,
		Title,
		Toolbar,
		Label,
		Input,
		Text,
		Link
	) {
	"use strict";

	QUnit.start();

	var oForm;
	var oResponsiveGridLayout;
	var oFormContainer1;
	var oFormContainer2;
	var oFormElement1;
	var oFormElement2;
	var oFormElement3;
	var oFormElement4;
	var oLabel1;
	var oLabel2;
	var oLabel3;
	var oLabel4;
	var oField1;
	var oField2;
	var oField3;
	var oField4;
	var oTitle;

	// if some test breaks internal controls of test may not destroyed
	// what leads to duplicate ID errors in next test
	function cleanupControl(oControl) {
		if (oControl && !oControl._bIsBeingDestroyed) {
			oControl.destroy();
		}
		oControl = undefined;
	}

	function initForm(bOneContainer) {
		oResponsiveGridLayout = new ResponsiveGridLayout("RGL1");
		oLabel1 = new Label("L1", {text: "Label 1"});
		oLabel2 = new Label("L2", {text: "Label 2"});
		oField1 = new Input("I1");
		oField2 = new Input("I2");
		oFormElement1 = new FormElement("FE1",{
			label: oLabel1,
			fields: [oField1]
		});
		oFormElement2 = new FormElement("FE2",{
			label: oLabel2,
			fields: [oField2]
		});
		oFormContainer1 = new FormContainer("FC1",{
			formElements: [ oFormElement1, oFormElement2 ]
		});
		var aFormContainers = [oFormContainer1];
		if (!bOneContainer) {
			oLabel3 = new Label("L3", {text: "Label 3"});
			oLabel4 = new Label("L4", {text: "Label 4"});
			oField3 = new Input("I3");
			oField4 = new Input("I4");
			oFormElement3 = new FormElement("FE3",{
				label: oLabel3,
				fields: [oField3]
			});
			oFormElement4 = new FormElement("FE4",{
				label: oLabel4,
				fields: [oField4]
			});
			oTitle = new Title("T2", {text: "Test"});
			oFormContainer2 = new FormContainer("FC2",{
				title: oTitle,
				tooltip: "Test",
				expandable: true,
				formElements: [ oFormElement3, oFormElement4 ]
			});
			aFormContainers.push(oFormContainer2);
		}
		oForm = new Form("F1", {
			layout: oResponsiveGridLayout,
			editable: true,
			formContainers: aFormContainers
		}).placeAt("content");
		sap.ui.getCore().applyChanges();
	}

	function initTestOneContainer() {
		initForm(true);
	}

	function initTestTwoContainers() {
		initForm(false);
	}

	function afterTest(bOneContainer) {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			cleanupControl(oResponsiveGridLayout);
			cleanupControl(oLabel1);
			cleanupControl(oLabel2);
			cleanupControl(oLabel3);
			cleanupControl(oLabel4);
			cleanupControl(oField1);
			cleanupControl(oField2);
			cleanupControl(oField3);
			cleanupControl(oField4);
			cleanupControl(oFormElement1);
			cleanupControl(oFormElement2);
			cleanupControl(oFormElement3);
			cleanupControl(oFormElement4);
			cleanupControl(oFormContainer1);
			cleanupControl(oFormContainer2);
			cleanupControl(oTitle);
		}
	}

	QUnit.module("Form", {
		beforeEach: initTestOneContainer,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oForm, "Form is created");
		assert.ok(oResponsiveGridLayout, "ResponsiveGridLayout is created");
		assert.equal(oForm.getLayout().getId(), "RGL1", "getLayout() returns layout.");
	});

	QUnit.test("one container specific things", function(assert) {
		assert.notOk(sap.ui.getCore().byId("F1--Grid"), "no Main Grid");
	});

	QUnit.module("inner Grid", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("content of Grid", function(assert) {
		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var aContent = oGrid.getContent();
		assert.equal(aContent.length, 4, "Grid has 4 Elements");
		assert.equal(aContent[0].getId(), "L1", "Label1 is 1. element");
		assert.equal(aContent[1].getId(), "I1", "Field1 is 2. element");
		assert.equal(aContent[2].getId(), "L2", "Label2 is 3. element");
		assert.equal(aContent[3].getId(), "I2", "Field2 is 4. element");
		assert.equal(aContent[0].getParent().getId(), "FE1", "FormElement is still parent of label");
		assert.equal(aContent[1].getParent().getId(), "FE1", "FormElement is still parent of field");
		assert.equal(aContent[2].getParent().getId(), "FE2", "FormElement is still parent of label");
		assert.equal(aContent[3].getParent().getId(), "FE2", "FormElement is still parent of field");
	});

	QUnit.test("Panel", function(assert) {
		var oPanel = sap.ui.getCore().byId("FC1---Panel");
		assert.notOk(oPanel, "no panel created for first container");

		oPanel = sap.ui.getCore().byId("FC2---Panel");
		assert.ok(oPanel, "panel created for second container");
		assert.equal(oTitle.getParent().getId(), "FC2", "FormContainer is still parent of Title");
		assert.equal(oPanel.getContent().getId(), "FC2--Grid", "Grid is inside Panel");
		assert.ok(jQuery.sap.domById("T2"), "Title rendered");
		assert.ok(jQuery.sap.domById("FC2--Exp"), "Expander rendered");
		assert.equal(jQuery("#FC2---Panel").attr("title"), "Test", "tooltip set on panel");
	});

	QUnit.test("aria", function(assert) {
		assert.notOk(jQuery("#FC1--Grid").attr("role"), "role \"form\" not set on grid");
		assert.notOk(jQuery("#FC1--Grid").attr("aria-labelledby"), "aria-labelledby not set on grid");
		assert.equal(jQuery("#FC2---Panel").attr("role"), "form", "role \"form\" set on panel");
		assert.equal(jQuery("#FC2---Panel").attr("aria-labelledby"), "T2", "aria-labelledby set on panel");

		oFormContainer1.addAriaLabelledBy("XXX");
		oFormContainer2.addAriaLabelledBy("YYY");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#FC1--Grid").attr("role"), "form", "role \"form\" set on grid");
		assert.equal(jQuery("#FC1--Grid").attr("aria-labelledby"), "XXX", "aria-labelledby set on grid");
		assert.equal(jQuery("#FC2---Panel").attr("aria-labelledby"), "YYY T2", "aria-labelledby set on panel");
	});

	QUnit.test("Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oFormContainer2.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.notOk(jQuery.sap.domById("T2"), "Title not rendered");
		assert.notOk(jQuery.sap.domById("FC2--Exp"), "Expander not rendered");
		assert.ok(jQuery.sap.domById("TB1"), "Toolbar rendered");
		assert.ok(jQuery("#FC2---Panel").attr("aria-labelledby"), "TB1", "aria-labelledby set on panel");
	});

	QUnit.test("main Grid", function(assert) {
		var oGrid = sap.ui.getCore().byId("F1--Grid");
		var aContent = oGrid.getContent();

		assert.equal(aContent.length, 2, "Grid has 2 Elements");
		assert.equal(aContent[0].getId(), "FC1--Grid", "Grid1 is 1. element");
		assert.equal(aContent[1].getId(), "FC2---Panel", "Panel is 2. element");
	});

	QUnit.test("add/remove fields", function(assert) {
		var oGrid = sap.ui.getCore().byId("FC2--Grid");
		var oNewField = new Input("I5");
		oFormElement4.insertField(oNewField, 0);
		var aContent = oGrid.getContent();
		assert.equal(aContent.length, 5, "Grid has 5 Elements");
		assert.equal(aContent[3].getId(), "I5", "new field is 4. element");

		oFormElement4.removeField(oNewField);
		aContent = oGrid.getContent();
		assert.equal(aContent.length, 4, "Grid has 4 Elements");
		assert.equal(aContent[3].getId(), "I4", "Field4 is 4. element");

		oNewField.destroy();
	});

	QUnit.test("add/remove FormElement", function(assert) {
		var oGrid = sap.ui.getCore().byId("FC2--Grid");
		var oNewLabel = new Label("L5", {text: "Label 5"});
		var oNewField = new Input("I5");
		var oNewFormElement = new FormElement("FE5",{
			label: oNewLabel,
			fields: [oNewField]
		});
		oFormContainer2.insertFormElement(oNewFormElement, 1);
		var aContent = oGrid.getContent();
		assert.equal(aContent.length, 6, "Grid has 6 Elements");
		assert.equal(aContent[2].getId(), "L5", "new Label is 3. element");
		assert.equal(aContent[3].getId(), "I5", "new Field is 4. element");

		oFormContainer2.removeFormElement(oNewFormElement);
		aContent = oGrid.getContent();
		assert.equal(aContent.length, 4, "Grid has 4 Elements");
		assert.equal(aContent[3].getId(), "I4", "Field4 is 4. element");

		oNewFormElement.destroy();
	});

	QUnit.test("visibility of FormElement", function(assert) {
		var oGrid = sap.ui.getCore().byId("FC2--Grid");
		var oNewLabel = new Label("L5", {text: "Label 5"});
		var oNewField = new Input("I5");
		var oNewFormElement = new FormElement("FE5",{
			visible: false,
			label: oNewLabel,
			fields: [oNewField]
		});
		oFormContainer2.insertFormElement(oNewFormElement, 1);
		var aContent = oGrid.getContent();
		assert.equal(aContent.length, 4, "Grid has 4 Elements, as invisible FormElemnt is not rendered");

		oNewFormElement.setVisible(true);
		aContent = oGrid.getContent();
		assert.equal(aContent.length, 6, "Grid has 6 Elements");
		assert.equal(aContent[2].getId(), "L5", "new Label is 3. element");
		assert.equal(aContent[3].getId(), "I5", "new Field is 4. element");
	});

	QUnit.test("add/remove FormContainer", function(assert) {
		var oGrid = sap.ui.getCore().byId("F1--Grid");
		var oNewFormContainer = new FormContainer("FC3",{ title: "Test"});
		oForm.insertFormContainer(oNewFormContainer, 1);
		sap.ui.getCore().applyChanges();
		var aContent = oGrid.getContent();

		assert.equal(aContent.length, 3, "Grid has 3 Elements");
		assert.equal(aContent[1].getId(), "FC3---Panel", "new Panel is 2. element");

		oForm.removeFormContainer(oNewFormContainer);
		sap.ui.getCore().applyChanges();
		aContent = oGrid.getContent();

		assert.equal(aContent.length, 2, "Grid has 2 Elements");
		assert.equal(aContent[1].getId(), "FC2---Panel", "Panel is 2. element");

		oForm.removeFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		aContent = oGrid.getContent();

		assert.notOk(jQuery.sap.domById("F1--Grid"), "Main grid not rendered");
		assert.ok(jQuery.sap.domById("FC2---Panel"), "container panel rendered");

		oNewFormContainer.destroy();
		oFormContainer1.destroy();
	});

	QUnit.test("remove Panel", function(assert) {
		oFormContainer2.destroyTitle();
		oFormContainer2.setExpandable(false);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("F1--Grid");
		var aContent = oGrid.getContent();
		var oPanel = sap.ui.getCore().byId("FC2---Panel");
		assert.notOk(oPanel, "no panel created for container");
		assert.equal(aContent.length, 2, "Grid has 2 Elements");
		assert.equal(aContent[1].getId(), "FC2--Grid", "Grid is 2. element");

		oFormContainer2.setTitle("Test");
		sap.ui.getCore().applyChanges();
		aContent = oGrid.getContent();
		oPanel = sap.ui.getCore().byId("FC2---Panel");
		assert.ok(oPanel, "panel created for container");
		assert.equal(aContent.length, 2, "Grid has 2 Elements");
		assert.equal(aContent[1].getId(), "FC2---Panel", "Panel is 2. element");
	});

	QUnit.test("visibility of FormContainer", function(assert) {
		var oGrid = sap.ui.getCore().byId("F1--Grid");
		var oNewFormContainer = new FormContainer("FC3",{ title: "Test", visible: false});
		oForm.insertFormContainer(oNewFormContainer, 1);
		sap.ui.getCore().applyChanges();
		var aContent = oGrid.getContent();

		assert.equal(aContent.length, 2, "Grid has 2 Elements, as invisible FormContainer is not rendered");

		oNewFormContainer.setVisible(true);
		sap.ui.getCore().applyChanges();
		aContent = oGrid.getContent();
		assert.equal(aContent.length, 3, "Grid has 3 Elements");
		assert.equal(aContent[1].getId(), "FC3---Panel", "new Panel is 2. element");
	});

	QUnit.module("LayoutData", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("default on FormContainer", function(assert) {
		var oGrid = sap.ui.getCore().byId("F1--Grid");
		assert.equal(oGrid.getDefaultSpan(), "L6 M12 S12", "Main Grid default span");

		oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid.getLayoutData();
		assert.equal(oLayoutData.getId(), "FC1--Grid--LD", "Grid has calculated LayoutData");
		assert.ok(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.ok(oLayoutData.isPropertyInitial("linebreakXL"), "no LinebreakXL set");
		var oParent = jQuery("#FC1--Grid").parent();
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		var oPanel = sap.ui.getCore().byId("FC2---Panel");
		oLayoutData = oPanel.getLayoutData();
		assert.equal(oLayoutData.getId(), "FC2---Panel--LD", "Panel has calculated LayoutData");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.ok(oLayoutData.isPropertyInitial("linebreakXL"), "no LinebreakXL set");
		oParent = jQuery("#FC2---Panel").parent();
		assert.ok(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM set");
	});

	QUnit.test("custom LayoutData on FormContainer", function(assert) {
		var oLayoutData = new GridData("GD1", {linebreak: true});
		oFormContainer2.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();
		var oPanel = sap.ui.getCore().byId("FC2---Panel");

		assert.equal(oPanel.getLayoutData().getId(), "GD1", "Original LayoutData returned");
		assert.equal(oLayoutData.getParent().getId(), "FC2", "Parent of LayoutData is still FormContainer");

		var oParent = jQuery("#FC1--Grid").parent();
		assert.ok(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");
	});

	QUnit.test("columns", function(assert) {
		var oFormContainer3 = new FormContainer("FC3");
		var oFormContainer4 = new FormContainer("FC4");
		var oFormContainer5 = new FormContainer("FC5");
		var oFormContainer6 = new FormContainer("FC6");
		var oFormContainer7 = new FormContainer("FC7");
		var oFormContainer8 = new FormContainer("FC8");
		var oFormContainer9 = new FormContainer("FC9");
		oForm.addFormContainer(oFormContainer3);
		oForm.addFormContainer(oFormContainer4);
		oForm.addFormContainer(oFormContainer5);
		oForm.addFormContainer(oFormContainer6);
		oForm.addFormContainer(oFormContainer7);
		oForm.addFormContainer(oFormContainer8);
		oForm.addFormContainer(oFormContainer9);
		oResponsiveGridLayout.setColumnsXL(4);
		oResponsiveGridLayout.setColumnsL(3);
		oResponsiveGridLayout.setColumnsM(2);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("F1--Grid");
		assert.equal(oGrid.getDefaultSpan(), "XL3 L4 M6 S12", "Main Grid default span");

		oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid.getLayoutData();
		var oParent = jQuery("#FC1--Grid").parent();
		assert.ok(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL set");
		assert.ok(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL set");
		assert.ok(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		var oPanel = sap.ui.getCore().byId("FC2---Panel");
		oLayoutData = oPanel.getLayoutData();
		oParent = jQuery("#FC2---Panel").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC3--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC3--Grid").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.ok(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC4--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC4--Grid").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.ok(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.ok(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC5--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC5--Grid").parent();
		assert.ok(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.ok(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC6--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC6--Grid").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC7--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC7--Grid").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.ok(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL set");
		assert.ok(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC8--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC8--Grid").parent();
		assert.notOk(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM not set");

		oGrid = sap.ui.getCore().byId("FC9--Grid");
		oLayoutData = oGrid.getLayoutData();
		oParent = jQuery("#FC9--Grid").parent();
		assert.ok(oLayoutData.getLinebreakXL(), "calculated LayoutData linebreakXL set");
		assert.notOk(oLayoutData.getLinebreakL(), "calculated LayoutData linebreakL not set");
		assert.ok(oLayoutData.getLinebreakM(), "calculated LayoutData linebreakM set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContXL"), "class sapUiFormResGridLastContXL not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastContL"), "class sapUiFormResGridLastContL set");
		assert.notOk(oParent.hasClass("sapUiFormResGridLastContM"), "class sapUiFormResGridLastContM not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowXL"), "class sapUiFormResGridFirstRowXL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowL"), "class sapUiFormResGridFirstRowL not set");
		assert.notOk(oParent.hasClass("sapUiFormResGridFirstRowM"), "class sapUiFormResGridFirstRowM not set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowXL"), "class sapUiFormResGridLastRowXL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowL"), "class sapUiFormResGridLastRowL set");
		assert.ok(oParent.hasClass("sapUiFormResGridLastRowM"), "class sapUiFormResGridLastRowM set");
	});

	QUnit.test("default on Labels and Fields", function(assert) {
		var oNewField = new Input("I5");
		oFormElement2.addField(oNewField);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		var oParent = jQuery("#L1").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M2 S12", "Span on Label");
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Label");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Label");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Label");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Label");
		assert.ok(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl set on Label");

		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		oParent = jQuery("#I1").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL8 L8 M10 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oField2);
		oParent = jQuery("#I2").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M5 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField);
		oParent = jQuery("#I6").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M5 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("default multiline Fields", function(assert) {
		var oNewField1 = new Input("I5");
		oFormElement4.addField(oNewField1);
		var oNewField2 = new Input("I6");
		oFormElement4.addField(oNewField2);
		var oNewField3 = new Input("I7");
		oFormElement4.addField(oNewField3);
		var oNewField4 = new Input("I8");
		oFormElement4.addField(oNewField4);
		var oNewField5 = new Input("I9");
		oFormElement4.addField(oNewField5);
		var oNewField6 = new Input("I10");
		oFormElement4.addField(oNewField6);
		var oNewField7 = new Input("I11");
		oFormElement4.addField(oNewField7);
		var oNewField8 = new Input("I12");
		oFormElement4.addField(oNewField8);
		var oNewField9 = new Input("I13");
		oFormElement4.addField(oNewField9);
		var oNewField10 = new Input("I14");
		oFormElement4.addField(oNewField10);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC2--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oField4);
		var oParent = jQuery("#I4").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL1 L1 M1 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField1);
		oParent = jQuery("#I5").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL1 L1 M1 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField8);
		oParent = jQuery("#I12").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M1 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.ok(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL set");
		assert.ok(oLayoutData.getLinebreakL(), "LayoutData linebreakL set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 4, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 4, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField9);
		oParent = jQuery("#I13").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M1 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField10);
		oParent = jQuery("#I14").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M10 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.ok(oLayoutData.getLinebreakM(), "LayoutData linebreakM set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 2, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("default on Fields without Label", function(assert) {
		oFormElement2.destroyLabel();
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oField2);
		var oParent = jQuery("#I2").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL12 L12 M12 S12", "Span on Field");
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("custom Layout Data on Label", function(assert) {
		var oLayoutData = new GridData("GD1", {span: "XL3 L3 M3 S3"});
		var oVariantlayoutData = new VariantLayoutData("VD1", {multipleLayoutData: [oLayoutData]});
		oLabel2.setLayoutData(oVariantlayoutData);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		oLayoutData = oGrid._getLayoutDataForControl(oLabel2);
		var oParent = jQuery("#L2").parent();
		assert.equal(oLayoutData.getId(), "GD1", "custom LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL3 L3 M3 S3", "Span on Label");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Label");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Label");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Label");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Label");
		assert.ok(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl set on Label");

		oLayoutData = oGrid._getLayoutDataForControl(oField2);
		oParent = jQuery("#I2").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL9 L9 M9 S9", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("custom Layout Data on Field", function(assert) {
		var oLayoutData = new GridData("GD1", {span: "XL3 L3 M3 S3"});
		var oNewField = new Input("I5", {layoutData: oLayoutData});
		oFormElement2.addField(oNewField);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		oLayoutData = oGrid._getLayoutDataForControl(oField2);
		var oParent = jQuery("#I2").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL5 L5 M7 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField);
		oParent = jQuery("#I5").parent();
		assert.equal(oLayoutData.getId(), "GD1", "custom LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL3 L3 M3 S3", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("custom layout data on multiline Fields", function(assert) {
		var oLayoutData = new GridData("GD1", {span: "L7 M9 S1"});
		var oNewField1 = new Input("I5", {layoutData: oLayoutData});
		oFormElement4.addField(oNewField1);
		var oNewField2 = new Input("I6");
		oFormElement4.addField(oNewField2);
		var oNewField3 = new Input("I7");
		oFormElement4.addField(oNewField3);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC2--Grid");
		oLayoutData = oGrid._getLayoutDataForControl(oField4);
		var oParent = jQuery("#I4").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL1 L1 M1 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField1);
		oParent = jQuery("#I5").parent();
		assert.equal(oLayoutData.getId(), "GD1", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "L7 M9 S1", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField2);
		oParent = jQuery("#I6").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M5 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.ok(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL set");
		assert.ok(oLayoutData.getLinebreakL(), "LayoutData linebreakL set");
		assert.ok(oLayoutData.getLinebreakM(), "LayoutData linebreakM set");
		assert.equal(oLayoutData.getIndentXL(), 4, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 4, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 2, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField3);
		oParent = jQuery("#I7").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M5 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("change custom Layout Data on Field", function(assert) {
		var oLayoutData = new GridData("GD1", {span: "XL3 L3 M3 S3"});
		var oNewField = new Input("I5", {layoutData: oLayoutData});
		oFormElement2.addField(oNewField);
		sap.ui.getCore().applyChanges();

		oLayoutData.setSpan("L2 M2 S2");
		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		oLayoutData = oGrid._getLayoutDataForControl(oField2);
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL6 L6 M8 S12", "Span on Field");

		oLayoutData = oGrid._getLayoutDataForControl(oNewField);
		assert.equal(oLayoutData.getId(), "GD1", "custom LayoutData used");
		assert.equal(oLayoutData.getSpan(), "L2 M2 S2", "Span on Field");
	});

	QUnit.test("LabelSpan", function(assert) {
		oResponsiveGridLayout.setLabelSpanL(5);
		oResponsiveGridLayout.setLabelSpanM(4);
		oResponsiveGridLayout.setLabelSpanS(3);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL5 L5 M4 S3", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL7 L7 M8 S9", "Span on Field");

		oResponsiveGridLayout.setLabelSpanXL(6);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL6 L5 M4 S3", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL6 L7 M8 S9", "Span on Field");
	});

	QUnit.test("adjustLabelSpan", function(assert) {
		oResponsiveGridLayout.setColumnsM(2);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M4 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL8 L8 M8 S12", "Span on Field");

		oResponsiveGridLayout.setAdjustLabelSpan(false);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M2 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL8 L8 M10 S12", "Span on Field");

		oResponsiveGridLayout.setColumnsM(1);
		oResponsiveGridLayout.setColumnsL(1);
		oResponsiveGridLayout.setAdjustLabelSpan(true);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M2 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL10 L10 M10 S12", "Span on Field");

		oResponsiveGridLayout.setColumnsL(2);
		oLayoutData = new GridData("GD1", {spanL: 12});
		oFormContainer1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M2 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL10 L10 M10 S12", "Span on Field");
	});

	QUnit.test("EmptySpan", function(assert) {
		oResponsiveGridLayout.setEmptySpanL(2);
		oResponsiveGridLayout.setEmptySpanM(3);
		oResponsiveGridLayout.setEmptySpanS(4);
		oResponsiveGridLayout.setLabelSpanS(3); // emptySpan only works in S for labelspan > 12
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL6 L6 M7 S5", "Span on Field");

		oResponsiveGridLayout.setEmptySpanXL(1);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL7 L6 M7 S5", "Span on Field");
	});

	QUnit.test("breakpoint", function(assert) {
		oResponsiveGridLayout.setBreakpointXL(1500);
		oResponsiveGridLayout.setBreakpointL(1000);
		oResponsiveGridLayout.setBreakpointM(500);
		sap.ui.getCore().applyChanges();
		var oGrid = sap.ui.getCore().byId("F1--Grid");

		assert.equal(oGrid._iBreakPointLargeDesktop, "1500", "BreapointXL on Main Grid");
		assert.equal(oGrid._iBreakPointDesktop, "1000", "BreapointL on Main Grid");
		assert.equal(oGrid._iBreakPointTablet, "500", "BreapointM on Main Grid");
	});

	QUnit.module("LayoutData one Container", {
		beforeEach: initTestOneContainer,
		afterEach: afterTest
	});

	QUnit.test("singleContainerFullSize", function(assert) {
		oResponsiveGridLayout.setSingleContainerFullSize(false);
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("F1--Grid");

		assert.ok(oGrid, "Main grid used");
		var aContent = oGrid.getContent();

		assert.equal(aContent.length, 1, "Grid has 1 Elements");
		assert.equal(aContent[0].getId(), "FC1--Grid", "Grid1 is 1. element");
	});

	QUnit.test("default on Fields and Label", function(assert) {
		oFormElement2.destroyLabel();
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		var oParent = jQuery("#L1").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M2 S12", "Span on Label");
		assert.ok(oLayoutData.getLinebreak(), "LayoutData linebreak set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Label");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Label");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Label");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Label");
		assert.ok(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl set on Label");

		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		oParent = jQuery("#I1").parent();
		assert.equal(oLayoutData.getId(), "RGL1--Dummy", "calculated LayoutData used");
		assert.equal(oLayoutData.getSpan(), "XL10 L10 M10 S12", "Span on Field");
		assert.notOk(oLayoutData.getLinebreak(), "LayoutData linebreak not set");
		assert.notOk(oLayoutData.getLinebreakXL(), "LayoutData linebreakXL not set");
		assert.notOk(oLayoutData.getLinebreakL(), "LayoutData linebreakL not set");
		assert.notOk(oLayoutData.getLinebreakM(), "LayoutData linebreakM not set");
		assert.equal(oLayoutData.getIndentXL(), 0, "IndentXL on Field");
		assert.equal(oLayoutData.getIndentL(), 0, "IndentL on Field");
		assert.equal(oLayoutData.getIndentM(), 0, "IndentM on Field");
		assert.equal(oLayoutData.getIndentS(), 0, "IndentS on Field");
		assert.notOk(oParent.hasClass("sapUiFormElementLbl"), "class sapUiFormElementLbl not set on Field");
	});

	QUnit.test("adjustLabelSpan", function(assert) {
		sap.ui.getCore().applyChanges();

		var oGrid = sap.ui.getCore().byId("FC1--Grid");
		var oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL2 L2 M2 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL10 L10 M10 S12", "Span on Field");

		oResponsiveGridLayout.setAdjustLabelSpan(false);
		sap.ui.getCore().applyChanges();

		oLayoutData = oGrid._getLayoutDataForControl(oLabel1);
		assert.equal(oLayoutData.getSpan(), "XL4 L4 M2 S12", "Span on Label");
		oLayoutData = oGrid._getLayoutDataForControl(oField1);
		assert.equal(oLayoutData.getSpan(), "XL8 L8 M10 S12", "Span on Field");
	});

	QUnit.test("breakpoint", function(assert) {
		oResponsiveGridLayout.setBreakpointXL(1500);
		oResponsiveGridLayout.setBreakpointL(1000);
		oResponsiveGridLayout.setBreakpointM(500);
		sap.ui.getCore().applyChanges();
		var oGrid = sap.ui.getCore().byId("FC1--Grid");

		assert.equal(oGrid._iBreakPointLargeDesktop, "1500", "BreapointXL on Main Grid");
		assert.equal(oGrid._iBreakPointDesktop, "1000", "BreapointL on Main Grid");
		assert.equal(oGrid._iBreakPointTablet, "500", "BreapointM on Main Grid");
	});

	QUnit.module("Content", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("Field width", function(assert) {
		var oText = new Text("T1", {text: "Test"});
		oFormElement2.addField(oText);
		var oLink = new Link("Li1", {text: "Test", href: "http://www.sap.com"});
		oFormElement2.addField(oLink);
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery("#T1").attr("style").indexOf("100%") > 0, "Text width set to 100%");
		assert.ok(!jQuery("#Li1").attr("style") || jQuery("#Li1").attr("style").indexOf("100%") < 0, "Link width not set to 100%");
	});

	QUnit.test("Expand", function(assert) {
		assert.notOk(jQuery("#FC2---Panel").hasClass("sapUiRGLContainerColl"), "Panel not collapsed");

		oFormContainer2.setExpanded(false);
		assert.ok(jQuery("#FC2---Panel").hasClass("sapUiRGLContainerColl"), "Panel is collapsed");

		oForm.invalidate(); // to test in Renderer
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#FC2---Panel").hasClass("sapUiRGLContainerColl"), "Panel is collapsed");

		oFormContainer2.setExpanded(true);
		assert.notOk(jQuery("#FC2---Panel").hasClass("sapUiRGLContainerColl"), "Panel not collapsed");
	});

	QUnit.test("destroy layout", function(assert) {
		var iLength = 0;
		if (!Object.keys) {
			jQuery.each(oResponsiveGridLayout.mContainers, function(){iLength++;});
		} else {
			iLength = Object.keys(oResponsiveGridLayout.mContainers).length;
		}

		assert.equal(iLength, 2, "Layout control data exits");

		oForm.setLayout("");
		oResponsiveGridLayout.destroy();
		iLength = 0;

		if (!Object.keys) {
			jQuery.each(oResponsiveGridLayout.mContainers, function(){iLength++;});
		} else {
			iLength = Object.keys(oResponsiveGridLayout.mContainers).length;
		}
		assert.equal(iLength, 0, "Layout control data cleared");
		assert.notOk(sap.ui.getCore().byId("FC1--Grid"), "Container Grid destroyed");
		assert.notOk(sap.ui.getCore().byId("FC2---Panel"), "Panel destroyed");
	});

	QUnit.test("getContainerRenderedDomRef", function(assert) {
		var oDom = oResponsiveGridLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.ok(oDom, "Dom for container1 returned");
		assert.equal(oDom.id, "FC1--Grid", "Grid is representation of container1");

		oDom = oResponsiveGridLayout.getContainerRenderedDomRef(oFormContainer2);
		assert.ok(oDom, "Dom for container2 returned");
		assert.equal(oDom.id, "FC2---Panel", "Panel is representation of container2");

		oForm.setVisible(false);
		sap.ui.getCore().applyChanges();
		oDom = oResponsiveGridLayout.getContainerRenderedDomRef(oFormContainer2);
		assert.notOk(oDom, "no Dom for container2 returned if invisible Form");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oResponsiveGridLayout.getElementRenderedDomRef(oFormElement1);
		assert.notOk(oDom, "no Dom for FormElement returned");
	});

});
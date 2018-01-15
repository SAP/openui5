/* global QUnit */

// Test only the things relevant for ResponsiveLayout. The basic Form functionality
// is tested in Form, FormContainer and FormElement qUnit tests.

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/ResponsiveLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/layout/ResponsiveFlowLayoutData",
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
		ColumnLayout,
		FormContainer,
		FormElement,
		VariantLayoutData,
		ResponsiveFlowLayoutData,
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
	var oResponsiveLayout;
	var oFormContainer1;
	var oFormContainer2;
	var oFormElement1;
	var oFormElement2;
	var oFormElement3;
	var oFormElement4;
	var oLabel1;
	var oLabel2;
	var oField1;
	var oField2;
	var oField3;
	var oField4;
	var oField5;
	var oField6;
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
		oResponsiveLayout = new sap.ui.layout.form.ResponsiveLayout("RL1");
		oLabel1 = new sap.m.Label("L1", {text: "Label 1"});
		oLabel2 = new sap.m.Label("L2", {text: "Label 2"});
		oField1 = new sap.m.Input("I1");
		oField2 = new sap.m.Input("I2");
		oField3 = new sap.m.Input("I3");
		oFormElement1 = new sap.ui.layout.form.FormElement("FE1",{
			label: oLabel1,
			fields: [oField1]
		});
		oFormElement2 = new sap.ui.layout.form.FormElement("FE2",{
			label: oLabel2,
			fields: [oField2, oField3]
		});
		oFormContainer1 = new sap.ui.layout.form.FormContainer("FC1",{
			formElements: [ oFormElement1, oFormElement2 ]
		});
		var aFormContainers = [oFormContainer1];
		if (!bOneContainer) {
			oField4 = new sap.m.Input("I4");
			oField5 = new sap.m.Input("I5");
			oField6 = new sap.m.Input("I6");
			oFormElement3 = new sap.ui.layout.form.FormElement("FE3",{
				fields: [oField4]
			});
			oFormElement4 = new sap.ui.layout.form.FormElement("FE4",{
				fields: [oField5, oField6]
			});
			oTitle = new sap.ui.core.Title("T2", {text: "Test"});
			oFormContainer2 = new sap.ui.layout.form.FormContainer("FC2",{
				title: oTitle,
				tooltip: "Test",
				expandable: true,
				formElements: [ oFormElement3, oFormElement4 ]
			});
			aFormContainers.push(oFormContainer2);
		}
		oForm = new sap.ui.layout.form.Form("F1", {
			layout: oResponsiveLayout,
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

	function afterTest() {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			cleanupControl(oResponsiveLayout);
			cleanupControl(oLabel1);
			cleanupControl(oLabel2);
			cleanupControl(oField1);
			cleanupControl(oField2);
			cleanupControl(oField3);
			cleanupControl(oField4);
			cleanupControl(oField5);
			cleanupControl(oField6);
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
		assert.ok(oResponsiveLayout, "ResponsiveLayout is created");
		assert.equal(oForm.getLayout().getId(), "RL1", "getLayout() returns layout.");
	});

	QUnit.test("one container specific things", function(assert) {
		assert.notOk(sap.ui.getCore().byId("F1--RFLayout"), "no Main RF-Layout");
	});

	QUnit.module("inner ResponsiveFlowLayouts", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("content of Main Layout", function(assert) {
		var oRFL = sap.ui.getCore().byId("F1--RFLayout");
		assert.ok(oRFL, "Main RF-Layout exist");
		assert.ok(oRFL instanceof sap.ui.layout.ResponsiveFlowLayout, "Main Layout is ResponsiveFlowLayout");
	});

	QUnit.test("Respresentations of Containers", function(assert) {
		var oRFL = sap.ui.getCore().byId("F1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Main RF-Layout content");
		assert.ok(aContent[0] instanceof sap.ui.layout.ResponsiveFlowLayout, "Container1 is ResponsiveFlowLayout");
		assert.equal(aContent[0].getId(), "FC1--RFLayout", "Layout for Container1");
		assert.equal(aContent[1].getMetadata().getName(), "sap.ui.layout.form.ResponsiveLayoutPanel", "Container2 is Panel");
		assert.equal(aContent[1].getId(), "FC2--Panel", "Panel for Container1");
	});

	QUnit.test("Panel", function(assert) {
		var oPanel = sap.ui.getCore().byId("FC1--Panel");
		assert.notOk(oPanel, "no panel created for first container");

		oPanel = sap.ui.getCore().byId("FC2--Panel");
		assert.ok(oPanel, "panel created for second container");
		assert.equal(oTitle.getParent().getId(), "FC2", "FormContainer is still parent of Title");
		assert.equal(oPanel.getContent().getId(), "FC2--RFLayout", "RF-Layout is inside Panel");
		assert.ok(oPanel.getContent() instanceof sap.ui.layout.ResponsiveFlowLayout, "content of Panel is ResponsiveFlowLayout");
		assert.ok(jQuery.sap.domById("T2"), "Title rendered");
		assert.ok(jQuery.sap.domById("FC2--Exp"), "Expander rendered");
		assert.equal(jQuery("#FC2--Panel").attr("title"), "Test", "tooltip set on panel");
	});

	QUnit.test("add/remove Panel", function(assert) {
		oFormContainer2.destroyTitle();
		oFormContainer2.setExpandable(false);
		sap.ui.getCore().applyChanges();

		var oRFL = sap.ui.getCore().byId("F1--RFLayout");
		var aContent = oRFL.getContent();
		var oPanel = sap.ui.getCore().byId("FC2--Panel");
		assert.notOk(oPanel, "no panel created for container");
		assert.equal(aContent.length, 2, "Main RF-Layout content");
		assert.equal(aContent[1].getId(), "FC2--RFLayout", "Layout for Container1");

		oFormContainer2.setTitle("Test");
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent();
		oPanel = sap.ui.getCore().byId("FC2--Panel");
		assert.ok(oPanel, "panel created for container");
		assert.equal(aContent.length, 2, "Grid has 2 Elements");
		assert.equal(aContent[1].getId(), "FC2--Panel", "Panel is 2. element");
	});

	QUnit.test("aria", function(assert) {
		assert.notOk(jQuery("#FC1--RFLayout").attr("role"), "role \"form\" not set on RF-Layout");
		assert.notOk(jQuery("#FC1--RFLayout").attr("aria-labelledby"), "aria-labelledby not set on RF-Layout");
		assert.equal(jQuery("#FC2--Panel").attr("role"), "form", "role \"form\" set on panel");
		assert.equal(jQuery("#FC2--Panel").attr("aria-labelledby"), "T2", "aria-labelledby set on panel");

		oFormContainer1.addAriaLabelledBy("XXX");
		oFormContainer2.addAriaLabelledBy("YYY");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#FC1--RFLayout").attr("role"), "form", "role \"form\" set on RF-Layout");
		assert.equal(jQuery("#FC1--RFLayout").attr("aria-labelledby"), "XXX", "aria-labelledby set on RF-Layout");
		assert.equal(jQuery("#FC2--Panel").attr("aria-labelledby"), "YYY T2", "aria-labelledby set on panel");
	});

	QUnit.test("Toolbar", function(assert) {
		var oToolbar = new sap.m.Toolbar("TB1");
		oFormContainer2.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.notOk(jQuery.sap.domById("T2"), "Title not rendered");
		assert.notOk(jQuery.sap.domById("FC2--Exp"), "Expander not rendered");
		assert.ok(jQuery.sap.domById("TB1"), "Toolbar rendered");
		assert.ok(jQuery("#FC2--Panel").attr("aria-labelledby"), "TB1", "aria-labelledby set on panel");
	});

	QUnit.test("Content of Containers Layout", function(assert) {
		var oRFL = sap.ui.getCore().byId("FC1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Container1 RF-Layout content");
		assert.ok(aContent[0] instanceof sap.ui.layout.ResponsiveFlowLayout, "ResponsiveFlowLayout for Element1");
		assert.equal(aContent[0].getId(), "FE1--RFLayout", "Layout for Element11");
		assert.ok(aContent[1] instanceof sap.ui.layout.ResponsiveFlowLayout, "ResponsiveFlowLayout for Element2");
		assert.equal(aContent[1].getId(), "FE2--RFLayout", "Layout for Element12");
	});

	QUnit.test("Content of Elements Layout", function(assert) {
		var oRFL = sap.ui.getCore().byId("FE1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element1 RF-Layout content");
		assert.equal(aContent[0].getId(), "L1", "Element1 first content is Label1");
		assert.equal(aContent[1].getId(), "I1", "Element1 second content is Field1");
		assert.equal(oLabel1.getParent().getId(), "FE1", "FormElement still parent of Label1");
		assert.equal(oField1.getParent().getId(), "FE1", "FormElement still parent of Field1");

		oRFL = sap.ui.getCore().byId("FE2--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element2 RF-Layout content");
		assert.equal(aContent[0].getId(), "L2", "Element2 first content is Label1");
		assert.equal(aContent[1].getId(), "FE2--content--RFLayout", "Element2 second content is inner Layout");
		assert.ok(aContent[1] instanceof sap.ui.layout.ResponsiveFlowLayout, "Element2 inner layout is RF-Layout");
		aContent = aContent[1].getContent();
		assert.equal(aContent.length, 2, "Element2 inner Layout content");
		assert.equal(aContent[0].getId(), "I2", "Element2 first content is Field2");
		assert.equal(aContent[1].getId(), "I3", "Element2 second content is Field3");
		assert.equal(oField3.getParent().getId(), "FE2", "FormElement still parent of Field3");

		oRFL = sap.ui.getCore().byId("FE3--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 1, "Element3 RF-Layout content");
		assert.equal(aContent[0].getId(), "I4", "Element3 first content is Field4");

		oRFL = sap.ui.getCore().byId("FE4--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element4 RF-Layout content");
		assert.equal(aContent[0].getId(), "I5", "Element4 first content is Field5");
		assert.equal(aContent[1].getId(), "I6", "Element4 second content is Field6");
	});

	QUnit.test("add/remove fields", function(assert) {
		var oRFL = sap.ui.getCore().byId("FE1--RFLayout");
		var oNewField = new sap.m.Input("I7");
		oFormElement1.insertField(oNewField, 0);
		sap.ui.getCore().applyChanges();

		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element1 RF-Layout content");
		assert.equal(aContent[0].getId(), "L1", "Element1 first content is Label1");
		assert.equal(aContent[1].getId(), "FE1--content--RFLayout", "Element1 second content is inner Layout");
		aContent = aContent[1].getContent();
		assert.equal(aContent.length, 2, "Element1 inner Layout content");
		assert.equal(aContent[0].getId(), "I7", "Element1 first content is new Field");
		assert.equal(aContent[1].getId(), "I1", "Element1 second content is Field3");

		oFormElement2.insertField(oNewField, 1);
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element1 RF-Layout content");
		assert.equal(aContent[0].getId(), "L1", "Element1 first content is Label1");
		assert.equal(aContent[1].getId(), "I1", "Element1 second content is Field1");
		assert.notOk(sap.ui.getCore().byId("FE1--content--RFLayout"), "Element1 inner layout destroyed");
		oRFL = sap.ui.getCore().byId("FE2--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element2 RF-Layout content");
		assert.equal(aContent[0].getId(), "L2", "Element2 first content is Label1");
		assert.equal(aContent[1].getId(), "FE2--content--RFLayout", "Element2 second content is inner Layout");
		aContent = aContent[1].getContent();
		assert.equal(aContent.length, 3, "Element2 inner Layout content");
		assert.equal(aContent[0].getId(), "I2", "Element2 first content is Field2");
		assert.equal(aContent[1].getId(), "I7", "Element2 second content is new Field");
		assert.equal(aContent[2].getId(), "I3", "Element2 third content is Field3");

		oFormElement3.addField(oNewField);
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent()[1].getContent();
		assert.equal(aContent.length, 2, "Element2 inner Layout content");
		assert.equal(aContent[0].getId(), "I2", "Element2 first content is Field2");
		assert.equal(aContent[1].getId(), "I3", "Element2 second content is Field3");
		oRFL = sap.ui.getCore().byId("FE3--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element3 RF-Layout content");
		assert.equal(aContent[0].getId(), "I4", "Element3 first content is Field4");
		assert.equal(aContent[1].getId(), "I7", "Element3 second content is new Field");

		oFormElement3.removeField(oNewField);
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 1, "Element3 RF-Layout content");
		assert.equal(aContent[0].getId(), "I4", "Element3 first content is Field4");

		oNewField.destroy();
	});

	QUnit.test("add/remove Label", function(assert) {
		oFormElement3.setLabel(oLabel1);
		oFormElement4.setLabel(oLabel2);
		sap.ui.getCore().applyChanges();

		var oRFL = sap.ui.getCore().byId("FE1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 1, "Element1 RF-Layout content");
		assert.equal(aContent[0].getId(), "I1", "Element1 first content is Field1");

		oRFL = sap.ui.getCore().byId("FE2--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element2 RF-Layout content");
		assert.equal(aContent[0].getId(), "I2", "Element2 first content is Field2");
		assert.equal(aContent[1].getId(), "I3", "Element2 second content is Field3");

		oRFL = sap.ui.getCore().byId("FE3--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element3 RF-Layout content");
		assert.equal(aContent[0].getId(), "L1", "Element3 first content is Label1");
		assert.equal(aContent[1].getId(), "I4", "Element3 second content is Field4");

		oRFL = sap.ui.getCore().byId("FE4--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Element4 RF-Layout content");
		assert.equal(aContent[0].getId(), "L2", "Element4 first content is Label2");
		assert.equal(aContent[1].getId(), "FE4--content--RFLayout", "Element4 second content is inner Layout");
		aContent = aContent[1].getContent();
		assert.equal(aContent.length, 2, "Element4 inner Layout content");
		assert.equal(aContent[0].getId(), "I5", "Element4 first content is Field5");
		assert.equal(aContent[1].getId(), "I6", "Element4 second content is Field6");
	});

	QUnit.test("add/remove FormElement", function(assert) {
		oFormContainer2.insertFormElement(oFormElement2, 0);
		sap.ui.getCore().applyChanges();

		var oRFL = sap.ui.getCore().byId("FC1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 1, "Container1 RF-Layout content");
		assert.equal(aContent[0].getId(), "FE1--RFLayout", "Layout for Element1");
		oRFL = sap.ui.getCore().byId("FC2--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 3, "Container2 RF-Layout content");
		assert.equal(aContent[0].getId(), "FE2--RFLayout", "Layout for Element2");
		assert.equal(aContent[1].getId(), "FE3--RFLayout", "Layout for Element3");
		assert.equal(aContent[2].getId(), "FE4--RFLayout", "Layout for Element4");

		oFormContainer1.insertFormElement(oFormElement2, 0);
		sap.ui.getCore().applyChanges();
		oRFL = sap.ui.getCore().byId("FC1--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Container1 RF-Layout content");
		assert.equal(aContent[0].getId(), "FE2--RFLayout", "Layout for Element2");
		assert.equal(aContent[1].getId(), "FE1--RFLayout", "Layout for Element1");
		oRFL = sap.ui.getCore().byId("FC2--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Container2 RF-Layout content");
		assert.equal(aContent[0].getId(), "FE3--RFLayout", "Layout for Element3");
		assert.equal(aContent[1].getId(), "FE4--RFLayout", "Layout for Element4");

		oFormContainer1.removeFormElement(oFormElement2);
		sap.ui.getCore().applyChanges();
		oRFL = sap.ui.getCore().byId("FC1--RFLayout");
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 1, "Container1 RF-Layout content");
		assert.notOk(sap.ui.getCore().byId("FE2--RFLayout"), "Element2 layout destroyed");
		oFormElement2.destroy();
	});

	QUnit.test("add/remove FormContainer", function(assert) {
		oForm.removeFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery.sap.domById("F1--RFLayout"), "Main layout not rendered");
		assert.ok(jQuery.sap.domById("FC2--Panel"), "container panel rendered");
		assert.notOk(sap.ui.getCore().byId("FC1--RFLayout"), "Container1 layout destroyed");

		oForm.addFormContainer(oFormContainer1);
		sap.ui.getCore().applyChanges();
		var oRFL = sap.ui.getCore().byId("F1--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Main RF-Layout content");
		assert.equal(aContent[0].getId(), "FC2--Panel", "Panel for Container1");
		assert.equal(aContent[1].getId(), "FC1--RFLayout", "Layout for Container1");
	});

	QUnit.test("visibility of FormElement", function(assert) {
		var oNewLabel = new sap.m.Label("L5", {text: "Label 5"});
		var oNewField = new sap.m.Input("I7");
		var oNewFormElement = new sap.ui.layout.form.FormElement("FE5",{
			visible: false,
			label: oNewLabel,
			fields: [oNewField]
		});
		oFormContainer2.insertFormElement(oNewFormElement, 1);
		sap.ui.getCore().applyChanges();
		var oRFL = sap.ui.getCore().byId("FC2--RFLayout");
		var aContent = oRFL.getContent();
		assert.equal(aContent.length, 2, "Container1 RF-Layout content");

		oNewFormElement.setVisible(true);
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 3, "Container2 RF-Layout content");
	});

	QUnit.test("visibility of FormContainer", function(assert) {
		var oNewFormContainer = new sap.ui.layout.form.FormContainer("FC3",{ title: "Test", visible: false});
		oForm.insertFormContainer(oNewFormContainer, 1);
		sap.ui.getCore().applyChanges();
		var oRFL = sap.ui.getCore().byId("F1--RFLayout");
		var aContent = oRFL.getContent();

		assert.equal(aContent.length, 2, "Main layout has 2 Elements, as invisible FormContainer is not rendered");

		oNewFormContainer.setVisible(true);
		sap.ui.getCore().applyChanges();
		aContent = oRFL.getContent();
		assert.equal(aContent.length, 3, "Main layout  has 3 Elements");
		assert.equal(aContent[1].getId(), "FC3--Panel", "new Panel is 2. element");
	});

	QUnit.module("LayoutData", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("default on FormContainer", function(assert) {
		var oRFL = sap.ui.getCore().byId("FC1--RFLayout");
		var oLayoutData = oRFL.getLayoutData();
		assert.notOk(oLayoutData, "Layout for Container1 has no LayoutData");

		var oPanel = sap.ui.getCore().byId("FC2--Panel");
		oLayoutData = oPanel.getLayoutData();
		assert.notOk(oLayoutData, "Panel for Container1 has no LayoutData");
	});

	QUnit.test("custom LayoutData on FormContainer", function(assert) {
		var oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("RFLD1", {linebreak: true});
		oFormContainer2.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();
		var oPanel = sap.ui.getCore().byId("FC2--Panel");

		assert.equal(oPanel.getLayoutData().getId(), "RFLD1", "Original LayoutData returned");
		assert.equal(oLayoutData.getParent().getId(), "FC2", "Parent of LayoutData is still FormContainer");
	});

	QUnit.test("default on FormElement", function(assert) {
		var oRFL = sap.ui.getCore().byId("FE1--RFLayout");
		var oLayoutData = oRFL.getLayoutData();
		assert.ok(!!oLayoutData, "Layout for Element1 has LayoutData");
		assert.ok(oLayoutData instanceof sap.ui.layout.ResponsiveFlowLayoutData, "LayoutData are ResponsiveFlowLayoutData");
		assert.notOk(oLayoutData.getMargin(), "No margins");
		assert.notOk(oLayoutData.getLinebreak(), "No linebreak");
		assert.equal(oLayoutData.getWeight(), 1, "weight");

		oRFL = sap.ui.getCore().byId("FE3--RFLayout");
		oLayoutData = oRFL.getLayoutData();
		assert.ok(!!oLayoutData, "Layout for Element3 has LayoutData");
		assert.ok(oLayoutData instanceof sap.ui.layout.ResponsiveFlowLayoutData, "LayoutData are ResponsiveFlowLayoutData");
		assert.notOk(oLayoutData.getMargin(), "No margins");
		assert.notOk(oLayoutData.getLinebreak(), "No linebreak");
		assert.equal(oLayoutData.getWeight(), 1, "weight");

		oRFL = sap.ui.getCore().byId("FE2--content--RFLayout");
		oLayoutData = oRFL.getLayoutData();
		assert.ok(!!oLayoutData, "inner Layout for Element2 has LayoutData");
		assert.ok(oLayoutData instanceof sap.ui.layout.ResponsiveFlowLayoutData, "LayoutData are ResponsiveFlowLayoutData");
		assert.notOk(oLayoutData.getMargin(), "No margins");
		assert.notOk(oLayoutData.getLinebreak(), "No linebreak");
		assert.equal(oLayoutData.getWeight(), 2, "weight");
	});

	QUnit.test("custom LayoutData on FormElement", function(assert) {
		var oLayoutData = new sap.ui.layout.ResponsiveFlowLayoutData("RFLD1", {linebreak: true});
		oFormElement2.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var oRFL = sap.ui.getCore().byId("FE2--RFLayout");
		oLayoutData = oRFL.getLayoutData();
		assert.ok(!!oLayoutData, "Layout for Element2 has LayoutData");
		assert.equal(oLayoutData.getId(), "RFLD1", "LayoutData are custom LayoutData");
		assert.ok(oLayoutData.getMargin(), "margins set");
		assert.ok(oLayoutData.getLinebreak(), "linebreak set");
		assert.equal(oLayoutData.getWeight(), 1, "weight");
	});

	QUnit.test("default on Field and Label", function(assert) {
		var oLayoutData = oLabel1.getLayoutData();
		assert.notOk(!!oLayoutData, "Label has no LayoutData");
		oLayoutData = oField1.getLayoutData();
		assert.notOk(!!oLayoutData, "Field has no LayoutData");
		oLayoutData = oField2.getLayoutData();
		assert.notOk(!!oLayoutData, "Field has no LayoutData");
	});

	QUnit.test("custom LayoutData on Field and Label", function(assert) {
		var oLayoutData1 = new sap.ui.layout.ResponsiveFlowLayoutData("RFLD1", {weight: 3});
		oLabel1.setLayoutData(oLayoutData1);
		var oLayoutData2 = new sap.ui.layout.ResponsiveFlowLayoutData("RFLD2", {weight: 2});
		oField3.setLayoutData(oLayoutData2);
		sap.ui.getCore().applyChanges();

		var oLayoutData = oLabel1.getLayoutData();
		assert.ok(!!oLayoutData, "Label has LayoutData");
		assert.equal(oLayoutData.getId(), "RFLD1", "LayoutData are given custom LayoutData");
		oLayoutData = oField3.getLayoutData();
		assert.ok(!!oLayoutData, "Field has LayoutData");
		assert.equal(oLayoutData.getId(), "RFLD2", "LayoutData are given custom LayoutData");
		var oRFL = sap.ui.getCore().byId("FE2--content--RFLayout");
		oLayoutData = oRFL.getLayoutData();
		assert.ok(!!oLayoutData, "inner Layout for Element2 has LayoutData");
		assert.equal(oLayoutData.getWeight(), 3, "weight");
	});

	QUnit.module("Content", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("Field width", function(assert) {
		var oText = new sap.m.Text("T1", {text: "Test"});
		oFormElement2.addField(oText);
		var oLink = new sap.m.Link("Li1", {text: "Test", href: "http://www.sap.com"});
		oFormElement2.addField(oLink);
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery("#T1").attr("style").indexOf("100%") > 0, "Text width set to 100%");
		assert.ok(!jQuery("#Li1").attr("style") || jQuery("#Li1").attr("style").indexOf("100%") < 0, "Link width not set to 100%");
	});

	QUnit.test("Expand", function(assert) {
		assert.notOk(jQuery("#FC2--Panel").hasClass("sapUiRLContainerColl"), "Panel not collapsed");

		oFormContainer2.setExpanded(false);
		assert.ok(jQuery("#FC2--Panel").hasClass("sapUiRLContainerColl"), "Panel is collapsed");

		oForm.invalidate(); // to test in Renderer
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#FC2--Panel").hasClass("sapUiRLContainerColl"), "Panel is collapsed");

		oFormContainer2.setExpanded(true);
		assert.notOk(jQuery("#FC2--Panel").hasClass("sapUiRLContainerColl"), "Panel not collapsed");
	});

	QUnit.test("destroy layout", function(assert) {
		var iLength = 0;
		if (!Object.keys) {
			jQuery.each(oResponsiveLayout.mContainers, function(){iLength++;});
		} else {
			iLength = Object.keys(oResponsiveLayout.mContainers).length;
		}

		assert.equal(iLength, 2, "Layout control data exits");

		oForm.destroyLayout();
		iLength = 0;

		if (!Object.keys) {
			jQuery.each(oResponsiveLayout.mContainers, function(){iLength++;});
		} else {
			iLength = Object.keys(oResponsiveLayout.mContainers).length;
		}
		assert.equal(iLength, 0, "Layout control data cleared");
		assert.notOk(sap.ui.getCore().byId("FC1--RFLayout"), "Container Layout destroyed");
		assert.notOk(sap.ui.getCore().byId("FC2--Panel"), "Panel destroyed");
	});

	QUnit.test("getContainerRenderedDomRef", function(assert) {
		var oDom = oResponsiveLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.ok(oDom, "Dom for container1 returned");
		assert.equal(oDom.id, "FC1--RFLayout", "RF-Layout is representation of container1");

		oDom = oResponsiveLayout.getContainerRenderedDomRef(oFormContainer2);
		assert.ok(oDom, "Dom for container2 returned");
		assert.equal(oDom.id, "FC2--Panel", "Panel is representation of container2");

		oFormContainer1.setVisible(false);
		sap.ui.getCore().applyChanges();
		oDom = oResponsiveLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.notOk(oDom, "no Dom for container1 returned if invisible");

		oForm.setVisible(false);
		sap.ui.getCore().applyChanges();
		oDom = oResponsiveLayout.getContainerRenderedDomRef(oFormContainer2);
		assert.notOk(oDom, "no Dom for container2 returned if invisible Form");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oResponsiveLayout.getElementRenderedDomRef(oFormElement1);
		assert.ok(oDom, "Dom for FormElement returned");
		assert.equal(oDom.id, "FE1--RFLayout", "RF-Layout is representation of Element1");

		oFormElement1.setVisible(false);
		sap.ui.getCore().applyChanges();
		oDom = oResponsiveLayout.getElementRenderedDomRef(oFormElement1);
		assert.notOk(oDom, "no Dom for Element1 returned if invisible");

		oForm.setVisible(false);
		sap.ui.getCore().applyChanges();
		oDom = oResponsiveLayout.getElementRenderedDomRef(oFormElement2);
		assert.notOk(oDom, "no Dom for Element2 returned if invisible Form");
	});

});
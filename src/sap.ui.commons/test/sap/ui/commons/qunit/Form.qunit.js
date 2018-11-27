/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/form/FormLayout",
	"sap/ui/commons/form/Form",
	"sap/ui/commons/Title",
	"sap/ui/commons/form/FormContainer",
	"sap/ui/commons/form/FormElement",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Label",
	"sap/ui/commons/DatePicker",
	"sap/ui/commons/RadioButtonGroup",
	"sap/ui/core/Item",
	"sap/ui/commons/DropdownBox",
	"sap/ui/core/ListItem",
	"sap/ui/commons/library",
	"sap/ui/commons/CheckBox",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery"
], function(
	qutils,
	createAndAppendDiv,
	FormLayout,
	Form,
	Title,
	FormContainer,
	FormElement,
	TextField,
	Label,
	DatePicker,
	RadioButtonGroup,
	Item,
	DropdownBox,
	ListItem,
	commonsLibrary,
	CheckBox,
	Button,
	jQuery
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	// create Form

	new Form("F1",{
		title: new Title("F1T",{text: "Form Title", icon: "test-resources/sap/ui/commons/images/controls/sap.ui.commons.form.Form.gif", tooltip: "Title tooltip"}),
		tooltip: "Form tooltip",
		layout: new FormLayout("Layout1"),
		formContainers: [
			new FormContainer("C1",{
				title: "Container1",
				formElements: [
					new FormElement("C1E1",{
						label: "Label1",
						fields: [new TextField("TF1", {required:true})]
					}),
					new FormElement("C1E2",{
						label: new Label("L1",{text:"Label2"}),
						fields: [new DatePicker("DP1",{ariaLabelledBy: "dummy"})]
					}),
					new FormElement("C1E3",{
						label: new Label("L2",{text:"Label3", icon:"test-resources/sap/ui/commons/images/help.gif"}),
						fields: [new RadioButtonGroup("RBG1",{
							items: [new Item({text: "true"}),
									new Item({text: "false"})]
						})]
					})
				]
			}),
			new FormContainer("C2",{
				title: new Title("C2T",{text: "Container2", icon: "test-resources/sap/ui/commons/images/controls/sap.ui.commons.form.FormContainer.gif", tooltip: "Title tooltip"}),
				formElements: [
					new FormElement("C2E1",{
						label: new Label("L4",{text:"Label4"}),
						fields: [new TextField("TF3"),
								 new TextField("TF4",{width: "5em", required: true})]
					}),
					new FormElement("C3E3",{
						label: "Label5",
						fields: [new DropdownBox("DdB1",{
							items: [new ListItem({text: "one"}),
									new ListItem({text: "two"}),
									new ListItem({text: "three"})]
						})]
					})
				]
			}),
			new FormContainer("C3",{
				title: new Title("C3T",{text: "Container3", level: commonsLibrary.TitleLevel.H3}),
				tooltip: "Container tooltip",
				expandable: true,
				formElements: [
					new FormElement("C3E1",{
						fields: [new CheckBox({text: 'one'}),
								 new CheckBox({text: 'two'})]
					}),
					new FormElement("C3E2",{
						fields: [new CheckBox({text: 'three'})]
					})
				]
			}),
			new FormContainer("C4",{
				formElements: [
					new FormElement("C4E1",{
						fields: [new Button({text: 'OK'}),
								 new Button({text: 'Cancel'})]
					}),
					new FormElement("C4E2",{
						visible: false,
						fields: [new TextField("C4E2T1", {value: 'invisible'})]
					})
				]
			}),
			new FormContainer("C5",{
				title: "invisible",
				visible: false,
				formElements: [
					new FormElement("C5E1",{
						fields: [new TextField("C5E1T1", {value: 'invisible'})]
					})
				]
			})]
	}).placeAt("uiArea1");

	new Form("F2",{
		title: new Title("F2T",{text: "Form with width of 300px", emphasized: true, level: commonsLibrary.TitleLevel.H1}),
		width: "300px",
		layout: new FormLayout("Layout2"),
		formContainers: [
			new FormContainer("F2C1",{
				title: "Container1",
				formElements: [
					new FormElement("F2C1E1",{
						label: "Label1",
						fields: [new TextField("F2C1E1TF1", {required:true})]
					})
				]
			})]
	}).placeAt("uiArea2");

	new Form("F3",{
		title: "Invisible Form",
		layout: new FormLayout("Layout3"),
		visible: false,
		formContainers: [
			new FormContainer("F3C1",{
				title: "Container1",
				formElements: [
					new FormElement("F3C1E1",{
						label: "Label1",
						fields: [new TextField("F3C1E1TF1", {required:true})]
					})
				]
			})]
	}).placeAt("uiArea3");

	// test functions

	QUnit.module("Contol functions");

	QUnit.test("Form", function(assert) {
		var oForm = sap.ui.getCore().byId("F1");

		assert.equal(oForm.getLayout().getId(), "Layout1", "getLayout() returns layout.");
	});

	QUnit.test("Container", function(assert) {
		var oContainer1 = sap.ui.getCore().byId("C1");
		var oContainer2 = sap.ui.getCore().byId("C2");

		//title must return text if text entered, control if control entered
		assert.equal(oContainer1.getTitle(), "Container1", "getTitle(): Title as text entered must return text");
		assert.ok(oContainer2.getTitle() instanceof Title, "getTitle(): Title as control entered must return control");
	});

	QUnit.test("Element", function(assert) {
		var oElement = sap.ui.getCore().byId("C1E1");
		//label must return text if text entered, control if control entered
		assert.equal(oElement.getLabel(), "Label1", "getLabel(): Label as text endered must return text");
		assert.ok(!(oElement.getAggregation("label") instanceof Label), "Label as text entered must not be an control in aggregation");
		assert.ok(oElement.getLabelControl() instanceof Label, "Label as text endeted must be an control in getLabelControl");
		oElement = sap.ui.getCore().byId("C1E2");
		assert.ok(oElement.getLabel() instanceof Label, "getLabel(): Label as control entered must return control");
		assert.equal(oElement.getLabel(), oElement.getLabelControl(), "getLabel(): Label as control entered must be the same in getLabelControl");
	});

	QUnit.module("Rendering");

	QUnit.test("Form", function(assert) {
		assert.ok(document.getElementById("F1"), "Form is rendered");
		assert.ok(document.getElementById("Layout1"), "Layout is rendered");
		assert.equal(jQuery("#F1").attr("title"), "Form tooltip", "Form tooltip rendered");
		assert.ok(document.getElementById("F1T"), "Form title is rendered");
		assert.ok(jQuery("#F1T").is("h4"), "Form title is rendered as H4 as default");
		assert.ok(document.getElementById("F1T-ico"), "Form title image is rendered");
		assert.ok(!jQuery("#F1T").hasClass("sapUiFormTitleEmph"), "Form title rendered not emphasized");
		assert.equal(jQuery("#F2").width(), 300, "Form2 rendered width 300px");
		assert.equal(jQuery("#F2T").width(), jQuery("#F2").children().first().innerWidth(), "Form2 title rendered as large as the Layout");
		assert.ok(jQuery("#F2T").hasClass("sapUiFormTitleEmph"), "Form2 title rendered emphasized");
		assert.ok(jQuery("#F2T").is("h1"), "Form2 title is rendered as H1 as set on control");
		assert.ok(!document.getElementById("F3"), "invisible Form is not rendered");
	});

	QUnit.test("Container", function(assert) {
		assert.ok(document.getElementById("C1"), "Container is rendered");
		assert.ok(jQuery('h4:contains("Container1")').get(0), "Title (as text) is renderd");
		assert.ok(document.getElementById("C2T"), "Title (as Control) is rendered");
		assert.ok(jQuery("#C2T").is("h4"), "Container title is rendered as H4 as default");
		assert.ok(jQuery("#C3T").is("h3"), "Container title is rendered as H3 as set there");
		assert.ok(document.getElementById("C3-content"), "Container3 contetnt area is rendered");
		assert.ok(jQuery("#C3-content").is(":visible"), "Container3 content area is visible");
		assert.ok(!document.getElementById("C5"), "invisible Container is not rendered");

		// as button is loaded async, check if already there and rendered, if not, start test async
		if (sap.ui.require("sap/ui/commons/Button") && document.getElementById("C3--Exp")) {
			assert.ok(!document.getElementById("C1--Exp"), "Container1 no expander is rendered");
			assert.ok(document.getElementById("C3--Exp"), "Container3 expander is rendered");
		} else {
			var fnDone = assert.async();
			sap.ui.require(["sap/ui/commons/Button"], function() {
				sap.ui.getCore().applyChanges(); // to wait for re-rendering
				assert.ok(!document.getElementById("C1--Exp"), "Container1 no expander is rendered");
				assert.ok(document.getElementById("C3--Exp"), "Container3 expander is rendered");
				fnDone();
			});
		}
	});

	QUnit.test("Element", function(assert) {
		assert.ok(document.getElementById("C1E1"), "Element is rendered");
		assert.ok(!document.getElementById("C4E2"), "invisible Element is not rendered");
	});

	QUnit.test("FormControls", function(assert) {
		assert.ok(jQuery('label:contains("Label1")').get(0), "Label (as text) is renderd");
		assert.ok(jQuery('label:contains("Label1")').hasClass("sapUiLblReq"), "Label1 is renderd as required");
		assert.equal(jQuery('label:contains("Label1")').attr("for"), "TF1", "Label1 (as text) is renderd for TextField1");
		assert.ok(jQuery("#L4").hasClass("sapUiLblReq"), "Label4 is renderd as required");
		assert.ok(document.getElementById("TF1"), "TextField is rendered");
		assert.equal(jQuery("#TF1").attr("aria-labelledby"), jQuery('label:contains("Label1")').attr("id"), "TextField aria-labelledby points to label");
		assert.equal(jQuery("#TF3").attr("aria-labelledby"), "L4", "TextField3 aria-labelledby points to label");
		assert.equal(jQuery("#TF4").attr("aria-labelledby"), "L4", "TextField4 aria-labelledby points to label");
		assert.ok(document.getElementById("L1"), "Label (as control) is rendered");
		assert.equal(jQuery("#L1").attr("for"), "DP1-input", "Label1 is renderd for DatePicker");
		assert.ok(document.getElementById("DP1"), "DatePicker is rendered");
		assert.equal(jQuery("#DP1-input").attr("aria-labelledby"), "L1 dummy", "DatePicker aria-labelledby changed (contains reference to label)");
		assert.ok(document.getElementById("RBG1"), "RadioButtonGroup is rendered");
		assert.ok(!document.getElementById("C4E2T1"), "Content of invisible Element is not rendered");
		assert.ok(!document.getElementById("C5e1T1"), "Content of invisible Container is not rendered");
	});

	QUnit.module("Interaction");

	//		QUnit.test("Form", function(assert) {
	//			assert.expect(0);
	//
	//		});

	QUnit.test("Container", function(assert) {
		//expander function
		var oContainer = sap.ui.getCore().byId("C3");
		qutils.triggerMouseEvent("C3--Exp", "click");
		assert.ok(!jQuery("#C3-content").is(":visible"), "Container3 content area is not visible after click on expander");
		assert.equal(oContainer.getExpanded(), false, "Container3 getExpanded()");
	});

	//		QUnit.test("Element", function(assert) {
	//			assert.expect(0);
	//
	//		});
});
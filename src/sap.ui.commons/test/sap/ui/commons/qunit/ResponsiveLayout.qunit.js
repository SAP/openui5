/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/form/ResponsiveLayout",
	"sap/ui/commons/form/Form",
	"sap/ui/commons/Title",
	"sap/ui/commons/form/FormContainer",
	"sap/ui/commons/form/FormElement",
	"sap/ui/commons/TextField",
	"sap/ui/commons/layout/ResponsiveFlowLayoutData",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/core/LayoutData",
	"sap/ui/thirdparty/jquery"
], function(
	createAndAppendDiv,
	ResponsiveLayout,
	Form,
	Title,
	FormContainer,
	FormElement,
	TextField,
	ResponsiveFlowLayoutData,
	VariantLayoutData,
	LayoutData,
	jQuery
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	// create Form

	new Form("F1",{
		title: new Title("F1T",{text: "Form1"}),
		layout: new ResponsiveLayout("Layout1"),
		formContainers: [
			new FormContainer("F1C1",{
				formElements: [
					new FormElement("F1C1E1",{
						label: "Label",
						fields: [
							new TextField("F1C1E1_T1",{value: "Text"})
						]
					})
				]
			})
		]
	}).placeAt("uiArea1");

	new Form("F2",{
		title: "Form2",
		layout: new ResponsiveLayout("Layout2"),
		formContainers: [
			new FormContainer("F2C1",{
				title: "Title as text",
				formElements: [
					new FormElement("F2C1E1",{
						label: "Label",
						fields: [
							new TextField("F2C1E1_T1",{value: "Text"}),
							new TextField("F2C1E1_T2",{value: "Text"})
						]
					})
				]
			})
		]
	}).placeAt("uiArea2");

	var oLayout3 = new ResponsiveLayout("Layout3");
	var oForm3 = new Form("F3",{
		title: "Form3",
		layout: oLayout3,
		formContainers: [
			new FormContainer("F3C1",{
				title: new Title("F3C1T",{text: "Title as Control"}),
				formElements: [
					new FormElement("F3C1E1",{
						label: "Label",
						fields: [
							new TextField("F3C1E1_T1",{value: "Text"}),
							new TextField("F3C1E1_T2",{value: "Text"})
						]
					}),
					new FormElement("F3C1E2",{
						label: "Label",
						fields: [
							new TextField("F3C1E2_T1",{value: "Text"}),
							new TextField("F3C1E2_T2",{value: "Text"})
						]
					})
				]
			}),
			new FormContainer("F3C2",{
				title: "Title as Text",
				expandable: true,
				formElements: [
						new FormElement("F3C2E1",{
							label: "Label",
							fields: [
								new TextField("F3C2E1_T1",{value: "Text"}),
								new TextField("F3C2E1_T2",{value: "Text"})
							]
						}),
						new FormElement("F3C2E2",{
							label: "Label",
							fields: [
								new TextField("F3C2E2_T1",{value: "Text"}),
								new TextField("F3C2E2_T2",{
										value: "Text",
										layoutData: new ResponsiveFlowLayoutData("F3C2E2_T2LD",{linebreak: true})
								})
							],
							layoutData: new ResponsiveFlowLayoutData("F3C2E2LD",{linebreak: true})
						}),
						new FormElement("F3C2E3",{
							visible: false,
							label: "Label",
							fields: [
								new TextField("F3C2E3_T1",{value: "invisible"})
							],
							layoutData: new ResponsiveFlowLayoutData({linebreak: true})
						})
				],
				layoutData: new ResponsiveFlowLayoutData("F3C2LD",{minWidth: 300})
			}),
			new FormContainer("F3C3",{
				title: "Title as Text",
				expandable: true,
				expanded: false,
				formElements: [
					new FormElement("F3C3E1",{
						label: "Label",
						fields: [
							new TextField("F3C3E1_T1",{value: "Text"}),
							new TextField("F3C3E1_T2",{value: "Text"})
						]
					}),
					new FormElement("F3C3E2",{
						label: "Label",
						fields: [
							new TextField("F3C3E2_T1",{value: "Text"}),
							new TextField("F3C3E2_T2",{value: "Text"})
						],
						layoutData: new VariantLayoutData({
							multipleLayoutData: [
								new LayoutData(),
								new ResponsiveFlowLayoutData("F3C3E2LD",{linebreak: true})
							]
						})
					})
				],
				layoutData: new VariantLayoutData("F3C3VLD",{
					multipleLayoutData: [
						new LayoutData(),
						new ResponsiveFlowLayoutData("F3C3LD",{linebreak: true})
					]
				})
			}),
			new FormContainer("F3C5",{
				title: "Invisible",
				visible: false,
				formElements: [
					new FormElement("F3C5E1",{
						label: "Label",
						fields: [
							new TextField("F3C5E1_T1",{value: "Text"})
						]
					})
				]
			})
		]
	}).placeAt("uiArea3");


	// test functions

	QUnit.module("functions");

	QUnit.test("Getter", function(assert) {
		// overwritten getter must return data of corresponding objects
		var oElement = sap.ui.getCore().byId("F1C1E1");
		var oRFLayout = sap.ui.getCore().byId("F1C1E1--RFLayout");
		assert.equal(oRFLayout.getContent()[0].getParent().getId(), oElement.getId(), "Form1: Element must be still parent of Label");
		assert.equal(oRFLayout.getContent()[1].getParent().getId(), oElement.getId(), "Form1: Element must be still parent of Field");

		var oPanel = sap.ui.getCore().byId("F2C1--Panel");
		var oContainer = sap.ui.getCore().byId("F2C1");
		oElement = sap.ui.getCore().byId("F2C1E1");
		oRFLayout = sap.ui.getCore().byId("F2C1E1--content--RFLayout");
		assert.equal(oRFLayout.getContent()[0].getParent().getId(), oElement.getId(), "Form2: Element must be still parent of Field");

		oPanel = sap.ui.getCore().byId("F3C1--Panel");
		oContainer = sap.ui.getCore().byId("F3C1");
		assert.equal(oContainer.getTitle().getParent().getId(), oContainer.getId(), "Form3: Container3 Title must still have Container as Parent");

		oPanel = sap.ui.getCore().byId("F3C2--Panel");
		oContainer = sap.ui.getCore().byId("F3C2");
		var oLayoutData = sap.ui.getCore().byId("F3C2LD");
		assert.equal(oPanel.getLayoutData().getId(), oLayoutData.getId(), "Form3: Panel2 must get LayoutData from Container");
		assert.equal(oLayoutData.getParent().getId(), oContainer.getId(), "Form3: Container2 LayoutData must still have Container as Parent");
		oElement = sap.ui.getCore().byId("F3C2E2");
		oRFLayout = sap.ui.getCore().byId("F3C2E2--RFLayout");
		oLayoutData = sap.ui.getCore().byId("F3C2E2LD");
		assert.equal(oRFLayout.getLayoutData().getId(), oLayoutData.getId(), "Form3: Container2 Element2 - RFLayout must get LayoutData from Element");
		assert.equal(oLayoutData.getParent().getId(), oElement.getId(), "Form3: Container2 Element2 LayoutData must still have Element as Parent");

		oPanel = sap.ui.getCore().byId("F3C3--Panel");
		oContainer = sap.ui.getCore().byId("F3C3");
		oLayoutData = sap.ui.getCore().byId("F3C3LD");
		assert.equal(oPanel.getLayoutData().getId(), oLayoutData.getId(), "Form3: Panel3 must get LayoutData from Container");

	});

	QUnit.module("Rendering");

	QUnit.test("Container rendering", function(assert) {
		assert.ok(document.getElementById("F1"), "Form1 is rendered");
		assert.ok(document.getElementById("Layout1"), "Layout1 is rendered");
		assert.ok(!document.getElementById("F1C1--Panel"), "Form1: Container1 no Panel rendered (because no title and expander)");
		assert.ok(document.getElementById("F1C1--RFLayout"), "Form1: Container1 ResponsiveFlowLayout rendered");

		// panel
		assert.ok(document.getElementById("F2C1--Panel"), "Form2: Container1 Panel rendered (because title)");
		assert.ok(document.getElementById("F2C1--RFLayout"), "Form2: Container1 ResponsiveFlowLayout rendered");
		// title as text
		var oContainer = sap.ui.getCore().byId("F2C1");
		assert.ok(document.getElementById("F2C1--title"), "Form2: Container1 Title rendered");
		assert.equal(jQuery("#F2C1--title").text(), oContainer.getTitle(), "Form2: Container1 Title Text");
		// title as control
		oContainer = sap.ui.getCore().byId("F3C1");
		var oTitle = oContainer.getTitle();
		assert.ok(oTitle.getDomRef(), "Form3: Container1 Title rendered");
		assert.equal(oTitle.$().text(), oContainer.getTitle().getText(), "Form3: Container1 Title Text");
		// expander
		// as button is loaded async, check if already there and rendered, if not, start test async
		if (sap.ui.require("sap/ui/commons/Button") && document.getElementById("F3C2--Exp")) {
			assert.ok(!document.getElementById("F3C1--Exp"), "Form3: Container1 no expander rendered");
			assert.ok(document.getElementById("F3C2--Exp"), "Form3: Container2 expander rendered");
		} else {
			var fnDone = assert.async();
			sap.ui.require(["sap/ui/commons/Button"], function() {
				sap.ui.getCore().applyChanges(); // to wait for re-rendering
				assert.ok(!document.getElementById("F3C1--Exp"), "Form3: Container1 no expander rendered");
				assert.ok(document.getElementById("F3C2--Exp"), "Form3: Container2 expander rendered XXX");
				fnDone();
			});
		}

		assert.ok(!document.getElementById("F3C5--Panel"), "Form3: invisible Container5 - Panel not rendered");
		assert.ok(!document.getElementById("F3C5--RFLayout"), "Form3: invisible Container5 - ResponsiveFlowLayout not rendered");
	});

	QUnit.test("Element Rendering", function(assert) {
		assert.ok(document.getElementById("F1C1E1--RFLayout"), "Form1: Element1 ResponsiveFlowLayout rendered");
		assert.ok(!document.getElementById("F1C1E1--content--RFLayout"), "Form1: Element1 no ResponsiveFlowLayout for content rendered");

		assert.ok(document.getElementById("F2C1E1--RFLayout"), "Form2: Element1 ResponsiveFlowLayout rendered");
		assert.ok(document.getElementById("F2C1E1--content--RFLayout"), "Form2: Element1 ResponsiveFlowLayout for content rendered");

		assert.ok(!document.getElementById("F3C2E3--RFLayout"), "Form3: invisible Element ResponsiveFlowLayout not rendered");
		assert.ok(!document.getElementById("F3C5E1--RFLayout"), "Form3: invisible Containers Element ResponsiveFlowLayout not rendered");
	});

	QUnit.test("Fieds Rendering", function(assert) {
		assert.ok(sap.ui.getCore().byId("F1C1E1").getLabelControl().getDomRef(), "Label1 rendered");
		assert.ok(document.getElementById("F1C1E1_T1"), "TextField1 rendered");

		assert.ok(sap.ui.getCore().byId("F2C1E1").getLabelControl().getDomRef(), "Form2: Label rendered");
		assert.ok(document.getElementById("F2C1E1_T1"), "Form2: TextField1 rendered");
		assert.ok(document.getElementById("F2C1E1_T2"), "Form2: TextField2 rendered");

		assert.ok(!document.getElementById("F3C2E3_T1"), "Form3: invisible Element - TextField not rendered");
		assert.ok(!document.getElementById("F3C5E1_T1"), "Form3: invisible Container - TextField not rendered");
	});

	QUnit.module("Interaction");

	QUnit.test("add container", function(assert) {
		oForm3.addFormContainer(
				new FormContainer("F3C4",{
					title: "new container",
						formElements: [
								new FormElement("F3C4E1",{
									label: "Label",
									fields: [new TextField("F3C4E1_T1",{value: "Text"}),
											 new TextField("F3C4E1_T2",{value: "Text"})]
								})
				]
			})
			);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("F3C4--Panel"), "Form3: new Container Panel rendered (because title)");
		assert.ok(document.getElementById("F3C4--RFLayout"), "Form3: new Container ResponsiveFlowLayout rendered");
		assert.ok(document.getElementById("F3C4E1--RFLayout"), "Form3: new Element1 ResponsiveFlowLayout rendered");
		assert.ok(document.getElementById("F3C4E1--content--RFLayout"), "Form3: new Element1 ResponsiveFlowLayout for content rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E1").getLabelControl().getDomRef(), "Form3: new Label1 rendered");
		assert.ok(document.getElementById("F3C4E1_T1"), "Form3: new TextField1 rendered");
	});

	QUnit.test("add element", function(assert) {
		var oContainer = sap.ui.getCore().byId("F3C4");
		oContainer.addFormElement(
				new FormElement("F3C4E2",{
					label: "Label",
					fields: [new TextField("F3C4E2_T1",{value: "Text"})]
				})
			);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("F3C4E2--RFLayout"), "Form3: new Element2 ResponsiveFlowLayout rendered");
		assert.ok(!document.getElementById("F3C4E2--content--RFLayout"), "Form3: new Element2 no ResponsiveFlowLayout for content rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: new Label2 rendered");
		assert.ok(document.getElementById("F3C4E2_T1"), "Form3: new TextField1 rendered");
	});

	QUnit.test("add field", function(assert) {
		var oElement = sap.ui.getCore().byId("F3C4E2");
		oElement.addField(new TextField("F3C4E2_T2",{value: "Text"}));
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("F3C4E2--content--RFLayout"), "Form3: new Element2 ResponsiveFlowLayout for content rendered");
		assert.ok(document.getElementById("F3C4E2_T1"), "Form3: new still TextField1 rendered");
		assert.ok(document.getElementById("F3C4E2_T2"), "Form3: new TextField2 rendered");
	});

	QUnit.test("make Element invisible", function(assert) {
		var oElement = sap.ui.getCore().byId("F3C4E2");
		oElement.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!sap.ui.getCore().byId("F3C4E2--RFLayout"), "Form3: Elements ResponsiveFlowLayout does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4E2--content--RFLayout"), "Form3: ResponsiveFlowLayout for Element content does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: Label2 not longer rendered");
		assert.ok(!document.getElementById("F3C4E2_T1"), "Form3: TextField1 not longer rendered");
	});

	QUnit.test("make Element visible", function(assert) {
		var oElement = sap.ui.getCore().byId("F3C4E2");
		oElement.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(sap.ui.getCore().byId("F3C4E2--RFLayout"), "Form3: Elements ResponsiveFlowLayout exist again.");
		assert.ok(sap.ui.getCore().byId("F3C4E2--content--RFLayout"), "Form3: Elements ResponsiveFlowLayout for content exist again.");
		assert.ok(document.getElementById("F3C4E2--RFLayout"), "Form3: Element ResponsiveFlowLayout rendered");
		assert.ok(document.getElementById("F3C4E2--content--RFLayout"), "Form3: Element2 ResponsiveFlowLayout for content rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: Label2 rendered");
		assert.ok(document.getElementById("F3C4E2_T1"), "Form3: TextField1 rendered");
	});

	QUnit.test("make Container invisible", function(assert) {
		var oContainer = sap.ui.getCore().byId("F3C4");
		oContainer.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!sap.ui.getCore().byId("F3C4--Panel"), "Form3: Containers Panel does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4--RFLayout"), "Form3: ResponsiveFlowLayout for Container content does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4E2--RFLayout"), "Form3: Elements ResponsiveFlowLayout does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4E2--content--RFLayout"), "Form3: ResponsiveFlowLayout for Element content does not exist any more.");
		assert.ok(!sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: Label2 not longer rendered");
		assert.ok(!document.getElementById("F3C4E2_T1"), "Form3: TextField1 not longer rendered");
	});

	QUnit.test("make Container visible", function(assert) {
		var oContainer = sap.ui.getCore().byId("F3C4");
		oContainer.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(sap.ui.getCore().byId("F3C4--Panel"), "Form3: Containers Panel exist again.");
		assert.ok(sap.ui.getCore().byId("F3C4--RFLayout"), "Form3: ResponsiveFlowLayout for Container exist again.");
		assert.ok(document.getElementById("F3C4--Panel"), "Form3: Containers Panel rendered");
		assert.ok(document.getElementById("F3C4--RFLayout"), "Form3: Containers ResponsiveFlowLayout rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E2--RFLayout"), "Form3: Elements ResponsiveFlowLayout exist again.");
		assert.ok(sap.ui.getCore().byId("F3C4E2--content--RFLayout"), "Form3: Elements ResponsiveFlowLayout for content exist again.");
		assert.ok(document.getElementById("F3C4E2--RFLayout"), "Form3: Element ResponsiveFlowLayout rendered");
		assert.ok(document.getElementById("F3C4E2--content--RFLayout"), "Form3: Element2 ResponsiveFlowLayout for content rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: Label2 rendered");
		assert.ok(document.getElementById("F3C4E2_T1"), "Form3: TextField1 rendered");
	});

	QUnit.test("destroy and add container new", function(assert) {
		var oContainer = sap.ui.getCore().byId("F3C4");
		var aFormElements = oContainer.removeAllFormElements();
		oContainer.destroy();
		oForm3.addFormContainer(
				new FormContainer("F3C4",{
					title: "new container",
						formElements: aFormElements
				})
			);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("F3C4--Panel"), "Form3: Container Panel still rendered");
		assert.ok(document.getElementById("F3C4--RFLayout"), "Form3: Container ResponsiveFlowLayout still rendered");
		assert.ok(document.getElementById("F3C4E1--RFLayout"), "Form3: Element1 ResponsiveFlowLayout still rendered");
		assert.ok(document.getElementById("F3C4E1--content--RFLayout"), "Form3: Element1 ResponsiveFlowLayout for content still rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E1").getLabelControl().getDomRef(), "Form3: Label1 still rendered");
		assert.ok(document.getElementById("F3C4E1_T1"), "Form3: TextField1 still rendered");
	});

	QUnit.test("destroy and add element new", function(assert) {
		var oElement = sap.ui.getCore().byId("F3C4E2");
		oElement.destroy();
		var oContainer = sap.ui.getCore().byId("F3C4");
		oContainer.addFormElement(
				new FormElement("F3C4E2",{
					label: "Label",
					fields: [new TextField("F3C4E2_T1",{value: "Text"})]
				})
			);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("F3C4E2--RFLayout"), "Form3: Element2 ResponsiveFlowLayout still rendered");
		assert.ok(sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form3: Label2 still rendered");
		assert.ok(document.getElementById("F3C4E2_T1"), "Form3: TextField1 still rendered");
	});

	QUnit.test("remove field", function(assert) {
		var oElement = sap.ui.getCore().byId("F3C4E2");
		oElement.removeField("F3C4E2_T1");
		sap.ui.getCore().applyChanges();
		assert.ok(!document.getElementById("F3C4E2_T1"), "Form4: new TextField1 not longer rendered");
		assert.ok(!document.getElementById("F3C4E2--content--RFLayout"), "Form4: new Element2 ResponsiveFlowLayout for content not longer rendered");
		var oElementData = oLayout3.mContainers["F3C4"][2]["F3C4E2"];
		assert.ok(!oElementData[1], "Element2 ResponsiveFlowLayout for content not longer in layout control data");
		assert.ok(!sap.ui.getCore().byId("F3C4E2--content--RFLayout"), "Element2 ResponsiveFlowLayout for content desroyed");
	});

	QUnit.test("remove element", function(assert) {
		var oContainer = sap.ui.getCore().byId("F3C4");
		oContainer.removeFormElement("F3C4E2");
		sap.ui.getCore().applyChanges();
		assert.ok(!document.getElementById("F3C4E2--RFLayout"), "Form3: new Element2 ResponsiveFlowLayout not longer rendered");
		assert.ok(!sap.ui.getCore().byId("F3C4E2").getLabelControl().getDomRef(), "Form4: new Label2 not longer rendered");
		assert.ok(!document.getElementById("F3C4E2_T1"), "Form4: new TextField1 not longer rendered");
		var oElementData = oLayout3.mContainers["F3C4"][2]["F3C4E2"];
		assert.ok(!oElementData, "Element2 not longer in the layout control data");
		assert.ok(!sap.ui.getCore().byId("F3C4E2--RFLayout"), "Element2 ResponsiveFlowLayout desroyed");
	});

	QUnit.test("remove container", function(assert) {
		oForm3.removeFormContainer("F3C4");
		sap.ui.getCore().applyChanges();
		assert.ok(!document.getElementById("F3C4--Panel"), "Form3: new Container Panel not longer rendered rendered");
		assert.ok(!document.getElementById("F3C4--RFLayout"), "Form3: new Container ResponsiveFlowLayout not longer rendered");
		assert.ok(!document.getElementById("F3C4E1--RFLayout"), "Form3: new Element1 ResponsiveFlowLayout not longer rendered");
		assert.ok(!document.getElementById("F3C4E1--content--RFLayout"), "Form4: new Element1 ResponsiveFlowLayout for content not longer rendered");
		assert.ok(!sap.ui.getCore().byId("F3C4E1").getLabelControl().getDomRef(), "Form4: new Label1 not longer rendered");
		assert.ok(!document.getElementById("F3C4E1_T1"), "Form4: new TextField1 not longer rendered rendered");
		assert.ok(!oLayout3.mContainers["F3C4"], "Container not longer in the layout control data");
		assert.ok(!sap.ui.getCore().byId("F3C4E1--content--RFLayout"), "Element1 ResponsiveFlowLayout for content desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C4E1--RFLayout"), "Element1 ResponsiveFlowLayout desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C4--RFLayout"), "Container ResponsiveFlowLayout desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C4--Panel"), "Panel desroyed");
	});

	QUnit.test("destroy layout", function(assert) {
		oForm3.setLayout(null);
		oLayout3.destroy();
		var iLength = 0;

		if (!Object.keys) {
			jQuery.each(oLayout3.mContainers, function(){iLength++;});
		} else {
			iLength = Object.keys(oLayout3.mContainers).length;
		}
		assert.equal(iLength, 0, "Layout control data cleared");
		assert.ok(!sap.ui.getCore().byId("F3C1E1--content--RFLayout"), "Element1 ResponsiveFlowLayout for content desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C1E1--RFLayout"), "Element1 ResponsiveFlowLayout desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C1--RFLayout"), "Container ResponsiveFlowLayout desroyed");
		assert.ok(!sap.ui.getCore().byId("F3C1--Panel"), "Panel desroyed");
	});
});
/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ColumnElementData",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/ui/core/Control"
	],
	function(
			SemanticFormElement,
			ColumnElementData,
			Label,
			Input,
			Text,
			Control
	) {
	"use strict";

	// TODO: Fake iSematicFormContent on controls until it is official supported
	var myTypeCheck = function(vTypeName) {
		if (vTypeName === "sap.ui.core.ISemanticFormContent") {
			return true;
		} else {
			return this.getMetadata().isA(vTypeName);
		}
	};
	Input.prototype.isA = myTypeCheck;

	var oFormElement;

	var RenderControl = Control.extend("myRenderControl", { // dummy to fake rendering of FormElement
		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				var aFields = oFormElement.getFieldsForRendering();
				if (aFields && aFields.length > 0) {
					for (var i = 0; i < aFields.length; i++) {
						var oField = aFields[i];
						oRm.renderControl(oField);
					}
				}
				oRm.close("div");
			}
		}
	});

	var oRenderControl;

	function initTest() {
		oFormElement = new SemanticFormElement("FE1");
		oRenderControl = new RenderControl("RC1").placeAt("qunit-fixture"); // use this DOM node, as no better exist
	}

	function afterTest() {
		if (oFormElement) {
			oFormElement.destroy();
			oFormElement = undefined;
			oRenderControl.destroy();
			oRenderControl = undefined;
		}
	}

	QUnit.module("API", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oFormElement, "FormElement is created");
	});

	QUnit.test("Delimiter", function(assert) {
		assert.equal(oFormElement.getDelimiter(), "/", "default delimiter");
		oFormElement.setDelimiter("*");
		assert.equal(oFormElement.getDelimiter(), "*", "new delimiter");
	});

	QUnit.module("edit mode", {
		beforeEach: function() {
			initTest();
			oFormElement._setEditable(true);
			},
		afterEach: afterTest
	});

	QUnit.test("one Field", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		oFormElement.addField(oField1);
		var aFields = oFormElement.getFieldsForRendering();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.equal(aFields[0], oField1, "First field rendered");
	});

	QUnit.test("invalid content", function(assert) {
		var oLabel = new Label("L1");
		var oException;

		try {
			oFormElement.addField(oLabel);
			sap.ui.getCore().applyChanges();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		oLabel.destroy();
	});

	QUnit.test("two fields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		var aFields = oFormElement.getFieldsForRendering();

		assert.equal(aFields.length, 3, "3 controls rendered");
		assert.equal(aFields[0], oField1, "First field rendered");
		assert.ok(aFields[1] && aFields[1].isA("sap.m.Text"), "Delimiter rendered");
		assert.equal(aFields[1] && aFields[1].getText && aFields[1].getText(), "/", "Delimitter symbol rendered");
		assert.equal(aFields[1] && aFields[1].getTextAlign && aFields[1].getTextAlign(), "Center", "Delimitter horizontal centered");
		assert.ok(aFields[2] && aFields[2] === oField2, "Second field rendered");
	});

	QUnit.test("two fields with fieldLabels", function(assert) {
		var oLabel1 = new Label("L1", {text: "Label 1"});
		var oLabel2 = new Label("L2", {text: "Label 2"});
		oFormElement.addFieldLabel(oLabel1);
		oFormElement.addFieldLabel(oLabel2);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		sap.ui.getCore().applyChanges();

		var aFields = oFormElement.getFieldsForRendering();
		var oLabel = oFormElement.getLabelControl();

		assert.ok(oLabel, "Label created");
		assert.equal(oLabel && oLabel.getText(), "Label 1 / Label 2", "Label text");
		assert.equal(aFields.length, 3, "3 controls rendered");
		assert.equal(jQuery(oField1.getFocusDomRef()).attr("aria-label"), "Label 1", "First field aria-label set");
		assert.notOk(jQuery(oField1.getFocusDomRef()).attr("aria-labelledby"), "First field no aria-labelledby set");
		assert.equal(jQuery(oField2.getFocusDomRef()).attr("aria-label"), "Label 2", "Second field aria-label set");
		assert.notOk(jQuery(oField2.getFocusDomRef()).attr("aria-labelledby"), "Second field no aria-labelledby set");

		// change Label text
		oLabel1.setText("Changed Label");
		assert.equal(oLabel && oLabel.getText(), "Changed Label / Label 2", "Label text");

	});

	QUnit.test("three fields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		var oField3 = new Text("F3", {text: "Text 3"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.insertField(oField3, 1);
		var aFields = oFormElement.getFieldsForRendering();

		assert.equal(aFields.length, 5, "5 controls rendered");
		assert.equal(aFields[0], oField1, "First field rendered");
		assert.ok(aFields[1] && aFields[1].isA("sap.m.Text"), "Delimiter rendered");
		assert.equal(aFields[1] && aFields[1].getText && aFields[1].getText(), "/", "Delimitter symbol rendered");
		assert.equal(aFields[1] && aFields[1].getTextAlign && aFields[1].getTextAlign(), "Center", "Delimitter horizontal centered");
		assert.ok(aFields[2] && aFields[2] === oField3, "Third field rendered");
		assert.ok(aFields[3] && aFields[3].isA("sap.m.Text"), "Delimiter rendered");
		assert.equal(aFields[3] && aFields[3].getText && aFields[3].getText(), "/", "Delimitter symbol rendered");
		assert.equal(aFields[3] && aFields[3].getTextAlign && aFields[3].getTextAlign(), "Center", "Delimitter horizontal centered");
		assert.ok(aFields[4] && aFields[4] === oField2, "Second field rendered");
	});

	QUnit.test("remove field", function(assert) {
		var oLabel1 = new Label("L1", {text: "Label 1"});
		var oLabel2 = new Label("L2", {text: "Label 2"});
		oFormElement.addFieldLabel(oLabel1);
		oFormElement.addFieldLabel(oLabel2);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		sap.ui.getCore().applyChanges();

		oFormElement.removeField(oField1);
		oFormElement.removeFieldLabel(oLabel1);
		sap.ui.getCore().applyChanges();

		var aFields = oFormElement.getFieldsForRendering();
		var oLabel = oFormElement.getLabelControl();

		assert.ok(oLabel, "Label created");
		assert.equal(oLabel && oLabel.getText(), "Label 2", "Label text");
		assert.equal(aFields.length, 1, "1 control rendered");
		assert.equal(aFields[0], oField2, "Second field rendered");

		// change Label text
		sinon.spy(oLabel, "setText");
		oLabel1.setText("Changed Label");
		assert.equal(oLabel && oLabel.getText(), "Label 2", "Label text");
		assert.notOk(oLabel.setText.called, "Internal Label not updated from unassigned Label");

		oField1.destroy();
		oLabel1.destroy();
	});

	QUnit.test("delimiter change", function(assert) {
		var oLabel1 = new Label("L1", {text: "Label 1"});
		var oLabel2 = new Label("L2", {text: "Label 2"});
		oFormElement.addFieldLabel(oLabel1);
		oFormElement.addFieldLabel(oLabel2);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.setDelimiter("*");
		var aFields = oFormElement.getFieldsForRendering();

		var oLabel = oFormElement.getLabelControl();

		assert.ok(oLabel, "Label created");
		assert.equal(oLabel && oLabel.getText(), "Label 1 * Label 2", "Label text");
		assert.equal(aFields.length, 3, "3 controls rendered");
		assert.equal(aFields[0], oField1, "First field rendered");
		assert.ok(aFields[1] && aFields[1].isA("sap.m.Text"), "Delimiter rendered");
		assert.equal(aFields[1] && aFields[1].getText && aFields[1].getText(), "*", "Delimitter symbol rendered");
		assert.equal(aFields[1] && aFields[1].getTextAlign && aFields[1].getTextAlign(), "Center", "Delimitter horizontal centered");
		assert.ok(aFields[2] && aFields[2] === oField2, "Second field rendered");
	});

	QUnit.test("layoutData", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);

		// fake Form, FormContainer and Layout
		var oFormContainer = new Text("FC1");
		var oForm = new Text("Form1");
		var oLayout = new Text("Layout1");
		oFormContainer.addDependent(oFormElement);
		oForm.addDependent(oFormContainer);
		oForm.addDependent(oLayout);
		oForm.getLayout = function() {
			return oLayout;
		};
		oLayout.getLayoutDataForDelimiter = function() {
			return new ColumnElementData({cellsLarge: 1});
		};
		oLayout.getLayoutDataForSemanticField = function(iFields) {
			return new ColumnElementData({cellsLarge: iFields}); // just to check number is transfered
		};

		var aFields = oFormElement.getFieldsForRendering();
		var oLayoutData = aFields[0] && aFields[0].getLayoutData();
		assert.ok(oLayoutData, "LayoutData assigned to Field");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 2, "Number of Fields used");

		var oDelimiter = aFields[1];
		oLayoutData = oDelimiter && oDelimiter.getLayoutData();
		assert.ok(oLayoutData, "LayoutData assigned to Delimitter");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 1, "cells Large set");

		oLayoutData = aFields[2] && aFields[2].getLayoutData();
		assert.ok(oLayoutData, "LayoutData assigned to Field");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 2, "Number of Fields used");

		// check layoutData removed after Field is removed
		oFormElement.removeField(oField2);
		oLayoutData = oField2.getLayoutData();
		assert.notOk(oLayoutData, "no LayoutData assigned to Field");
		oField2.destroy();

		oFormContainer.removeDependent(oFormElement);
		oForm.destroy();
	});

	QUnit.test("layout data as promise", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		var oField3 = new Input("F3", {value: "Text 3"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.addField(oField3);

		// fake Form, FormContainer and Layout
		var oFormContainer = new Text("FC1");
		var oForm = new Text("Form1");
		var oLayout = new Text("Layout1");
		oFormContainer.addDependent(oFormElement);
		oForm.addDependent(oFormContainer);
		oForm.addDependent(oLayout);
		oForm.getLayout = function() {
			return oLayout;
		};
		oLayout.getLayoutDataForDelimiter = function() {
			return new Promise(function(fResolve) {
				fResolve(new ColumnElementData());
			});
		};
		oLayout.getLayoutDataForSemanticField = function(iFields) {
			return new Promise(function(fResolve) {
				fResolve(new ColumnElementData({cellsLarge: iFields})); // just to check number is transfered
			});
		};

		var aFields = oFormElement.getFieldsForRendering();

		var fnDone = assert.async();
		setTimeout(function() {// wait to resolve promise
			var oLayoutData = aFields[0] && aFields[0].getLayoutData();
			assert.ok(oLayoutData, "LayoutData assigned to Field");
			assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
			assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 3, "Number of Fields used");

			var oDelimiter = aFields[1];
			oLayoutData = oDelimiter && oDelimiter.getLayoutData();
			assert.ok(oLayoutData, "LayoutData assigned");
			assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");

			oLayoutData = aFields[2] && aFields[2].getLayoutData();
			assert.ok(oLayoutData, "LayoutData assigned to Field");
			assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
			assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 3, "Number of Fields used");

			oDelimiter = aFields[3];
			oLayoutData = oDelimiter && oDelimiter.getLayoutData();
			assert.ok(oLayoutData, "LayoutData assigned");
			assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");

			var oLayoutData = aFields[4] && aFields[4].getLayoutData();
			assert.ok(oLayoutData, "LayoutData assigned to Field");
			assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData used");
			assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 3, "Number of Fields used");

			oFormContainer.removeDependent(oFormElement);
			oForm.destroy();
			fnDone();
		}, 0);
	});

	QUnit.module("display mode", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("one Field", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		oFormElement.addField(oField1);
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Text 1", "rendered text");

		sinon.spy(aFields[0], "setText");

		oRenderControl.invalidate(); // simulate invalidate bubbled by setText to Form
		sap.ui.getCore().applyChanges();
		assert.notOk(aFields[0].setText.called, "Text not determined again");
	});

	QUnit.test("two fields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Text 1 / Text 2", "rendered text");
	});

	QUnit.test("three fields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {description: "Text 2"});
		var oField3 = new Text("F3", {text: "Text 3"});
		oField2.getFormValueProperty = function() {return "description";};
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.insertField(oField3, 1);
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Text 1 / Text 3 / Text 2", "rendered text");
	});

	QUnit.test("three fields with async getFormattedValue", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		var oField3 = new Input("F3", {value: "Text 3"});
		oField1.getFormFormattedValue = function() {return "FormattedText 1";};
		var fnResolve;
		var oPromise = new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});
		oField2.getFormFormattedValue = function() {return oPromise;};
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.addField(oField3);
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "", "no rendered text before Promise resolved");

		fnResolve("FormattedText 2");

		var fnDone = assert.async();
		setTimeout(function() { // as Promise.all is executed late
			assert.equal(aFields[0].getText && aFields[0].getText(), "FormattedText 1 / FormattedText 2 / Text 3", "rendered text after Promise resolved");
			fnDone();
		}, 0);
	});

	QUnit.test("remove field", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.removeField(oField1);
		oField1.destroy();
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Text 2", "rendered text");
	});

	QUnit.test("change value of field", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Text("F2", {text: "Text 2"});
		var oField3 = new Input("F3", {description: "Text 3"});
		oField3.getFormValueProperty = function() {return "description";};
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.addField(oField3);
		var aFields = oFormElement.getFieldsForRendering();
		sap.ui.getCore().applyChanges();

		oField1.setValue("Test 1");
		oField2.setText("Test 2");
		oField3.setDescription("Test 3");

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Test 1 / Test 2 / Test 3", "rendered text");
	});

	QUnit.test("delimiter change", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		sap.ui.getCore().applyChanges();

		oFormElement.setDelimiter("*");
		var aFields = oFormElement.getFieldsForRendering();

		assert.equal(aFields.length, 1, "1 control rendered");
		assert.ok(aFields[0].isA("sap.m.Text"), "Text control rendered");
		assert.equal(aFields[0].getText && aFields[0].getText(), "Text 1 * Text 2", "rendered text");
	});

	QUnit.test("change mode", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("F1", {value: "Text 1"});
		var oField2 = new Input("F2", {value: "Text 2"});
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		sap.ui.getCore().applyChanges();

		var aFields = oFormElement.getFieldsForRendering();
		var oField = aFields[0];
		assert.ok(oField.isA("sap.m.Text"), "Text control rendered");
		assert.equal(oField.getText && oField.getText(), "Text 1 / Text 2", "rendered text");

		oFormElement._setEditable(true);
		sap.ui.getCore().applyChanges();

		aFields = oFormElement.getFieldsForRendering();
		var oDeleimiter = aFields[1];
		assert.ok(oField._bIsBeingDestroyed, "Text control destroyed;");
		assert.equal(aFields.length, 3, "3 controls rendered");
		assert.equal(aFields[0], oField1, "First field rendered");
		assert.ok(aFields[1] && aFields[1].isA("sap.m.Text"), "Delimiter rendered");
		assert.ok(aFields[2] && aFields[2] === oField2, "Second field rendered");

		oFormElement._setEditable(false);
		sap.ui.getCore().applyChanges();

		aFields = oFormElement.getFieldsForRendering();
		assert.ok(oField.isA("sap.m.Text"), "Text control rendered");
		assert.equal(oField.getText && oField.getText(), "Text 1 / Text 2", "rendered text");
		assert.ok(oDeleimiter._bIsBeingDestroyed, "oDeleimiter control destroyed;");
	});

});
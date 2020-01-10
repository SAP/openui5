/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/layout/form/FormElement",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/model/json/JSONModel"
	],
	function(
			qutils,
			FormElement,
			Label,
			Input,
			JSONModel
	) {
	"use strict";

	var oFormElement;

	function initTest() {
		oFormElement = new FormElement("FE1");
	}

	function afterTest() {
		if (oFormElement) {
			oFormElement.destroy();
			oFormElement = undefined;
		}
	}

	QUnit.module("Instance", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oFormElement, "FormElement is created");
	});

	QUnit.module("visible", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("isVisible / getVisible", function(assert) {
		assert.ok(oFormElement.getVisible(), "FormElement visible per default");
		assert.ok(oFormElement.isVisible(), "FormElement is visible for rendering");

		oFormElement.setVisible(false);

		assert.notOk(oFormElement.getVisible(), "FormElement not visible");
		assert.notOk(oFormElement.isVisible(), "FormElement not visible for rendering");
	});

	QUnit.module("Label", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("Label as control", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);

		assert.equal(oFormElement.getLabel(), oLabel, "Label control is assigned");
		assert.equal(oFormElement.getLabelControl(), oLabel, "Label control is used");
	});

	QUnit.test("Label as String", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();

		assert.equal(oFormElement.getLabel(), "Test", "Label string is assigned");
		assert.notOk(oFormElement.getAggregation("label") instanceof Label, "Label as text entered must not be an control in aggregation");
		assert.ok(oLabel, "Label control created");
		assert.ok(oLabel instanceof Label, "Label control is sap.m.Label");
		assert.equal(oLabel.getText(), "Test", "Label string is set on control");

	});

	QUnit.test("Label change String to String", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel1 = oFormElement.getLabelControl();
		oFormElement.setLabel("Test2");
		var oLabel2 = oFormElement.getLabelControl();

		assert.equal(oLabel1, oLabel2, "Label is reused");
		assert.equal(oLabel1.getText(), "Test2", "Label string is set on control");
	});

	QUnit.test("Label change String to Control", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();
		var oLabelId = oLabel.getId();
		var oLabel2 = new Label("L1", {text: "Test2"});
		oFormElement.setLabel(oLabel2);
		oLabel = oFormElement.getLabelControl();

		assert.notOk(sap.ui.getCore().byId(oLabelId), "internal Label is destroyed");
		assert.equal(oLabel, oLabel2, "Label control is used");
	});

	QUnit.test("Label change Control to String", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		oFormElement.setLabel("Test2");
		var oLabel2 = oFormElement.getLabelControl();

		assert.ok(sap.ui.getCore().byId("L1"), "old Label still exist");
		assert.equal(oLabel.getText(), "Test", "old Label has still old text");
		assert.equal(oLabel2.getText(), "Test2", "internal Label created and text set");

		oLabel.destroy();
	});

	QUnit.test("Label change Control to Control", function(assert) {
		var oLabel1 = new Label("L1", {text: "Test"});
		var oLabel2 = new Label("L2", {text: "Test2"});
		oFormElement.setLabel(oLabel1);
		oFormElement.setLabel(oLabel2);

		assert.ok(sap.ui.getCore().byId("L1"), "old Label still exist");
		assert.notOk(oLabel1.getParent(), "old label not longer assigned to element");
		assert.equal(oLabel1.getText(), "Test", "old Label has still old text");
		assert.equal(oLabel2.getText(), "Test2", "internal Label created and text set");

		oLabel1.destroy();
	});

	QUnit.test("destroyLabel as control", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		oFormElement.destroyLabel();

		assert.notOk(oFormElement.getLabel(), "no Label is assigned");
		assert.notOk(oFormElement.getLabelControl(), "no Label is used");
	});

	QUnit.test("destroyLabel as String", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();
		var oLabelId = oLabel.getId();
		oFormElement.destroyLabel();

		assert.notOk(oFormElement.getLabel(), "no Label is assigned");
		assert.notOk(oFormElement.getLabelControl(), "no Label is used");
		assert.notOk(sap.ui.getCore().byId(oLabelId), "internal Label is destroyed");
	});

	QUnit.test("_setEditable function", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		sinon.stub(oLabel, "getDomRef").returns(true); // fake Label is rendered
		sinon.spy(oLabel, "invalidate");

		assert.notOk(oFormElement.getProperty("_editable"), "Default: not editable");
		oFormElement._setEditable(true);

		assert.ok(oFormElement.getProperty("_editable"), "Default: editable set");
		assert.ok(oLabel.invalidate.called, "Label invalidated");

		oLabel.getDomRef.restore();
	});

	QUnit.test("isDisplayOnly with Label control", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		oFormElement._setEditable(true);

		assert.notOk(oLabel.isDisplayOnly(), "Label is not display only");

		oFormElement._setEditable(false);
		assert.ok(oLabel.isDisplayOnly(), "Label is display only");

		oLabel.setDisplayOnly(false);
		assert.notOk(oLabel.isDisplayOnly(), "Label is not display only, as set on Label");
	});

	QUnit.test("isDisplayOnly with Label as string", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();
		oFormElement._setEditable(true);

		assert.notOk(oLabel.isDisplayOnly(), "Label is not display only");

		oFormElement._setEditable(false);
		assert.ok(oLabel.isDisplayOnly(), "Label is display only");
	});

	QUnit.test("wrapping", function(assert) {
		var oLabel = new Label("L1", {text: "Label"});
		oFormElement.setLabel(oLabel);
		assert.ok(oLabel.isWrapping(), "Label gets wrapping as default");

		oLabel.setWrapping(false);
		assert.notOk(oLabel.isWrapping(), "Label gets it's own wrapping value");
		oLabel.destroy();

		oFormElement.setLabel("Label");
		oLabel = oFormElement.getLabelControl();
		assert.ok(oLabel.isWrapping(), "Label gets wrapping as default");
	});

	QUnit.test("destroy with Label as string", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();
		var oLabelId = oLabel.getId();

		oFormElement.destroy();
		oFormElement = undefined;
		assert.notOk(sap.ui.getCore().byId(oLabelId), "internal Label is destroyed");
	});

	QUnit.module("Fields", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("addField", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		var aFields = oFormElement.getFields();

		assert.equal(aFields.length, 2, "2 Fields added");
		assert.deepEqual(aFields, oFormElement.getFieldsForRendering(), "getFieldsForRendering returns same Fields");
		assert.equal(aFields[0].getId(), "I1", "first Field");
		assert.equal(aFields[1].getId(), "I2", "second Field");
		assert.equal(oFormElement.indexOfField(oField2), 1, "Index of Field");
		assert.equal(oLabel.getLabelForRendering(), "I1", "Label points to first field");
		assert.notOk(oLabel.isRequired(), "Label not required");

		sinon.stub(oLabel, "getDomRef").returns(true); // fake Label is rendered
		sinon.spy(oLabel, "invalidate");
		oField2.setRequired(true);
		assert.ok(oLabel.isRequired(), "Label is required");
		assert.ok(oLabel.invalidate.called, "Label invalidated");
		oLabel.getDomRef.restore();

		oFormElement.setLabel();
		assert.notOk(oLabel.isRequired(), "Label not required");
		oLabel.destroy();
	});

	QUnit.test("insertField", function(assert) {
		oFormElement.setLabel("Test");
		var oLabel = oFormElement.getLabelControl();
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oFormElement.insertField(oField1, 0);
		oFormElement.insertField(oField2, 0);
		var aFields = oFormElement.getFields();

		assert.equal(aFields.length, 2, "2 Fields inserted");
		assert.deepEqual(aFields, oFormElement.getFieldsForRendering(), "getFieldsForRendering returns same Fields");
		assert.equal(aFields[0].getId(), "I2", "first Field");
		assert.equal(aFields[1].getId(), "I1", "second Field");
		assert.equal(oFormElement.indexOfField(oField2), 0, "Index of Field");
		assert.equal(oLabel.getLabelForRendering(), "I2", "Label points to first field");
		assert.notOk(oLabel.isRequired(), "Label not required");

		sinon.stub(oLabel, "getDomRef").returns(true); // fake Label is rendered
		sinon.spy(oLabel, "invalidate");
		oField2.setRequired(true);
		assert.ok(oLabel.isRequired(), "Label is required");
		assert.ok(oLabel.invalidate.called, "Label invalidated");

		oLabel.getDomRef.restore();
	});

	QUnit.test("removeField", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		var oRemoved = oFormElement.removeField(oField1);
		var aFields = oFormElement.getFields();

		assert.equal(oRemoved, oField1, "Field removed");
		assert.equal(aFields.length, 1, "1 Fields assigned");
		assert.deepEqual(aFields, oFormElement.getFieldsForRendering(), "getFieldsForRendering returns same Fields");
		assert.equal(aFields[0].getId(), "I2", "first Field");
		assert.equal(oLabel.getLabelForRendering(), "I2", "Label points to first field");

		oField1.setRequired(true);
		assert.notOk(oLabel.isRequired(), "Label not required");
		oField1.destroy();

		sinon.stub(oLabel, "getDomRef").returns(true); // fake Label is rendered
		sinon.spy(oLabel, "invalidate");
		oField2.setRequired(true); // to test Field2 is still observed
		assert.ok(oLabel.invalidate.called, "Label invalidated");

		oLabel.getDomRef.restore();
	});

	QUnit.test("removeAllFields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		var aRemoved = oFormElement.removeAllFields();
		var aFields = oFormElement.getFields();

		assert.equal(aRemoved.length, 2, "2 Fields removed");
		assert.equal(aFields.length, 0, "no Fields assigned");
		assert.deepEqual(aFields, oFormElement.getFieldsForRendering(), "getFieldsForRendering returns same Fields");
		assert.notOk(oLabel.getLabelForRendering(), "Label points to no field");

		oField1.setRequired(true);
		assert.notOk(oLabel.isRequired(), "Label not required");
		oField1.destroy();
		oField2.destroy();

		oLabel.setRequired(true);
		assert.ok(oLabel.isRequired(), "Label is required, as set on Label");
	});

	QUnit.test("destroyFields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("I1");
		var oField2 = new Input("I2");
		oFormElement.addField(oField1);
		oFormElement.addField(oField2);
		oFormElement.destroyFields();
		var aFields = oFormElement.getFields();

		assert.equal(aFields.length, 0, "no Fields assigned");
		assert.deepEqual(aFields, oFormElement.getFieldsForRendering(), "getFieldsForRendering returns same Fields");
		assert.notOk(oLabel.getLabelForRendering(), "Label points to no field");
		assert.notOk(sap.ui.getCore().byId("I1"), "Field1 destroyed");
		assert.notOk(sap.ui.getCore().byId("I2"), "Field2 destroyed");
	});

	QUnit.test("updateFields", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oModel = new JSONModel({
			fields:[{value: "Field 1", required: false},
			        {value: "Field 2", required: false},
			        {value: "Field 3", required: true}]
		});
		oFormElement.setModel(oModel);

		var oFieldTemplate = new Input();
		oFieldTemplate.bindProperty("value", "value").bindProperty("required", "required");
		oFormElement.bindAggregation("fields", "/fields", oFieldTemplate);
		var aFields = oFormElement.getFields();

		assert.equal(aFields.length, 3, "3 Fields assigned");
		assert.equal(oLabel.getLabelForRendering(), aFields[0].getId(), "Label points to first field");
		assert.ok(oLabel.isRequired(), "Label is required");

		oModel.oData.fields = [{value: "Field 2", required: false},
		                       {value: "Field 3", required: false}];
		oModel.checkUpdate();

		aFields = oFormElement.getFields();

		assert.equal(aFields.length, 2, "2 Fields assigned");
		assert.equal(oLabel.getLabelForRendering(), aFields[0].getId(), "Label points to first field");
		assert.notOk(oLabel.isRequired(), "Label is not required");
	});

	QUnit.module("other functions", {
		beforeEach: initTest,
		afterEach: afterTest
	});

	QUnit.test("enhanceAccessibilityState", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var oField1 = new Input("I1");
		oFormElement.addField(oField1);

		var mAriaProps = oFormElement.enhanceAccessibilityState(oField1, {});
		assert.equal(mAriaProps["labelledby"], "L1", "aria-labelledby set to Label");

		mAriaProps = oFormElement.enhanceAccessibilityState(oField1, {labelledby: "X"});
		assert.equal(mAriaProps["labelledby"], "L1 X", "aria-labelledby set to Label");
	});

	QUnit.test("onLayoutDataChange", function(assert) {
		var oLabel = new Label("L1", {text: "Test"});
		oFormElement.setLabel(oLabel);
		var bCalled = false;
		var oParent = {
				onLayoutDataChange: function() {
					bCalled = true;
				}
		};

		// simulate FormContainer
		sinon.stub(oFormElement, "getParent").callsFake(function() {return oParent;});

		oFormElement.onLayoutDataChange();
		assert.ok(bCalled, "onLayoutDataChange called on parent");
	});

	QUnit.test("getRenderedDomRef", function(assert) {
		assert.notOk(oFormElement.getRenderedDomRef(), "no DOMRef as not asigned to Container");

		var oParent = {
				getElementRenderedDomRef: function() {
					return "X";
				}
		};

		// simulate FormContainer
		sinon.stub(oFormElement, "getParent").callsFake(function() {return oParent;});

		assert.equal(oFormElement.getRenderedDomRef(), "X", "Value returned from Container");
	});

});
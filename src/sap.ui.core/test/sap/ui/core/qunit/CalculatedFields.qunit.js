/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Float",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/table/Column",
	"sap/ui/table/Table"
], function(
	JSONModel,
	Float,
	TimeOfDay,
	Label,
	Input,
	Column,
	Table
) {
	"use strict";

	//add divs for control tests
	var oText = document.createElement("div");
	oText.setAttribute("id", "txt");
	document.body.appendChild(oText);
	var oText2 = document.createElement("div");
	oText2.setAttribute("id", "txt2");
	document.body.appendChild(oText2);
	var oTable = document.createElement("div");
	oTable.setAttribute("id", "table");
	document.body.appendChild(oTable);

	var oModel;
	var oModel2;
	var testData;
	var testData2;
	var oTxt;

	function setup(){
		if (oTxt) {
			oTxt.destroy();
		}

		testData = {
			"teamMembers":[
				{"firstName":"Andreas", "lastName":"Klark", "gender":"male"},
				{"firstName":"Peter", "lastName":"Miller", "gender":"male"},
				{"firstName":"Gina", "lastName":"Rush", "gender":"female"},
				{"firstName":"Steave", "lastName":"Ander", "gender":"male"},
				{"firstName":"Michael", "lastName":"Spring", "gender":"male"},
				{"firstName":"Marc", "lastName":"Green", "gender":"male"},
				{"firstName":"Frank", "lastName":"Wallace", "gender":"male"}
			],
			"values":
				[
				 {"value" : 3.55},
				 {"value" : 5.322},
				 {"value" : 222.322},
				 {"value" : "13:47:26"}
			]
		};

		testData2 = {
			"values": [
				{"value" : 7.55},
				{"value" : 555554.32241},
				{"value" : 2.418}
			]
		};

		oModel = new JSONModel();
		oModel.setData(testData);
		oModel2 = new JSONModel();
		oModel2.setData(testData2);
		sap.ui.getCore().setModel(oModel);
		sap.ui.getCore().setModel(oModel2, "model2");

		oTxt = new Input();
		oTxt.placeAt("txt");
	}

	QUnit.test("Binding syntax tests", function(assert) {
		setup();

		oTxt.bindValue("/teamMembers/4/firstName");
		assert.equal(oTxt.getValue(), "Michael", "normal syntax 1");
		oTxt.unbindProperty("value");

		oTxt.bindValue({ path: "/teamMembers/4/firstName"});
		assert.equal(oTxt.getValue(), "Michael", "normal syntax 2");
		oTxt.unbindProperty("value");

		oTxt.bindValue({ path: "/teamMembers/4/firstName",
			parts: [
				{path: "/teamMembers/6/firstName"},
				{path: "/teamMembers/6/lastName"}
			]
		});
		assert.equal(oTxt.getValue(), "Frank Wallace", "calculated fields syntax 1");
		oTxt.unbindProperty("value");

		oTxt.bindValue({
			parts: [
				"/teamMembers/2/firstName",
				"/teamMembers/0/firstName",
				"/teamMembers/2/lastName"
			]
		});
		assert.equal(oTxt.getValue(), "Gina Andreas Rush", "calculated fields syntax 2");
	});

	QUnit.test("Binding syntax constructor tests", function(assert) {
		setup();

		oTxt = new Input({
			value: {
				parts: [
					{path: "/teamMembers/6/firstName"},
					{path: "/teamMembers/6/lastName"}
				]
			}
		});

		oTxt.placeAt("txt");
		assert.equal(oTxt.getValue(), "Frank Wallace", "calculated fields constructor syntax 1");

		oTxt.destroy();
		oTxt = new Input({
			value: {
				parts: [
					"/teamMembers/2/firstName",
					"/teamMembers/0/firstName",
					"/teamMembers/2/lastName"
				]
			}
		});
		oTxt.placeAt("txt");
		assert.equal(oTxt.getValue(), "Gina Andreas Rush", "calculated fields constructor syntax 2");
	});

	QUnit.test("Composite Binding tests", function(assert) {
		setup();

		oTxt.bindValue({
			path: "/teamMembers/4/firstName",
			parts: [
				{path: "/teamMembers/6/firstName"},
				{path: "/teamMembers/6/lastName"},
				{path: "/teamMembers/3/lastName"},
				{path: "/values/1/value", type: new Float()}
			]
		});

		var oComp = oTxt.getBinding("value");
		assert.ok(oComp);
		assert.equal(oComp.getType(), null, "Type should be null");
		assert.equal(oComp.getPath(), null, "Path should be null");
		assert.equal(oComp.getModel(), null, "Model should be null");
		assert.equal(oComp.getContext(), null, "Context should be null");
		assert.equal(oComp.getBindings().length, 4, "Bindings check");
		assert.equal(oComp.getBindings()[0].getValue(), "Frank", "Bindings value check");
		assert.equal(oComp.getBindings()[1].getValue(), "Wallace", "Bindings value check");
		assert.equal(oComp.getBindings()[2].getValue(), "Ander", "Bindings value check");
		assert.equal(oComp.getBindings()[3].getValue(), 5.322, "Bindings value check");

		assert.equal(oComp.getBindings()[3].getExternalValue(), "5.322", "Bindings value check");
	});

	QUnit.test("Calculated fields model tests wrong path", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/teamMembers/6/firstName"},
				{path: "/tea/5/xyz"}
			]
		});
		assert.equal(oTxt.getValue(), "Frank ", "calculated fields wrong path");
	});

	QUnit.test("Calculated fields model custom formatter", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/teamMembers/6/firstName"},
				{path: "/teamMembers/6/lastName"},
				{path: "/teamMembers/5/lastName"}
			],
			formatter: function(oV1, oV2, oV3){
				assert.equal(oV3, "Green", "name check");
				return "Dear " + oV1 + " " + oV2;
			}
		});

		assert.equal(oTxt.getValue(), "Dear Frank Wallace", "calculated fields test custom formatter");
	});

	QUnit.test("Calculated fields model tests wrong path", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/teamMembers/6/firstName"},
				{path: "/teamMembers/6/lastName"}
			]
		});
		assert.equal(oTxt.getValue(), "Frank Wallace", "calculated fields syntax 1");
	});

	QUnit.test("Calculated fields multi model tests", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/values/1/value"},
				{path: "model2>/values/1/value"},
				{path: "model2>/values/2/value"}
			],
			formatter: function(oV1, oV2, oV3){
				return oV1 + oV2 + oV3;
			}
		});

		assert.equal(oTxt.getValue(), "555562.06241" , "calculated fields multi model bindings ");
	});

	QUnit.test("Calculated fields multi model tests wrong path", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/values/1/value"},
				{path: "model2>/values/200/value"},
				{path: "model2>/values/2/value"}
			],
			formatter: function(oV1, oV2, oV3){
				assert.ok(!oV2, "value should be undefined");
				return oV1 + oV3;
			}
		});

		assert.equal(oTxt.getValue(), "7.74" , "calculated fields multi model bindings ");
	});

	QUnit.test("Calculated fields with types and raw values", function(assert) {
		setup();
		oTxt.bindValue({
			parts: [
				{path: "/values/1/value", type: new Float()},
				{path: "model2>/values/1/value", type: new Float()},
				{path: "model2>/values/2/value", type: new Float()}
			],
			formatter: function(oV1, oV2, oV3){
				return oV1 + oV2 + oV3; // strings are added
			}
		});

		assert.equal(oTxt.getValue(), "5.322555,554.322412.418" , "calculated fields formatter");
		oTxt.unbindProperty("value");

		oTxt.bindValue({
			parts: [
				{path: "/values/1/value", type: new Float()},
				{path: "model2>/values/1/value"},
				{path: "model2>/values/2/value", type: new Float()},
				{path: "/teamMembers/6/lastName"}
			],
			formatter: function(oV1, oV2, oV3){
				return oV1 + oV2 + oV3; // raw values
			},
			useRawValues : true
		});

		assert.equal(oTxt.getValue(), "555562.06241" , "calculated fields formatter raw values");
	});

	QUnit.test("Calculated fields with types and native values", function(assert) {
		setup();
		assert.expect(2);

		oTxt.bindValue({
			parts: [
				{path: "/values/3/value", type: new TimeOfDay()},
				{path: "model2>/values/1/value", type: new Float()}
			],
			formatter: function(oV1, oV2){
				assert.ok(oV1 instanceof Date, "The value is parsed with the model format");
				assert.strictEqual(oV2, 555554.32241, "The raw value is returned");
			},
			useInternalValues : true
		});

		oTxt.getValue();
	});
	QUnit.module("Table", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			this.clock.restore();
		}
	});

	QUnit.test("Calculated fields with table", function(assert) {
		setup();
		 var oTable = new Table({
			columns: [
				new Column({
					label: new Label({ text: "name" }),
						template: new Input({ value: {
							parts: [
								{path: "firstName"},
								{path: "lastName"}
							],
							formatter: function (firstName, lastName) {
								if (firstName && lastName) {
									return "Dear " + firstName + " " + lastName;
								}
								return null;
							}
						}})
					})
				]
		});

		oTable.bindRows("/teamMembers");
		oTable.placeAt("table");

		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);
		var counter = 0;

		oTable.getRows().forEach(function(oRow, i){
			if (oRow.getCells()[0].getValue()) {
				assert.equal(oRow.getCells()[0].getValue(), "Dear " + testData.teamMembers[i].firstName + " " + testData.teamMembers[i].lastName, "check names");
				counter++;
			}
		});
		assert.equal(counter, 7, "table entries");
	});
});
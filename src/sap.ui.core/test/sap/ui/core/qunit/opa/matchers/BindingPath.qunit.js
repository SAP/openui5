/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/BindingPath',
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/ui/model/json/JSONModel'
], function (BindingPath, List, StandardListItem, JSONModel) {
	"use strict";

	function generateJSONModel() {
		// Arrange
		// Create JSON-Data
		var oJSONData = [
			{
				name: "Barbara"
			},
			{
				name: "Gerry"
			},
			{
				name: "Susan"
			}
		];
		return new JSONModel(oJSONData);
	}

	QUnit.module("Using two models at the same time", {

		beforeEach: function () {
			this.oModel = generateJSONModel.call(this);
			this.oModel2 = generateJSONModel.call(this);
			this.oBindingPath = new BindingPath();
			// Create new control
			this.oList = new List();
			this.oList.setModel(this.oModel, "JSONModel");
			this.oList.setModel(this.oModel2);
			this.oList.bindAggregation("items", {
				path: "JSONModel>/",
				template: new StandardListItem()
			});
			this.oSpy = sinon.spy(this.oBindingPath._oLogger, "debug");
		},

		afterEach: function () {
			// Cleanup
			this.oModel.destroy();
			this.oModel2.destroy();
			this.oList.destroy();
			this.oBindingPath.destroy();
			this.oSpy.restore();
		}
	});

	QUnit.test("Should throw an error on an incorrect binding path", function (assert) {
		var oErrorSpy = sinon.spy(this.oBindingPath._oLogger, "error");

		this.oBindingPath.setPath("");
		this.oBindingPath.isMatching(this.oList.getItems()[0]);

		sinon.assert.calledWithMatch(oErrorSpy, /The binding path property is required but not defined/);
		oErrorSpy.restore();
	});

	QUnit.test("Should not match an incorrect binding path despite of using correct model name", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/1");
		this.oBindingPath.setModelName("JSONModel");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(!bResult, "Did not match because the binding path is incorrect");
		sinon.assert.calledWithMatch(this.oSpy, "has a binding context for the model JSONModel but its binding path is /0 when it should be /1");
	});

	QUnit.test("Should match an correct model name and binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/0");
		this.oBindingPath.setModelName("JSONModel");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(bResult, "Matched because the binding path and model name are correct");
	});

	QUnit.test("Should not match an incorrect model name despite of using correct binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/0");
		this.oBindingPath.setModelName("Model");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(!bResult, "Did not match because the model name is incorrect");
		sinon.assert.calledWithMatch(this.oSpy, /has no binding context for the model Model/);
	});

	QUnit.test("Should not match no model name despite of using correct binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/0");
		this.oBindingPath.setModelName("");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(!bResult, "Did not match because no model name was set");
	});


	QUnit.module("Using an unnamed model", {

		beforeEach: function () {
			this.oModel = generateJSONModel.call(this);
			this.oBindingPath = new BindingPath();
			// Create new control
			this.oList = new List();
			this.oList.setModel(this.oModel);
			this.oList.bindAggregation("items", {
				path: "/",
				template: new StandardListItem()
			});
		},

		afterEach: function () {
			// Cleanup
			this.oModel.destroy();
			this.oList.destroy();
		}
	});

	QUnit.test("Should not match an incorrect model name despite of using correct binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/0");
		this.oBindingPath.setModelName("Model");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(!bResult, "Did not match because the model name is incorrect");
	});

	QUnit.test("Should match a correct binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/0");
		this.oBindingPath.setModelName("");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(bResult, "Matched because the binding path is correct");
	});

	QUnit.test("Should not match an incorrect binding path", function (assert) {
		// System under Test
		this.oBindingPath.setPath("/");
		this.oBindingPath.setModelName("");
		var bResult = this.oBindingPath.isMatching(this.oList.getItems()[0]);
		// Assert
		assert.ok(!bResult, "Did not match because the biding path is incorrect");
	});

});

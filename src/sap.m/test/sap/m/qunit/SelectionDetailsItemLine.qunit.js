/*global QUnit */
sap.ui.define([
	"sap/m/SelectionDetailsItemLine",
	"sap/m/SelectionDetailsListItemRenderer"
], function(SelectionDetailsItemLine, SelectionDetailsListItemRenderer) {
	"use strict";

	QUnit.module("Default values", {
		beforeEach: function() {
			this.oLine = new SelectionDetailsItemLine();
		},
		afterEach: function() {
			this.oLine.destroy();
			this.oLine = null;
		}
	});

	QUnit.test("Default value of property unit", function(assert) {
		assert.equal(this.oLine.getUnit(), "", "Default value is correct");
	});

	QUnit.test("Default value of property displayValue", function(assert) {
		assert.equal(this.oLine.getDisplayValue(), "", "Default value is correct");
	});

	QUnit.test("Default value of property lineMarker", function (assert) {
		assert.equal(this.oLine.getLineMarker(), "", "Default value should be an empty string");
	});

	QUnit.module("Function _getValueToRender", {
		beforeEach: function () {
			this.oItemLine = new SelectionDetailsItemLine({
				label: "someLabel",
				value: "someValue"
			});
		},
		afterEach: function () {
			this.oItemLine.destroy();
			this.oItemLine = null;
		}
	});

	QUnit.test("Accepts value type string", function(assert) {
		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, "someValue","Returns string for value of type string");
	});

	QUnit.test("Accepts value type int", function(assert) {
		//Arange
		var iValue = 42;
		this.oItemLine.setValue(iValue);

		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, iValue.toString(),"Returns string for value of type int");
	});

	QUnit.test("Accepts value type float", function(assert) {
		//Arange
		var fValue = 66.6;
		this.oItemLine.setValue(fValue);

		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, fValue.toString(),"Returns string for value of type float");
	});

	QUnit.test("Accepts value type int", function(assert) {
		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, "someValue","Returns string for value of type string");
	});

	QUnit.test("Accepts value type object containing day only", function(assert) {
		//Arrange
		var sValueFromObject;
		this.oItemLine.setValue({
			day: "someDay",
			time: null
		});

		//Act
		sValueFromObject = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValueFromObject, "someDay", "Returns string containing day");
	});

	QUnit.test("Accepts value type object containing time only", function(assert) {
		//Arrange
		var sValueFromObject;
		this.oItemLine.setValue({
			day: null,
			time: "someTime"
		});

		//Act
		sValueFromObject = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValueFromObject, "someTime", "Returns string containing time");
	});

	QUnit.test("Accepts value type object containing day and time", function(assert) {
		//Arrange
		var sValueFromObject;
		this.oItemLine.setValue({
			day: "someDay",
			time: "someTime"
		});

		//Act
		sValueFromObject = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValueFromObject, "someTime someDay", "Returns string containing time and day");
	});

	QUnit.test("Does not accept value type bool", function(assert) {
		//Arange
		var bValue = true;
		this.oItemLine.setValue(bValue);

		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, "","Returns empty string for value of type bool");
	});

	QUnit.test("Does not accept value type function", function(assert) {
		//Arange
		this.oItemLine.setValue(this.oItemLine.setValue);

		//Act
		var sValue = this.oItemLine._getValueToRender();

		//Assert
		assert.equal(sValue, "","Returns empty string for value of type function");
	});

	QUnit.module("SelectionDetailsListItemRenderer _isValidSvg");

	QUnit.test("Plain svg", function (assert) {
		assert.ok(SelectionDetailsListItemRenderer._isValidSvg("<svg />"), "Plain svg should be accepted.");
	});

	QUnit.test("Correct svg", function (assert) {
		var sValidSvg = "<svg width=10px height=10px focusable = false><path d = 'M-5,-5L5,-5L5,5L-5,5Z' fill = '#5899da' transform = 'translate(5,5)'></path></svg>",
			sValidSvg2 = "<svg width=10px height=10px focusable = false><path d = 'M-5,0 A5,5 0 1,0 5,0 A5,5 0 1,0 -5,0z' fill = '#5899da' transform = 'translate(5,5)'></path></svg>",
			sValidSvg3 = "<svg width=20px height=10px focusable = false><line x1 = '0' y1='5' x2 = '20' y2 = '5' stroke-width = '2'  stroke = '#5899da'> </line><path d = 'M-3,0 A3,3 0 1,0 3,0 A3,3 0 1,0 -3,0z' fill = '#5899da' transform = 'translate(10,5)'></path></svg>",
			fnIsValidSvg = SelectionDetailsListItemRenderer._isValidSvg;

		assert.ok(fnIsValidSvg(sValidSvg), sValidSvg + " should be valid.");
		assert.ok(fnIsValidSvg(sValidSvg2), sValidSvg2 + " should be valid.");
		assert.ok(fnIsValidSvg(sValidSvg3), sValidSvg3 + " should be valid.");
	});

	QUnit.test("Incorrect svg", function (assert) {
		var aInvalidSvgs = [
					"<svg",
					"",
					"<svg><image width=\"500\" height=\"500\" xlink:href=\"img1.jpg\" opacity=\"0.35\" /></svg>",
					"<svg onload='alert(\"I am a very bad code.\");' />",
					"<svg /><script>alert('I am a very bad code.');</scr" + "ipt>",
					"<a href='url.html'>Link</a>"
				],
				fnIsValidSvg = SelectionDetailsListItemRenderer._isValidSvg;

		aInvalidSvgs.forEach(function (sSvg) {
			assert.notOk(fnIsValidSvg(sSvg), sSvg + " shouldn't be valid.");
		});
	});

});
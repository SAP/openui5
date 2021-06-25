/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/support/supportRules/util/EvalUtils"
], function (EvalUtils) {
	"use strict";

	QUnit.module("EvalUtils.js methods");

	QUnit.test("#evalFunction when syntax is correct", function (assert) {
		// arrange
		var oStub = sinon.stub(window, "eval");

		// act
		EvalUtils.evalFunction("function () {}");

		// assert
		assert.ok(true, "No error thrown when function syntax is correct");

		// clean up
		oStub.restore();
	});

	QUnit.test("#evalFunction when syntax is incorrect", function (assert) {
		// arrange
		var oStub = sinon.stub(window, "eval").throws();

		// assert
		assert.throws(function () {
			EvalUtils.evalFunction("some invalid function () {}");
		}, "Error should be thrown when function syntax is incorrect");

		// clean up
		oStub.restore();
	});
});

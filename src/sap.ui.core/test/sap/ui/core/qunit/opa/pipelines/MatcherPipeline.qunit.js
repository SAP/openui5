/*global QUnit sinon */
sap.ui.define([
	"sap/ui/test/pipelines/MatcherPipeline",
	"sap/base/Log"
], function(MatcherPipeline, Log){
	"use strict";

	QUnit.module("processing", {
		beforeEach: function () {
			this.fnMatcher = sinon.stub().returns(true);
			this.oPipeline = new MatcherPipeline();
			this.oDebugSpy = sinon.spy(Log, "debug");
		},
		afterEach: function () {
			this.oDebugSpy.restore();
		}
	});

	QUnit.test("Should process a single matcher", function(assert) {
		// Arrange
		var oControlStub = {};

		// Act
		var oResult = this.oPipeline.process({
			control: oControlStub,
			matchers: this.fnMatcher
		});

		// Assert
		assert.strictEqual(oResult, oControlStub, "Returned the control passed into the pipeline");
		sinon.assert.calledWith(this.fnMatcher, oControlStub);
		sinon.assert.calledWith(this.oDebugSpy, "1 out of 1 controls met the matchers pipeline requirements");
	});

	QUnit.test("Should process multiple matchers", function(assert) {
		// Arrange
		var sTruthyString = "foo",
			oMatcher = {
				isMatching: function () {
					return sTruthyString;
				}
			},
			fnThirdMatcher = this.stub().returns(true);

		// Act
		var sResult = this.oPipeline.process({
			control: {},
			matchers: [this.fnMatcher, oMatcher, fnThirdMatcher]
		});

		// Assert
		assert.strictEqual(sResult, sTruthyString, "Returned the string of the second matcher");
		sinon.assert.calledWith(fnThirdMatcher, sTruthyString);
		sinon.assert.calledWith(this.oDebugSpy, "Pipeline input control '' was transformed to 'foo'");
		sinon.assert.calledWith(this.oDebugSpy, "1 out of 1 controls met the matchers pipeline requirements");
	});

	QUnit.test("Should return false, if a control is not matching", function (assert) {
		var fnFalsyMatcher = this.stub().returns(false);
		var bResult = this.oPipeline.process({
			control: {},
			matchers: [fnFalsyMatcher]
		});

		assert.ok(!bResult, "False was returned");
		sinon.assert.calledWith(this.oDebugSpy, "0 out of 1 controls met the matchers pipeline requirements");
	});

	QUnit.test("Should pass nothing to the first matcher if undefined is given as control", function (assert) {

		// Act
		var oResult = this.oPipeline.process({
			matchers: this.fnMatcher
		});

		// Assert
		assert.strictEqual(oResult, undefined, "nothing was returned");
		sinon.assert.calledWith(this.fnMatcher);
	});

});

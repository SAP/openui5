/*global QUnit, sinon */
sap.ui.define([
	"../utils/loggerInterceptor",
	"sap/m/Button",
	"sap/ui/test/pipelines/MatcherPipeline",
	"sap/m/Image"
], function (loggerInterceptor, Button, MatcherPipeline, Image) {
	"use strict";

	// loadAndIntercept also loads the module.
	// I cannot load it with the require above because i need to spy during the loading
	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test.matchers.Properties");
	var Properties = sap.ui.test.matchers.Properties;

	QUnit.module("Properties", {
		beforeEach : function(){
			this.oButton = new Button("myButton" ,{
				text : "text to test",
				enabled : true
			});
			this.oImage = new Image({src: "./../../test-resources/sap/ui/HT[-10$40].jpg"});
			this.fnErrorStub = sinon.stub(oLogger, "error", function() {});
			this.fnDebugStub = sinon.stub(oLogger, "debug", function() {});
		},
		afterEach : function(){
			this.oButton.destroy();
			this.oImage.destroy();
			this.fnErrorStub.restore();
			this.fnDebugStub.restore();
		}
	});

	QUnit.test("With existing multiple properties", function(assert) {
		var bResult = new Properties({
			text : "text to test",
			enabled : true
		})(this.oButton);
		assert.ok(bResult, "Should match equal properties");
		sinon.assert.notCalled(this.fnDebugStub);

		bResult = new Properties({
			text : "text to test",
			enabled : false
		})(this.oButton);
		assert.ok(!bResult, "Should not match non-equal properties");
		sinon.assert.calledWith(this.fnDebugStub,
			"Control 'Element sap.m.Button#myButton' property 'enabled' has value 'true' but should have value 'false'");
		sinon.assert.notCalled(this.fnErrorStub);
	});

	QUnit.test("Should log only once if multiple properties do not match", function (assert) {
		var bResult = new Properties({
			text: "foo",
			enabled: "false"
		})(this.oButton);
		assert.ok(!bResult, "Should not match non-equal properties");

		sinon.assert.calledOnce(this.fnDebugStub);
		sinon.assert.calledWith(this.fnDebugStub,
			"Control 'Element sap.m.Button#myButton' property 'text' has value 'text to test' but should have value 'foo'");
	});

	QUnit.test("With non-existing properties", function(assert) {
		var bResult = new Properties({
			text : "text to test",
			notExistingProperty : "not existing value"
		})(this.oButton);
		assert.strictEqual(bResult, false, "Should not match non-existing properties");
		sinon.assert.calledWith(this.fnErrorStub, "Control 'Element sap.m.Button#myButton' does not have a property 'notExistingProperty'");
	});

	QUnit.test("With regexp", function(assert) {
		var bResult = new Properties({
			text : /test/i
		})(this.oButton);
		assert.strictEqual(bResult, true, "Should match regexp");
	});

	QUnit.test("Should match in the pipeline", function (assert) {
		var oMatcherPipeline = new MatcherPipeline();

		var bPipleineResult = oMatcherPipeline.process({
			matchers: new Properties({
				text: "text to test",
				enabled : true
			}),
			control: this.oButton
		});

		assert.ok(bPipleineResult, "Should match equal properties");
	});

	QUnit.test("Should match with regexp - declarative", function(assert) {
		var bResult = new Properties({
			src: {
				regex: {
					source: "HT\\[\\-10\\$40\\]\\.jpg"
				}
			}
		})(this.oImage);
		assert.ok(bResult, "Should match regexp");
	});

});

/*global QUnit */
sap.ui.define([
	"sap/ui/test/pipelines/MatcherPipeline",
	"sap/ui/test/matchers/Properties",
	"sap/m/Image",
	"sap/m/Button"
], function (MatcherPipeline, Properties, Image, Button) {
	"use strict";

	QUnit.module("Properties", {
		beforeEach : function(){
			this.oButton = new Button("myButton" ,{
				text : "text to test",
				enabled : true
			});
			this.oImage = new Image({src: "./../../test-resources/sap/ui/HT[-10$40].jpg"});
		},
		afterEach : function(){
			this.oButton.destroy();
			this.oImage.destroy();
		}
	});

	QUnit.test("With multiple matching properties", function(assert) {
		var bResult = new Properties({
			text : "text to test",
			enabled : true
		})(this.oButton);
		assert.ok(bResult, "Should match properties with same values");

		bResult = new Properties({
			text : "text to test",
			enabled : false
		})(this.oButton);
		assert.ok(!bResult, "Should not match when one value is different");
	});

	QUnit.test("With non-existing properties", function(assert) {
		var bResult = new Properties({
			text : "text to test",
			notExistingProperty : "not existing value"
		})(this.oButton);
		assert.strictEqual(bResult, false, "Should not match non-existing properties");
	});

	QUnit.test("With regexp", function(assert) {
		var bResult = new Properties({
			text : /test/i
		})(this.oButton);
		assert.strictEqual(bResult, true, "Should match regexp");
	});

	QUnit.test("Should match when value contains binding symbols", function(assert) {
		this.oButton.setText("{foo");
		var bResult = new Properties({
			text: "{foo"
		})(this.oButton);
		assert.strictEqual(bResult, true);
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

/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/gherkin/StepDefinitions"
], function(StepDefinitions) {
	"use strict";

	QUnit.module("Step Definitions Tests", {

		beforeEach : function() {
			this.stepDefs = new StepDefinitions();
		}

	});

	QUnit.test("Smoke test to register a step", function(assert) {
		this.stepDefs.register(/^some regex$/i, function() {});
		assert.ok(this.stepDefs._aDefinitions.length === 1, "Smoke test to register a step");
	});

	QUnit.test("Given no registered steps, cannot match", function(assert) {
		assert.deepEqual(this.stepDefs._generateTestStep({text: "hello world"}), {
			isMatch: false,
			text: "(NOT FOUND) hello world"
		}, "Given no registered steps, cannot match");
	});

	QUnit.test("Given three registered steps, when we try a bad step name, then cannot match", function(assert) {

		var regex1 = /^hello world$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		var regex2 = /^goodbye world$/i;
		var function2 = function() {};
		this.stepDefs.register(regex2, function2);

		var regex3 = /^water world$/i;
		var function3 = function() {};
		this.stepDefs.register(regex3, function3);

		assert.deepEqual(this.stepDefs._generateTestStep({text: "gas giant"}), {
			isMatch: false,
			text: "(NOT FOUND) gas giant"
		}, "Given three registered steps, when we try a bad step name, then cannot match");
	});

	QUnit.test("Given one registered step, we can match it!", function(assert) {

		var regex1 = /^hello world$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		assert.deepEqual(this.stepDefs._generateTestStep({text: "hello world"}), {
			isMatch: true,
			text: "hello world",
			regex: regex1,
			parameters: [],
			func: function1
		}, "Given one registered step, we can match it!");
	});

	QUnit.test("Given two registered steps, can match one of them", function(assert) {

		var regex1 = /^goodbye cruel world$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		var regex2 = /^hello world$/i;
		var function2 = function() {};
		this.stepDefs.register(regex2, function2);

		assert.deepEqual(this.stepDefs._generateTestStep({text: "goodbye cruel world"}), {
			isMatch: true,
			text: "goodbye cruel world",
			regex: regex1,
			parameters: [],
			func: function1
		}, "Given two registered steps, can match one of them");
	});

	QUnit.test("When two step definitions are identical, then throws error", function(assert) {

		var regex = /^hello world$/i;
		this.stepDefs.register(regex, function() {});

		assert.throws( function() {
				this.stepDefs.register(regex, function() {});
			}, function(error) {
				return error.message === "StepDefinitions.register: Duplicate step definition '/^hello world$/i'";
			},
			"Duplicate step definition throws an error"
		);
	});

	QUnit.test("When two step definitions are ambiguous, then throws error", function(assert) {

		this.stepDefs.register(/^hello world$/i, function() {});
		this.stepDefs.register(/.*/, function() {});

		assert.throws( function() {
				this.stepDefs._generateTestStep({text: "Hello World", keyword: "Given" });
			}, function(error) {
				return error.message === "Ambiguous step definition error: 2 step definitions '/^hello world$/i' and '/.*/' match the feature file step 'Hello World'";
			},
			"Ambiguous step definitions throws an error"
		);
	});

	QUnit.test("Parameters without data", function(assert) {

		var regex1 = /^thing # (.*?) is better than theng # (.*?) and thang # (.*?)$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		assert.deepEqual(this.stepDefs._generateTestStep({text: "thing # 12 is better than theng # 6 and thang # 8"}), {
			isMatch: true,
			text: "thing # 12 is better than theng # 6 and thang # 8",
			regex: regex1,
			parameters: ["12", "6", "8"],
			func: function1
		}, "Parameters without data");
	});

	QUnit.test("No parameters but there is data", function(assert) {

		var regex1 = /^Yet another regex$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		var data = [["Hello", "World"], ["Goodbye", "Cruel", "World"]];

		assert.deepEqual(this.stepDefs._generateTestStep({
			text: "Yet another regex",
			data: data
		}), {
			isMatch: true,
			text: "Yet another regex",
			regex: regex1,
			parameters: [data],
			func: function1
		}, "No parameters but there is data");
	});

	QUnit.test("Parameters and data", function(assert) {

		var regex1 = /^Regex # (.*?)$/i;
		var function1 = function() {};
		this.stepDefs.register(regex1, function1);

		var data = [["Hello", "World"], ["Goodbye", "Cruel", "World"]];

		assert.deepEqual(this.stepDefs._generateTestStep({
			text: "Regex # 42",
			data: data
		}), {
			isMatch: true,
			text: "Regex # 42",
			regex: regex1,
			parameters: ["42", data],
			func: function1
		}, "Parameters and data");
	});

	QUnit.test("invalid parameters as function input", function(assert) {

		var missingRegexError = "StepDefinitions.register: parameter 'rRegex' must be a valid RegExp object";
		var missingFunctionError = "StepDefinitions.register: parameter 'fnFunc' must be a valid Function";

		assert.throws( function(){
			this.stepDefs.register();
		}, function(error) {
			return (error.message === missingRegexError) || (error.message === missingFunctionError);
		},
			"called with no parameters"
		);

		assert.throws( function(){
			this.stepDefs.register(/hello world/i);
		}, function(error) {
			return error.message === missingFunctionError;
		},
			"called with no second parameter"
		);

		assert.throws( function(){
			this.stepDefs.register(null, function(){});
		}, function(error) {
			return error.message === missingRegexError;
		},
			"called with no first parameter"
		);

		assert.throws( function(){
			this.stepDefs.register("not a regex", "not a function");
		}, function(error) {
			return (error.message === missingRegexError) || (error.message === missingFunctionError);
		},
			"both parameters are of invalid types"
		);

		assert.throws( function(){
			this.stepDefs.register("not a regex", function(){});
		}, function(error) {
			return error.message === missingRegexError;
		},
			"first parameter is of invalid type"
		);

		assert.throws( function(){
			this.stepDefs.register(/regex/g, "not a function");
		}, function(error) {
			return error.message === missingFunctionError;
		},
			"second parameter is of invalid type"
		);

	});

});

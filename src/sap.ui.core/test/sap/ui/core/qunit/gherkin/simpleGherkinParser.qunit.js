/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/gherkin/simpleGherkinParser"
], function(simpleGherkinParser) {
	"use strict";

	QUnit.module("Simple Gherkin Parser Tests", {

		beforeEach: function() {
			QUnit.dump.maxDepth = 15;
			this.parser = simpleGherkinParser;
		}

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse simple feature", function(assert) {

		var text = [
			"Feature: Serve coffee",
			"    Coffee should not be served until paid for",
			"    Coffee should not be served until the button has been pressed",
			"    If there is no coffee left then money should be refunded",
			"",
			"  Scenario: Buy last coffee",
			"",
			"    For many people, buying a coffee is akin to religion.",
			"",
			"    Given there are 1 coffees left in the machine # this is NOT a comment and should NOT be stripped off",
			"    # This is a comment that should be stripped",
			"    And I have deposited 1$",
			"    When I press the coffee button",
			"    Then I should be served a coffee",
			"    But that coffee should not be cold",
			"# This is a comment with no leading spaces that should be stripped"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Serve coffee",
			scenarios: [
				{
					tags: [],
					name: "Buy last coffee",
					steps: [
						{ text: "there are 1 coffees left in the machine # this is NOT a comment and should NOT be stripped off",
							keyword: "Given"},
						{ text: "I have deposited 1$", keyword: "And" },
						{ text: "I press the coffee button", keyword: "When" },
						{ text: "I should be served a coffee", keyword: "Then" },
						{ text: "that coffee should not be cold", keyword: "But" }
					]
				}
			]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse feature with background", function(assert) {

		var text = [
			"Feature: Serve coffee",
			"    Coffee should not be served until paid for",
			"    Coffee should not be served until the button has been pressed",
			"    If there is no coffee left then money should be refunded",
			"",
			"  Background:",
			"    Given there are 1 coffees left in the machine",
			"",
			"  Scenario: Buy last coffee",
			"    And I have deposited 1$",
			"    When I press the coffee button",
			"    Then I should be served a coffee"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Serve coffee",
			background: {
				name: "<background>",
				steps: [
					{ text: "there are 1 coffees left in the machine", keyword: "Given" }
				]
			},
			scenarios: [
				{
					tags: [],
					name: "Buy last coffee",
					steps: [
						{ text: "I have deposited 1$", keyword: "And" },
						{ text: "I press the coffee button", keyword: "When" },
						{ text: "I should be served a coffee", keyword: "Then" }
					]
				}
			]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse feature with data table", function(assert) {

		var text = [
			"Feature: Give coffee to users",
			"",
			"  Scenario: Coffee makes people happy",
			"    Given these Users:",
			"      | name            | date of birth   |",
			"      | Michael Jackson | August 29, 1958 |",
			"      | Elvis           | January 8, 1935 |",
			"      | John Lennon     | October 9, 1940 |",
			"    And when I give them coffee",
			"    Then they should be happy"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give coffee to users",
			scenarios: [
				{
					tags: [],
					name: "Coffee makes people happy",
					steps: [
						{
							text: "these Users:",
							keyword: "Given",
							data: [
							  ["name","date of birth"],
							  ["Michael Jackson","August 29, 1958"],
							  ["Elvis","January 8, 1935"],
							  ["John Lennon","October 9, 1940"]
							]
						},
						{ text: "when I give them coffee", keyword: "And" },
						{ text: "they should be happy", keyword: "Then" }
					]
				}
			]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse feature and scenario with tags", function(assert) {

		var text = [
			"@wip @integration @caffeinated",
			"Feature: Serve coffee",
			"    Coffee should not be served until paid for",
			"    Coffee should not be served until the button has been pressed",
			"    If there is no coffee left then money should be refunded",
			"",
			"  @happy",
			"  Scenario: Buy last coffee",
			"    And I have deposited 1$ @misplaced_tag",
			"    When I press the coffee button",
			"    Then I should be served a coffee",
			"  @sad",
			"  Scenario: No coffee for you"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: ["@wip", "@integration", "@caffeinated"],
			name: "Serve coffee",
			scenarios: [
				{
					tags: ["@wip", "@integration", "@caffeinated", "@happy"],
					name: "Buy last coffee",
					steps: [
						{ text: "I have deposited 1$ @misplaced_tag", keyword: "And" },
						{ text: "I press the coffee button", keyword: "When" },
						{ text: "I should be served a coffee", keyword: "Then" }
					]
				},
				{
					tags: ["@wip", "@integration", "@caffeinated", "@sad"],
					name: "No coffee for you",
					steps: []
				}
			]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse scenario outline", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes people moods",
			"    Given the user <user>",
			"    When I give him <number> cups of coffee",
			"    Then he should be <mood>",
			"",
			"    Examples:",
			"      | user    | number | mood         |",
			"      | Michael | 1      | happy        |",
			"      | Elvis   | 4      | electrified  |",
			"      | John    | 2      | happy        |",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [
				{
					tags: [],
					name: "Coffee changes people moods",
					steps: [
						{ text: "the user <user>", keyword: "Given" },
						{ text: "I give him <number> cups of coffee", keyword: "When" },
						{ text: "he should be <mood>", keyword: "Then" }
					],
					examples: [{
						name: "",
						tags: [],
						data: [
							["user","number","mood"],
							["Michael","1","happy"],
							["Elvis","4","electrified"],
							["John","2","happy"]
						]
					}]
				}
			]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse scenario outline with no examples", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes people moods",
			"    Given the user <user>",
			"    When I give him <number> cups of coffee",
			"    Then he should be <mood>",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [{
				tags: [],
				name: "Coffee changes people moods",
				steps: [
					{ text: "the user <user>", keyword: "Given" },
					{ text: "I give him <number> cups of coffee", keyword: "When" },
					{ text: "he should be <mood>", keyword: "Then" }
				],
				examples: []
			}]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("invalid parameters as function input", function(assert) {

		var badStringError = "simpleGherkinParser.parse: parameter 'sText' must be a valid string";
		var badFilenameError = "simpleGherkinParser.parseFile: parameter 'sPath' must be a valid string";

		assert.throws( function(){
			this.parser.parse();
		}, function(error) {
			return error.message === badStringError;
		},
			"'parse' called with no parameter"
		);

		assert.throws( function(){
			this.parser.parse(/this is not a string/i);
		}, function(error) {
			return error.message === badStringError;
		},
			"'parse' called with invalid parameter"
		);

		assert.throws( function(){
			this.parser.parseFile();
		}, function(error) {
			return error.message === badFilenameError;
		},
			"'parseFile' called with no parameter"
		);

		assert.throws( function(){
			this.parser.parseFile(/this is not a string/i);
		}, function(error) {
			return error.message === badFilenameError;
		},
			"'parseFile' called with invalid parameter"
		);

		assert.throws( function(){
			this.parser.parseFile("this file does not exist");
		}, function(error) {
			return !!error.message.match(/^simpleGherkinParser\.parseFile\: error loading URL\: /);
		},
			"'parseFile' called with invalid file name"
		);

	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("given feature has single column table then parse as 1D list", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario: Coffee changes people moods",
			"    Given all the following people drink coffee:",
			"",
			"      | Michael |",
			"      | Elvis   |",
			"      | John    |",
			"",
			"    Then they should all have their moods changed",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [{
				tags: [],
				name: "Coffee changes people moods",
				steps: [{
					text: "all the following people drink coffee:",
					keyword: "Given",
					data: ["Michael", "Elvis", "John"]
				},{
					text: "they should all have their moods changed",
					keyword: "Then"
				}]
			}]
		});

	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("given feature has single row table then parse as 1D list", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario: Coffee changes people moods",
			"    Given all the following people drink coffee:",
			"",
			"      | Michael | Elvis | John |",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [{
				tags: [],
				name: "Coffee changes people moods",
				steps: [{
					text: "all the following people drink coffee:",
					keyword: "Given",
					data: ["Michael", "Elvis", "John"]
				}]
			}]
		});

	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("given feature has single element table then parse as list with one element", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario: Coffee changes people moods",
			"    Given all the following people drink coffee:",
			"",
			"      | Michael |",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [{
				tags: [],
				name: "Coffee changes people moods",
				steps: [{
					text: "all the following people drink coffee:",
					keyword: "Given",
					data: ["Michael"]
				}]
			}]
		});

	});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse scenario outline with single column", function(assert) {

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes people moods",
			"    Then he should be <MOOD>",
			"",
			"    Examples:",
			"      | MOOD         |",
			"      | happy        |",
			"      | electrified  |",
			"      | happy        |",
			""
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Give cups of coffee to users",
			scenarios: [{
				tags: [],
				name: "Coffee changes people moods",
				steps: [
					{ text: "he should be <MOOD>", keyword: "Then" }
				],
				examples: [{
					name: "",
					tags: [],
					data: ["MOOD","happy","electrified","happy"]
				}]
			}]
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Feature tags inherit downward from Feature-Scenario/Outline-Examples", function(assert) {

		var text = [
			"@feature",
			"Feature: Serve coffee",
			"",
			"  @scenario",
			"  Scenario: Buy last coffee",
			"    Given I have deposited $1",
			"",
			"  @outline",
			"  Scenario Outline: No coffee for you",
			"    Given I have deposited <MONEY>",
			"",
			"    @examples",
			"    Examples:",
			"      | MONEY |",
			"      | $2    |"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: ["@feature"],
			name: "Serve coffee",
			scenarios: [{
				tags: ["@feature", "@scenario"],
				name: "Buy last coffee",
				steps: [
					{ text: "I have deposited $1", keyword: "Given" }
				]
			},{
				tags: ["@feature", "@outline"],
				name: "No coffee for you",
				steps: [
					{ text: "I have deposited <MONEY>", keyword: "Given" }
				],
				examples: [{
					name: "",
					tags: ["@feature", "@outline", "@examples"],
					data: ["MONEY", "$2"]
				}]
			}]
		});
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given two Examples and one is @wip", function(assert) {

		var text = [
			"Feature: Serve coffee later",
			"",
			"  Scenario Outline: save money now to have more money for coffee later",
			"    Given I have deposited <MONEY>",
			"",
			"    @wip",
			"    Examples: lesser savings",
			"      | MONEY |",
			"      | $2    |",
			"",
			"    Examples: greater savings",
			"      | MONEY |",
			"      | $4    |"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Serve coffee later",
			scenarios: [{
				tags: [],
				name: "save money now to have more money for coffee later",
				steps: [
					{ text: "I have deposited <MONEY>", keyword: "Given" }
				],
				examples: [{
					name: "lesser savings",
					tags: ["@wip"],
					data: ["MONEY","$2"]
				},{
					name: "greater savings",
					tags: [],
					data: ["MONEY","$4"]
				}]
			}]
		});
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse two Scenario Outlines with no Examples", function(assert) {

		var text = [
			"Feature: Serve coffee later",
			"",
			"  Scenario Outline: don't save money now to have no money for coffee later",
			"    Given I wasted <MONEY> on lottery tickets",
			"",
			"  Scenario Outline: save money now to have more money for coffee later",
			"    Given I have deposited <MONEY>"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Serve coffee later",
			scenarios: [{
				examples: [],
				tags: [],
				name: "don't save money now to have no money for coffee later",
				steps: [
					{ text: "I wasted <MONEY> on lottery tickets", keyword: "Given" }
				]
			},{
				examples: [],
				tags: [],
				name: "save money now to have more money for coffee later",
				steps: [
					{ text: "I have deposited <MONEY>", keyword: "Given" }
				]
			}]
		});
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Should parse @tags with all characters but @ and space", function(assert) {

		var text = [
			"Feature: Outer Space",
			"",
			"  @!! @#$% @hello-world @_+=\/<> @|?*&^~`",
			"  Scenario: Space travel is REALLY cool",
			"    Given the vacuum of outer space is nearly 0 degrees Kelvin"
		].join("\n");

		assert.deepEqual(this.parser.parse(text), {
			tags: [],
			name: "Outer Space",
			scenarios: [{
				tags: ["@!!", "@#$%", "@hello-world", "@_+=\/<>", "@|?*&^~`"],
				name: "Space travel is REALLY cool",
				steps: [
					{ text: "the vacuum of outer space is nearly 0 degrees Kelvin", keyword: "Given" }
				]
			}]
		});
	});

});

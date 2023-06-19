/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit */

sap.ui.define([
	"sap/ui/test/gherkin/dataTableUtils"
], function(dtu) {
	"use strict";

	QUnit.module("Data Table Utilities Tests", {

		beforeEach : function() {
		}

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("normalization works as expected", function(assert) {

		// main test cases (tests multiple spaces between words and padding around string)
		assert.strictEqual(dtu.normalization.titleCase(" first	name "), "First Name", "titleCase");
		assert.strictEqual(dtu.normalization.pascalCase(" first name	first "), "FirstNameFirst", "pascalCase");
		assert.strictEqual(dtu.normalization.camelCase(" First Name	Last "), "firstNameLast", "camelCase");
		assert.strictEqual(dtu.normalization.hyphenated(" First Name	Third "), "first-name-third", "hyphenated");
		assert.strictEqual(dtu.normalization.none(" First	Name "), " First	Name ", "none");

		// boundary test cases
		assert.strictEqual(dtu.normalization.titleCase("d"), "D", "titleCase single letter");
		assert.strictEqual(dtu.normalization.titleCase(""), "", "titleCase empty");
		assert.strictEqual(dtu.normalization.pascalCase("p"), "P", "pascalCase single letter");
		assert.strictEqual(dtu.normalization.pascalCase(""), "", "pascalCase empty");
		assert.strictEqual(dtu.normalization.camelCase("F"), "f", "camelCase single letter");
		assert.strictEqual(dtu.normalization.camelCase(""), "", "camelCase empty");
		assert.strictEqual(dtu.normalization.camelCase("F"), "f", "camelCase single letter");
		assert.strictEqual(dtu.normalization.hyphenated("F"), "f", "hyphenated single letter");
		assert.strictEqual(dtu.normalization.hyphenated(""), "", "hyphenated empty");
		assert.strictEqual(dtu.normalization.none("N"), "N", "none single letter upper case");
		assert.strictEqual(dtu.normalization.none("n"), "n", "none single letter lower case");
		assert.strictEqual(dtu.normalization.none(""), "", "none empty");

		// weird characters
		assert.strictEqual(dtu.normalization.titleCase("pascal's wager"), "Pascals Wager", "Title Case single quote");
		assert.strictEqual(dtu.normalization.camelCase("Being, like, totally hot"), "beingLikeTotallyHot", "camelCase commas");
		assert.strictEqual(dtu.normalization.hyphenated("Being, like, totally hot"), "being-like-totally-hot", "hyphenation commas");
		assert.strictEqual(dtu.normalization.camelCase("11,111 22,222"), "1111122222", "camelCase numbers");
		assert.strictEqual(dtu.normalization.titleCase("(this is weird)"), "This Is Weird", "Title Case brackets");
		assert.strictEqual(dtu.normalization.camelCase("exclamation! marks# are not ok?"), "exclamationMarksAreNotOk",	"exclaim");

		// dashes, underscores treated like spaces
		assert.strictEqual(dtu.normalization.titleCase("Sold-To Party"), "Sold To Party", "Title Case dashes");
		assert.strictEqual(dtu.normalization.titleCase("Sold_To Party"), "Sold To Party", "Title Case underscores");
		assert.strictEqual(dtu.normalization.titleCase("hello____world"), "Hello World", "Title Case multi-underscores");
		assert.strictEqual(dtu.normalization.camelCase("Sold-To Party"), "soldToParty", "Camel Case dashes");
		assert.strictEqual(dtu.normalization.camelCase("Sold_To Party"), "soldToParty", "Camel Case underscores");
		assert.strictEqual(dtu.normalization.pascalCase("Sold-To Party"), "SoldToParty", "Pascal Case dashes");
		assert.strictEqual(dtu.normalization.pascalCase("Sold_To Party"), "SoldToParty", "Pascal Case underscores");
		assert.strictEqual(dtu.normalization.hyphenated("Sold-To Party"), "sold-to-party", "Hyphenated dashes");
		assert.strictEqual(dtu.normalization.hyphenated("Sold_To Party"), "sold-to-party", "Hyphenated underscores");
		assert.strictEqual(dtu.normalization.camelCase("--Sold--To Party--"), "soldToParty", "Camel Case dashes surround");
		assert.strictEqual(dtu.normalization.camelCase("__Sold__To Party__"), "soldToParty", "Camel Case underscores surround");
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given no normalization, toTable changes 2D matrix into list of objects", function(assert) {

		var data = [
			["Planet", "Mass (10^24 kg)", "Diameter (km)", "Gravity (m/s^2)"],
			["Mercury", "0.330", "4,879", "3.7"],
			["Venus", "4.87", "12,104", "8.9"],
			["Earth", "5.97", "12,756", "9.8"],
			["Jupiter", "1898", "142,984", "23.1"]
		];

		assert.deepEqual(dtu.toTable(data),
			[
				{
					"Planet": "Mercury",
					"Mass (10^24 kg)": "0.330",
					"Diameter (km)": "4,879",
					"Gravity (m/s^2)": "3.7"
				},{
					"Planet": "Venus",
					"Mass (10^24 kg)": "4.87",
					"Diameter (km)": "12,104",
					"Gravity (m/s^2)": "8.9"
				},{
					"Planet": "Earth",
					"Mass (10^24 kg)": "5.97",
					"Diameter (km)": "12,756",
					"Gravity (m/s^2)": "9.8"
				},{
					"Planet": "Jupiter",
					"Mass (10^24 kg)": "1898",
					"Diameter (km)": "142,984",
					"Gravity (m/s^2)": "23.1"
				}
			], "Without normalization"
		);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given normalization, toTable normalizes attribute names", function(assert) {

		var data = [
			["Party planet", "Favourite activity"],
			["Jumping Jupiter", "Partying hardy dude"],
			["Ecstatic Earth", "Tilting and changing seasons"],
			["Magnificent Mercury", "Being, like, totally hot"]
		];

		var expected = [
			{
				partyPlanet: "Jumping Jupiter",
				favouriteActivity: "Partying hardy dude"
			},{
				partyPlanet: "Ecstatic Earth",
				favouriteActivity: "Tilting and changing seasons"
			},{
				partyPlanet: "Magnificent Mercury",
				favouriteActivity: "Being, like, totally hot"
			}
		];

		assert.deepEqual(dtu.toTable(data, "camelCase"), expected, "camelCase string");

		var normalizationFunction = dtu.normalization.camelCase;
		assert.deepEqual(dtu.toTable(data, normalizationFunction), expected, "camelCase function");
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("When we duplicate column headers then toTable throws an Error", function(assert) {
		// The Cucumber Java's reference implementation uses the first column and doesn't throw an Error
		// We are deviating from the reference implementation because it seems like they didn't consider this edge case

		assert.throws( function(){
			dtu.toTable([
				["Planet", "Planet"],
				["Mercury", "Jupiter"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toTable: data table contains duplicate header: | Planet |";
		},
			"When we duplicate column headers then toTable throws an Error"
		);

		assert.throws( function(){
			dtu.toTable([
				["PLANET", "planet"],
				["Mercury", "Jupiter"]
			], "camelCase");
		}, function(error) {
			return error.message === "dataTableUtils.toTable: data table contains duplicate header: | planet |";
		},
			"When we duplicate column headers then toTable throws an Error - normalization creates collision"
		);

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given no normalization, toObject converts raw data into an object", function(assert) {

		var data = [
			["Planet", "Earth"],
			["Mass", "5.97"],
			["Diameter", "12,756"],
			["Gravity", "9.8"]
		];

		assert.deepEqual(dtu.toObject(data), {
			Planet: "Earth",
			Mass: "5.97",
			Diameter: "12,756",
			Gravity: "9.8"
		}, "toObject - no normalization");
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given nested data, toObject converts raw data into an object with nested object", function(assert) {

		var data = [
			["Namey Name", "Alice"],
			["Mystery Mass", "135 lbs"],
			["Telephone Number", "Home", "123-456-7890"],
			["Telephone Number", "Work", "123-456-0987"]
		];

		assert.deepEqual(dtu.toObject(data), {
			"Namey Name": "Alice",
			"Mystery Mass": "135 lbs",
			"Telephone Number": {
				Home: "123-456-7890",
				Work: "123-456-0987"
			}
		}, "toObject - nested data");

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("When we have duplicate keys then toObject throws Error", function(assert) {
		// The Cucumber Java's implementation of DataTable.asMap() keeps values from the last row and doesn't throw an Error
		// We are deviating from the reference implementation because it seems like they didn't consider this edge case

		assert.throws( function() {
			dtu.toObject([
				["Name", "135 lbs"],
				["Name", "Alice"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | Name | 135 lbs |";
		},
			"When we duplicate column headers then toTable throws an Error - Simple Key"
		);

		assert.throws( function() {
			dtu.toObject([
				["Telephone Number", "555-777-8888"],
				["Telephone Number", "Home", "333-555-7777"],
				["Telephone Number", "Home", "123-456-7890"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | Telephone Number | 555-777-8888 |";
		},
			"When we duplicate column headers then toTable throws an Error - Simple key replaced by nested key"
		);

		assert.throws( function() {
			dtu.toObject([
				["Address", "Street", "Grand Boulevard"],
				["Address", "5000 Hollywood Ave"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | Address | Street | Grand Boulevard |";
		},
			"When we duplicate column headers then toTable throws an Error - Nested key replaced by simple key"
		);

		assert.throws( function() {
			dtu.toObject([
				["Address", "Street", "House", "Grand Boulevard"],
				["Address", "5000 Hollywood Ave"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | Address | Street | House | Grand Boulevard |";
		},
			"When we duplicate column headers then toTable throws an Error - Deeply nested key replaced by simple key"
		);

		assert.throws( function() {
			dtu.toObject([
				["GPS", "Latitude", "Minutes", "30"],
				["GPS", "Latitude", "50"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | GPS | Latitude | Minutes | 30 |";
		},
			"When we duplicate column headers then toTable throws an Error - Deeply nested key replaced by nested key"
		);

		assert.throws( function() {
			dtu.toObject([
				["GPS", "Latitude", "50"],
				["GPS", "Latitude", "Minutes", "30"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | GPS | Latitude | 50 |";
		},
			"When we duplicate column headers then toTable throws an Error - Deeply nested key replaced by nested key 2"
		);

		assert.throws( function() {
			dtu.toObject([
				["GPS", "Latitude", "Minutes", "30"],
				["GPS", "Latitude", "Minutes", "50"]
			]);
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | GPS | Latitude | Minutes | 30 |";
		},
			"When we duplicate column headers then toTable throws an Error - Deeply nested key"
		);

		assert.throws( function() {
			dtu.toObject([
				["HOME ADDRESS", "5000 Boulevard Rene-Levesque"],
				["home address", "8000 Hollywood Boulevard"]
			], "camelCase");
		}, function(error) {
			return error.message === "dataTableUtils.toObject: data table row is being overwritten: | HOME ADDRESS | 5000 Boulevard Rene-Levesque |";
		},
			"When we duplicate column headers then toTable throws an Error - Normalization creates collision"
		);

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given normalization, toObject converts raw data into an object with normalized properties", function(assert) {

		var data = [
			["Namey Name", "Alice Aardvark"],
			["Mystery Mass", "135 lbs"],
			["Telephone Number", "Home Phone", "(123) 456-7890"],
			["Telephone Number", "Work Phone", "(123) 456-0987"]
		];

		var expected = {
			"namey-name": "Alice Aardvark",
			"mystery-mass": "135 lbs",
			"telephone-number": {
				"home-phone": "(123) 456-7890",
				"work-phone": "(123) 456-0987"
			}
		};

		assert.deepEqual(dtu.toObject(data, "hyphenated"), expected, "hyphenated string");

		var normalizationFunction = dtu.normalization.hyphenated;
		assert.deepEqual(dtu.toObject(data, normalizationFunction), expected, "hyphenated function");
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("toTable Invalid data input", function(assert) {

		var arrayError = "dataTableUtils.toTable: parameter 'aData' must be an Array of Array of Strings";
		var normError = "dataTableUtils.toTable: parameter 'vNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

		assert.throws( function(){
			dtu.toTable();
		}, function(error) {
			return error.message === arrayError;
		},
			"toTable aData is undefined"
		);

		assert.throws( function(){
			dtu.toTable(100);
		}, function(error) {
			return error.message === arrayError;
		},
			"toTable aData is invalid type"
		);

		assert.throws( function(){
			dtu.toTable([7]);
		}, function(error) {
			return error.message === arrayError;
		},
			"toTable aData is invalid array of arrays of string"
		);

		assert.throws( function(){
			dtu.toTable([[7]]);
		}, function(error) {
			return error.message === arrayError;
		},
			"toTable aData is invalid array of arrays of string"
		);

		assert.throws( function(){
			dtu.toTable([], 100);
		}, function(error) {
			return error.message === normError;
		},
			"toTable vNorm is invalid type"
		);

		assert.throws( function(){
			dtu.toTable([], "invalidNormalizationFunction");
		}, function(error) {
			return error.message === normError;
		},
			"toTable vNorm is invalid normalization string"
		);

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("toObject invalid data input", function(assert) {

		var arrayError = "dataTableUtils.toObject: parameter 'aData' must be an Array of Array of Strings";
		var normError = "dataTableUtils.toObject: parameter 'vNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

		assert.throws( function(){
			dtu.toObject();
		}, function(error) {
			return error.message === arrayError;
		},
			"toObject aArray is undefined"
		);

		assert.throws( function(){
			dtu.toObject(100);
		}, function(error) {
			return error.message === arrayError;
		},
			"toObject aArray is invalid type"
		);

		assert.throws( function(){
			dtu.toObject([7]);
		}, function(error) {
			return error.message === arrayError;
		},
			"toObject aArray is invalid normalization string"
		);

		assert.throws( function(){
			dtu.toObject([[7]]);
		}, function(error) {
			return error.message === arrayError;
		},
			"toObject aArray is invalid normalization string"
		);

		assert.throws( function(){
			dtu.toObject([], 100);
		}, function(error) {
			return error.message === normError;
		},
			"toObject vNorm is invalid type"
		);

		assert.throws( function(){
			dtu.toObject([], "invalidNormalizationFunction");
		}, function(error) {
			return error.message === normError;
		},
			"toObject vNorm is invalid normalization string"
		);

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Normalization functions: invalid data input", function(assert) {

		// titleCase
		assert.throws( function(){
			dtu.normalization.titleCase();
		}, function(error) {
			return error.message === "dataTableUtils.normalization.titleCase: parameter 'sString' must be a valid string";
		},
			"titleCase sString is not defined"
		);

		assert.throws( function(){
			dtu.normalization.titleCase(100);
		}, function(error) {
			return error.message === "dataTableUtils.normalization.titleCase: parameter 'sString' must be a valid string";
		},
			"titleCase sString is incorrect type"
		);

		// pascalCase
		assert.throws( function(){
			dtu.normalization.pascalCase();
		}, function(error) {
			return error.message === "dataTableUtils.normalization.pascalCase: parameter 'sString' must be a valid string";
		},
			"pascalCase sString is not defined"
		);

		assert.throws( function(){
			dtu.normalization.pascalCase(100);
		}, function(error) {
			return error.message === "dataTableUtils.normalization.pascalCase: parameter 'sString' must be a valid string";
		},
			"pascalCase sString is incorrect type"
		);

		// camelCase
		assert.throws( function(){
			dtu.normalization.camelCase();
		}, function(error) {
			return error.message === "dataTableUtils.normalization.camelCase: parameter 'sString' must be a valid string";
		},
			"camelCase sString is not defined"
		);

		assert.throws( function(){
			dtu.normalization.camelCase(100);
		}, function(error) {
			return error.message === "dataTableUtils.normalization.camelCase: parameter 'sString' must be a valid string";
		},
			"camelCase sString is incorrect type"
		);

		// hyphenated
		assert.throws( function(){
			dtu.normalization.hyphenated();
		}, function(error) {
			return error.message === "dataTableUtils.normalization.hyphenated: parameter 'sString' must be a valid string";
		},
			"hyphenated sString is not defined"
		);

		assert.throws( function(){
			dtu.normalization.hyphenated(100);
		}, function(error) {
			return error.message === "dataTableUtils.normalization.hyphenated: parameter 'sString' must be a valid string";
		},
			"hyphenated sString is incorrect type"
		);

		// none
		assert.throws( function(){
			dtu.normalization.none();
		}, function(error) {
			return error.message === "dataTableUtils.normalization.none: parameter 'sString' must be a valid string";
		},
			"none sString is not defined"
		);

		assert.throws( function(){
			dtu.normalization.none(100);
		}, function(error) {
			return error.message === "dataTableUtils.normalization.none: parameter 'sString' must be a valid string";
		},
			"none sString is incorrect type"
		);

	});

});

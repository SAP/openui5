/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit */

sap.ui.require([
  "sap/ui/test/gherkin/dataTableUtils"
], function(dtu) {
  'use strict';

  QUnit.module("Data Table Utilities Tests", {

    setup : function() {
    }

  });

  QUnit.test("normalization works as expected", function() {

    // main test cases
    strictEqual(dtu.normalization.titleCase(" first  name "),        "First Name", 'titleCase');
    strictEqual(dtu.normalization.pascalCase(" first name  first "), "FirstNameFirst",  'pascalCase');
    strictEqual(dtu.normalization.camelCase(" First Name  Last "),   "firstNameLast",  'camelCase');
    strictEqual(dtu.normalization.hyphenated(" First Name  Third "), "first-name-third", 'hyphenated');
    strictEqual(dtu.normalization.none(" First  Name "),              " First  Name ", 'none');

    // boundary test cases
    strictEqual(dtu.normalization.titleCase("d"), "D", 'titleCase single letter');
    strictEqual(dtu.normalization.titleCase(""), "", 'titleCase empty');
    strictEqual(dtu.normalization.camelCase("F"), "f",  'camelCase single letter');
    strictEqual(dtu.normalization.camelCase(""), "",  'camelCase empty');

    // weird characters
    strictEqual(dtu.normalization.titleCase("pascal's wager"), "Pascals Wager",  'Title Case single quote');
    strictEqual(dtu.normalization.camelCase("Being, like, totally hot"), "beingLikeTotallyHot",  'camelCase commas');
    strictEqual(dtu.normalization.hyphenated("Being, like, totally hot"), "being-like-totally-hot",  'hyphenation commas');
    strictEqual(dtu.normalization.camelCase("11,111 22,222"), "1111122222",  'camelCase numbers');
  });

  QUnit.test("Given no normalization, toTable changes 2D matrix into list of objects", function() {

    var data = [
      ['Planet', 'Mass (10^24 kg)', 'Diameter (km)', 'Gravity (m/s^2)'],
      ['Mercury', '0.330', '4,879', '3.7'],
      ['Venus', '4.87', '12,104', '8.9'],
      ['Earth', '5.97', '12,756', '9.8'],
      ['Jupiter', '1898', '142,984', '23.1']
    ];

    deepEqual(dtu.toTable(data),
      [
        {
          'Planet': 'Mercury',
          'Mass (10^24 kg)': '0.330',
          'Diameter (km)': '4,879',
          'Gravity (m/s^2)': '3.7'
        },{
          'Planet': 'Venus',
          'Mass (10^24 kg)': '4.87',
          'Diameter (km)': '12,104',
          'Gravity (m/s^2)': '8.9'
        },{
          'Planet': 'Earth',
          'Mass (10^24 kg)': '5.97',
          'Diameter (km)': '12,756',
          'Gravity (m/s^2)': '9.8'
        },{
          'Planet': 'Jupiter',
          'Mass (10^24 kg)': '1898',
          'Diameter (km)': '142,984',
          'Gravity (m/s^2)': '23.1'
        }
      ], 'Without normalization'
    );
  });

  QUnit.test("Given normalization, toTable normalizes attribute names", function() {

    var data = [
      ['Party planet', 'Favourite activity'],
      ['Jumping Jupiter', 'Partying hardy dude'],
      ['Ecstatic Earth', 'Tilting and changing seasons'],
      ['Magnificent Mercury', 'Being, like, totally hot']
    ];

    var expected = [
      {
        partyPlanet: 'Jumping Jupiter',
        favouriteActivity: 'Partying hardy dude'
      },{
        partyPlanet: 'Ecstatic Earth',
        favouriteActivity: 'Tilting and changing seasons'
      },{
        partyPlanet: 'Magnificent Mercury',
        favouriteActivity: 'Being, like, totally hot'
      }
    ];

    deepEqual(dtu.toTable(data, 'camelCase'), expected, 'camelCase string');

    var normalizationFunction = sap.ui.test.gherkin.dataTableUtils.normalization.camelCase;
    deepEqual(dtu.toTable(data, normalizationFunction), expected, 'camelCase function');
  });

  QUnit.test("Given no normalization, toObject converts raw data into an object", function() {

    var data = [
      ['Planet', 'Earth'],
      ['Mass', '5.97'],
      ['Diameter', '12,756'],
      ['Gravity', '9.8']
    ];

    deepEqual(dtu.toObject(data), {
      Planet: 'Earth',
      Mass: '5.97',
      Diameter: '12,756',
      Gravity: '9.8'
    }, "toObject - no normalization");
  });

  QUnit.test("Given nested data, toObject converts raw data into an object with nested object", function() {

    var data = [
      ['Namey Name', 'Alice'],
      ['Mystery Mass', '135 lbs'],
      ['Telephone Number', 'Home', '123-456-7890'],
      ['Telephone Number', 'Work', '123-456-0987']
    ];

    deepEqual(dtu.toObject(data), {
      'Namey Name': 'Alice',
      'Mystery Mass': '135 lbs',
      'Telephone Number': {
        Home: '123-456-7890',
        Work: '123-456-0987'
      }
    }, "toObject - nested data");

  });

  QUnit.test("Given normalization, toObject converts raw data into an object with normalized properties", function() {

    var data = [
      ['Namey Name', 'Alice Aardvark'],
      ['Mystery Mass', '135 lbs'],
      ['Telephone Number', 'Home Phone', '(123) 456-7890'],
      ['Telephone Number', 'Work Phone', '(123) 456-0987']
    ];

    var expected = {
      'namey-name': 'Alice Aardvark',
      'mystery-mass': '135 lbs',
      'telephone-number': {
        'home-phone': '(123) 456-7890',
        'work-phone': '(123) 456-0987'
      }
    };

    deepEqual(dtu.toObject(data, 'hyphenated'), expected, 'hyphenated string');

    var normalizationFunction = sap.ui.test.gherkin.dataTableUtils.normalization.hyphenated;
    deepEqual(dtu.toObject(data, normalizationFunction), expected, 'hyphenated function');
  });


  QUnit.test("toTable Invalid data input", function() {

    var arrayError = "dataTableUtils.toTable: parameter 'aData' must be an Array of Array of Strings";
    var normError = "dataTableUtils.toTable: parameter 'oNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

    throws( function(){
      dtu.toTable();
    }, function(error) {
      return error.message === arrayError;
    },
      "toTable aData is undefined"
    );

    throws( function(){
      dtu.toTable(100);
    }, function(error) {
      return error.message === arrayError;
    },
      "toTable aData is invalid type"
    );

    throws( function(){
      dtu.toTable([7]);
    }, function(error) {
      return error.message === arrayError;
    },
      "toTable aData is invalid array of arrays of string"
    );

    throws( function(){
      dtu.toTable([[7]]);
    }, function(error) {
      return error.message === arrayError;
    },
      "toTable aData is invalid array of arrays of string"
    );

    throws( function(){
      dtu.toTable([], 100);
    }, function(error) {
      return error.message === normError;
    },
      "toTable oNorm is invalid type"
    );

    throws( function(){
      dtu.toTable([], 'invalidNormalizationFunction');
    }, function(error) {
      return error.message === normError;
    },
      "toTable oNorm is invalid normalization string"
    );

  });


  QUnit.test("toObject invalid data input", function() {

    var arrayError = "dataTableUtils.toObject: parameter 'aData' must be an Array of Array of Strings";
    var normError = "dataTableUtils.toObject: parameter 'oNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

    throws( function(){
      dtu.toObject();
    }, function(error) {
      return error.message === arrayError;
    },
      "toObject aArray is undefined"
    );

    throws( function(){
      dtu.toObject(100);
    }, function(error) {
      return error.message === arrayError;
    },
      "toObject aArray is invalid type"
    );

    throws( function(){
      dtu.toObject([7]);
    }, function(error) {
      return error.message === arrayError;
    },
      "toObject aArray is invalid normalization string"
    );

    throws( function(){
      dtu.toObject([[7]]);
    }, function(error) {
      return error.message === arrayError;
    },
      "toObject aArray is invalid normalization string"
    );

    throws( function(){
      dtu.toObject([], 100);
    }, function(error) {
      return error.message === normError;
    },
      "toObject oNorm is invalid type"
    );

    throws( function(){
      dtu.toObject([], 'invalidNormalizationFunction');
    }, function(error) {
      return error.message === normError;
    },
      "toObject oNorm is invalid normalization string"
    );

  });


  QUnit.test("Normalization functions: invalid data input", function() {

    // titleCase
    throws( function(){
      dtu.normalization.titleCase();
    }, function(error) {
      return error.message === "dataTableUtils.normalization.titleCase: parameter 'sString' must be a valid string";
    },
      "titleCase sString is not defined"
    );

    throws( function(){
      dtu.normalization.titleCase(100);
    }, function(error) {
      return error.message === "dataTableUtils.normalization.titleCase: parameter 'sString' must be a valid string";
    },
      "titleCase sString is incorrect type"
    );

    // pascalCase
    throws( function(){
      dtu.normalization.pascalCase();
    }, function(error) {
      return error.message === "dataTableUtils.normalization.pascalCase: parameter 'sString' must be a valid string";
    },
      "pascalCase sString is not defined"
    );

    throws( function(){
      dtu.normalization.pascalCase(100);
    }, function(error) {
      return error.message === "dataTableUtils.normalization.pascalCase: parameter 'sString' must be a valid string";
    },
      "pascalCase sString is incorrect type"
    );

    // camelCase
    throws( function(){
      dtu.normalization.camelCase();
    }, function(error) {
      return error.message === "dataTableUtils.normalization.camelCase: parameter 'sString' must be a valid string";
    },
      "camelCase sString is not defined"
    );

    throws( function(){
      dtu.normalization.camelCase(100);
    }, function(error) {
      return error.message === "dataTableUtils.normalization.camelCase: parameter 'sString' must be a valid string";
    },
      "camelCase sString is incorrect type"
    );

    // hyphenated
    throws( function(){
      dtu.normalization.hyphenated();
    }, function(error) {
      return error.message === "dataTableUtils.normalization.hyphenated: parameter 'sString' must be a valid string";
    },
      "hyphenated sString is not defined"
    );

    throws( function(){
      dtu.normalization.hyphenated(100);
    }, function(error) {
      return error.message === "dataTableUtils.normalization.hyphenated: parameter 'sString' must be a valid string";
    },
      "hyphenated sString is incorrect type"
    );

    // none
    throws( function(){
      dtu.normalization.none();
    }, function(error) {
      return error.message === "dataTableUtils.normalization.none: parameter 'sString' must be a valid string";
    },
      "none sString is not defined"
    );

    throws( function(){
      dtu.normalization.none(100);
    }, function(error) {
      return error.message === "dataTableUtils.normalization.none: parameter 'sString' must be a valid string";
    },
      "none sString is incorrect type"
    );

  });

});

/*global QUnit*/

sap.ui.define([
	"sap/ui/core/util/PasteHelper"
], function(PasteHelper) {
	"use strict";

	// TEST DATA AS IN CLIPBOARD BY COPYING FROM SPREADSHEED and Expected results
	// Simple case with two rows and two cells in each row
	var TEST_A = "Aa\tBb b\nCc\tDd";
	var RESULT_A = [["Aa", "Bb b"],["Cc", "Dd"]];

	// Test case multi-line and quotation marks in the data middle and at the end
	var TEST_B = "\"A\n\"\"B\"\"\nC\n\"\"D\"\"\""; //["A↵"B"↵C↵"D""]
	var RESULT_B = [["A\n\"B\"\nC\n\"D\""]];

	// Test case multi-line and quotation marks in the data right at the begin and end
	var TEST_C = "\"\"\"A\"\"\n\"\"B\"\"\""; //[""A"↵"B""]
	var RESULT_C = [["\"A\"\n\"B\""]];

	// Test case - in the second row is multi-line cell
	var TEST_D = "Row 1 single-line\n\"Row 2\nmulti-line\"";
	var RESULT_D = [["Row 1 single-line"],["Row 2\nmulti-line"]];

	// Complex case with spases tabs and "" (2-3 after each other, very exotic case)
	var TEST_F = "\"\"\"\"\"A\"\"\n\"\"C\"\"\n\"\t\"A\n\"\"\"\"B\"\"\nC\""; //""""""A""↵""C""↵"	"A↵""""B""↵C""
	var RESULT_F = [["\"\"A\"\n\"C\"\n","A\n\"\"B\"\nC"]];

	//Test case tab character
	//var TEST_E = "\"Tab\tCharacter\"";
	//var RESULT_E = [["Tab\tCharacter"]];


	QUnit.module("Parse data to 2D array", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});


	function checkParser(assert, sTest, aExpectedArray) {
		var oEvent = { clipboardData: { getData: function(type){ return sTest;} } };
		var aResult = PasteHelper.getPastedDataAs2DArray(oEvent);
		assert.deepEqual(aResult, aExpectedArray, "the resulting data should be as expected");
	}

	QUnit.test("Simple case with two rows and two cells in each row", function(assert) {
		checkParser(assert, TEST_A, RESULT_A);
	});

	QUnit.test("Quotation marks in the middle and the end of the multi-line cell", function(assert) {
		checkParser(assert, TEST_B, RESULT_B);
	});

	QUnit.test("Quotation marks at the begin of the multi-line cell", function(assert) {
		checkParser(assert, TEST_C, RESULT_C);
	});

	QUnit.test("Multiline", function(assert) {
		checkParser(assert, TEST_D, RESULT_D);
	});

   //QUnit.test("Tab", function(assert) {
	   // checkParser(assert, TEST_E, RESULT_E);
   // });

	QUnit.test("Complex case with quotes, spaces and multiline", function(assert) {
		checkParser(assert, TEST_F, RESULT_F);
	});
});
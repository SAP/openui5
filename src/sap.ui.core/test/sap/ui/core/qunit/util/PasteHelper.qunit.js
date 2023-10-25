/*global QUnit*/

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/util/PasteHelper",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/type/String",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Currency"
], function(Localization, PasteHelper, ODataStringType, StringType, ODataByteType, ODataInt32Type, ODataDateType, ODataBooleanType, BooleanType, CurrencyType) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

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


	QUnit.module("Parsing to 2D array", {
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


	/**** Validation of the parsed data - from simple type such as string and numbers to date/time *******/
	QUnit.module("Validation of the parsed data", {
		beforeEach: function() {
			// Set language to english to test locale dependent values, for example Date and EDM Boolean
			Localization.setLanguage("en-US");
		},
		afterEach: function() {
			// Set language back to system lang
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//Simple case - string and number
	// Luis	10
	// Leo	8

	var aColumnsInfo1 = [
		{
			property: "name",
			type: new StringType() //not EDM, but UI5 data type
		},
		{
			property: "age",
			type: new ODataByteType() // OData type Edm.Byte
		}
	];

	// Data as 2D array as after parsing and result object after the validation was successful
	var aData1_OK = [["Luis", "10"],["Leo", "8"]];

	var oResult1_OK = {
		parsedData: [{name: "Luis", age: 10}, {name: "Leo", age: 8}],
		errors: null
	};

	// Result object where the validation was not successful the errors array is filled
	var aData1_ERR = [["Luis", "10"],["Leo", "blub"]];

	var oResult1_ERR = {
		parsedData: null,
		errors: [
			{
				//"Value 'blub' in row 2 and column 2 could not be parsed as sap.ui.model.odata.type.Byte"
				row: 2 , column: 2, property: "age", value: "blub", type:"sap.ui.model.odata.type.Byte", message: ""}
		]
	};

	// ui5 core type check
	var aColumnsInfo2 = [
		{
			property: "UserName",
			type: new ODataStringType() // OData type Edm.String
		},
		{
			property: "ValidAbo",
			type: new BooleanType() // not EDM type, can be "true" or "false"
		},
		{
			property: "LoginAttempts",
			type: new ODataInt32Type() // OData type  EDM.Int32
		},
		{
			property: "LastLoginDate",
			type: new ODataDateType() // OData EDM type
		}
	];

	// The validation should be successful and the the data array must be filled
	var aData2_OK = [["Luis", "true","100", "2018-05-10"],["Leon", "false", "5555","2018-12-18"]];
	var oResult2_OK = {
		parsedData: [{UserName: "Luis", ValidAbo: true, LoginAttempts: 100, LastLoginDate: "2018-05-10" },
			{UserName: "Leon", ValidAbo: false, LoginAttempts: 5555, LastLoginDate: "2018-12-18"}],
		errors: null
	};

	// The validation is not successful - so the errors array must be filled
	var aData2_ERR = [["Luis2018", "true", "-w100", "1005.2018"],["2Leo","false", "2.55","2018-12-73"]];
	var oResult2_ERR = {
		parsedData: null,
		errors: [
			{row: 1 , column: 3, property: "LoginAttempts", value: "-w100", type:"sap.ui.model.odata.type.Int32", message: ""}, //"Value '-w100' in row 1 and column 3 could not be parsed as sap.ui.model.odata.type.Int32" },
			{row: 1 , column: 4, property: "LastLoginDate", value: "1005.2018", type:"sap.ui.model.odata.type.Date", message: ""}, //"Value '1005.2018' in row 1 and column 4 could not be parsed as sap.ui.model.odata.type.Date"},
			{row: 2 , column: 3, property: "LoginAttempts", value: "2.55", type:"sap.ui.model.odata.type.Int32", message: ""}, //"Value '2.55' in row 2 and column 3 could not be parsed as sap.ui.model.odata.type.Int32"},
			{row: 2 , column: 4, property: "LastLoginDate", value: "2018-12-73", type:"sap.ui.model.odata.type.Date", message: ""} //"Value '2018-12-73' in row 2 and column 4 could not be parsed as sap.ui.model.odata.type.Date"}
		]
	};

	var aColumnsInfo3 = [
		{
			property: "Firstname",
			type: new ODataStringType()
		},
		{
			property: "Lastname",
			type: new ODataStringType()
		},
		{
			property: "Member",
			type: new ODataBooleanType() // "Yes" and "No" in en
		},
		{
			property: "LastLogin",
			type: new ODataDateType()
		},
		{
			property: "AboPrice",
			type: new CurrencyType()
		}
	];

	var aData3_OK = [["Luis", "Bond", "yes", "2018-12-03", "5 USD"],["Leo", "Prince", "no","2018-12-18", "1553 EUR"]];
	var oResult3_OK = {
		parsedData: [
			{Firstname: "Luis", Lastname: "Bond", Member: true, LastLogin: "2018-12-03", AboPrice: [ 5, "USD"]},
			{Firstname: "Leo", Lastname: "Prince", Member: false, LastLogin: "2018-12-18", AboPrice: [ 1553, "EUR"]}],
		errors: null
	};

	var aData3_ERR = [["Luis", "Bond", "true", "r05.122018 07:67:00", "a5 EUR"],["Leo", "Prince", "vino","18.12.2018 88:20:00", "-l1550EUR"]];
	var oResult3_ERR = {
		parsedData: null,
		errors: [
			{row: 1 , column: 3, property: "Member", value: "true", type: "sap.ui.model.odata.type.Boolean", message: ""}, // "Value 'true' in row 1 and column 3 could not be parsed as sap.ui.model.odata.type.Boolean"},
			{row: 1 , column: 4, property: "LastLogin", value: "r05.122018 07:67:00", type: "sap.ui.model.odata.type.Date", message: ""}, //"Value 'r05.122018 07:67:00' in row 1 and column 4 could not be parsed as sap.ui.model.odata.type.Date"},
			{row: 1 , column: 5, property: "AboPrice", value: "a5 EUR", type: "sap.ui.model.type.Currency", message: ""}, //"Value 'a5 EUR' in row 1 and column 5 could not be parsed as sap.ui.model.type.Currency"},
			{row: 2 , column: 3, property: "Member", value: "vino", type: "sap.ui.model.odata.type.Boolean", message: ""}, //"Value 'vino' in row 2 and column 3 could not be parsed as sap.ui.model.odata.type.Boolean"},
			{row: 2 , column: 4, property: "LastLogin", value: "18.12.2018 88:20:00", type: "sap.ui.model.odata.type.Date", message: ""}, //"Value '18.12.2018 88:20:00' in row 2 and column 4 could not be parsed as sap.ui.model.odata.type.Date"},
			{row: 2 , column: 5, property: "AboPrice", value: "-l1550EUR", type: "sap.ui.model.type.Currency", message: ""} //"Value '-l1550EUR' in row 2 and column 5 could not be parsed as sap.ui.model.type.Currency"}
		]
	};

	function validate(assert, pastedData, columnsInfo, expectedResult, sMsg) {

		var done = assert.async();

		var oPromise = PasteHelper.parse(pastedData, columnsInfo);

		oPromise.then(function(aResult) {

			if (aResult.errors) {
				for (var i = 0; i < aResult.errors.length; i++) {
					aResult.errors[i].message = "";
					aResult.errors[i].type = aResult.errors[i].type.getMetadata().getName();
				}
			}
			assert.deepEqual(aResult, expectedResult, "The result has to contain array of parsed data or errors. In this test the validation has to be " + sMsg + ".");
			done();
		});
	}

	QUnit.test("Simple data validation - string and number. Passing", function(assert) {
		validate(assert, aData1_OK, aColumnsInfo1, oResult1_OK, " pass");
	});
	QUnit.test("Simple data validation - string and number.Failing", function(assert) {
		validate(assert, aData1_ERR, aColumnsInfo1, oResult1_ERR, " fail");
	});

	QUnit.test("Date and core Boolean types validation. Passing", function(assert) {
		validate(assert, aData2_OK, aColumnsInfo2, oResult2_OK , " pass");
	});
	QUnit.test("Date and core Boolean types validation. Failing", function(assert) {
		validate(assert, aData2_ERR, aColumnsInfo2, oResult2_ERR, " fail");
	});

	QUnit.test("EDM Boolean and Currency types Validation. Passing", function(assert) {
		validate(assert, aData3_OK, aColumnsInfo3, oResult3_OK, " pass");
	});
	QUnit.test("EDM Boolean and Currency types Validation. Failing", function(assert) {
		validate(assert, aData3_ERR, aColumnsInfo3, oResult3_ERR, " fail");
	});

	// To check - number of columns is mismatching -  data for the last column are missing
	//var oResult4 = {
	//	parsedData: null,
	//	errors: [
	//		{row: 1 , column: 3, property: "LastLoginDate", value: null, type:"sap.ui.model.type.Date", message: "parsing error from core or own text"},
	//		{row: 2 , column: 3, property: "LastLoginDate", value: null, type:"sap.ui.model.type.Date", message: "parsing error from core or own text"}
	//	]
	//};
	//QUnit.test("Validation NOT ok as there are data missing for the last column.", function(assert) {
	//validate(assert, aData1_OK, aColumnsInfo2, oResult4);
	//});
});
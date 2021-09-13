// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/Popover"
], function (
		ValueHelpDelegate,
		Content,
		Condition,
		FilterOperatorUtil,
		Operator,
		SelectType,
		ConditionValidated,
		Icon,
		JSONModel,
		mLibrary,
		Popover
	) {
	"use strict";

	var oContent;

/* 	var oContainer = { //to fake ValueHelp

	}; */

	var _teardown = function() {
		oContent.destroy();
		oContent = null;
		//oContainer = undefined;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContent = new Content();
		},
		afterEach: _teardown
	});

	QUnit.test("EQ operator determination", function(assert) {
		var oOperator = new Operator({
			name: "MyTest",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oContent.set_config({operators: ["GT", "LT", oOperator.name]});
		assert.ok(oContent._oOperator.isA("sap.ui.mdc.condition.Operator"), "Operator was created.");
		assert.ok(oContent._oOperator.name === "MyTest", "Operator was set via configuration");
	});

	QUnit.test("_createCondition", function(assert) {

		var oOperator = new Operator({
			name: "MyTest",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oContent.set_config({operators: ["GT", "LT", oOperator.name]});

		var oCondition = oContent._createCondition("1", "Text1", {inParameter: "2"}, undefined);
		assert.ok(oCondition, "Condition created");
		if (oCondition) {
			assert.equal(oCondition && oCondition.operator, "MyTest", "Condition Operator");
			assert.equal(oCondition.values.length, 1, "Condition values length");
			assert.equal(oCondition.values[0], "1", "Condition values[0]");
			assert.deepEqual(oCondition.inParameters, {inParameter: "2"}, "Condition in-parameters");
			assert.notOk(oCondition.outParameters, "Condition no out-parameters");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
		}
	});

	QUnit.test("_getMaxConditions", function(assert) {
		oContent.set_config({maxConditions: -1});
		assert.equal(oContent._getMaxConditions(), -1, "maxConditions taken from config");
		oContent.set_config({maxConditions: 1});
		assert.equal(oContent._getMaxConditions(), 1, "maxConditions updated from config");
	});

	QUnit.test("_isSingleSelect", function(assert) {
		oContent.set_config({maxConditions: -1});
		assert.equal(oContent._isSingleSelect(), false, "multi-select correctly determined from maxConditions");
		oContent.set_config({maxConditions: 1});
		assert.equal(oContent._isSingleSelect(), true, "single-select correctly determined from maxConditions");
	});

});

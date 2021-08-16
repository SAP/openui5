// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/ListContent",
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
		ListContent,
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

	var _teardown = function() {
		oContent.destroy();
		oContent = null;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContent = new ListContent();
		},
		afterEach: _teardown
	});

	QUnit.test("EQ operator determination", function(assert) {
		var aConditions = [
			Condition.createItemCondition("A", "Validated A"),
			Condition.createItemCondition("B", "Validated B"),
			Condition.createItemCondition("C")
		];

		assert.equal(oContent.getCount(aConditions), 2, "getCount default implementation only considers validated conditions");
	});

});

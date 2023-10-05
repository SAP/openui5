// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit,sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/FilterableListContent",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/Popover",
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(
	ValueHelpDelegate,
	FilterableListContent,
	Condition,
	FilterBar,
	FilterOperatorUtil,
	Operator,
	ValueHelpSelectionType,
	ConditionValidated,
	Icon,
	JSONModel,
	mLibrary,
	Popover,
	oCore,
	Lib
) {
	"use strict";

	let oContent;
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

	const _teardown = function() {
		oContent.destroy();
		oContent = null;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContent = new FilterableListContent();
		},
		afterEach: _teardown
	});

	QUnit.test("_createDefaultFilterBar", function(assert) {
		const fnDone = assert.async();
		oContent._createDefaultFilterBar().then(function (oFilterBar) {
			assert.ok(oFilterBar, "FilterBar is created");
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "FilerBar is set as defaultFilterBar");
			fnDone();
		});
	});

	QUnit.test("_getPriorityFilterBar", function(assert) {
		const fnDone = assert.async();
		oContent._createDefaultFilterBar().then(function () {
			let oFilterBar = oContent._getPriorityFilterBar();
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "returns defaultFilterBar if none is set");
			const oMyFilterBar = new FilterBar();
			oContent.setFilterBar(oMyFilterBar);
			oFilterBar = oContent._getPriorityFilterBar();
			assert.equal(oFilterBar, oMyFilterBar, "returns dedicated filterbar, if available");
			fnDone();
		});
	});

	QUnit.test("getFormattedTokenizerTitle", function(assert) {

		assert.equal(oContent.getFormattedTokenizerTitle(0), oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitleNoCount"), "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(1), oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitle", 1), "formatted TokenizerTitle");

		oContent.setTokenizerTitle("myTitleText");
		assert.equal(oContent.getFormattedTokenizerTitle(0), "myTitleText", "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(1), "myTitleText", "formatted TokenizerTitle");

	});

	QUnit.test("_getListItemBindingContext", function(assert) {

		const sModelName = "MyModel";

		sinon.stub(oContent, "getListBindingInfo").callsFake(function () {
			return {
				model: sModelName
			};
		});

		const oItem = { getBindingContext: function () {}};
		sinon.spy(oItem, "getBindingContext");

		oContent._getListItemBindingContext(oItem);

		assert.ok(oItem.getBindingContext.called, "getBindingContext was called");
		assert.ok(oContent.getListBindingInfo.called, "getListBindingInfo was called");
		assert.equal(oItem.getBindingContext.lastCall.args[0], sModelName, "modelname was considered");

	});

});

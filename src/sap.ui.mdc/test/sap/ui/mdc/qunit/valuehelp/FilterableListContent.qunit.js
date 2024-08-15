// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit,sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/FilterableListContent",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/valuehelp/FilterBarDelegate",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/p13n/Engine",
	'sap/ui/mdc/p13n/StateUtil',
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment"
], function (
		Library,
		ValueHelpDelegate,
		FilterableListContent,
		Condition,
		FilterBar,
		FilterBarDelegate,
		FilterOperatorUtil,
		Operator,
		ValueHelpSelectionType,
		ConditionValidated,
		OperatorName,
		Icon,
		JSONModel,
		mLibrary,
		Popover,
		Engine,
		StateUtil,
		createAppEnvironment
	) {
	"use strict";

	let oContent;
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const _teardown = function() {
		oContent.destroy();
		oContent = null;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContent = new FilterableListContent("FLC1");
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

	QUnit.test("getActiveFilterBar", function(assert) {
		const fnDone = assert.async();
		oContent._createDefaultFilterBar().then(function () {
			let oFilterBar = oContent.getActiveFilterBar();
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "returns defaultFilterBar if none is set");
			const oMyFilterBar = new FilterBar();
			oContent.setFilterBar(oMyFilterBar);
			oFilterBar = oContent.getActiveFilterBar();
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

	QUnit.test("onBeforeShow", function(assert) {

		const oConditions = {test: [Condition.createCondition(OperatorName.EQ, ["X"])]};
		sinon.stub(ValueHelpDelegate, "getFilterConditions").returns(oConditions);
		sinon.stub(oContent, "getValueHelpDelegate").returns(ValueHelpDelegate);
		sinon.stub(StateUtil, "applyExternalState").returns(); // prevent Flex logic, just test as BlackBox
		return oContent._createDefaultFilterBar().then(function () {
			const oFilterBar = oContent.getActiveFilterBar();
			sinon.spy(oFilterBar, "cleanUpAllFilterFieldsInErrorState");
			sinon.stub(FilterBarDelegate, "fetchProperties").returns(
				Promise.resolve([{
					name: "$search",
					label: "Search",
					dataType: "sap.ui.model.type.String"
					},
					{
						name: "test",
						label: "Test",
						dataType: "sap.ui.model.type.String"
					}
				])
			);

			return oContent.onBeforeShow(true).then(() => {
				assert.ok(oFilterBar.cleanUpAllFilterFieldsInErrorState.called, "FilterBar.cleanUpAllFilterFieldsInErrorState called");
				assert.ok(StateUtil.applyExternalState.calledWith(oFilterBar, {filter: oConditions}), "StateUtil.applyExternalState called");
				oFilterBar.cleanUpAllFilterFieldsInErrorState.restore();
				ValueHelpDelegate.getFilterConditions.restore();
				FilterBarDelegate.fetchProperties.restore();
			});
		});

	});

	QUnit.test("clone", function(assert) {

		const oMyFilterBar = new FilterBar("FB1");
		oContent.setFilterBar(oMyFilterBar);
		const oClone = oContent.clone("MyClone");
		const oCloneFilterBar = oClone.getFilterBar();

		sinon.spy(oContent, "applyFilters");
		oCloneFilterBar.fireSearch();
		assert.notOk(oContent.applyFilters.called, "search of FilterBar");
		oClone.destroy();

		return oContent.onBeforeShow(true).then(() => {
			const oClone = oContent.clone("MyClone");
			const oCloneFilterBar = oClone.getFilterBar();

			oCloneFilterBar.fireSearch();
			assert.notOk(oContent.applyFilters.called, "search of FilterBar");
			oClone.destroy();
		});

	});

});

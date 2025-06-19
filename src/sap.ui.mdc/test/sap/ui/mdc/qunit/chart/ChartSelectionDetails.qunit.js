/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/chart/ChartSelectionDetails",
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/m/Text",
	"sap/ui/core/Lib",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(ChartSelectionDetails, FieldInfo, Text, CoreLib, MLibrary, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.ListMode
	const { ListMode } = MLibrary;

	const oResourceBundle = CoreLib.getResourceBundleFor("sap.ui.mdc");

	QUnit.module("sap.ui.mdc.chart.ChartSelectionDetails: default SelectionDetailsItemFactory", {});

	QUnit.test("should call '_selectionDetailsItemFactory'", function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});

		assert.ok(oChartSelectionDetails._oItemFactory, "'_oItemFactory' is set");
	});

	QUnit.test("'_selectionDetailsItemFactory' should return new SelectionDetailsItem with correctly formatted lines", function(assert) {
		const oBindingContext = {
			"testKey": "testValue"
		};
		const aDisplayData = [
		{
			"id": "title",
			"label": "Title",
			"value": "A Dictionary of Cebuano Visayan",
			"type": "Dimension",
			"unbound": false
		},
		{
			"id": "maxmetricsWords",
			"label": "Words (max)",
			"value": "",
			"type": "Measure",
			"unbound": false
		}];
		const mData = [{
			"maxmetricsWords" : 964198,
			"title": "A Dictionary of Cebuano Visayan",
			"title.d": "A Dictionary of Cebuano Visayan",
			"_context_row_number": 17
		}];

		const oChartSelectionDetails = new ChartSelectionDetails({});
		assert.ok(oChartSelectionDetails._oItemFactory, "'_oItemFactory' is set");
		const selectionDetailsItem = oChartSelectionDetails._selectionDetailsItemFactory(aDisplayData, mData, oBindingContext);
		assert.ok(selectionDetailsItem.isA("sap.m.SelectionDetailsItem"),"'_selectionDetailsItemFactory' returns correct type");
		assert.equal(selectionDetailsItem.getLines().length, 2, "SelectionDetailsItem has two lines");
		assert.equal(selectionDetailsItem.getLines()[0].getLabel(), "Title", "SelectionDetailsItem first line has correct label");
		assert.equal(selectionDetailsItem.getLines()[0].getValue(), "A Dictionary of Cebuano Visayan", "SelectionDetailsItem first line has correct value");
		assert.equal(selectionDetailsItem.getLines()[1].getLabel(), "Words (max)", "SelectionDetailsItem second line has correct label");
		assert.equal(selectionDetailsItem.getLines()[1].getValue(), "", "SelectionDetailsItem second line has correct empty value");
		assert.equal(selectionDetailsItem.getBindingContext(), oBindingContext, "SelectionDetailsItem has correct binding context");
		assert.ok(selectionDetailsItem.getLines()[0].isA("sap.m.SelectionDetailsItemLine"), "SelectionDetailsItem first line is of type SelectionDetailsItemLine");
	});

	QUnit.module("sap.ui.mdc.chart.ChartSelectionDetails: _navigate", {});

	QUnit.test("should have a default 'navigate' handler", function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});

		assert.equal(oChartSelectionDetails.mEventRegistry.navigate.length, 1, "1 eventhandling is set");
	});

	QUnit.test("should destroy content on back navigation", function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});

		const fnNavigateToDetailsSpy = sinon.spy(oChartSelectionDetails, "_navigateToDetails");
		const fnDestroySpy = sinon.spy();

		oChartSelectionDetails.fireNavigate({
			"direction": "back",
			"content": {
				destroy: fnDestroySpy
			}
		});
		assert.ok(fnDestroySpy.calledOnce, "'destroy' called on 'content' of event");
		assert.ok(fnNavigateToDetailsSpy.notCalled, "'_navigateToDetails' not called");
	});

	QUnit.test("should call '_navigateToDetails' on forward navigation", function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});

		const fnNavigateToDetailsSpy = sinon.spy(oChartSelectionDetails, "_navigateToDetails");
		const fnDestroySpy = sinon.spy();

		oChartSelectionDetails.fireNavigate({
			"content": {
				destroy: fnDestroySpy
			}
		});

		assert.ok(fnDestroySpy.notCalled, "'destroy' not called on 'content' of event");
		assert.ok(fnNavigateToDetailsSpy.calledOnce, "'_navigateToDetails' called once");
	});

	QUnit.module("sap.ui.mdc.chart.ChartSelectionDetails: _navigateToDetails", {});

	QUnit.test("should throw an error when 'fetchFieldInfosCallback' is not set", async function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});

		const sExpectedErrorMessage = "sap.ui.mdc.chart.ChartSelectionDetails._navigateToDetails: 'fetchFieldInfosCallback' is not set! This is required to determine navigation.";

		try {
			await oChartSelectionDetails._navigateToDetails({
				getSource: () => oChartSelectionDetails
			});
		} catch (e) {
			assert.equal(e.message, sExpectedErrorMessage, "Correct Error thrown");
		}
	});

	QUnit.test("should call 'fetchFieldInfosCallback'", async function(assert) {
		const fnFetchFieldInfosCallbackSpy = sinon.spy();
		const oChartSelectionDetails = new ChartSelectionDetails({
			fetchFieldInfosCallback: fnFetchFieldInfosCallbackSpy
		});
		const oBindingContext = {
			"testKey": "testValue"
		};

		try {
			await oChartSelectionDetails._navigateToDetails({
				getSource: () => oChartSelectionDetails,
				getParameter: (sParameterName) => {
					assert.equal(sParameterName, "item", "Only 'item' parameter is used.");
					return {
						getBindingContext: () => oBindingContext
					};
				}
			});
		} catch (e) {
			assert.ok(e, "Error thrown");
		}

		assert.ok(fnFetchFieldInfosCallbackSpy.calledOnce, "'fetchFieldInfosCallback' called once");

		assert.equal(fnFetchFieldInfosCallbackSpy.firstCall.args.length, 2, "'fetchFieldInfosCallback' called with two paramters");
		assert.equal(fnFetchFieldInfosCallbackSpy.firstCall.args[0], oChartSelectionDetails, "'fetchFieldInfosCallback' called with correct first paramter");
		assert.equal(fnFetchFieldInfosCallbackSpy.firstCall.args[1], oBindingContext, "'fetchFieldInfosCallback' called with correct second parameter");
	});

	QUnit.test("should throw an error when there is no FieldInfo", async function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({
			fetchFieldInfosCallback: () => {
				return Promise.resolve([]);
			}
		});

		const sExpectedErrorMessage = "sap.ui.mdc.chart.ChartSelectionDetails._navigateToDetails: 'fetchFieldInfosCallback' returned an empty map! Could not determine navigation.";

		try {
			await oChartSelectionDetails._navigateToDetails({
				getSource: () => oChartSelectionDetails,
				getParameter: (sParameterName) => {
					assert.equal(sParameterName, "item", "Only 'item' parameter is used.");
					return {
						getBindingContext: () => undefined
					};
				}
			});
		} catch (e) {
			assert.equal(e.message, sExpectedErrorMessage, "Correct Error thrown");
		}
	});

	QUnit.test("should navigate to content of FieldInfo when there is only one", async function(assert) {
		const oFieldInfo = new FieldInfo({});
		const oContent = new Text({});

		oFieldInfo.getContent = () => {
			return Promise.resolve(oContent);
		};
		const fnGetContentSpy = sinon.spy(oFieldInfo, "getContent");

		const oChartSelectionDetails = new ChartSelectionDetails({
			fetchFieldInfosCallback: () => {
				return Promise.resolve({
					"FieldInfo_1": oFieldInfo
				});
			}
		});
		const fnNavToSpy = sinon.spy(oChartSelectionDetails, "navTo");

		await oChartSelectionDetails._navigateToDetails({
			getSource: () => oChartSelectionDetails,
			getParameter: (sParameterName) => {
				assert.equal(sParameterName, "item", "Only 'item' parameter is used.");
				return {
					getBindingContext: () => undefined
				};
			}
		});

		assert.ok(fnGetContentSpy.calledOnce, "'getContent' of FieldInfo called");
		assert.equal(fnGetContentSpy.firstCall.args.length, 1, "'getContent' called with one paramter");
		assert.equal(fnGetContentSpy.firstCall.args[0](), oChartSelectionDetails, "'getContent' called with correct parameter");

		assert.ok(fnNavToSpy.calledOnce, "'navTo' called once");
		assert.equal(fnNavToSpy.firstCall.args.length, 2, "'navTo' called with two paramters");

		const [sTitle, oNavigationTarget] = fnNavToSpy.firstCall.args;

		assert.equal(sTitle, "", "'navTo' called with correct sTitle (empty string)");
		assert.equal(oNavigationTarget, oContent, "'navTo' called with correct oNavigationTarget");
	});

	QUnit.test("should call '_getDetailsList' and navigate to the result when there is more than 1 FieldInfo", async function(assert) {
		const sExpectedTitle = oResourceBundle.getText("chart.SELECTION_DETAILS_BTN");


		const oFieldInfo = new FieldInfo({});
		const fnGetContentSpy = sinon.spy(oFieldInfo, "getContent");

		const oChartSelectionDetails = new ChartSelectionDetails({
			fetchFieldInfosCallback: () => {
				return Promise.resolve({
					"FieldInfo_1": oFieldInfo,
					"FieldInfo_2": oFieldInfo
				});
			}
		});

		const fnNavToSpy = sinon.spy(oChartSelectionDetails, "navTo");
		const fnGetDetailsListSpy = sinon.spy(oChartSelectionDetails, "_getDetailsList");

		await oChartSelectionDetails._navigateToDetails({
			getSource: () => oChartSelectionDetails,
			getParameter: (sParameterName) => {
				assert.equal(sParameterName, "item", "Only 'item' parameter is used.");
				return {
					getBindingContext: () => undefined
				};
			}
		});

		assert.ok(fnGetContentSpy.notCalled, "'getContent' of FieldInfo not called");

		assert.ok(fnGetDetailsListSpy.calledOnce, "'_getDetailsList' called once");

		assert.ok(fnNavToSpy.calledOnce, "'navTo' called once");
		assert.equal(fnNavToSpy.firstCall.args.length, 2, "'navTo' called with two paramters");

		const [sTitle, oNavigationTarget] = fnNavToSpy.firstCall.args;

		assert.equal(sTitle, sExpectedTitle, "'navTo' called with correct sTitle ' " + sExpectedTitle + "'");

		assert.ok(oNavigationTarget.isA("sap.m.List"), "'navTo' called with correct oNavigationTarget (isA sap.m.List)");
		assert.equal(oNavigationTarget.getItems().length, 2, "'navTo' called with correct oNavigationTarget (has 2 Items)");
		assert.equal(oNavigationTarget.getItems()[0].getTitle(), "FieldInfo_1", "'navTo' called with correct oNavigationTarget (Item 1 has correct title)");
		assert.equal(oNavigationTarget.getItems()[1].getTitle(), "FieldInfo_2", "'navTo' called with correct oNavigationTarget (Item 2 has correct title)");
	});

	QUnit.module("sap.ui.mdc.chart.ChartSelectionDetails: _getDetailsList", {});

	QUnit.test("should create an empty sap.m.List", function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});
		const oList = oChartSelectionDetails._getDetailsList(oChartSelectionDetails, {}, undefined);

		assert.ok(oList.isA("sap.m.List"), "return correct controltype");
		assert.equal(oList.getMode(), ListMode.SingleSelectMaster, "List has correct mode");
		assert.equal(oList.getRememberSelections(), false, "List has correct rememberSelections");
		assert.equal(oList.getItems().length, 0, "List has no items");
	});

	QUnit.test("should call 'navTo' on itemPress event", async function(assert) {
		const oChartSelectionDetails = new ChartSelectionDetails({});
		const fnNavToSpy = sinon.spy(oChartSelectionDetails, "navTo");

		const oFieldInfo = new FieldInfo({});
		const oContent = new Text({});

		oFieldInfo.getContent = () => {
			return Promise.resolve(oContent);
		};
		const fnGetContentSpy = sinon.spy(oFieldInfo, "getContent");

		const mFieldInfos = {
			"FieldInfo_1": oFieldInfo,
			"FieldInfo_2": oFieldInfo
		};
		const oList = oChartSelectionDetails._getDetailsList(oChartSelectionDetails, mFieldInfos, undefined);

		assert.equal(oList.getItems().length, 2, "List has two items");

		oList.fireItemPress({
			"listItem": oList.getItems()[0]
		});

		await nextUIUpdate();

		assert.ok(fnGetContentSpy.calledOnce, "'getContent' of FieldInfo called once");

		assert.ok(fnNavToSpy.calledOnce, "'navTo' called once");
		assert.equal(fnNavToSpy.firstCall.args.length, 2, "'navTo' called with two paramters");

		const [sTitle, oNavigationTarget] = fnNavToSpy.firstCall.args;
		const sExpectedTitle = Object.keys(mFieldInfos)[0];

		assert.equal(sTitle, sExpectedTitle, "'navTo' called with correct sTitle ' " + sExpectedTitle + "'");
		assert.equal(oNavigationTarget, oContent, "'navTo' called with correct oNavigationTarget");
	});

});
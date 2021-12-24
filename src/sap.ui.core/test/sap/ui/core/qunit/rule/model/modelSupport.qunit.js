/*global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/StandardListItem",
	"sap/m/Table",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/support/library",
	"sap/ui/support/RuleAnalyzer",
	"sap/ui/test/TestUtils"
], function(Button, StandardListItem, Table, JSONModel, CountMode, ODataV2Model, ODataV4Model,
		SupportLib, RuleAnalyzer, TestUtils) {
	"use strict";

	QUnit.module("sap.ui.core.rules.Model.support", {
		/**
		 * Set up a fake server to use with OData models.
		 *
		 * @param {string} sBasePath The base path to the test data files
		 * @param {object} oFixture A fixture of URIs and the data they should return
		 */
		setUpFakeServer : function (sBasePath, oFixture) {
			TestUtils.useFakeServer(this._oSandbox, sBasePath, oFixture);
		}
	});

	//**********************************************************************************************
	QUnit.test("bindingPathSyntaxValidation", function(assert) {
		var oButton = new Button({
				text:'{/actoinName}' // wrong path: 'actoinName' instead of 'actionName'
			}),
			oModel = new JSONModel({
				actionName: "Say Hello"
			}),
			sRuleId = "bindingPathSyntaxValidation";

		oButton.setModel(oModel);
		oButton.placeAt("qunit-fixture");

		return RuleAnalyzer.analyze({type: "global"}, [{libName: "sap.ui.core", ruleId: sRuleId}])
			.then(function() {
				var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

				assert.strictEqual(aIssues.length, 1, "Expected issues ");
				assert.strictEqual(aIssues[0].rule.id, sRuleId);
			});
	});

	//**********************************************************************************************
[true, false].forEach(function (bUse$select) {
	QUnit.test("selectUsedInBoundAggregation: v2, use $select: " + bUse$select, function (assert) {
		var oModel, fnResolve,
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		this.setUpFakeServer("sap/ui/core", {
			"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata"
				: {source : "qunit/model/GWSAMPLE_BASIC.metadata.xml"},
			"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet?$skip=0&$top=100&$select=SalesOrderID"
				: {message : JSON.stringify({"d" : {"results" : []}})},
			"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet?$skip=0&$top=100"
				: {message : JSON.stringify({"d" : {"results" : []}})}
		});

		oModel = new ODataV2Model({
			defaultCountMode : CountMode.None,
			serviceUrl : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
			useBatch : false
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			events : {
				dataReceived : fnResolve
			},
			path : '/SalesOrderSet',
			parameters : bUse$select ? {select : 'SalesOrderID'} : undefined,
			template : new StandardListItem("SOItem", {
				title: new Text({text: "{SalesOrderID}"})
			})
		});

		return oPromise.then(function () {
			return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]);
		}).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, bUse$select ? 0 : 1, "Correct number of issues");
			if (!bUse$select) {
				assert.deepEqual(aIssues[0].context, {id : oTable.getId()}, "Correct ID");
				assert.strictEqual(aIssues[0].details, "The aggregation 'items' of element "
					+ oTable.getId() + " with binding path '/SalesOrderSet' is bound against a "
					+ "collection, yet no binding parameter 'select' is used. Using 'select' may "
					+ "improve performance.", "Correct details");
				assert.strictEqual(aIssues[0].severity, SupportLib.Severity.Low,
					"Correct severity");
			}
			oTable.destroy();
		});
	});
});

	//**********************************************************************************************
[true, false].forEach(function (bUse$select) {
	QUnit.test("selectUsedInBoundAggregation: v4: use $select: " + bUse$select, function (assert) {
		var oModel, fnResolve,
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		this.setUpFakeServer("sap/ui/core", {
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
				: {source : "qunit/odata/v4/data/metadata.xml"},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$select=ID&$skip=0&$top=100"
				: {message : JSON.stringify({"value" : []})},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$skip=0&$top=100"
				: {message : JSON.stringify({"value" : []})}
		});

		oModel = new ODataV4Model({
			serviceUrl : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			synchronizationMode : "None"
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			events : {
				dataReceived : fnResolve
			},
			path : '/EMPLOYEES',
			parameters : bUse$select ? {$select : 'ID'} : undefined,
			template : new StandardListItem("EmployeeItem", {
				title: new Text({text: "{ID}"})
			})
		});

		return oPromise.then(function () {
			return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]);
		}).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, bUse$select ? 0 : 1, "Correct number of issues");
			if (!bUse$select) {
				assert.deepEqual(aIssues[0].context, {id : oTable.getId()}, "Correct ID");
				assert.strictEqual(aIssues[0].details, "The aggregation 'items' of element "
					+ oTable.getId() + " with binding path '/EMPLOYEES' is bound against a "
					+ "collection, yet no OData query option '$select' is used. Using '$select' may"
					+ " improve performance. Alternatively, enable the automatic generation of "
					+ "'$select' and '$expand' in the model using the 'autoExpandSelect' "
					+ "parameter", "Correct details");
				assert.strictEqual(aIssues[0].severity, SupportLib.Severity.Low,
					"Correct severity");
			}
			oTable.destroy();
		});
	});
});

	//**********************************************************************************************
	QUnit.test("selectUsedInBoundAggregation: no binding", function (assert) {
		var sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		oTable.placeAt("qunit-fixture");
		oTable.bindItems({
			path : '/SalesOrderSet',
			template : new StandardListItem("SOItem", {
				title: new Text({text: "{SalesOrderID}"})
			})
		});

		return RuleAnalyzer.analyze({type: "global"}, [{libName: "sap.ui.core", ruleId: sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 0, "Correct number of issues");
			oTable.destroy();
		});
	});

	//**********************************************************************************************
	QUnit.test("selectUsedInBoundAggregation: v4: use autoExpandSelect", function (assert) {
		var oModel, fnResolve,
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		this.setUpFakeServer("sap/ui/core", {
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
				: {source : "qunit/odata/v4/data/metadata.xml"},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$select=ID&$skip=0&$top=100"
				: {message : JSON.stringify({"value" : []})},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$skip=0&$top=100"
				: {message : JSON.stringify({"value" : []})}
		});

		oModel = new ODataV4Model({
			autoExpandSelect : true,
			serviceUrl : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			synchronizationMode : "None"
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			events : {
				dataReceived : fnResolve
			},
			path : '/EMPLOYEES',
			template : new StandardListItem("EmployeeItem", {
				title: new Text({text: "{ID}"})
			})
		});

		return oPromise.then(function () {
			return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]);
		}).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 0, "Correct number of issues");
			oTable.destroy();
		});
	});
});
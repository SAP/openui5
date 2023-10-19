/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/StandardListItem",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/support/library",
	"sap/ui/support/RuleAnalyzer",
	"sap/ui/test/TestUtils"
], function(Log, Button, StandardListItem, Table, Text, VBox, JSONModel, CountMode, ODataV2Model, ODataV4Model,
		SupportLib, RuleAnalyzer, TestUtils) {
	/*global sinon*/
	"use strict";

	QUnit.module("sap.ui.core.rules.Model.support", {
		beforeEach : function () {
			var oEmptyV2Response = {message : JSON.stringify({"d" : {"results" : []}})},
				oEmptyV4Response = {message : JSON.stringify({"value" : []})};

			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core", {
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata"
					: {source : "qunit/model/GWSAMPLE_BASIC.metadata.xml"},
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet?$skip=0&$top=100&$select=SalesOrderID"
					: oEmptyV2Response,
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet?$skip=0&$top=100"
					: oEmptyV2Response,
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('42')?$select=SalesOrderID"
					: oEmptyV2Response,
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('42')"
					: oEmptyV2Response,
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('42')/firstName"
					: oEmptyV2Response,
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('42')/lastName"
					: oEmptyV2Response,
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
					: {source : "qunit/odata/v4/data/metadata.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$select=ID&$skip=0&$top=100"
					: oEmptyV4Response,
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES?$skip=0&$top=100"
					: oEmptyV4Response,
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES('42')?$select=ID"
					: oEmptyV4Response,
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES('42')"
					: oEmptyV4Response
			});
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning")
				.withExactArgs(
					sinon.match((sMsg) => /retry loading JavaScript resource: .*library\.support\.js/.test(sMsg)),
					undefined, "sap.ui.ModuleSystem", undefined)
				.atLeast(0);
			this.oLogMock.expects("error")
				.withExactArgs(
					sinon.match((sMsg) => /failed to load JavaScript resource: .*library\.support\.js/.test(sMsg)),
					undefined, "sap.ui.ModuleSystem", undefined)
				.atLeast(0);
			this.oLogMock.expects("fatal").never();
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

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]).then(function() {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 1, "Expected issues ");
			assert.strictEqual(aIssues[0].rule.id, sRuleId);
		});
	});

	//**********************************************************************************************
[true, false].forEach(function (bUse$select) {
	QUnit.test("selectUsedInBoundAggregation: v2, use $select: " + bUse$select, function (assert) {
		var oModel,
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		oModel = new ODataV2Model({
			defaultCountMode : CountMode.None,
			serviceUrl : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
			useBatch : false
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			path : '/SalesOrderSet',
			parameters : bUse$select ? {select : 'SalesOrderID'} : undefined,
			template : new StandardListItem("SOItem", {
				title: new Text({text: "{SalesOrderID}"})
			})
		});

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]).then(function () {
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
		var oModel,
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		oModel = new ODataV4Model({
			serviceUrl : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			synchronizationMode : "None"
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			path : '/EMPLOYEES',
			parameters : bUse$select ? {$select : 'ID'} : undefined,
			template : new StandardListItem("EmployeeItem", {
				title: new Text({text: "{ID}"})
			})
		});

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, bUse$select ? 0 : 1, "Correct number of issues");
			if (!bUse$select) {
				assert.deepEqual(aIssues[0].context, {id : oTable.getId()}, "Correct ID");
				assert.strictEqual(aIssues[0].details, "The aggregation 'items' of element "
					+ oTable.getId() + " with binding path '/EMPLOYEES' is bound against a "
					+ "collection, yet no OData query option '$select' is used. Using '$select' may"
					+ " improve performance. Alternatively, enable the automatic generation of "
					+ "'$select' and '$expand' in the model using the 'autoExpandSelect' "
					+ "parameter.", "Correct details");
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

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 0, "Correct number of issues");
			oTable.destroy();
		});
	});

	//**********************************************************************************************
	QUnit.test("selectUsedInBoundAggregation: composite binding", function (assert) {
		var oModel = new ODataV2Model({
				defaultCountMode : CountMode.None,
				serviceUrl : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
				useBatch : false
			});
		var oText = new Text();

		oText.setModel(oModel);
		oText.placeAt("qunit-fixture");
		oText.bindText({parts: [{path: "/SalesOrderSet('42')/firstName"}, {path: "/SalesOrderSet('42')/lastName"}]});

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: "selectUsedInBoundAggregation"}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 0, "Correct number of issues");
			oText.destroy();
			oModel.destroy();
		});
	});

	//**********************************************************************************************
	QUnit.test("selectUsedInBoundAggregation: v4: use autoExpandSelect", function (assert) {
		var oModel,
			sRuleId = "selectUsedInBoundAggregation",
			oTable = new Table();

		oModel = new ODataV4Model({
			autoExpandSelect : true,
			serviceUrl : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			synchronizationMode : "None"
		});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");

		oTable.bindItems({
			path : '/EMPLOYEES',
			template : new StandardListItem("EmployeeItem", {
				title: new Text({text: "{ID}"})
			})
		});

		return RuleAnalyzer.analyze({type: "global"},
				[{libName: "sap.ui.core", ruleId: sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, 0, "Correct number of issues");
			oTable.destroy();
		});
	});

	//**********************************************************************************************
[true, false].forEach(function (bUse$select) {
	QUnit.test("selectUsedInBoundAggregation: v2.ODataContextBinding, use select: " + bUse$select,
			function (assert) {
		var oModel,
			sRuleId = "selectUsedInBoundAggregation",
			oVBox = new VBox();

		oModel = new ODataV2Model({
			defaultCountMode : CountMode.None,
			serviceUrl : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
			useBatch : false
		});

		oVBox.setModel(oModel);
		oVBox.bindElement("/SalesOrderSet('42')",
			bUse$select ? {select : "SalesOrderID"} : undefined);
		oVBox.bindProperty("visible", "/visibility");

		return RuleAnalyzer.analyze({type : "global"},
				[{libName : "sap.ui.core", ruleId : sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, bUse$select ? 0 : 1, "Correct number of issues");
			if (!bUse$select) {
				assert.deepEqual(aIssues[0].context, {id : oVBox.getId()}, "Correct ID");
				assert.strictEqual(aIssues[0].details, "The element " + oVBox.getId() + " with "
					+ "binding path '/SalesOrderSet('42')' is bound against an entity, yet no "
					+ "binding parameter 'select' is used. Using 'select' may improve "
					+ "performance.");
				assert.strictEqual(aIssues[0].severity, SupportLib.Severity.Low,
					"Correct severity");
			}

			oVBox.destroy();
		});
	});
});

	//**********************************************************************************************
[true, false].forEach(function (bUse$select) {
	QUnit.test("selectUsedInBoundAggregation: v4.ODataContextBinding, use select: " + bUse$select,
			function (assert) {
		var oModel,
			sRuleId = "selectUsedInBoundAggregation",
			oVBox = new VBox();

		oModel = new ODataV4Model({
			serviceUrl : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			synchronizationMode : "None"
		});

		oVBox.setModel(oModel);
		oVBox.bindElement("/EMPLOYEES('42')",
			bUse$select ? {$select : "ID"} : undefined);

		return RuleAnalyzer.analyze({type : "global"},
				[{libName : "sap.ui.core", ruleId : sRuleId}]).then(function () {
			var aIssues = RuleAnalyzer.getLastAnalysisHistory().issues;

			assert.strictEqual(aIssues.length, bUse$select ? 0 : 1, "Correct number of issues");
			if (!bUse$select) {
				assert.deepEqual(aIssues[0].context, {id : oVBox.getId()}, "Correct ID");
				assert.strictEqual(aIssues[0].details, "The element " + oVBox.getId() + " with "
					+ "binding path '/EMPLOYEES('42')' is bound against an entity, yet no OData "
					+ "query option '$select' is used. Using '$select' may improve performance. "
					+ "Alternatively, enable the automatic generation of '$select' and '$expand' in"
					+ " the model using the 'autoExpandSelect' parameter.");
				assert.strictEqual(aIssues[0].severity, SupportLib.Severity.Low,
					"Correct severity");
			}

			oVBox.destroy();
		});
	});
});
});
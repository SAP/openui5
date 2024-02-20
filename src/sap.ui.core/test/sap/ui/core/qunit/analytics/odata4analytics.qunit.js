/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/ODataModelAdapter",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataModel"
], function (Log, isEmptyObject, o4aFakeService, Filter, FilterOperator, odata4analytics, ODataModelAdapter,
		ODataUtils, ODataModel) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var sServiceURL = "http://o4aFakeService:8080/";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.odata4analytics", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		afterEach : function (assert) {
			if (this.oModel) {
				this.oModel.getODataModel().destroy();
			}
			// this would ruin AnalyticalTable.qunit.js in testsuite4analytics
//			XMLHttpRequest.restore();
			this.oLogMock.verify();
		},

		beforeEach : function () {
			var oParameterizationRequest,
				oQueryResult,
				that = this;

			this.oLogMock = sinon.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			o4aFakeService.fake({
				baseURI: sServiceURL
			});
			this.oODataModel = new ODataModel(sServiceURL);
			ODataModelAdapter.apply(this.oODataModel);
			return this.oODataModel.getMetaModel().loaded().then(function () {
				that.oModel = new odata4analytics.Model(
					new odata4analytics.Model.ReferenceByModel(that.oODataModel));

				oQueryResult = that.oModel.findQueryResultByName("ActualPlannedCostsResults");
				oParameterizationRequest = new odata4analytics.ParameterizationRequest(
					oQueryResult.getParameterization());

				oParameterizationRequest.setParameterValue("P_ControllingArea", "US01");
				oParameterizationRequest.setParameterValue("P_CostCenter", "");
				oParameterizationRequest.setParameterValue("P_CostCenterTo", "");

				that.oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);
				that.oQueryResultRequest.setParameterizationRequest(oParameterizationRequest);
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("Create Model-Instance", function (assert) {
		// check if model could be wrapped
		assert.ok(this.oModel, "OData Model should be wrapped.");
	});

	//*********************************************************************************************
	QUnit.test("Get names of all query results offered by the service", function (assert) {
		var aQueryResultNames = this.oModel.getAllQueryResultNames();

		assert.strictEqual(aQueryResultNames[0], "ActualPlannedCostsResults",
			"First Query Result Name is 'ActualPlannedCostsResults'.");
		assert.strictEqual(aQueryResultNames[1], "TypeWithHierarchiesResults",
			"Second Query Result Name is 'TypeWithHierarchiesResults'.");
		assert.strictEqual(aQueryResultNames[2], "CONTRACTPERFResults",
			"Third Query Result Name is 'CONTRACTPERFResults'.");
		assert.strictEqual(aQueryResultNames.length, 3,
			"Number of interpreted Query Results is correct.");
	});

	//*********************************************************************************************
	QUnit.test("Get all query results", function (assert) {
		var mQueryResults = this.oModel.getAllQueryResults();

		assert.ok(mQueryResults, "Query results object could be loaded.");
		assert.ok(mQueryResults["ActualPlannedCostsResults"],
			"Expected query results were loaded.");
		assert.ok(mQueryResults["ActualPlannedCostsResults"] instanceof odata4analytics.QueryResult,
			"Query Result 'ActualPlannedCosts' is an instance of odata4analytics.QueryResult.");
	});

	//*********************************************************************************************
	QUnit.test("Find query result by name", function (assert) {
		var mQueryResults = this.oModel.getAllQueryResults(),
			oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults");

		assert.ok(oQueryResult, "Query result 'ActualPlannedCostsResults' could be found.");
		assert.deepEqual(oQueryResult, mQueryResults["ActualPlannedCostsResults"],
			"Query Result 'ActualPlannedCostsResults' was fetched by name.");
	});

	//*********************************************************************************************
	QUnit.test("Get all parameter names", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParameterization = oQueryResult.getParameterization(),
			aParameterNames = oParameterization.getAllParameterNames();

		assert.ok(Array.isArray(aParameterNames), "Parameter names were loaded.");
		assert.strictEqual(aParameterNames.length, 3, "Number of Parameters should be 3.");
	});

	//*********************************************************************************************
	QUnit.test("Try to fetch parameters from the parameterization", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParameterization = oQueryResult.getParameterization(),
			oParameter = oParameterization.findParameterByName("P_CostCenter");

		assert.ok(oParameter instanceof odata4analytics.Parameter,
			"Parameter could be fetched by name.");
		assert.strictEqual(oParameter.getProperty().type, "Edm.String",
			"Parameter should be of type 'Edm.String'.");
	});

	//*********************************************************************************************
	QUnit.test("Fetch peer boundary of an interval boundary parameter", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParameter = oQueryResult.getParameterization().findParameterByName("P_CostCenter"),
			oPeerBoundaryIntervalParameter;

		assert.ok(oParameter.isIntervalBoundary(),
			"Parameter " + oParameter.getName() + " is correctly marked as interval boundary.");

		oPeerBoundaryIntervalParameter = oParameter.getPeerIntervalBoundaryParameter();
		assert.ok(oPeerBoundaryIntervalParameter,
			"Parameter " + oParameter.getName() + " has expected peer parameter "
			+ oPeerBoundaryIntervalParameter.getName() + ".");
	});

	//*********************************************************************************************
	QUnit.test("Get all dimension names", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			aDimensionNames = oQueryResult.getAllDimensionNames();

		assert.ok(Array.isArray(aDimensionNames), "getAllDimensionNames returned an Array.");
		assert.strictEqual(aDimensionNames.length, 14);
		assert.strictEqual(aDimensionNames[0], "ControllingArea",
			"Access to the dimension array returns the expected values (1/2).");
		assert.strictEqual(aDimensionNames[8], "Currency",
			"Access to the dimension array returns the expected values (2/2).");
	});

	//*********************************************************************************************
	QUnit.test("Try to fetch specific dimensions from the query result", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oDimensionByName = oQueryResult.findDimensionByName("Currency"),
			oDimensionByAccess = oQueryResult.getAllDimensions()["Currency"];

		assert.ok(oDimensionByName instanceof odata4analytics.Dimension,
			"Check if Dimension object was retrieved.");
		assert.ok(oDimensionByAccess instanceof odata4analytics.Dimension,
			"Check if Dimension object was retrieved.");

		assert.strictEqual(oDimensionByAccess.getName(), "Currency",
			"Introspection check on dimensionByAccess.");
		assert.strictEqual(oDimensionByName.getKeyProperty().name, "Currency",
			"Introspection check on dimensionByAccess.");

		assert.deepEqual(oDimensionByName, oDimensionByAccess,
			"Retrieving dimensions by 'Name' and through 'Access' should be deliver the"
			+ " same result.");
	});

	//*********************************************************************************************
	QUnit.test("Getting attribute names from Dimensions", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oDimensionByName = oQueryResult.findDimensionByName("ControllingArea"),
			aDimensionAttributeNames = oDimensionByName.getAllAttributeNames();

		assert.ok(Array.isArray(aDimensionAttributeNames),
			"Attribute names Array could be retrieved.");

		assert.strictEqual(aDimensionAttributeNames[0], "ControllingAreaText",
			"Attribute ControllingAreaText found for ControllingArea.");

		// edge cases, should be undefined
		assert.strictEqual(oDimensionByName.findAttributeByName(), undefined,
			"Calling findAttributeByName with no parameters should return 'undefined'.");
		assert.strictEqual(oDimensionByName.findAttributeByName("nonexisting-attribute"), undefined,
			"Calling findAttributeByName with invalid attribute name should return 'undefined'.");
		assert.strictEqual(oDimensionByName.findAttributeByName(null), undefined,
			"Calling findAttributeByName with 'null' should return 'undefined'.");
	});

	//*********************************************************************************************
	QUnit.test("Get all measure names", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			aMeasureNames = oQueryResult.getAllMeasureNames();

		assert.ok(Array.isArray(aMeasureNames), "getAllMeasureNames returned an Array.");
		assert.strictEqual(aMeasureNames.length, 4, "Number of Measures should be '4'.");
		assert.strictEqual(aMeasureNames[0], "ActualCosts",
			"Access to the dimension array returns the expected values (1/2).");
		assert.strictEqual(aMeasureNames[3], "ActualPlannedCostsPercentage",
			"Access to the dimension array returns the expected values (2/2).");
	});

	//*********************************************************************************************
	QUnit.test("Try to fetch specific measures from the query result", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oMeasureByName = oQueryResult.findMeasureByName("ActualCosts"),
			oMeasureByAccess = oQueryResult.getAllMeasures()["ActualCosts"];

		assert.ok(oMeasureByName instanceof odata4analytics.Measure,
			"Check if Measure object was retrieved.");
		assert.ok(oMeasureByAccess instanceof odata4analytics.Measure,
			"Check if Measure object was retrieved.");

		assert.strictEqual(oMeasureByAccess.getName(), "ActualCosts",
			"Introspection check on measureByAccess.");
		assert.strictEqual(oMeasureByName.getUnitProperty().name,
			"Currency", "Introspection check on measureByAccess.");

		assert.deepEqual(oMeasureByName, oMeasureByAccess,
			"Retrieving dimensions by 'Name' and through 'Access' should be deliver the"
			+ " same result.");
	});

	//*********************************************************************************************
	QUnit.test("Get all attribute names", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oDimension = oQueryResult.findDimensionByName("ControllingArea"),
			aAttributeNames = oDimension.getAllAttributeNames();

		assert.ok(Array.isArray(aAttributeNames), "getAllAttributeNames returned an Array.");
		assert.strictEqual(aAttributeNames.length, 1, "Number of Attributes should be '3'.");
		assert.strictEqual(aAttributeNames[0], "ControllingAreaText",
			"Access to the dimension array returns the expected values.");
	});

	//*********************************************************************************************
	QUnit.test("Try to fetch specific attributes", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oDimension = oQueryResult.findDimensionByName("ControllingArea"),
			oAttributeByName = oDimension.findAttributeByName("ControllingAreaText"),
			oAttributeByAccess = oDimension.getAllAttributes()["ControllingAreaText"];

		assert.ok(oAttributeByName instanceof odata4analytics.DimensionAttribute,
			"Check if Attribute object was retrieved.");
		assert.ok(oAttributeByAccess instanceof odata4analytics.DimensionAttribute,
			"Check if Attribute object was retrieved.");

		assert.strictEqual(oAttributeByAccess.getName(), "ControllingAreaText",
			"Introspection check on attributeByAccess.");
		assert.strictEqual(oAttributeByName.getName(), "ControllingAreaText",
			"Introspection check on attributeByName.");

		assert.deepEqual(oAttributeByName, oAttributeByAccess,
			"Retrieving dimensions by 'Name' and through 'Access' should be deliver the"
			+ " same result.");
	});

	//*********************************************************************************************
	QUnit.test("Determine which properties of a query result are updatable", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oUpdatablePropertyNames = oQueryResult.getEntitySet().getUpdatablePropertyNameSet(),
			oUpdatable,
			iPropertyCount = 0,
			iDimensionCount = 0,
			iMeasureCount = 0,
			iUpdatablePropertyCount = 0,
			iCount;

		for ( var sPropName in oUpdatablePropertyNames) {
			iUpdatablePropertyCount++;
			if ((oUpdatable = oQueryResult.findMeasureByName(sPropName))) {
				// is a measure
				if (oUpdatable.isUpdatable) {
					assert.ok(oUpdatable.isUpdatable, sPropName + " is an updatable measure.");
					iMeasureCount++;
				}
			} else if ((oUpdatable = oQueryResult.findDimensionByName(sPropName))) {
				// is a dimension
				assert.ok(oUpdatable, sPropName + " is an updatable dimension.");
				iDimensionCount++;
			} else {
				// is only a property
				assert.ok(sPropName, sPropName + " is an updatable property.");
				iPropertyCount++;
			}
		}
		iCount = iPropertyCount + iDimensionCount + iMeasureCount;
		assert.equal(iUpdatablePropertyCount, iCount,
			"getUpdatablePropertyNameSet() delivered correct a count.");
	});

	//*********************************************************************************************
	QUnit.test("Access query with hierarchy from entity type", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults");

		var aHierPropNames = oQueryResult.getEntityType().getAllHierarchyPropertyNames();
		assert.ok(Array.isArray(aHierPropNames) && typeof aHierPropNames[0] === "string",
				"Hierarchy property names correctly fetched.");
		var oHierarchy = oQueryResult.getEntityType().getHierarchy("ControllingArea");
		assert.ok(!!oHierarchy, "Hierarchy correctly fetched.");
	});

	//*********************************************************************************************
	QUnit.test("Access hierarchy from dimension", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oHierarchy,
			sHierarchyDimensionName = "CostCenter",
			sOtherDimensionName = "ControllingArea",
			oDimension = oQueryResult.findDimensionByName(sHierarchyDimensionName);

		assert.ok(!!oDimension, "Dimension correctly fetched.");
		oHierarchy = oDimension.getHierarchy("CostCenter");
		assert.ok(!!oHierarchy, "Hierarchy correctly fetched.");

		oDimension = oQueryResult.findDimensionByName(sOtherDimensionName); // negative
		// test
		assert.ok(!!oDimension, "Dimension correctly fetched.");
		oHierarchy = oDimension.getHierarchy("ControllingArea");
		assert.ok(!!oHierarchy, "Hierarchy correctly fetched.");
	});

	//*********************************************************************************************
	QUnit.test("Create request for query parameterization", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParamRequest =
				new odata4analytics.ParameterizationRequest(oQueryResult.getParameterization()),
			sURIToParamEntitySetRelative = oParamRequest.getURIToParameterizationEntitySet(),
			sURIToParamEntitySetAbsolute =
				oParamRequest.getURIToParameterizationEntitySet(sServiceURL);

		assert.strictEqual(sURIToParamEntitySetRelative, "/ActualPlannedCosts",
			"Relative URI to Parameterization Entity Set is correct.");
		assert.strictEqual(sURIToParamEntitySetAbsolute, sServiceURL + "/ActualPlannedCosts",
			"Absolute URI to Parameterization Entity Set is correct.");

		assert.throws(function() {
			oParamRequest.setParameterValue("blub", "a");
		}, "Setting an invalid Parameter throws an Exception.");

		assert.throws(function() {
			oParamRequest.getURIToParameterizationEntry();
		},
			"Getting the parameterization URI for incomplete parameter assignments throws an "
			+ "Exception.");
	});

	//*********************************************************************************************
	QUnit.test("Create request with parameters, no aggregation level and no measueres selected",
		function (assert) {

		var aDimNames,
			aMeasNames,
			oQueryResultRequest = this.oQueryResultRequest,
			sRefURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
				+ "P_CostCenterTo=%27%27)/Results",
			sSetURI = oQueryResultRequest.getURIToQueryResultEntries();

		assert.strictEqual(sSetURI, sRefURI, "URI correctly constructed. ");

		aDimNames = oQueryResultRequest.getAggregationLevel();
		assert.ok(isEmptyObject(aDimNames), "No aggregation level set.");

		aMeasNames = oQueryResultRequest.getMeasureNames();
		assert.ok(isEmptyObject(aMeasNames), "No measues selected.");
	});

	//*********************************************************************************************
	QUnit.test("Create request for query results", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			sRefSetURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
				+ "P_CostCenterTo=%27%27)/Results",
			sSetURI,
			sRefEntriesURI,
			sEntriesURI,
			aRefDimNames,
			aDimNames,
			aRefMeasNames,
			aMeasNames;

		oQueryResultRequest.setAggregationLevel([
			"ControllingArea"
		]);
		oQueryResultRequest.addToAggregationLevel([
			"CostCenter"
		]);

		assert.throws(function() {
			oQueryResultRequest.addToAggregationLevel([
				"ID"
			]);
		}, "Adding wrong dimension throws exception. ");

		oQueryResultRequest.includeDimensionKeyTextAttributes(null, true, true);
		oQueryResultRequest.includeDimensionKeyTextAttributes("ControllingArea", true, false);

		oQueryResultRequest.setMeasures(); // all measures!
		oQueryResultRequest.includeMeasureRawFormattedValueUnit(null, false, true);
		oQueryResultRequest.includeMeasureRawFormattedValueUnit("ActualPlannedCostsDifference",
			true, false);

		sSetURI = oQueryResultRequest.getURIToQueryResultEntitySet();
		assert.strictEqual(sSetURI, sRefSetURI, "QueryResultEntitySet URI correctly constructed.");

		sRefEntriesURI = sRefSetURI +
			"?$select=ControllingArea,CostCenter,CostCenterText,ActualPlannedCostsDifference,id";
		oQueryResultRequest.setRequestOptions(true);
		sEntriesURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sEntriesURI, sRefEntriesURI,
			"QueryResultEntries URI correctly constructed.");

		aRefDimNames = [
			"ControllingArea", "CostCenter"
		];
		aDimNames = oQueryResultRequest.getAggregationLevel();
		assert.deepEqual(aDimNames, aRefDimNames, "Aggregation levels correctly set.");

		aRefMeasNames = [
			"ActualCosts",
			"PlannedCosts",
			"ActualPlannedCostsDifference",
			"ActualPlannedCostsPercentage"
		];
		aMeasNames = oQueryResultRequest.getMeasureNames();
		assert.deepEqual(aMeasNames, aRefMeasNames, "Measures correctly set.");
	});

	//*********************************************************************************************
	QUnit.test("_addCondition: prevent duplicates", function (assert) {
		const oFilter0 = {};
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();
		const aFilterProperties = ["sPath", "sOperator", "oValue1", "oValue2", "sFractionalSeconds1",
			"sFractionalSeconds2"];

		aFilterProperties.forEach((sProperty) => {
			oFilter0[sProperty] = "~" + sProperty;
			oFilterExpression.clear();

			// code under test (first filter)
			oFilterExpression._addCondition(oFilter0);

			assert.strictEqual(oFilterExpression._aConditionUI5Filter.length, 1);
			assert.strictEqual(oFilterExpression._aConditionUI5Filter[0], oFilter0);

			const oFilter1 = Object.assign({}, oFilter0); // clone oFilter0

			// code under test (cloned filter not added)
			oFilterExpression._addCondition(oFilter1);

			assert.strictEqual(oFilterExpression._aConditionUI5Filter.length, 1);
			assert.strictEqual(oFilterExpression._aConditionUI5Filter[0], oFilter0);

			// code under test (equal filter, but differnt in another property, not added)
			oFilter1["notRelevantProperty"] = "~notRelevantProperty";
			oFilterExpression._addCondition(oFilter1);

			assert.strictEqual(oFilterExpression._aConditionUI5Filter.length, 1);
			assert.strictEqual(oFilterExpression._aConditionUI5Filter[0], oFilter0);

			// code under test (different filter property value)
			oFilter1[sProperty] += "-other";
			oFilterExpression._addCondition(oFilter1);

			assert.strictEqual(oFilterExpression._aConditionUI5Filter.length, 2);
			assert.strictEqual(oFilterExpression._aConditionUI5Filter[0], oFilter0);
			assert.strictEqual(oFilterExpression._aConditionUI5Filter[1], oFilter1);
		});
	});

	//*********************************************************************************************
[[{sPath: "~path"}], ["~path", "~operator", "~value1", "~value2"]].forEach((aArguments, i) => {
	QUnit.test("addCondition: via " + (i ? "Filter arguments" : "Filter object"), function (assert) {
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();
		const oFilterExpressionMock = sinon.mock(oFilterExpression);
		oFilterExpressionMock.expects("_addCondition")
			.withExactArgs(i === 0
				? sinon.match.same(aArguments[0])
				: sinon.match({sPath: "~path", sOperator: "~operator", oValue1: "~value1", oValue2: "~value2"}));
		const oEntityTypeMock = sinon.mock(oFilterExpression._oEntityType);
		oEntityTypeMock.expects("findPropertyByName").withExactArgs("~path").returns("~path");
		oEntityTypeMock.expects("getFilterablePropertyNames").withExactArgs().returns(["~path"]);

		// code under test
		assert.strictEqual(oFilterExpression.addCondition(...aArguments), oFilterExpression);

		oEntityTypeMock.verify();
		oFilterExpressionMock.verify();
	});
});

	//*********************************************************************************************
[["~path"], [{sPath: "~path"}]].forEach((aArguments, i) => {
	QUnit.test("addCondition: fails, unknow property name, " + i, function (assert) {
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();
		const oFilterExpressionMock = sinon.mock(oFilterExpression);
		oFilterExpressionMock.expects("_addCondition").never();
		const oEntityTypeMock = sinon.mock(oFilterExpression._oEntityType);
		oEntityTypeMock.expects("findPropertyByName").withExactArgs("~path").returns(null);

		assert.throws(() => {
			// code under test
			oFilterExpression.addCondition(...aArguments);
		}, /Cannot add filter condition for unknown property name ~path/);

		oEntityTypeMock.verify();
		oFilterExpressionMock.verify();
	});
});

	//*********************************************************************************************
[["~path"], [{sPath: "~path"}]].forEach((aArguments, i) => {
	QUnit.test("addCondition: fails, not filterable property name, " + i, function (assert) {
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();
		const oFilterExpressionMock = sinon.mock(oFilterExpression);
		oFilterExpressionMock.expects("_addCondition").never();
		const oEntityTypeMock = sinon.mock(oFilterExpression._oEntityType);
		oEntityTypeMock.expects("findPropertyByName").withExactArgs("~path").returns("~path");
		oEntityTypeMock.expects("getFilterablePropertyNames").withExactArgs().returns([]);

		assert.throws(() => {
			// code under test
			oFilterExpression.addCondition(...aArguments);
		}, /Cannot add filter condition for not filterable property name ~path/);

		oEntityTypeMock.verify();
		oFilterExpressionMock.verify();
	});
});

	//*********************************************************************************************
	QUnit.test("Create filter expressions on the query result", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			sRefFilterOptionString,
			sFilterOptionString,
			sRefSetURI,
			sSetURI,
			sRefEntriesURI,
			sEntriesURI;

		oFilterExpression.addCondition("CostCenter", FilterOperator.EQ, "100-1000");
		const oAddConditionSpy = this.spy(oFilterExpression, "_addCondition");
		oFilterExpression.addSetCondition("Currency", ["EUR", "USD", "GBP"]);
		assert.strictEqual(oAddConditionSpy.callCount, 3);
		assert.ok(oAddConditionSpy.firstCall
			.calledWithExactly(sinon.match({sPath: "Currency", sOperator: "EQ", oValue1: "EUR"})));
		assert.ok(oAddConditionSpy.secondCall
			.calledWithExactly(sinon.match({sPath: "Currency", sOperator: "EQ", oValue1: "USD"})));
		assert.ok(oAddConditionSpy.thirdCall
			.calledWithExactly(sinon.match({sPath: "Currency", sOperator: "EQ", oValue1: "GBP"})));
		oFilterExpression.addCondition("CostCenter", FilterOperator.BT, "100-1000", "200-3000");

		sRefFilterOptionString = "(CostCenter eq %27100-1000%27 or (CostCenter ge %27100-1000%27"
			+ " and CostCenter le %27200-3000%27)) and (Currency eq %27EUR%27 or Currency eq"
			+ " %27USD%27 or Currency eq %27GBP%27)";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterExpression URI correctly constructed.");
		assert.ok(sFilterOptionString.match(/CostCenter eq %27100-1000%27/g).length == 1,
			"Repeated input of equal filter expression is ignored.");

		sRefSetURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntitySet();
		assert.strictEqual(sSetURI, sRefSetURI, "QueryResultEntitySet URI correctly constructed.");

		sRefEntriesURI = sRefSetURI
			+ "?$filter=(CostCenter eq %27100-1000%27 or (CostCenter ge %27100-1000%27 and"
			+ " CostCenter le %27200-3000%27)) and (Currency eq %27EUR%27 or Currency eq"
			+ " %27USD%27 or Currency eq %27GBP%27)";
		sEntriesURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sEntriesURI, sRefEntriesURI,
			"QueryResultEntries URI correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Fetch value help for some parameters with filter", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParameter = oQueryResult.getParameterization().findParameterByName("P_CostCenter"),
			oParamValueSetRequest,
			sRefParameterValueSetURI,
			sParameterValueSetURI,
			oBaseParameter,
			oFilterExpression,
			sRefFilterOptionString,
			sFilterOptionString,
			sURIToPVS,
			sRefURIToPVS;

		assert.ok(oParameter, "Parameter was found.");
		//TODO fails with current metadata
// 		assert.ok(oParameter.isValueSetAvailable(), "ValueSet for parameter is available.");

		// 1. plain list
		oParamValueSetRequest = new odata4analytics.ParameterValueSetRequest(oParameter);
		oParamValueSetRequest.includeParameterText(true);
		sRefParameterValueSetURI = "/ActualPlannedCosts?$select=P_CostCenter";
		sParameterValueSetURI = oParamValueSetRequest.getURIToParameterValueSetEntries();
		assert.strictEqual(sParameterValueSetURI, sRefParameterValueSetURI,
			"ParamValueSet URI correctly constructed.");

		// 2. filtered list
		oBaseParameter = oQueryResult.getParameterization().
			findParameterByName("P_ControllingArea");
		assert.ok(oBaseParameter, "Succeeded to look up object for parameter ControllingArea");

		oFilterExpression = oParamValueSetRequest.getFilterExpression();
		assert.ok(oFilterExpression, "Filter expression found.");
		oFilterExpression.addCondition(oBaseParameter.getName(), FilterOperator.EQ,
			"US01");
		sRefFilterOptionString = "(P_ControllingArea eq %27US01%27)";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterExpression URI correctly constructed.");

		sURIToPVS = oParamValueSetRequest.getURIToParameterValueSetEntries();
		sRefURIToPVS = "/ActualPlannedCosts?$select=P_CostCenter&$filter=(P_ControllingArea eq"
			+ " %27US01%27)";
		assert.strictEqual(sURIToPVS, sRefURIToPVS,
			"URI to param value set correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Fetch value help for some query result dimension", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParamRequest =
				new odata4analytics.ParameterizationRequest(oQueryResult.getParameterization()),
			oDimension,
			oDimMemberSetRequest,
			sRefURI,
			sURI,
			oBaseDim,
			oFilterExpression;

		oParamRequest.setParameterValue("P_ControllingArea", "US01");
		oParamRequest.setParameterValue("P_CostCenter", "");
		oParamRequest.setParameterValue("P_CostCenterTo", "");

		oDimension = oQueryResult.findDimensionByName("CostCenter");

		// 1. plain list
		oDimMemberSetRequest =
			new odata4analytics.DimensionMemberSetRequest(oDimension, oParamRequest, false);
		oDimMemberSetRequest.includeDimensionTextAttributes(true);
		sRefURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$select=CostCenter,CostCenterText";
		sURI = oDimMemberSetRequest.getURIToDimensionMemberEntries();
		assert.strictEqual(sURI, sRefURI, "Dimension members were found.");

		// 2. filtered list
		oBaseDim = oQueryResult.findDimensionByName("ControllingArea");
		oFilterExpression = oDimMemberSetRequest.getFilterExpression();
		oFilterExpression.addCondition(oBaseDim.getName(), FilterOperator.EQ, "US01");
		sRefURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$select=CostCenter,CostCenterText&$"
			+ "filter=(ControllingArea eq %27US01%27)";
		sURI = oDimMemberSetRequest.getURIToDimensionMemberEntries();
		assert.strictEqual(sURI, sRefURI, "Dimension members were found filtered.");
	});

	//*********************************************************************************************
	QUnit.test("Create sorting expressions on the query result", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oSortExpression,
			sRefBaseURI,
			sRefFilterOptionString,
			sFilterOptionString,
			sSorterString,
			sEntriesURI,
			sSetURI;

		assert.ok(oFilterExpression instanceof odata4analytics.FilterExpression,
			"FilterExpression instance created.");
		oSortExpression = oQueryResultRequest.getSortExpression();
		assert.ok(oSortExpression instanceof odata4analytics.SortExpression,
			"SortExpression instance created.");

		oQueryResultRequest.setAggregationLevel([
			"ControllingArea", "CostCenter"
		]);
		oQueryResultRequest.setMeasures(/*all*/);

		oSortExpression.addSorter("CostCenter", odata4analytics.SortOrder.Ascending);
		// BCP: 2380000530, ignore addSorter call if the sort expression already contains a
		// sorter for that property
		oSortExpression.addSorter("CostCenter", odata4analytics.SortOrder.Descending, true);

		oFilterExpression.addSetCondition("Currency", [
			"EUR", "USD", "GBP"
		]);
		oFilterExpression.addCondition("CostCenter", FilterOperator.BT, "100-1000",
			"200-3000");

		sRefBaseURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$select=ControllingArea,CostCenter,ActualCosts,"
			+ "PlannedCosts,ActualPlannedCostsDifference,ActualPlannedCostsPercentage&$filter=";

		sRefFilterOptionString = "((CostCenter ge %27100-1000%27 and CostCenter le %27200-3000%27))"
			+ " and (Currency eq %27EUR%27 or Currency eq %27USD%27 or Currency eq %27GBP%27)";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");

		sRefBaseURI += sRefFilterOptionString;

		sSorterString = "&$orderby=CostCenter asc";
		sEntriesURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sEntriesURI, sRefBaseURI + sSorterString,
			"QueryResultEntries URI correctly constructed.");

		oSortExpression.addSorter("ControllingArea", odata4analytics.SortOrder.Descending, true);
		sSorterString = "&$orderby=CostCenter asc,ControllingArea desc";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sSorterString,
			"QueryResultEntries URI correctly constructed with 2 sorters.");

		oSortExpression.removeSorter("ControllingArea");
		sSorterString = "&$orderby=CostCenter asc";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sSorterString,
			"QueryResultEntries URI correctly constructed with 1 sorter.");

		oSortExpression.addSorter("Currency", odata4analytics.SortOrder.Descending);
		sSorterString = "&$orderby=CostCenter asc";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sSorterString,
			"Ignore dimension which is not selected.");

		oSortExpression.clear();
		sSorterString = "";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sSorterString,
			"QueryResultEntries URI correctly constructed without sorters.");

		oQueryResultRequest.setMeasures(["ActualCosts"]);
		oSortExpression.addSorter("CostCenter", odata4analytics.SortOrder.Ascending);
		oSortExpression.addSorter("PlannedCosts", odata4analytics.SortOrder.Descending);
		assert.strictEqual(oQueryResultRequest.getURIToQueryResultEntries(),
			"/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$select=ControllingArea,CostCenter,"
			+ "ActualCosts&$filter=" + sRefFilterOptionString
			+ "&$orderby=CostCenter asc,PlannedCosts desc",
			"Allow measure which is not selected.");
	});

	//*********************************************************************************************
	QUnit.test("Fetch value help for some parameter with sorting", function (assert) {
		var oQueryResult = this.oModel.findQueryResultByName("ActualPlannedCostsResults"),
			oParamRequest = new odata4analytics.ParameterizationRequest(
				oQueryResult.getParameterization()),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult),
			oParameter,
			oParamValueSetRequest,
			sRefParameterValueSetURI,
			sParameterValueSetURI,
			oBaseParameter;

		oQueryResultRequest.setParameterizationRequest(oParamRequest);

		oParameter = oQueryResult.getParameterization().findParameterByName("P_ControllingArea");
		assert.ok(oParameter, "Parameter was found.");
		//TODO fails with current metadata
// 		assert.ok(oParameter.isValueSetAvailable(), "ValueSet for parameter is available.");

		// 1. plain list
		oParamValueSetRequest = new odata4analytics.ParameterValueSetRequest(oParameter);
		oParamValueSetRequest.includeParameterText(true);
		sRefParameterValueSetURI = "/ActualPlannedCosts?$select=P_ControllingArea";
		sParameterValueSetURI = oParamValueSetRequest.getURIToParameterValueSetEntries();
		assert.strictEqual(sParameterValueSetURI, sRefParameterValueSetURI,
			"ParamValueSet URI correctly constructed.");

		// 2. sorted list
		oBaseParameter = oQueryResult.getParameterization()
			.findParameterByName("P_ControllingArea");
		assert.ok(oBaseParameter, "Succeeded to look up object for parameter ControllingArea");
		//TODO make this work
// 		var oSortExpression = oQueryResultRequest.getSortExpression();
// 		oSortExpression.addSorter("P_ControllingArea", odata4analytics.SortOrder.Ascending);
// 		var sURIToPVS = oParamValueSetRequest.getURIToParameterValueSetEntries();
// 		var sRefURIToPVS = "";
// 		assert.strictEqual(sURIToPVS, sRefURIToPVS, "URI to param value set correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Add paging and a count to the query result", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oSortExpression = oQueryResultRequest.getSortExpression(),
			sRefBaseURI,
			sRefFilterOptionString,
			sFilterOptionString,
			sRefCountURI,
			sSetURI;

		oQueryResultRequest.setAggregationLevel([
			"ControllingArea", "CostCenter"
		]);
		oQueryResultRequest.setMeasures();

		oSortExpression.addSorter("CostCenter", odata4analytics.SortOrder.Ascending);
		oSortExpression.addSorter("ControllingArea", odata4analytics.SortOrder.Descending);
		oFilterExpression.addSetCondition("Currency", [
			"EUR", "USD", "GBP"
		]);
		oFilterExpression.addCondition("CostCenter", FilterOperator.BT, "100-1000",
			"200-3000");

		sRefBaseURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$select=ControllingArea,CostCenter,ActualCosts,"
			+ "PlannedCosts,ActualPlannedCostsDifference,ActualPlannedCostsPercentage&$filter=";

		sRefFilterOptionString =
			"((CostCenter ge %27100-1000%27 and CostCenter le %27200-3000%27)) and"
			+ " (Currency eq %27EUR%27 or Currency eq %27USD%27 or Currency eq %27GBP%27)";
		oQueryResultRequest.setResultPageBoundaries(1, 10);
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");

		sRefBaseURI += sRefFilterOptionString;
		sRefCountURI = "&$orderby=CostCenter asc,ControllingArea desc&"
			+ "$top=10&$inlinecount=allpages";
		oQueryResultRequest.setRequestOptions(null, true);
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sRefCountURI,
			"QueryResultEntries URI correctly constructed with PageBoundaries from 1 to 10.");

		oQueryResultRequest.setResultPageBoundaries(null, 500);
		sRefCountURI = "&$orderby=CostCenter asc,ControllingArea desc&$top=500&"
			+ "$inlinecount=allpages";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sRefCountURI,
			"QueryResultEntries URI correctly constructed with PageBoundaries up to 500.");

		oQueryResultRequest.setResultPageBoundaries(500, null);
		sRefCountURI =
			"&$orderby=CostCenter asc,ControllingArea desc&$skip=499&$inlinecount=allpages";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sRefCountURI,
			"QueryResultEntries URI correctly constructed with PageBoundaries from 500");

		oQueryResultRequest.setResultPageBoundaries(500, 500);
		sRefCountURI =
			"&$orderby=CostCenter asc,ControllingArea desc&$top=1&$skip=499&$inlinecount=allpages";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sRefCountURI,
			"QueryResultEntries URI correctly constructed with PageBoundaries from 500 to 500.");

		oQueryResultRequest.setResultPageBoundaries(null, null);
		sRefCountURI = "&$orderby=CostCenter asc,ControllingArea desc&$inlinecount=allpages";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefBaseURI + sRefCountURI,
			"QueryResultEntries URI correctly constructed without PageBoundaries.");
	});

	//*********************************************************************************************
	QUnit.test("addUI5FilterConditions (empty array)", function (assert) {
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();
		const oFilterExpressionMock = this.mock(oFilterExpression);
		oFilterExpressionMock.expects("_addUI5FilterArray").never();
		oFilterExpressionMock.expects("addCondition").never();

		// code under test
		assert.strictEqual(oFilterExpression.addUI5FilterConditions([]), oFilterExpression);

		oFilterExpressionMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("addUI5FilterConditions (no filter array)", function (assert) {
		const oFilterExpression = this.oQueryResultRequest.getFilterExpression();

		[undefined, 1, {}].forEach((vArgument) => {
			assert.throws(() => {
				// code under test
				oFilterExpression.addUI5FilterConditions(vArgument);
			}, /Argument is not an array/);
		});
	});

	//*********************************************************************************************
	QUnit.test("Combining with some simple condition", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oFilter1 = new Filter("Currency", FilterOperator.EQ, "GBP"),
			oFilter2 = new Filter("Currency", FilterOperator.EQ, "USD"),
			oFilter3 = new Filter("Currency", FilterOperator.EQ, "EUR"),
			oMultiFilter = new Filter([oFilter1, oFilter2, oFilter3], false),
			aUI5FilterArray,
			sRefFilterOptionString,
			sFilterOptionString;

		oFilterExpression.addUI5FilterConditions([
			oMultiFilter
		]);
		oFilterExpression.addSetCondition("CostCenter", [
			"100-1000", "100-1100"
		]);

		aUI5FilterArray = oFilterExpression.getExpressionAsUI5FilterArray();
		assert.ok((aUI5FilterArray instanceof Array
			&& aUI5FilterArray[0] instanceof Filter),
			"UI5 filter array correctly constructed.");

		sRefFilterOptionString = "(CostCenter eq %27100-1000%27 or CostCenter eq %27100-1100%27)"
			+ " and (((Currency eq %27GBP%27) or (Currency eq %27USD%27) or"
			+ " (Currency eq %27EUR%27)))";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Combining with other UI5 filters on same sPath", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oFilter1 = new Filter("Currency", FilterOperator.EQ, "GBP"),
			oFilter2 = new Filter("Currency", FilterOperator.EQ, "USD"),
			oFilter3 = new Filter("Currency", FilterOperator.EQ, "EUR"),
			oMultiFilter = new Filter([oFilter1, oFilter2, oFilter3], false),
			aUI5FilterArray,
			sRefFilterOptionString,
			sFilterOptionString,
			sRefSetURI,
			sSetURI;

		const oAddConditionSpy = this.spy(oFilterExpression, "addCondition");
		const oAddUI5FilterArraySpy = this.spy(oFilterExpression, "_addUI5FilterArray");
		const aMultifilter = [oMultiFilter];
		oFilterExpression.addUI5FilterConditions(aMultifilter);
		const aUI5FilterArrayIn = [
			new Filter("CostCenter", FilterOperator.EQ, "100-1000"),
			new Filter("CostCenter", FilterOperator.EQ, "100-1100")
		];
		oFilterExpression.addUI5FilterConditions(aUI5FilterArrayIn);

		assert.strictEqual(oAddConditionSpy.callCount, 2);
		assert.ok(oAddConditionSpy.firstCall.calledWithExactly(sinon.match.same(aUI5FilterArrayIn[0])));
		assert.ok(oAddConditionSpy.secondCall.calledWithExactly(sinon.match.same(aUI5FilterArrayIn[1])));
		assert.strictEqual(oAddUI5FilterArraySpy.callCount, 1);
		assert.ok(oAddUI5FilterArraySpy.firstCall.calledWithExactly(sinon.match.same(aMultifilter)));

		aUI5FilterArray = oFilterExpression.getExpressionAsUI5FilterArray();
		assert.ok((aUI5FilterArray instanceof Array
			&& aUI5FilterArray[0] instanceof Filter),
			"UI5 filter array correctly constructed.");

		sRefFilterOptionString = "(CostCenter eq %27100-1000%27 or CostCenter eq %27100-1100%27)"
			+ " and (((Currency eq %27GBP%27) or (Currency eq %27USD%27) or"
			+ " (Currency eq %27EUR%27)))";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");

		sRefSetURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$filter=(CostCenter eq %27100-1000%27 or"
			+ " CostCenter eq %27100-1100%27) and (((Currency eq %27GBP%27) or"
			+ " (Currency eq %27USD%27) or (Currency eq %27EUR%27)))";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefSetURI, "QueryResultEntries URI correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Combining with other UI5 filters on different sPaths", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oFilter1 = new Filter("Currency", FilterOperator.EQ, "GBP"),
			oFilter2 = new Filter("Currency", FilterOperator.EQ, "USD"),
			oFilter3 = new Filter("Currency", FilterOperator.EQ, "EUR"),
			oMultiFilter = new Filter([oFilter1, oFilter2, oFilter3], false),
			aUI5FilterArray,
			sRefFilterOptionString,
			sFilterOptionString,
			sRefSetURI,
			sSetURI;

		oFilterExpression.addUI5FilterConditions([
			oMultiFilter
		]);
		oFilterExpression.addUI5FilterConditions([
			new Filter("CostCenter", FilterOperator.EQ, "100-1000"),
			new Filter("ControllingArea", FilterOperator.EQ, "US01")
		]);

		aUI5FilterArray = oFilterExpression.getExpressionAsUI5FilterArray();
		assert.ok((aUI5FilterArray instanceof Array
				&& aUI5FilterArray[0] instanceof Filter),
				"UI5 filter array correctly constructed.");

		sRefFilterOptionString = "(ControllingArea eq %27US01%27) and"
			+ " (CostCenter eq %27100-1000%27) and (((Currency eq %27GBP%27) or"
			+ " (Currency eq %27USD%27) or (Currency eq %27EUR%27)))";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");

		sRefSetURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$filter=(ControllingArea eq %27US01%27)"
			+ " and (CostCenter eq %27100-1000%27) and (((Currency eq %27GBP%27)"
			+ " or (Currency eq %27USD%27) or (Currency eq %27EUR%27)))";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefSetURI, "QueryResultEntries URI correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Tests 1-3 together", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oFilter1 = new Filter("Currency", FilterOperator.EQ, "GBP"),
			oFilter2 = new Filter("Currency", FilterOperator.EQ, "USD"),
			oFilter3 = new Filter("Currency", FilterOperator.EQ, "EUR"),
			oMultiFilter = new Filter([oFilter1, oFilter2, oFilter3], false),
			aUI5FilterArray,
			sRefFilterOptionString,
			sFilterOptionString,
			sRefSetURI,
			sSetURI;

		oFilterExpression.addUI5FilterConditions([
			oMultiFilter
		]);
		oFilterExpression.addUI5FilterConditions([
			new Filter("CostCenter", FilterOperator.EQ, "100-1000"),
			new Filter("CostCenter", FilterOperator.EQ, "100-1100"),
			new Filter("ControllingArea", FilterOperator.EQ, "US01")
		]);
		aUI5FilterArray = oFilterExpression.getExpressionAsUI5FilterArray();

		assert.ok((aUI5FilterArray instanceof Array
			&& aUI5FilterArray[0] instanceof Filter),
			"UI5 filter array correctly constructed.");

		sRefFilterOptionString =
			"(ControllingArea eq %27US01%27) and (CostCenter eq %27100-1000%27"
			+ " or CostCenter eq %27100-1100%27) and (((Currency eq %27GBP%27)"
			+ " or (Currency eq %27USD%27) or (Currency eq %27EUR%27)))";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");

		sRefSetURI = "/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27%27,"
			+ "P_CostCenterTo=%27%27)/Results?$filter=(ControllingArea eq %27US01%27)"
			+ " and (CostCenter eq %27100-1000%27 or CostCenter eq %27100-1100%27)"
			+ " and (((Currency eq %27GBP%27) or (Currency eq %27USD%27)"
			+ " or (Currency eq %27EUR%27)))";
		sSetURI = oQueryResultRequest.getURIToQueryResultEntries();
		assert.strictEqual(sSetURI, sRefSetURI, "QueryResultEntries URI correctly constructed.");
	});

	//*********************************************************************************************
	QUnit.test("Multiple UI5 filter arrays are combined with AND", function (assert) {
		var oQueryResultRequest = this.oQueryResultRequest,
			oFilterExpression = oQueryResultRequest.getFilterExpression(),
			oFilter1 = new Filter("Currency", FilterOperator.EQ, "GBP"),
			oFilter2 = new Filter("Currency", FilterOperator.EQ, "USD"),
			oFilter3 = new Filter("Currency", FilterOperator.EQ, "EUR"),
			oMultiFilter = new Filter([oFilter1, oFilter2, oFilter3], false),
			aUI5FilterArray,
			sRefFilterOptionString,
			sFilterOptionString;

		oFilterExpression.addUI5FilterConditions([
			oMultiFilter
		]);
		oFilterExpression.addUI5FilterConditions([
			new Filter("CostCenter", FilterOperator.EQ, "100-1100"),
			new Filter("ControllingArea", FilterOperator.EQ, "US01")
		]);
		oFilterExpression.addUI5FilterConditions([
			new Filter("CostCenter", FilterOperator.EQ, "100-1000"),
			new Filter("ControllingArea", FilterOperator.EQ, "US02")
		]);

		aUI5FilterArray = oFilterExpression.getExpressionAsUI5FilterArray();
		assert.ok((aUI5FilterArray instanceof Array
			&& aUI5FilterArray[0] instanceof Filter),
			"UI5 filter array correctly constructed.");

		sRefFilterOptionString = "(ControllingArea eq %27US01%27 or ControllingArea eq %27US02%27)"
			+ " and (CostCenter eq %27100-1100%27 or CostCenter eq %27100-1000%27)"
			+ " and (((Currency eq %27GBP%27) or (Currency eq %27USD%27)"
			+ " or (Currency eq %27EUR%27)))";
		sFilterOptionString = oFilterExpression.getURIFilterOptionValue();
		assert.strictEqual(sFilterOptionString, sRefFilterOptionString,
			"FilterOptionString correctly constructed.");
	});

	//*********************************************************************************************
	//*********************************************************************************************
	QUnit.test("This is how it all begins", function (assert) {
		var oModelReference = new odata4analytics.Model.ReferenceByModel(this.oODataModel),
			oOData4SAPAnalyticsModel = new odata4analytics.Model(oModelReference);

		assert.strictEqual(oOData4SAPAnalyticsModel.getODataModel(), this.oODataModel);

		// Note: requires ODataModelAdapter.apply(this.oODataModel); beforehand
		this.oODataModel.setAnalyticalExtensions(oOData4SAPAnalyticsModel);

		assert.strictEqual(this.oODataModel.getAnalyticalExtensions(), oOData4SAPAnalyticsModel);
	});

	//*********************************************************************************************
	// this is how Chart uses odata4analytics (nothing more)
	QUnit.test("sap.chart.Chart", function (assert) {
		var bIsAnalytical,
			oModelReference = new odata4analytics.Model.ReferenceByModel(this.oODataModel),
			oOData4SAPAnalyticsModel = new odata4analytics.Model(oModelReference);

		// Note: sap.ui.table.AnalyticalTable only uses the following, no odata4analytics at all!
		ODataModelAdapter.apply(this.oODataModel); // called by Chart!
		this.oODataModel.setAnalyticalExtensions(oOData4SAPAnalyticsModel);

		bIsAnalytical
			= oOData4SAPAnalyticsModel.findQueryResultByName("ActualPlannedCostsResults")
				!== undefined;

		assert.strictEqual(bIsAnalytical, true);
	});
	//TODO var iLength = oBinding instanceof sap.ui.model.analytics.AnalyticalBinding
	//                 ? oBinding.getTotalSize() : oBinding.getLength();

	//*********************************************************************************************
	QUnit.test("From model to query results", function (assert) {
		var oActualPlannedCostsResults,
			oCONTRACTPERFResults,
			// Note: this is a simpler way to start
			oOData4SAPAnalyticsModel = this.oODataModel.getAnalyticalExtensions(),
			oTypeWithHierarchiesResults;

		assert.deepEqual(oOData4SAPAnalyticsModel.getAllQueryResultNames(),
			["ActualPlannedCostsResults", "TypeWithHierarchiesResults", "CONTRACTPERFResults"]);

		oActualPlannedCostsResults
			= oOData4SAPAnalyticsModel.findQueryResultByName("ActualPlannedCostsResults");

		assert.ok(oActualPlannedCostsResults instanceof odata4analytics.QueryResult);

		oTypeWithHierarchiesResults
			= oOData4SAPAnalyticsModel.findQueryResultByName("TypeWithHierarchiesResults");

		assert.ok(oTypeWithHierarchiesResults instanceof odata4analytics.QueryResult);

		oCONTRACTPERFResults
			= oOData4SAPAnalyticsModel.findQueryResultByName("CONTRACTPERFResults");

		assert.ok(oCONTRACTPERFResults instanceof odata4analytics.QueryResult);

		assert.deepEqual(oOData4SAPAnalyticsModel.getAllQueryResults(), {
			"ActualPlannedCostsResults" : oActualPlannedCostsResults,
			"CONTRACTPERFResults" : oCONTRACTPERFResults,
			"TypeWithHierarchiesResults" : oTypeWithHierarchiesResults
		});
	});

	//*********************************************************************************************
	QUnit.test("Parameterization", function (assert) {
		var oQueryResult = this.oODataModel.getAnalyticalExtensions()
				.findQueryResultByName("ActualPlannedCostsResults"),
			oQueryResultRequest,
			oParameterization,
			oParameterizationRequest;

		assert.strictEqual(oQueryResult.getEntitySet().getQName(), "ActualPlannedCostsResults");

		oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		assert.strictEqual(oQueryResultRequest.getQueryResult(), oQueryResult);

		oParameterization = oQueryResult.getParameterization();

		assert.ok(oParameterization instanceof odata4analytics.Parameterization);

		oParameterizationRequest = new odata4analytics.ParameterizationRequest(oParameterization);

		assert.strictEqual(oParameterizationRequest.getParameterization(), oParameterization);

		// set a simple parameter
		assert.ok(!oParameterization.findParameterByName("P_ControllingArea").isIntervalBoundary());

		oParameterizationRequest.setParameterValue("P_ControllingArea", "US01");

		// set a parameter interval
		assert.ok(oParameterization.findParameterByName("P_CostCenter").isIntervalBoundary());

		oParameterizationRequest.setParameterValue("P_CostCenter", "from", "to");
		// Note: the following is implied by using the 3rd parameter above
//		oParameterizationRequest.setParameterValue("P_CostCenterTo", "to");

		oQueryResultRequest.setParameterizationRequest(oParameterizationRequest);

		assert.strictEqual(oQueryResultRequest.getParameterizationRequest(),
			oParameterizationRequest);

		assert.strictEqual(oQueryResultRequest.getURIToQueryResultEntitySet(),
			"/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27from%27"
			+ ",P_CostCenterTo=%27to%27)/Results");
	});

	//*********************************************************************************************
	// this is how AnnotationHelper uses odata4analytics (nothing more)
	QUnit.test("sap.ovp.cards.AnnotationHelper", function (assert) {
		var oModelReference = new odata4analytics.Model.ReferenceByModel(this.oODataModel),
			oOData4SAPAnalyticsModel = new odata4analytics.Model(oModelReference),
			oQueryResult = oOData4SAPAnalyticsModel
				.findQueryResultByName("ActualPlannedCostsResults"),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult),
			oParameterization = oQueryResult.getParameterization(),
			oParameterizationRequest
				= new odata4analytics.ParameterizationRequest(oParameterization);

		oQueryResultRequest.setParameterizationRequest(oParameterizationRequest);
		oParameterizationRequest.setParameterValue("P_ControllingArea", "US01");
		oParameterizationRequest.setParameterValue("P_CostCenter", "from", "to");

		assert.strictEqual(oQueryResultRequest.getURIToQueryResultEntitySet(),
			"/ActualPlannedCosts(P_ControllingArea=%27US01%27,P_CostCenter=%27from%27"
			+ ",P_CostCenterTo=%27to%27)/Results",
			"result of sap.ovp.cards.AnnotationHelper.resolveParameterizedEntitySet");
		assert.strictEqual(oQueryResult.getEntitySet().getQName(), "ActualPlannedCostsResults",
			"catch block in case getURIToQueryResultEntitySet() fails");

		// also used:
		// this.oODataModel.getServiceMetadata()...
		// this.oODataModel.getMetaModel().getODataProperty(oEntityType, sPath);
	});

	//*********************************************************************************************
	QUnit.test("EntityType - static members, constructor and getters", function (assert) {
		var sNamespace = "http://www.sap.com/Protocols/SAPData",
			oFilterRestrictions,
			oHierarchy,
			oKey0 = {
				extensions : [
					{ namespace : sNamespace, name : "filterable", value : "true" },
					{ namespace : sNamespace, name : "filter-restriction", value : "interval" },
					{ namespace : sNamespace, name : "required-in-filter", value : "true" },
					{ namespace : sNamespace, name : "sortable", value : "false" }
				],
				name : "key0"
			},
			oKey1 = {
				extensions : [
					{ namespace : sNamespace, name : "filterable", value : "false" },
					{ namespace : sNamespace, name : "hierarchy-level-for", value : "property0" },
					{ namespace : sNamespace, name : "hierarchy-node-external-key-for",
						value : "property0"},
					{ namespace : sNamespace, name : "required-in-filter", value : "false" },
					{ namespace : sNamespace, name : "sortable", value : "true" }
				],
				name : "key1"
			},
			oProperty0 = {
				extensions : [
					{ namespace : "Foo", name : "filterable", value : "false" }, // unsupported NS
					{ namespace : sNamespace, name : "filter-restriction", value : "invalid" },
					{ namespace : sNamespace, name : "hierarchy-node-for", value : "key0" },
					{ namespace : sNamespace, name : "required-in-filter", value : "true" },
					{ namespace : "Foo", name : "sortable", value : "false" } // unsupported NS
				],
				name : "property0"
			},
			oProperty1 = {
				extensions : [
					{ namespace : sNamespace, name : "filter-restriction", value : "single-value" },
					{ namespace : sNamespace, name : "hierarchy-parent-node-for",
						value : "property0" }
				],
				name : "property1"
			},
			oProperty2 = {
				extensions : [
					{ namespace : sNamespace, name : "filter-restriction", value : "multi-value" },
					// workaround for GW bug
					{ namespace : sNamespace, name : "hierarchy-parent-nod", value : "property3" }
				],
				name : "property2"
			},
			oProperty3 = {
				extensions : [
					{ namespace : sNamespace, name : "hierarchy-node-for", value : "key1" }
				],
				name : "property3"
			},
			oProperty4 = {
				extensions : [
					{ namespace : sNamespace, name : "hierarchy-drill-state-for",
						value : "property2" }
					],
					name : "property4"
			},
			oDataJSEntityType = {
				key : {
					propertyRef : [oKey0, oKey1]
				},
				name : "EntityType",
				property : [oKey0, oKey1, oProperty0, oProperty1, oProperty2, oProperty3,
					oProperty4]
			},
			oModel = {},
			oProperties,
			oSchema = { namespace : "Schema.Namespace"},
			oEntityType = new odata4analytics.EntityType(oModel, oSchema, oDataJSEntityType);

		// static members
		assert.deepEqual(odata4analytics.EntityType.propertyFilterRestriction, {
				SINGLE_VALUE : "single-value",
				MULTI_VALUE : "multi-value",
				INTERVAL : "interval"
			}, "static mempers");

		// values provided in constructor
		assert.strictEqual(oEntityType.getModel(), oModel, "provided by constructor");
		assert.strictEqual(oEntityType.getSchema(), oSchema);
		assert.strictEqual(oEntityType.getTypeDescription(), oDataJSEntityType);
		assert.strictEqual(oEntityType.getQName(), "Schema.Namespace.EntityType");

		// content derived from oDataJSEntityType
		assert.deepEqual(oEntityType.getKeyProperties(), ["key0", "key1"], "keys");
		oProperties = oEntityType.getProperties();
		assert.strictEqual(Object.keys(oProperties).length, 7, "properties");
		assert.strictEqual(oProperties["key0"], oKey0);
		assert.strictEqual(oProperties["key1"], oKey1);
		assert.strictEqual(oProperties["property0"], oProperty0);
		assert.strictEqual(oProperties["property1"], oProperty1);
		assert.strictEqual(oProperties["property2"], oProperty2);
		assert.strictEqual(oProperties["property3"], oProperty3);
		assert.strictEqual(oProperties["property4"], oProperty4);
		assert.deepEqual(oEntityType.getFilterablePropertyNames(),
			["key0", "property0", "property1", "property2", "property3", "property4"],
			"filterable properties");
		assert.deepEqual(oEntityType.getSortablePropertyNames(),
			["key1", "property0", "property1", "property2", "property3", "property4"],
			"sortable properties");
		assert.deepEqual(oEntityType.getRequiredFilterPropertyNames(), ["key0", "property0"],
			"required-in-filter properties");
		oFilterRestrictions = oEntityType.getPropertiesWithFilterRestrictions();
		assert.strictEqual(Object.keys(oFilterRestrictions).length, 3, "filter restrictions");
		assert.strictEqual(oFilterRestrictions["key0"], "interval");
		assert.strictEqual(oFilterRestrictions["property1"], "single-value");
		assert.strictEqual(oFilterRestrictions["property2"], "multi-value");
		// hierarchies
		assert.strictEqual(oEntityType.getHierarchy("bar"), null, "hierarchies");
		assert.strictEqual(oEntityType._aHierarchyPropertyNames, null);
		assert.strictEqual(oEntityType.getAllHierarchyPropertyNames(),
			oEntityType._aHierarchyPropertyNames, "array of hierarchy properties stored");
		assert.ok(oEntityType.getAllHierarchyPropertyNames().indexOf("key0") >= 0);
		assert.ok(oEntityType.getAllHierarchyPropertyNames().indexOf("key1") >= 0);

		oHierarchy = oEntityType.getHierarchy("key0");
		assert.strictEqual(oHierarchy.getNodeExternalKeyProperty(), oKey1, "Hierarchy - key0");
		assert.strictEqual(oHierarchy.getNodeIDProperty(), oProperty0);
		assert.strictEqual(oHierarchy.getParentNodeIDProperty(), oProperty1);
		assert.strictEqual(oHierarchy.getNodeLevelProperty(), oKey1);
		assert.strictEqual(oHierarchy.getNodeValueProperty(), oKey0);
		oHierarchy = oEntityType.getHierarchy("key1");
		assert.strictEqual(oHierarchy.getNodeExternalKeyProperty(), undefined, "Hierarchy - key1");
		assert.strictEqual(oHierarchy.getNodeIDProperty(), oProperty3);
		assert.strictEqual(oHierarchy.getParentNodeIDProperty(), oProperty2);
		assert.strictEqual(oHierarchy.getNodeLevelProperty(), undefined);
		assert.strictEqual(oHierarchy.getNodeValueProperty(), oKey1);
		oHierarchy = oEntityType.getHierarchy("property2");
		assert.strictEqual(oHierarchy.getNodeExternalKeyProperty(), undefined,
			"Hierarchy - property2");
		assert.strictEqual(oHierarchy.getNodeIDProperty(), oProperty2);
		assert.strictEqual(oHierarchy.getParentNodeIDProperty(), undefined);
		assert.strictEqual(oHierarchy.getNodeLevelProperty(), undefined);
		assert.strictEqual(oHierarchy.getNodeValueProperty(), oProperty2);


		// private members at prototype
		assert.strictEqual(odata4analytics.EntityType.prototype._oEntityType, null,
			"prototype members");
		assert.strictEqual(odata4analytics.EntityType.prototype._oSchema, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._oModel, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._sQName, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._aKeyProperties, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._oPropertySet, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._aFilterablePropertyNames, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._aRequiredFilterPropertyNames,
			null);
		assert.strictEqual(odata4analytics.EntityType.prototype._oPropertyFilterRestrictionSet,
			null);
		assert.strictEqual(odata4analytics.EntityType.prototype._aHierarchyPropertyNames, null);
		assert.strictEqual(odata4analytics.EntityType.prototype._oRecursiveHierarchySet, null);
	});

	//*********************************************************************************************
	QUnit.test("RecursiveHierarchy - constructor and getters", function (assert) {
		var oEntityType = {},
			oNodeIDProperty = {},
			oParentNodeIDProperty = {},
			oNodeLevelProperty = {},
			oNodeValueProperty = {},
			oNodeExternalKeyProperty = {},
			oRecursiveHierarchy = new odata4analytics.RecursiveHierarchy(oEntityType,
				oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty, oNodeValueProperty,
				oNodeExternalKeyProperty);

		// static values
		assert.strictEqual(oRecursiveHierarchy.isRecursiveHierarchy(), true, "static values");
		assert.strictEqual(oRecursiveHierarchy.isLeveledHierarchy(), false);

		// values provided in constructor
		assert.strictEqual(oRecursiveHierarchy._oEntityType, oEntityType,
			"provided by constructor");
		assert.strictEqual(oRecursiveHierarchy.getNodeIDProperty(), oNodeIDProperty);
		assert.strictEqual(oRecursiveHierarchy.getParentNodeIDProperty(), oParentNodeIDProperty);
		assert.strictEqual(oRecursiveHierarchy.getNodeLevelProperty(), oNodeLevelProperty);
		assert.strictEqual(oRecursiveHierarchy.getNodeValueProperty(), oNodeValueProperty);
		assert.strictEqual(oRecursiveHierarchy.getNodeExternalKeyProperty(),
			oNodeExternalKeyProperty);

		// private members at prototype
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oEntityType, null,
			"prototype members");
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oNodeIDProperty, null);
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oParentNodeIDProperty,
			null);
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oNodeLevelProperty, null);
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oNodeValueProperty, null);
		assert.strictEqual(odata4analytics.RecursiveHierarchy.prototype._oNodeExternalKeyProperty,
			null);
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest - constructor and getters/setters", function (assert) {
		var oAnyValue = {},
			oParameterizationRequest = {},
			oQueryResult = {},
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult,
				oParameterizationRequest);

		// parameters given in the constructor
		assert.strictEqual(oQueryResultRequest.getQueryResult(), oQueryResult);
		assert.strictEqual(oQueryResultRequest.getParameterizationRequest(),
			oParameterizationRequest);

		// initial member values after constructor call
		assert.deepEqual(oQueryResultRequest._oAggregationLevel, {}, "initial member values");
		assert.deepEqual(oQueryResultRequest._oDimensionHierarchies, {});
		assert.deepEqual(oQueryResultRequest._oMeasures, {});
		assert.strictEqual(oQueryResultRequest._bIncludeEntityKey, false);
		assert.strictEqual(oQueryResultRequest._oFilterExpression, null);
		assert.strictEqual(oQueryResultRequest._oSortExpression, null);
		assert.strictEqual(oQueryResultRequest._oSelectedPropertyNames, null);

		// simple getter/setter
		oQueryResultRequest.setParameterizationRequest(oAnyValue);
		assert.strictEqual(oQueryResultRequest.getParameterizationRequest(), oAnyValue,
			"simple Getter/Setter");


		// private members at prototype
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oQueryResult, null,
			"prototype members");
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oParameterizationRequest,
			null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._sResourcePath, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oAggregationLevel, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oDimensionHierarchies,
			null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oMeasures, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._bIncludeEntityKey, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._bIncludeCount, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._bReturnNoEntities, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oFilterExpression, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._oSortExpression, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._iSkipRequestOption, null);
		assert.strictEqual(odata4analytics.QueryResultRequest.prototype._iTopRequestOption, null);
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#addRecursiveHierarchy", function (assert) {
		var oDimension = {
				getHierarchy : function () {}
			},
			oDimensionMock = sinon.mock(oDimension),
			oHierarchy = {},
			bIncludeExternalKey = {/* object instead of boolean to test same instance*/},
			bIncludeText = {/* object instead of boolean to test same instance*/},
			sName = "HierarchyDimensionName",
			oQueryResult = {
				findDimensionByName : function () {}
			},
			oQueryResultMock = sinon.mock(oQueryResult),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		oQueryResultMock.expects("findDimensionByName").never();

		// code under test
		oQueryResultRequest.addRecursiveHierarchy();

		oQueryResultMock.expects("findDimensionByName").withExactArgs(sName).returns();

		// code under test
		assert.throws(function () {
			oQueryResultRequest.addRecursiveHierarchy(sName);
		}, new Error("'" + sName + "' is not a dimension property"));

		oQueryResultMock.expects("findDimensionByName")
			.withExactArgs(sName)
			.returns(oDimension);
		oDimensionMock.expects("getHierarchy").withExactArgs().returns(null);

		// code under test - given name is a dimension without a hierarchy
		assert.throws(function () {
			oQueryResultRequest.addRecursiveHierarchy(sName);
		}, new Error("Dimension '" + sName + "' does not have a hierarchy"));

		oQueryResultRequest._oSelectedPropertyNames = {};
		oQueryResultRequest._oDimensionHierarchies = {};

		oQueryResultMock.expects("findDimensionByName")
			.withExactArgs(sName)
			.returns(oDimension);
		oDimensionMock.expects("getHierarchy").withExactArgs().returns(oHierarchy);

		// code under test - success
		oQueryResultRequest.addRecursiveHierarchy(sName, bIncludeExternalKey, bIncludeText);

		assert.strictEqual(oQueryResultRequest._oSelectedPropertyNames, null,
			"compiled list of selected properties reset");
		assert.deepEqual(oQueryResultRequest._oDimensionHierarchies[sName], {
			id : true,
			externalKey : bIncludeExternalKey,
			text : bIncludeText
		});
		assert.strictEqual(oQueryResultRequest._oDimensionHierarchies[sName].externalKey,
			bIncludeExternalKey);
		assert.strictEqual(oQueryResultRequest._oDimensionHierarchies[sName].text, bIncludeText);

		oDimensionMock.verify();
		oQueryResultMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#getURIQueryOptionValue: $select - aggregation level",
			function (assert) {
		var mDimensions,
			oQueryResult = {
				findDimensionByName : function (sName) {
					return mDimensions[sName];
				}
			},
			oDimension0 = new odata4analytics.Dimension(oQueryResult, {name : "dimension0"}),
			oDimension1 = new odata4analytics.Dimension(oQueryResult, {name : "dimension1"}),
			oDimension2 = new odata4analytics.Dimension(oQueryResult, {name : "dimension2"}),
			oDimension0Mock = sinon.mock(oDimension0),
			oDimension2Mock = sinon.mock(oDimension2),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		mDimensions = { // do initialization here to avoid eslint warning
			dimension0 : oDimension0,
			dimension1 : oDimension1,
			dimension2 : oDimension2
		};

		assert.strictEqual(oQueryResultRequest._oSelectedPropertyNames, null, "Check precondition");

		// code under test - no selects
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"), null);

		// prepare test data
		oQueryResultRequest._oAggregationLevel = {
			dimension0 : {text : true}, // but no text property -> not part of select
			dimension1 : {key : true},
			dimension2 : {key : true, text : true, attributes : ["dimension1", "attribute1"]}
		};

		oDimension0Mock.expects("getTextProperty").withExactArgs().returns(null);
		oDimension2Mock.expects("getTextProperty")
			.withExactArgs()
			.returns({name : "dimension2Text"});
		oDimension2Mock.expects("findAttributeByName")
			.withExactArgs("dimension1")
			.returns({getName : function () { return "dimension1"; }});
		oDimension2Mock.expects("findAttributeByName")
			.withExactArgs("attribute1")
			.returns({getName : function () { return "attribute1"; }});

		// code under test - with selects
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"),
			"dimension1,dimension2,dimension2Text,attribute1");
		assert.deepEqual(oQueryResultRequest._oSelectedPropertyNames, {
			attribute1 : true,
			dimension1 : true,
			dimension2 : true,
			dimension2Text : true
		});

		oDimension0Mock.verify();
		oDimension2Mock.verify();
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#getURIQueryOptionValue: $select - measures", function (assert) {
		var mMeasures,
			oQueryResult = {
				findMeasureByName : function (sName) {
					return mMeasures[sName];
				}
			},
			oMeasure0 = new odata4analytics.Measure(oQueryResult, {name : "measure0"}),
			oMeasure1 = new odata4analytics.Measure(oQueryResult, {name : "measure1"}),
			oMeasure2 = new odata4analytics.Measure(oQueryResult, {name : "measure2"}),
			oMeasure0Mock = sinon.mock(oMeasure0),
			oMeasure1Mock = sinon.mock(oMeasure1),
			oMeasure2Mock = sinon.mock(oMeasure2),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		mMeasures = { // do initialization here to avoid eslint warning
			measure0 : oMeasure0,
			measure1 : oMeasure1,
			measure2 : oMeasure2
		};

		// prepare test data
		oQueryResultRequest._oMeasures = {
			// neither a formatted value nor a unit property -> not part of select
			measure0 : {text : true, unit : true},
			measure1 : {value : true},
			measure2 : {value : true, text : true, unit : true}
		};

		oMeasure1Mock.expects("getRawValueProperty")
			.withExactArgs()
			.returns({name : "measure1"});
		oMeasure2Mock.expects("getRawValueProperty")
			.withExactArgs()
			.returns({name : "measure2"});
		oMeasure0Mock.expects("getFormattedValueProperty").withExactArgs().returns(null);
		oMeasure2Mock.expects("getFormattedValueProperty")
			.withExactArgs()
			.returns({name : "measure2Text"});
		oMeasure0Mock.expects("getUnitProperty").withExactArgs().returns(null);
		oMeasure2Mock.expects("getUnitProperty")
			.withExactArgs()
			.returns({name : "measure2Unit"});

		// code under test
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"),
			"measure1,measure2,measure2Text,measure2Unit");
		assert.deepEqual(oQueryResultRequest._oSelectedPropertyNames, {
			measure1 : true,
			measure2 : true,
			measure2Text : true,
			measure2Unit : true
		});

		oMeasure0Mock.verify();
		oMeasure1Mock.verify();
		oMeasure2Mock.verify();
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#getURIQueryOptionValue: $select - keys", function (assert) {
		var oKeyProperty0 = {name : "key0"},
			oKeyProperty1 = {name : "key1"},
			oQueryResult = {
				getEntityType : function () {
					return {
						getTypeDescription : function () {
							return {
								key : {
									propertyRef : [oKeyProperty0, oKeyProperty1]
								}
							};
						}
					};
				}
			},
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		// prepare test data
		oQueryResultRequest._bIncludeEntityKey = true;

		// code under test
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"), "key0,key1");

		// keys are not added to _oSelectedPropertyNames - why?
		assert.deepEqual(oQueryResultRequest._oSelectedPropertyNames, {});
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#getURIQueryOptionValue: $select - dimension hierarchies",
			function (assert) {
		var oEntityType = {getTextPropertyOfProperty : function () {}},
			oEntityTypeMock = sinon.mock(oEntityType),
			mHierarchy,
			oHierarchy0 = new odata4analytics.RecursiveHierarchy({/*EntityType*/},
				{/*oNodeIDProperty*/
					name : "nodeId0"
				}, {/*oParentNodeIDProperty*/}, {/*oNodeLevelProperty*/},
				{/*oNodeValueProperty*/},
				{/*oNodeExternalKeyProperty*/
					name : "externalKey0"
				}),
			oHierarchy1 = new odata4analytics.RecursiveHierarchy({},
				{
					name : "nodeId1"
				}, {}, {}, {}, {}),
			oHierarchy2 = new odata4analytics.RecursiveHierarchy({},
				{
					name : "nodeId2"
				}, {}, {}, {}, {}),
			oQueryResult = {
				findDimensionByName : function (sName) {
					return {
						getHierarchy : function () {
							return mHierarchy[sName] || null;
						}
					};
				},
				getEntityType : function () { return oEntityType; }
			},
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		mHierarchy = { // do initialization here to avoid eslint warning
			dimension0 : oHierarchy0,
			dimension1 : oHierarchy1,
			dimension2 : oHierarchy2
		};

		// prepare test data
		oQueryResultRequest._oDimensionHierarchies = {
			dimension0 : {id : true, externalKey : true, text : true}, // but no text property
			dimension1 : {id : true, text : true},
			dimension2 : {}
		};

		oEntityTypeMock.expects("getTextPropertyOfProperty")
			.withExactArgs("nodeId0")
			.returns(null);
		oEntityTypeMock.expects("getTextPropertyOfProperty")
			.withExactArgs("nodeId1")
			.returns({name : "nodeIdText1"});

		// code under test
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"),
			"nodeId0,externalKey0,nodeId1,nodeIdText1");

		assert.deepEqual(oQueryResultRequest._oSelectedPropertyNames, {
			externalKey0 : true,
			nodeId0 : true,
			nodeId1 : true,
			nodeIdText1 : true
		});

		oEntityTypeMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("QueryResultRequest#getURIQueryOptionValue: $select - mixed", function (assert) {
		var mDimensions,
			oKeyProperty = {name : "key"},
			mMeasures,
			oEntityType = {
				getTextPropertyOfProperty : function () {},
				getTypeDescription : function () {
					return {
						key : {
							propertyRef : [oKeyProperty]
						}
					};
				}
			},
			oQueryResult = {
				findDimensionByName : function (sName) {
					return mDimensions[sName];
				},
				findMeasureByName : function (sName) {
					return mMeasures[sName];
				},
				getEntityType : function () {
					return oEntityType;
				}
			},
			oDimension = new odata4analytics.Dimension(oQueryResult, {name : "dimension"}),
			oDimensionMock = sinon.mock(oDimension),
			oEntityTypeMock = sinon.mock(oEntityType),
			oHierarchy = new odata4analytics.RecursiveHierarchy({/*EntityType*/},
					{/*oNodeIDProperty*/
						name : "nodeId"
					}, {/*oParentNodeIDProperty*/}, {/*oNodeLevelProperty*/},
					{/*oNodeValueProperty*/},
					{/*oNodeExternalKeyProperty*/
						name : "externalKey"
					}),
			oHierarchyDimension = new odata4analytics.Dimension(oQueryResult,
				{name : "hierarchyDimension"}),
			oHierarchyDimensionMock = sinon.mock(oHierarchyDimension),
			oMeasure = new odata4analytics.Measure(oQueryResult, {name : "measure"}),
			oMeasureMock = sinon.mock(oMeasure),
			oQueryResultRequest = new odata4analytics.QueryResultRequest(oQueryResult);

		mDimensions = { // do initialization here to avoid eslint warning
			dimension : oDimension,
			hierarchyDimension : oHierarchyDimension
		};
		mMeasures = { // do initialization here to avoid eslint warning
			measure : oMeasure
		};

		// prepare test data
		oQueryResultRequest._bIncludeEntityKey = true;
		oQueryResultRequest._oAggregationLevel = {
			dimension : {key : true, text : true, attributes : ["attribute"]}
		};
		oQueryResultRequest._oDimensionHierarchies = {
			hierarchyDimension : {id : true, externalKey : true, text : true}
		};
		oQueryResultRequest._oMeasures = {
			measure : {value : true, text : true, unit : true}
		};

		oDimensionMock.expects("getTextProperty").withExactArgs().returns({name : "dimensionText"});
		oDimensionMock.expects("findAttributeByName")
			.withExactArgs("attribute")
			.returns({getName : function () { return "attribute"; }});
		oHierarchyDimensionMock.expects("getHierarchy").withExactArgs().returns(oHierarchy);
		oMeasureMock.expects("getRawValueProperty")
			.withExactArgs()
			.returns({name : "measure"});
		oMeasureMock.expects("getFormattedValueProperty")
			.withExactArgs()
			.returns({name : "measureText"});
		oMeasureMock.expects("getUnitProperty")
			.withExactArgs()
			.returns({name : "dimension"});
		oEntityTypeMock.expects("getTextPropertyOfProperty")
			.withExactArgs("nodeId")
			.returns({name : "nodeIdText"});

		// code under test - with selects
		assert.strictEqual(oQueryResultRequest.getURIQueryOptionValue("$select"),
			"dimension,dimensionText,attribute,measure,measureText,nodeId,externalKey,nodeIdText,"
				+ "key");

		assert.deepEqual(oQueryResultRequest._oSelectedPropertyNames, {
			attribute : true,
			dimension : true,
			dimensionText : true,
			externalKey : true,
			measure : true,
			measureText : true,
			nodeId : true,
			nodeIdText : true
		});

		oDimensionMock.verify();
		oEntityTypeMock.verify();
		oHierarchyDimensionMock.verify();
		oMeasureMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("_renderPropertyFilterValue", function (assert) {
		const oDataUtilsMock = sinon.mock(ODataUtils);
		oDataUtilsMock.expects("_formatValue")
			.withExactArgs("~sFilterValue", "~sPropertyEDMTypeName", true, "~sFractionalSeconds")
			.returns("~unecoded Value");

		// code under test
		assert.strictEqual(new odata4analytics.FilterExpression()._renderPropertyFilterValue("~sFilterValue",
			"~sPropertyEDMTypeName", "~sFractionalSeconds"), "%7eunecoded%20Value");

		oDataUtilsMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("_renderPropertyFilterValue, Edm.Time", function (assert) {
		const oDataUtilsMock = sinon.mock(ODataUtils);
		oDataUtilsMock.expects("_formatValue")
			.withExactArgs({ms : 42, __edmType : "Edm.Time"}, "Edm.Time", true, "~sFractionalSeconds")
			.returns("~unecoded Value");

		// code under test
		assert.strictEqual(new odata4analytics.FilterExpression()._renderPropertyFilterValue("42", "Edm.Time",
			"~sFractionalSeconds"), "%7eunecoded%20Value");

		oDataUtilsMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("_renderPropertyFilterValue, Edm.Time but not only digits", function (assert) {
		const oDataUtilsMock = sinon.mock(ODataUtils);
		oDataUtilsMock.expects("_formatValue")
			.withExactArgs("42notOnlyDigits", "Edm.Time", true, "~sFractionalSeconds")
			.returns("~unecoded Value");

		// code under test
		assert.strictEqual(new odata4analytics.FilterExpression()._renderPropertyFilterValue("42notOnlyDigits",
			"Edm.Time", "~sFractionalSeconds"), "%7eunecoded%20Value");

		oDataUtilsMock.verify();
	});

	//*********************************************************************************************
[
	{sOperator: FilterOperator.BT, sExpectedResult: "(~sPath ge ~renderedValue1 and ~sPath le ~renderedValue2)"},
	{sOperator: FilterOperator.NB, sExpectedResult: "(~sPath lt ~renderedValue1 or ~sPath gt ~renderedValue2)"},
	{sOperator: FilterOperator.Contains, sExpectedResult: "substringof(~renderedValue1,~sPath)"},
	{sOperator: FilterOperator.NotContains, sExpectedResult: "not substringof(~renderedValue1,~sPath)"},
	{sOperator: FilterOperator.StartsWith, sExpectedResult: "startswith(~sPath,~renderedValue1)"},
	{sOperator: FilterOperator.EndsWith, sExpectedResult: "endswith(~sPath,~renderedValue1)"},
	{sOperator: FilterOperator.NotStartsWith, sExpectedResult: "not startswith(~sPath,~renderedValue1)"},
	{sOperator: FilterOperator.NotEndsWith, sExpectedResult: "not endswith(~sPath,~renderedValue1)"},
	{sOperator: "OtherOperator", sExpectedResult: "~sPath otheroperator ~renderedValue1"}
].forEach((oFixture) => {
	QUnit.test("renderUI5Filter: " + oFixture.sOperator, function (assert) {
		const oFilter = {
			sPath: "~sPath",
			sOperator : oFixture.sOperator,
			oValue1 : "~sValue1",
			oValue2 : "~sValue2",
			sFractionalSeconds1 : "~sFractionalSeconds1",
			sFractionalSeconds2 : "~sFractionalSeconds1"
		};
		const oProperty = {type : "~sEDMTypeName"};
		const oEntityType = {findPropertyByName : function () {}};
		const oFilterExpression = new odata4analytics.FilterExpression(undefined, undefined, oEntityType);
		const oFilterExpressionMock = sinon.mock(oFilterExpression);
		const oEntityMock = sinon.mock(oFilterExpression._oEntityType);
		oEntityMock.expects("findPropertyByName").withExactArgs(oFilter.sPath).returns(oProperty);
		const aStringOperators = [FilterOperator.Contains, FilterOperator.NotContains, FilterOperator.StartsWith,
			FilterOperator.EndsWith, FilterOperator.NotStartsWith, FilterOperator.NotEndsWith];
		if (aStringOperators.includes(oFixture.sOperator)) {
			oFilterExpressionMock.expects("_renderPropertyFilterValue")
				.withExactArgs(oFilter.oValue1, "Edm.String")
				.returns("~renderedValue1");
		} else {
			oFilterExpressionMock.expects("_renderPropertyFilterValue")
				.withExactArgs(oFilter.oValue1, oProperty.type, oFilter.sFractionalSeconds1)
				.returns("~renderedValue1");
		}
		if ([FilterOperator.BT, FilterOperator.NB].includes(oFixture.sOperator)) {
			oFilterExpressionMock.expects("_renderPropertyFilterValue")
				.withExactArgs(oFilter.oValue2, oProperty.type, oFilter.sFractionalSeconds2)
				.returns("~renderedValue2");
		}

		// code under test
		assert.strictEqual(oFilterExpression.renderUI5Filter(oFilter), oFixture.sExpectedResult);

		oEntityMock.verify();
		oFilterExpressionMock.verify();
	});
});

	//*********************************************************************************************
	QUnit.test("renderUI5Filter: fails", function (assert) {
		const oEntityType = {findPropertyByName : function () {}};
		const oFilterExpression = new odata4analytics.FilterExpression(undefined, undefined, oEntityType);
		const oEntityMock = sinon.mock(oFilterExpression._oEntityType);
		oEntityMock.expects("findPropertyByName").withExactArgs("~sPath").returns(null);

		// code under test
		assert.throws(function () {
			oFilterExpression.renderUI5Filter({sPath: "~sPath"});
		}, /Cannot add filter condition for unknown property name ~sPath/);

		oEntityMock.verify();
	});

	//*********************************************************************************************
	// BCP: 985176/2023
	QUnit.test("renderUI5FilterArray", function (assert) {
		const aFilterArray = [
			{sPath: 'Material'},
			{aFilters: [/*Multi Filter*/]},
			{sPath: 'MaterialDocument', sOperator: 'EQ', oValue1: '4900005860'},
			{sPath: 'MaterialDocument', sOperator: 'EQ', oValue1: "4900005859"},
			{sPath: 'MaterialDocument', sOperator: 'EQ', oValue1: '4900005915'},
			{sPath: 'MaterialDocument', sOperator: 'EQ', oValue1: '4900005916'},
			{sPath: 'MaterialGroup'},
			{sPath: 'MaterialType'},
			{sPath: 'Plant'},
			{sPath: 'ReversalMovementIsSelected'},
			{sPath: 'StockLevelIsValuated'},
			{sPath: 'StorageLocation'}
		];
		const oFilterExpression = new odata4analytics.FilterExpression();
		const oFilterExpressionMock = this.mock(oFilterExpression);
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[0]).returns("~Material");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[2]).returns("~MaterialDocument0");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[3]).returns("~MaterialDocument1");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[4]).returns("~MaterialDocument2");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[5]).returns("~MaterialDocument3");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[6]).returns("~MaterialGroup");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[7]).returns("~MaterialType");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[8]).returns("~Plant");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[9])
			.returns("~ReversalMovementIsSelected");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[10])
			.returns("~StockLevelIsValuated");
		oFilterExpressionMock.expects("renderUI5Filter").withExactArgs(aFilterArray[11]).returns("~StorageLocation");
		oFilterExpressionMock.expects("renderUI5MultiFilter").withExactArgs(aFilterArray[1]).returns("~MultiFilter");

		// code under test
		assert.strictEqual(oFilterExpression.renderUI5FilterArray(aFilterArray.slice()),
			"(~Material) and (~MaterialDocument0 or ~MaterialDocument1 or ~MaterialDocument2 or ~MaterialDocument3)"
			+ " and (~MaterialGroup) and (~MaterialType) and (~Plant) and (~ReversalMovementIsSelected)"
			+ " and (~StockLevelIsValuated) and (~StorageLocation) and (~MultiFilter)");
	});

	//*********************************************************************************************
	QUnit.test("deepEqual", function (assert) {
		var aColumns = [];

		function test(iExpectedResult, sProperty) {
			var oNewColumn = {},
				aNewColumns = [{}, oNewColumn],
				oOldColumn = {},
				aOldColumns = [{}, oOldColumn];

			oNewColumn[sProperty] = "new";
			oOldColumn[sProperty] = "old";
			if (iExpectedResult === 2) { // important changes win
				aNewColumns.unshift({formatter : "new"});
				aOldColumns.unshift({formatter : "old"});
			}

			// code under test
			assert.strictEqual(
				odata4analytics.helper.deepEqual(aOldColumns, aNewColumns),
				iExpectedResult);
		}

		// code under test
		assert.strictEqual(odata4analytics.helper.deepEqual(undefined, []), 2,
			"_aLastChangedAnalyticalInfo is initially undefined");

		// code under test
		assert.strictEqual(odata4analytics.helper.deepEqual(aColumns, aColumns), 0);

		// code under test
		assert.strictEqual(odata4analytics.helper.deepEqual([], [{}]), 2);

		["grouped", "inResult", "level", "name", "total", "visible"].forEach(test.bind(null, 2));
		// changes to formatter do not affect GET requests, but only AnalyticalBinding#getGroupName
		["formatter"].forEach(test.bind(null, 1));
		// Note: these appear in test code and real life, but are ignored by our code
		["sorted", "sortOrder"].forEach(test.bind(null, 0));

		// code under test
		assert.strictEqual(odata4analytics.helper.deepEqual([], []), 0);
	});

	//*********************************************************************************************
	QUnit.test("deepEqual: fnFormatterChanged", function (assert) {
		var o = {
				formatterChanged : function () {}
			},
			oMock = this.mock(o),
			aNewColumns = [{
				name : "a",
				formatter : 0
			}, {
				name : "b",
				formatter : 0
			}, {
				name : "c",
				formatter : 0
			}],
			aOldColumns = [{
				name : "a",
				formatter : 1
			}, {
				name : "b",
				formatter : 0
			}, {
				name : "c",
				formatter : 1
			}];

		oMock.expects("formatterChanged").withExactArgs(sinon.match.same(aNewColumns[0]));
		oMock.expects("formatterChanged").withExactArgs(sinon.match.same(aNewColumns[2]));

		// code under test
		assert.strictEqual(
			odata4analytics.helper.deepEqual(aOldColumns, aNewColumns, o.formatterChanged),
			1);
	});

/** @deprecated As of version 1.94.0 */
[{
	sModel : "sap/ui/model/odata/ODataModel",
	mParameter : undefined
}, {
	sModel : "sap/ui/model/odata/ODataModel",
	mParameter : {modelVersion : 1}
}, {
	sModel : "sap/ui/model/odata/v2/ODataModel",
	mParameter : {modelVersion : 2}
}].forEach((oFixture) => {
	[true, false].forEach((bPreloaded) => {
	QUnit.test(`Model#_init: requires ${oFixture.sModel} instance, already loaded: ${bPreloaded}`, function (assert) {
		const oODataModelClassMock = this.mock();
		const oSapUiMock = this.mock(sap.ui);
		oSapUiMock.expects("require")
			.withExactArgs(oFixture.sModel)
			.returns(bPreloaded ? oODataModelClassMock : undefined);
		oSapUiMock.expects("requireSync")
			.withExactArgs(oFixture.sModel)
			.exactly(bPreloaded ? 0 : 1)
			.returns(oODataModelClassMock);
		const oODataModel = {getServiceMetadata() {}, attachMetadataLoaded() {}};
		oODataModelClassMock.withExactArgs("~sServiceURI").returns(oODataModel);
		const oODataModelMock = this.mock(oODataModel);
		oODataModelMock.expects("getServiceMetadata")
			.withExactArgs()
			.exactly(2)
			.returns(undefined);
		oODataModelMock.expects("attachMetadataLoaded").withExactArgs(sinon.match.func);
		const oModel = {};

		// code under test
		odata4analytics.Model.prototype._init.call(oModel, new odata4analytics.Model.ReferenceByURI("~sServiceURI"),
			oFixture.mParameter);

		assert.strictEqual(oModel._mParameter, oFixture.mParameter);
		assert.deepEqual(oModel._oActivatedWorkarounds, {});
		assert.strictEqual(oModel._oModel, oODataModel);
	});
	});
});
});
//TODO QueryResultRequest: aggregation level and measure handling, setResourcePath,
// includeDimensionKeyTextAttributes, includeMeasureRawFormattedValueUnit
//TODO odata4analytics.QueryResult

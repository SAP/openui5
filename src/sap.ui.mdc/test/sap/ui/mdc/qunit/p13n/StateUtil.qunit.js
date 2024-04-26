/* global QUnit, sinon */
sap.ui.define([
	"sap/m/p13n/Engine",
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
	"sap/ui/mdc/chart/Item",
	"sap/ui/mdc/odata/v4/TypeMap",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/p13n/modules/StateHandlerRegistry",
	"sap/base/util/merge",
	"sap/ui/model/odata/type/String", // to have types loaded, needed for legacy-free UI5
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/Guid",
	"sap/ui/mdc/odata/TypeMap"
], function (
	Engine,
	createAppEnvironment,
	TableDelegate,
	Column,
	StateUtil,
	FilterBarDelegate,
	FilterField,
	ChartDelegate,
	ChartItem,
	ODataV4TypeMap,
	OperatorName,
	StateHandlerRegistry,
	merge,
	StringType,
	BooleanType,
	Int16Type,
	Int32Type,
	Int64Type,
	SByteType,
	DecimalType,
	DoubleType,
	DateType,
	TimeOfDayType,
	DateTimeOffsetType,
	GuidType,
	TypeMap
) {
	"use strict";

	function createFilterItem(oFilterBar, sPropertyName, mPropertyBag) {
		return new Promise(function(resolve, reject){
			resolve(new FilterField({
				conditions: "{$filters>/conditions/" + sPropertyName + "}",
				propertyKey: sPropertyName
			}));
		});
	}

	function fetchProperties() {
		const mProperties = {
			String: {label: "String",name:"String",dataType:"Edm.String", groupable: true},
			Boolean: {label: "Boolean",name:"Boolean",dataType:"Edm.Boolean"},
			Int16: {label: "Int16",name:"Int16",dataType:"Edm.Int16"},
			Int32: {label: "Int32",name:"Int32",dataType:"Edm.Int32"},
			Int64: {label: "Int64",name:"Int64",dataType:"Edm.Int64"},
			SByte: {label: "SByte",name:"SByte",dataType:"Edm.SByte"},
			Decimal: {label: "Decimal",name:"Decimal",dataType:"Edm.Decimal"},
			Single: {label: "Single",name:"Single",dataType:"Edm.String"},
			Double: {label: "Double",name:"Double",dataType:"Edm.Double"},
			Date: {label: "Date",name:"Date",dataType:"Edm.Date"},
			TimeOfDay: {label: "TimeOfDay",name:"TimeOfDay",dataType:"Edm.TimeOfDay"},
			DateTimeOffset: {label: "DateTimeOffset",name:"DateTimeOffset",dataType:"Edm.DateTimeOffset"},
			Guid: {label: "Guid",name:"Guid",dataType:"Edm.Guid"}
		};

		const aProperties = [];
		for (const sProperty in mProperties) {
			aProperties.push({
				name: mProperties[sProperty].name,
				label: mProperties[sProperty].label,
				dataType: mProperties[sProperty].dataType
				//filterable: mProperties[sProperty].filterable
			});
		}
		return Promise.resolve(aProperties);
	}

	function getTypeMap() {
		return TypeMap;
	}

	QUnit.module("API tests for FilterBar", {
		before: function(){

			const sFilterBarView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:FilterBar id="myFilterBar" p13nMode="Item,Value"></mdc:FilterBar></mvc:View>';

			FilterBarDelegate.fetchProperties = fetchProperties;
			FilterBarDelegate.addItem = createFilterItem;
			FilterBarDelegate.getTypeMap = getTypeMap;
			return createAppEnvironment(sFilterBarView, "FilterBar").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
			}.bind(this));
		},
		beforeEach: function(){
			this.oFilterBar = this.oView.byId('myFilterBar');
			this.oFilterBar.setPropertyInfo([]);
			this.oFilterBar.removeAllFilterItems([]);
		},
		afterEach: function(){
			this.oFilterBar.setFilterConditions({});
		},
		after: function(){
			delete FilterBarDelegate.apiVersion;//CLEANUP_DELEGATTE
			this.oUiComponentContainer = null;
			this.oView = null;
			this.oFilterBar.destroy();
		}
	});

	//Removal of 'EEQ' operator
	QUnit.test("call 'applyExternalState' with 'EEQ' operator' and non existing operator", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": "EEQ", "values": [true] }],
			"Decimal":[{"operator": "ImaginaryOperator","values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions
		};

		//we expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition + 2x addMetadata
			assert.equal(aDirtyChanges.length, 2, "The correct amount of changes has been created");

			StateUtil.retrieveExternalState(this.oFilterBar).then(function(oState){

				assert.equal(Object.keys(oState.filter).length, 2, "EEQ has not been considered in ChangeHandler");
				assert.ok(oState.filter.String);
				assert.ok(oState.filter.Date);

				assert.equal(Object.keys(this.oFilterBar.getFilterConditions()).length, 2, "The correct filter state has been set");
				assert.deepEqual(mFilterConditions, this.oFilterBar.getFilterConditions(), "The state object as been modified due to sanity");

				done();
			}.bind(this));
		}.bind(this));
	});

	/*********************************************************************************************/
	/****************************** Condition based Changes***************************************/
	/*********************************************************************************************/

	QUnit.test("retrieveExternalState for FilterBar without any conditions", function(assert){
		const done = assert.async();

		//If there are no conditions explicitly set, the retrieved state shold return an empty 'filter' object
		StateUtil.retrieveExternalState(this.oFilterBar).then(function(oExternalizedState){
			assert.ok(oExternalizedState,"Externalized state has been retrieved");
			assert.equal(oExternalizedState.hasOwnProperty("filter"),true,"Externalized state includes 'filter' attribute");
			done();
		});

	});

	QUnit.test("applyExternalState to FilterBar without any conditions + retrieve afterwards", function(assert){
		const done = assert.async();

		const oExternalState = {
			filter: {
				"String":[{"operator": OperatorName.Contains,"values":["YUHUUU"]}],
				"Boolean":[{"operator": OperatorName.EQ,"values":[true]}],
				"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
				"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
			},
			items: []
		};

		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
			assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");

			//check if the changes hold the correct content
			assert.equal(aDirtyChanges[0].getContent().condition, oExternalState.filter.String[0], "The correct 'addCondition' change has been created");
			assert.equal(aDirtyChanges[1].getContent().condition, oExternalState.filter.Boolean[0], "The correct 'addCondition' change has been created");
			assert.equal(aDirtyChanges[2].getContent().condition, oExternalState.filter.Decimal[0], "The correct 'addCondition' change has been created");
			assert.equal(aDirtyChanges[3].getContent().condition, oExternalState.filter.Date[0], "The correct 'addCondition' change has been created");

			StateUtil.retrieveExternalState(this.oFilterBar).then(function(oRetrievedState){

				//check if the retrieved state matches the applied state
				assert.ok(oRetrievedState, "Externalized State has been retrieved");
				assert.deepEqual(oRetrievedState, oExternalState, "The retried state matches the applied state");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' without new conditions (no change expected)", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		this.oFilterBar.setFilterConditions(mFilterConditions);

		const oExternalState = {
			filter: mFilterConditions,
			items: []
		};

		//call applyExternalState with a state that matches the current condition's baseline --> no changes expected
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
			assert.equal(aDirtyChanges.length, 0, "The correct amount of changes has been created");

			//as we dit not change the state, we expect 'retrieveExternalState' to retrieve the same state has before
			StateUtil.retrieveExternalState(this.oFilterBar).then(function(oRetrievedState){
				assert.ok(oRetrievedState, "Externalized State has been retrieved");
				assert.deepEqual(oRetrievedState, oExternalState, "The retried state matches the applied state");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' with new conditions for existing conditions", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const mFilterConditionsNew = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [false] }],//set to false --> only add one filter value as delta and not remove existing value
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		this.oFilterBar.setFilterConditions(mFilterConditions);

		const oExternalState = {
			filter: mFilterConditionsNew,
			items: []
		};

		//cwe expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 1, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "Boolean", "The correct property is affected");

			//we expect the retrieved staste to match the latest changes
			StateUtil.retrieveExternalState(this.oFilterBar).then(function(oRetrievedState){
				assert.ok(oRetrievedState, "Externalized State has been retrieved");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' with the same conditions twice", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions
		};

		//we expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition + addPropertyInfo
			assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
			assert.equal(aDirtyChanges[1].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
			assert.equal(aDirtyChanges[2].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[2].getContent().name, "Decimal", "The correct property is affected");
			assert.equal(aDirtyChanges[3].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[3].getContent().name, "Date", "The correct property is affected");

			//the second time there should not be any changes
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' with an empty objects --> no implict reset triggered", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions
		};

			//we expect one change and the other conditions to be unaffected by the change
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

				//an existing value has been changed --> removeCondition + addCondition
				assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");
				assert.equal(aDirtyChanges[0].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
				assert.equal(aDirtyChanges[1].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
				assert.equal(aDirtyChanges[2].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[2].getContent().name, "Decimal", "The correct property is affected");
				assert.equal(aDirtyChanges[3].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[3].getContent().name, "Date", "The correct property is affected");

				//the second time there should not be any changes
				const oResetState = {
					filter: {
						"String": [],
						"Boolean": [],
						"Decimal":[],
						"Date":[]
					}
				};

				StateUtil.applyExternalState(this.oFilterBar, oResetState).then(function(aDirtyChanges){
					assert.equal(aDirtyChanges.length, 0, "No implicit removal! Only explicitly conditions will be removed.");
					done();
				});
			}.bind(this));
	});

	QUnit.test("call 'applyExternalState' with an empty objects --> explicit reset triggered", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions
		};

			//we expect one change and the other conditions to be unaffected by the change
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

				//an existing value has been changed --> removeCondition + addCondition
				assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");
				assert.equal(aDirtyChanges[0].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
				assert.equal(aDirtyChanges[1].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
				assert.equal(aDirtyChanges[2].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[2].getContent().name, "Decimal", "The correct property is affected");
				assert.equal(aDirtyChanges[3].getChangeType(), "addCondition", "The condition change for add has been created");
				assert.equal(aDirtyChanges[3].getContent().name, "Date", "The correct property is affected");

				//the second time there should not be any changes
				const oResetState = {
					filter: {
						"String": [{ "operator": OperatorName.Contains, "values": ["Test"], "filtered": false }],
						"Boolean": [{ "operator": OperatorName.EQ, "values": [true], "filtered": false }],
						"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"], "filtered": false}],
						"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"], "filtered": false}]
					}
				};

				StateUtil.applyExternalState(this.oFilterBar, oResetState).then(function(aDirtyChanges){
					assert.equal(aDirtyChanges.length, 4, "Conditions will not be removed explicitly");
					assert.equal(aDirtyChanges[0].getChangeType(), "removeCondition", "The condition change for remove has been created");
					assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
					assert.equal(aDirtyChanges[1].getChangeType(), "removeCondition", "The condition change for remove has been created");
					assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
					assert.equal(aDirtyChanges[2].getChangeType(), "removeCondition", "The condition change for remove has been created");
					assert.equal(aDirtyChanges[2].getContent().name, "Decimal", "The correct property is affected");
					assert.equal(aDirtyChanges[3].getChangeType(), "removeCondition", "The condition change for remove has been created");
					assert.equal(aDirtyChanges[3].getContent().name, "Date", "The correct property is affected");
					done();
				});
			}.bind(this));
	});

	/*********************************************************************************************/
	/*********************************** Item based Changes***************************************/
	/*********************************************************************************************/

	QUnit.test("call 'applyExternalState' with only new items", function(assert){
		const done = assert.async();

		const aItemState = [
			{name: "String", position: 0},
			{name: "Boolean", position: 1},
			{name: "Date", position: 2}
		];

		const oExternalState = {
			filter: {},
			items: aItemState
		};

		//we expect one "addFilter" change for each provided item for the FilterBar
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 3, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
			assert.equal(aDirtyChanges[1].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
			assert.equal(aDirtyChanges[2].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[2].getContent().name, "Date", "The correct property is affected");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' with only new items (but no position provided)", function(assert){
		const done = assert.async();

		const aItemState = [
			{name: "String"},
			{name: "Boolean"},
			{name: "Date"}
		];

		const oExternalState = {
			filter: {},
			items: aItemState
		};

		//we expect one "addFilter" change for each provided item for the FilterBar
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 3, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
			assert.equal(aDirtyChanges[1].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");
			assert.equal(aDirtyChanges[2].getChangeType(), "addFilter", "The condition change for add has been created");
			assert.equal(aDirtyChanges[2].getContent().name, "Date", "The correct property is affected");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' and trigger 'reset' afterwards (no key specified)", function(assert){
		const done = assert.async();

		const aItemState = [
			{name: "String"},
			{name: "Boolean"},
			{name: "Date"}
		];

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions,
			items: aItemState
		};

		// add some item and filter changes
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			assert.equal(this.oFilterBar.getFilterItems().length, 3, "Items created");

			//no keys specified --> reset everything
			StateUtil.resetState(this.oFilterBar).then(function(){

				assert.equal(this.oFilterBar.getFilterItems().length, 0, "Items removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().String, [],"Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Boolean, [], "Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Decimal, [], "Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Date, [], "Condition removed");
				done();
			}.bind(this));

		}.bind(this));
	});

/*
	QUnit.test("call 'applyExternalState' and trigger 'resetState' afterwards (item key specified)", function(assert){
		var done = assert.async();

		var aItemState = [
			{name: "String"},
			{name: "Boolean"},
			{name: "Date"}
		];

		var mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ", "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ","values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
			filter: mFilterConditions,
			items: aItemState
		};

		// add some item and filter changes
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			assert.equal(this.oFilterBar.getFilterItems().length, 3, "Items created");

			//Item key specified --> reset only items
			StateUtil.resetState(this.oFilterBar, ["items"]).then(function(){

				assert.equal(this.oFilterBar.getFilterItems().length, 0, "Items removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions(), mFilterConditions, "Items removed");
				done();
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' and trigger 'resetState' afterwards (filter key specified)", function(assert){
		var done = assert.async();

		var aItemState = [
			{name: "String"},
			{name: "Boolean"},
			{name: "Date"}
		];

		var mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ", "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ","values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
			filter: mFilterConditions,
			items: aItemState
		};

		// add some item and filter changes
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			assert.equal(this.oFilterBar.getFilterItems().length, 3, "Items created");

			//Item key specified --> reset only items
			StateUtil.resetState(this.oFilterBar, ["filter"]).then(function(){

				assert.equal(this.oFilterBar.getFilterItems().length, 3, "Items removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().String, [],"Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Boolean, [], "Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Decimal, [], "Condition removed");
				assert.deepEqual(this.oFilterBar.getFilterConditions().Date, [], "Condition removed");
				done();
			}.bind(this));

		}.bind(this));
	});*/

	QUnit.test("call 'applyExternalState' and remove existing items", function(assert){
		const done = assert.async();

		const fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}",
				propertyKey: sPath
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Date"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Boolean"));

		const aItemState = [
			{name: "String", visible: false},
			{name: "Boolean", visible: false}
		];

		const oExternalState = {
			filter: {},
			items: aItemState
		};

		//we expect one "addFilter" change for each provided item for the FilterBar
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 2, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "removeFilter", "The filter change for remove has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
			assert.equal(aDirtyChanges[1].getChangeType(), "removeFilter", "The filter change for remove has been created");
			assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' and reorder multiple items", function(assert){
		const done = assert.async();

		const fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}",
				propertyKey: sPath
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Date"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Boolean"));

		const aItemState = [
			{name: "String", position: 1},
			{name: "Double", position: 3}
		];

		const oExternalState = {
			filter: {},
			items: aItemState //Expected outcome: Date, String, Boolean, Double (2x move change)
		};

		//we expect one "addFilter" change for each provided item for the FilterBar
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 2, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "moveFilter", "The filter change for move has been created");
			assert.equal(aDirtyChanges[1].getChangeType(), "moveFilter", "The filter change for move has been created");

			assert.equal(this.oFilterBar.getFilterItems().length, 4, "FilterBar still has 4 items");

			assert.deepEqual(this.oFilterBar.getCurrentState().items[1].name, oExternalState.items[0].name, "the desired and actual state match");
			assert.deepEqual(this.oFilterBar.getCurrentState().items[3].name, oExternalState.items[1].name, "the desired and actual state match");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' and add items without position with existing items", function(assert){
		const done = assert.async();

		const fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}",
				propertyKey: sPath
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));

		const aItemState = [
			{name: "Date"},
			{name: "Boolean"}
		];

		const oExternalState = {
			filter: {},
			items: aItemState //Expected outcome: Date, String, Boolean, Double (2x move change)
		};

		//we expect two "addFilter" change for each provided item for the FilterBar
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 2, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "addFilter", "The filter change for add has been created");
			assert.equal(aDirtyChanges[1].getChangeType(), "addFilter", "The filter change for add has been created");

			assert.equal(this.oFilterBar.getFilterItems().length, 4, "FilterBar still has 4 items");

			assert.equal(this.oFilterBar.getFilterItems()[2].getPropertyKey(), oExternalState.items[0].name, "the item has been added on the correct positiion");
			assert.equal(this.oFilterBar.getFilterItems()[3].getPropertyKey(), oExternalState.items[1].name, "the item has been added on the correct positiion");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.module("API tests for Table", {
		before: function(){
			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:Table id="mdcTable" p13nMode="Column,Sort,Filter,Group,Aggregate"></mdc:Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				TableDelegate.fetchProperties = fetchProperties;
				TableDelegate.getTypeMap = getTypeMap;
				TableDelegate.addItem = function(oControl, sPropertyName) {
					return Promise.resolve(new Column({propertyKey: sPropertyName}));
				};
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
			}.bind(this));
		},
		beforeEach: function(){
			this.oTable = this.oView.byId('mdcTable');
			this.oTable.removeAllColumns();

			return this.oTable.retrieveInbuiltFilter().then(function(){
				sinon.stub(this.oTable.getInbuiltFilter(), "_toInternal").callsFake(function(oProperty, oXCondition) {
					return oXCondition;
				});
			}.bind(this));
		},
		afterEach: function(){
			this.oTable.getInbuiltFilter()._toInternal.restore();
			this.oTable.setSortConditions(undefined);
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oTable.destroy();
			this.oView = null;
		}
	});

	QUnit.test("Create columns via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			items: [
				{
					name: "String"
				},
				{
					name: "Boolean"
				}
			]
		};

		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, oState.items.length, "Correct amount of changes created: " + aChanges.length);
			assert.equal(aChanges[0].getChangeType(), "addColumn", "Correct change type created");
			assert.equal(aChanges[1].getChangeType(), "addColumn", "Correct change type created");
			assert.equal(this.oTable.getColumns().length, oState.items.length, "Number of created columns correct");

			const oRemoveState = {
				items: [
					{
						name: "String",
						visible: false
					},
					{
						name: "Boolean",
						visible: false
					}
				]
			};

			StateUtil.applyExternalState(this.oTable, oRemoveState).then(function(aChanges){
				assert.equal(aChanges.length, oRemoveState.items.length, "Correct amount of changes created: " + aChanges.length);
				assert.equal(aChanges[0].getChangeType(), "removeColumn", "Correct change type created");
				assert.equal(aChanges[1].getChangeType(), "removeColumn", "Correct change type created");

				assert.equal(this.oTable.getColumns().length, 0, "Correct amount of columns removed");

				done();
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Create columns and sorter via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			sorters: [
				{
					key: "String",
					name: "String",
					descending: true
				}
			],
			items: [
				{
					key:  "Decimal",
					name: "Decimal"
				},
				{
					key:  "Double",
					name: "Double"
				}
			]
		};

		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 3, "Correct amount of changes created: " + aChanges.length);

			assert.equal(aChanges[0].getChangeType(), "addColumn", "Correct change type created");
			assert.equal(aChanges[1].getChangeType(), "addColumn", "Correct change type created");
			assert.equal(aChanges[2].getChangeType(), "addSort", "Correct change type created");

			assert.equal(this.oTable.getColumns().length, oState.items.length, "Number of created columns correct");
			assert.deepEqual(this.oTable.getSortConditions().sorters, oState.sorters, "Correct sort object created");

			StateUtil.retrieveExternalState(this.oTable).then(function(oTableState){
				assert.deepEqual(oTableState.items, oState.items, "Correct state retrieved");
				assert.deepEqual(oTableState.sorters, oState.sorters, "Correct state retrieved");
				done();
			});

		}.bind(this));
	});

	QUnit.test("Create different sort changes via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			sorters: [
				{
					key: "String",
					name: "String",
					descending: true
				}
			]
		};

		//add new sorter
		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);

			assert.equal(aChanges[0].getChangeType(), "addSort", "Correct change type created");
			assert.deepEqual(this.oTable.getSortConditions().sorters, oState.sorters, "Correct sort object created");

			oState.sorters[0].descending = false;

			//change sort order
			StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
				assert.equal(aChanges.length, 2, "Correct amount of changes created: " + aChanges.length);

				assert.equal(aChanges[0].getChangeType(), "removeSort", "Correct change type created");
				assert.equal(aChanges[1].getChangeType(), "addSort", "Correct change type created");
				assert.deepEqual(this.oTable.getSortConditions().sorters, oState.sorters, "Correct sort object created");

				oState.sorters[0].sorted = false;

				//remove sorter via 'enabled'
				StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
					assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);
					assert.equal(aChanges[0].getChangeType(), "removeSort", "Correct change type created");
					assert.deepEqual(this.oTable.getSortConditions().sorters, [], "No sorter left");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Create different width/supplementaryConfig changes via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			supplementaryConfig: {
				aggregations : {
					columns: {
						String: {
							width: "150px"
						}
					}
				}
			}
		};

		//add new column width change
		StateUtil.applyExternalState(this.oTable, oState)
		.then(function(aChanges){
			assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);
			assert.equal(aChanges[0].getChangeType(), "setColumnWidth", "Correct change type created");

			//Check new state after appliance
			return StateUtil.retrieveExternalState(this.oTable);
		}.bind(this))
		.then(function(oRetrievedState){
			assert.deepEqual(oRetrievedState.supplementaryConfig, oState.supplementaryConfig, "The retrieved config is equal to the applied");

			//Apply a state without explicitly mentioning a property --> no change should occur
			return StateUtil.applyExternalState(this.oTable, {
				supplementaryConfig: {
					aggregations: {
						columns: {
							//No property mentioned --> no remove changes should be created as there is no 'absolute' appliance
						}
					}
				}
			});
		}.bind(this))
		.then(function(aChanges){

			assert.deepEqual(aChanges.length, 0, "Correct amount of changes created: " + aChanges.length);

			//The state has not changed --> only explicit changes will be processed
			StateUtil.retrieveExternalState(this.oTable).then(function(oRetrievedState){
				assert.deepEqual(oRetrievedState.supplementaryConfig, oState.supplementaryConfig, "The retrieved config is equal to the applied");
				done();
			});
		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' twice to create and change some filter conditions", function(assert){
		const done = assert.async();

		const mFilterConditions = {
			"String": [{ "operator": OperatorName.Contains, "values": ["Test"] }],
			"Boolean": [{ "operator": OperatorName.EQ, "values": [true] }],
			"Decimal":[{"operator": OperatorName.EQ,"values":["12.01"]}],
			"Date":[{"operator": OperatorName.EQ,"values":["2020-02-11"]}]
		};

		const oExternalState = {
			filter: mFilterConditions
		};

		//we expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oTable, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");

			//the second time there should not be any changes
			const oResetState = {
				filter: {
					"String": [],
					"Date":[{"operator": OperatorName.EQ,"values":["2020-02-12"]}]
				}
			};

			//A date value has been added --> we expect only one change
			StateUtil.applyExternalState(this.oTable, oResetState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 1, "Every condition has been removed via 'removeCondition' change");
				assert.equal(aDirtyChanges[0].getChangeType(), "addCondition", "The condition change for remove has been created");
				assert.equal(aDirtyChanges[0].getContent().name, "Date", "The correct property is affected");
				assert.deepEqual(aDirtyChanges[0].getContent().condition, {"operator": OperatorName.EQ,"values":["2020-02-12"]}, "The correct value is affected");
				done();
			});
		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' to create filter values but without p13nMode enabled", function(assert) {
		const done = assert.async();

		this.oTable.setP13nMode(["Column","Sort"]);

		const oState = {
			sorters: [
				{
					key: "String",
					name: "String",
					descending: true
				}
			],
			filter: {
				"Date":[{"operator": OperatorName.EQ,"values":["2020-02-12"]}]
			}
		};

		//add new sorter
		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 1, "Only one change was created");
			assert.equal(aChanges[0].getChangeType(), "addSort", "Only sort and no filter changes should be created");
			this.oTable.setP13nMode(["Column","Sort","Filter","Aggregate","Group"]);
			done();
		}.bind(this));

	});

	QUnit.module("API tests for Table with V4 Analytics", {
		before: function(){
			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:Table id="mdcTable" p13nMode="Column,Sort,Filter,Group,Aggregate" ' +
				'delegate="{name: \'sap/ui/mdc/odata/v4/TableDelegate\', payload: {}}"></mdc:Table></mvc:View>';

			return createAppEnvironment(sTableView, "V4AnalyticsTable").then(function(mCreatedApp){
				TableDelegate.fetchProperties = fetchProperties;
				TableDelegate.getTypeMap = getTypeMap;
				TableDelegate.addItem = function(oControl, sPropertyName) {
					return Promise.resolve(new Column({propertyKey: sPropertyName}));
				};
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
			}.bind(this));
		},
		beforeEach: function(){
			this.oTable = this.oView.byId('mdcTable');
			this.oTable.removeAllColumns();

			return this.oTable.retrieveInbuiltFilter().then(function(){
				sinon.stub(this.oTable.getInbuiltFilter(), "_toInternal").callsFake(function(oProperty, oXCondition) {
					return oXCondition;
				});
			}.bind(this));
		},
		afterEach: function(){
			this.oTable.getInbuiltFilter()._toInternal.restore();
			this.oTable.setSortConditions(undefined);
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oTable.destroy();
			this.oView = null;
		}
	});

	QUnit.test("Create different group changes via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			groupLevels: [
				{
					key: "String",
					name: "String"
				}
			]
		};

		//add new grouping
		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);

			assert.equal(aChanges[0].getChangeType(), "addGroup", "Correct change type created");
			assert.deepEqual(this.oTable.getGroupConditions().groupLevels, oState.groupLevels, "Correct groupLevels object created");

			oState.groupLevels[0].grouped = false;

			//remove grouping
			StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
				assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);

				assert.equal(aChanges[0].getChangeType(), "removeGroup", "Correct change type created");
				assert.deepEqual(this.oTable.getGroupConditions().groupLevels, [], "Correct groupLevels object created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Create different aggregate changes via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			aggregations: {
				String : {}
			}
		};

		//add new grouping
		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);

			assert.equal(aChanges[0].getChangeType(), "addAggregate", "Correct change type created");
			assert.deepEqual(this.oTable.getAggregateConditions(), oState.aggregations, "Correct aggregation object created");

			oState.aggregations["String"].aggregated = false;

			//remove grouping
			StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
				assert.equal(aChanges.length, 1, "Correct amount of changes created: " + aChanges.length);

				assert.equal(aChanges[0].getChangeType(), "removeAggregate", "Correct change type created");
				assert.deepEqual(this.oTable.getAggregateConditions(), {}, "Correct aggregations object created");

				done();
			}.bind(this));
		}.bind(this));
	});

	const myChartDelegatefetchProperties = function (oMDCChart) {

        const aMetadata = [
            {
                name: "CategoryName",
                dataType: "String",
                label: "Category",
                groupable: true
            },
            {
                name: "SalesNumber",
                path: "SalesNumber",
                dataType: "Edm.Int32",
                aggregatable: true,
                label: "Sales Number"
            }, {
                name: "agSalesAmount",
                path: "SalesAmount",
                dataType: "String",
                label: "Sales Amount",
                aggregatable: true
                //defaultAggregation: "sum",
                //supportedAggregations: ["sum", "min", "max", "average"]
            }, {
                name: "Name",
                path: "Name",
                dataType: "String",
                label: "Name",
                groupable: true
            }, {
                name: "Industry",
                dataType: "String",
                label: "Industry",
                groupable: true
            }, {
                name: "Country",
                dataType: "String",
                label: "Country",
                groupable: true
            }, {
                name: "SomePropertyName",
                dataType: "String",
                label: "SomeProperty",
                groupable: true
            }
        ];

        return Promise.resolve(aMetadata);
    };

	QUnit.module("API tests for Chart", {
		before: function(){
			sinon.stub(ChartDelegate, "fetchProperties").callsFake(myChartDelegatefetchProperties);
			ChartDelegate.apiVersion = 2;
			ChartDelegate.addItem = function (oChart, sPropertyName, mPropertyBag, sRole) {
				if (oChart.getModel) {
					return Promise.resolve(this._createMDCChartItem(sPropertyName, oChart, sRole));
				}
			};
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  >\n' +
				'\t\t\t\t<mdc:Chart id="mdcChart" p13nMode="{=[\'Sort\',\'Item\',\'Type\']}" delegate="{\'name\': \'sap/ui/mdc/odata/v4/vizChart/ChartDelegate\',\'payload\': {}}" >\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';

			return createAppEnvironment(sChartView, "Chart").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
			}.bind(this));
		},
		beforeEach: function(){
			this.oChart = this.oView.byId('mdcChart');
		},
		afterEach: function(){
			this.oChart.setSortConditions(undefined);
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oChart.destroy();
			this.oView = null;

			ChartDelegate.fetchProperties.restore();
		}
	});

	QUnit.test("Create / Remove items via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			items: [
				{
				  "name": "Industry",
				  "role": "category"
				}
			  ],
			sorters: []
		};

		StateUtil.applyExternalState(this.oChart, oState).then(function(aChanges){
			assert.equal(aChanges.length, oState.items.length, "Correct amount of changes created: " + aChanges.length);
			assert.equal(aChanges[0].getChangeType(), "addItem", "Correct change type created");
			assert.equal(this.oChart.getItems().length, 4, "Correct amount of items");

			const oRemoveState = {
				items: [
					{
						"name": "Industry",
						"visible": false
					}
					],
				sorters: []
			};

			StateUtil.applyExternalState(this.oChart, oRemoveState).then(function(aChanges){
				assert.equal(aChanges.length, oRemoveState.items.length, "Correct amount of changes created for: " + aChanges.length);
				assert.equal(aChanges[0].getChangeType(), "removeItem", "Correct change type created");
				assert.equal(this.oChart.getItems().length, 3, "Correct amount of items removed");

				done();
			}.bind(this));

		}.bind(this));

	});

	QUnit.test("Change an items role via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			items: [
				{
				  "name": "Name",
				  "role": "series"
				}
			  ],
			sorters: []
		};

		StateUtil.applyExternalState(this.oChart, oState).then(function(aChanges){
			assert.equal(aChanges.length, 2, "Correct amount of changes created: " + aChanges.length);
			assert.equal(aChanges[0].getChangeType(), "removeItem", "Correct change type created");
			assert.equal(aChanges[1].getChangeType(), "addItem", "Correct change type created");
			assert.equal(this.oChart.getItems().length, 3, "Correct amount of items");

			assert.equal(this.oChart.getItems()[0].getRole(), "series", "Role correctly changed");

			done();
		}.bind(this));
	});

	QUnit.test("Create / Remove sorters via 'applyExternalState'", function(assert){

		const done = assert.async();

		const oState = {
			sorters: [
				{
					"key": "Name",
					"name": "Name",
					"descending": false
				},
				{
					"key": "Date",
					"name": "Date",
					"descending": true
				}
			  ]
		};

		assert.ok(!this.oChart.getSortConditions(), "No sorters defined.");

		StateUtil.applyExternalState(this.oChart, oState).then(function(aChanges){

			assert.deepEqual(oState.sorters, this.oChart.getSortConditions().sorters, "Correct SortConditions created");

			const oRemoveState = {
				sorters: [
				  {
					  "name": "Date",
					  "sorted": false
				  }]
			};

			StateUtil.applyExternalState(this.oChart, oRemoveState).then(function(aChanges){
				assert.ok(aChanges.length === 1, "Correct amount of changes created for remove: " + aChanges.length);
				assert.ok(this.oChart.getSortConditions().sorters.length === 1, "Correct amount of sortConditions: " + aChanges.length);
				done();
			}.bind(this));
		}.bind(this));
	});


	QUnit.test("Change chart type via 'applyExternalState'", function(assert){

		const done = assert.async();

		let oState = {
			"supplementaryConfig": {
				"properties": {
					"chartType": "pie"
				}
			}
		};

		assert.equal(this.oChart.getChartType(), "column", "Chart has correct type");


		StateUtil.applyExternalState(this.oChart, oState).then(function(aChanges){

			assert.ok(aChanges.length === 1, "Correct amount of changes created for changed chart type: " + aChanges.length);
			assert.equal(this.oChart.getChartType(), "pie", "Chart has correct type");

			oState = {
				"supplementaryConfig": {
					"properties": {
						"chartType": "column"
					}
				}
			};

			StateUtil.applyExternalState(this.oChart, oState).then(function(aChanges){
				assert.ok(aChanges.length === 1, "Correct amount of changes created for changed chart type: " + aChanges.length);
				assert.equal(this.oChart.getChartType(), "column", "Chart has correct type");
				done();
			}.bind(this));

		}.bind(this));

	});

	QUnit.module("State event handling", {
		beforeEach: function() {
			this.stateHandlerRegistry = StateHandlerRegistry.getInstance();
		},
		afterEach: function() {
			this.stateHandlerRegistry.destroy();
		}
	});

	QUnit.test("Ceck attaching & detaching", function(assert) {

		const fnHandler1 = function(){};
		const fnHandler2 = function(){};

		StateUtil.attachStateChange(fnHandler1);
		StateUtil.attachStateChange(fnHandler2);
		assert.equal(Engine.getInstance().stateHandlerRegistry.mEventRegistry.stateChange.length, 2, "Event listeners attached");

		StateUtil.detachStateChange(fnHandler1);
		StateUtil.detachStateChange(fnHandler2);
		assert.notOk(Engine.getInstance().stateHandlerRegistry.mEventRegistry.hasOwnProperty("stateChange"), "Event listeners detached");
	});

	QUnit.module("State diff calculation", {
		getSampleState: function() {
			return {
				sorters: [
					{
						position: 0,
						name: "String",
						descending: true
					}
				],
				items: [
					{
						position: 0,
						name: "Decimal"
					},
					{
						position: 1,
						name: "Double"
					}
				],
				supplementaryConfig: {
					aggregations : {
						columns: {
							String: {
								width: "150px"
							}
						}
					}
				},
				filter: {
					String: [{
						operator: OperatorName.Contains,
						values: [
							"Test"
						]
					}],
					Boolean: [{
						operator: OperatorName.EQ,
						values: [
							true
						]
					}]
				},
				groupLevels: [
					{
						position: 0,
						name: "String"
					}
				],
				aggregations: {}
			};
		},
		before: function(){
			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:Table id="mdcTable2" p13nMode="Column,Sort,Filter,Group,Aggregate"></mdc:Table></mvc:View>';
			TableDelegate.getSupportedFeatures = function() {
				return {p13nModes: ["Column", "Sort", "Filter", "Group", "Aggregate"]};
			};
			return createAppEnvironment(sTableView, "StateDiff").then(function(mCreatedApp){
				TableDelegate.fetchProperties = fetchProperties;
				TableDelegate.getTypeMap = getTypeMap;
				TableDelegate.addItem = function(oControl, sPropertyName) {
					return Promise.resolve(new Column({propertyKey: sPropertyName}));
				};
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
			}.bind(this));
		},
		beforeEach: function(){
			this.oTable = this.oView.byId('mdcTable2');
			this.oTable.removeAllColumns();

			return this.oTable.retrieveInbuiltFilter().then(function(){
				sinon.stub(this.oTable.getInbuiltFilter(), "_toInternal").callsFake(function(oProperty, oXCondition) {
					return oXCondition;
				});
			}.bind(this));
		},
		afterEach: function(){
			this.oTable.getInbuiltFilter()._toInternal.restore();
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oTable.destroy();
			this.oView = null;
		}
	});

	QUnit.test("Ceck empty diff between identical states", function(assert) {

		const done = assert.async();

		StateUtil.retrieveExternalState(this.oTable).then(function(oInitialState){
			// 1) Store the initial state before appliance begins
			return oInitialState;
		})
		.then(function(oInitialState){
			// 2) Diff two idential states
			return StateUtil.diffState(this.oTable, oInitialState, oInitialState);
		}.bind(this))
		.then(function(oStateDiff){
			// 3) Check state diff --> no changes should be diffed
			assert.equal(oStateDiff.items.length, 0, "No item changes found");
			assert.equal(oStateDiff.groupLevels.length, 0, "No group changes found");
			assert.deepEqual(oStateDiff.supplementaryConfig, {}, "No supplementaryConfig changes found");
			assert.deepEqual(oStateDiff.filter, {}, "No filter changes found");
			assert.deepEqual(oStateDiff.aggregations, {}, "No aggregate changes found");
			done();
		});

	});

	QUnit.test("Ceck empty diff after appliance", function(assert) {

		const done = assert.async();

		const oSampleState = this.getSampleState();

		let oInitialState;

		StateUtil.retrieveExternalState(this.oTable).then(function(oState){
			// 1) Store the initial state before appliance begins
			oInitialState = oState;
			return oState;
		})
		.then(function(){
			return StateUtil.applyExternalState(this.oTable, oSampleState).then(function(aChanges){
				// 1) Check initial change appliance
				assert.equal(aChanges.length, 7, "Correct amount of changes created");
				return aChanges;
			});
		}.bind(this))
		.then(function(){
			return StateUtil.retrieveExternalState(this.oTable);
		}.bind(this))
		.then(function(oNewState){
			return StateUtil.diffState(this.oTable, oInitialState, oNewState);
		}.bind(this))
		.then(function(oStateDiff){
			assert.deepEqual(oStateDiff, oSampleState, "The state diff is identical to the applied state");
			done();
		});

	});

	QUnit.test("Ceck in case the position explicitly changed through an insert", function(assert) {

		const done = assert.async();

		StateUtil.diffState(this.oTable, {
			items: [{
				name: "Single"
			},{
				name: "Decimal"
			}]
		}, {
			items: [{
				name: "String"
			},{
				name: "Single"
			},{
				name: "Decimal"
			}]
		})
		.then(function(oStateDiff){
			assert.equal(oStateDiff.items[0].name, "String", "The state diff includes the added item");
			assert.equal(oStateDiff.items[0].position, 0, "The state diff includes the position for the added item");
			done();
		});

	});

	QUnit.test("Ceck diff takes position into account", function(assert) {

		const done = assert.async();

		const oInitialState = {
			items: [{
				name: "Single"
			},{
				name: "Decimal"
			},{
				name: "Double"
			},{
				name: "Int32"
			}]
		};

		const oNewState = {
			items: [
			{
				name: "Double"
			},{
				name: "Decimal"
			},{
				name: "Single"
			},{
				name: "Int32"
			}]
		};

		StateUtil.diffState(this.oTable, oInitialState, oNewState)
		.then(function(oStateDiff){

			assert.equal(oStateDiff.items.length, 2, "Two item diffed in state");
			assert.equal(oStateDiff.items[0].name, "Double", "Correct key position");
			assert.equal(oStateDiff.items[0].position, 0, "Correct index position");
			assert.equal(oStateDiff.items[1].name, "Decimal", "Correct key position");
			assert.equal(oStateDiff.items[1].position, 1, "Correct index position");
			done();
		});

	});

	QUnit.test("Ceck only diff returned between two different states", function(assert) {

		const done = assert.async();

		const oInitialState = this.getSampleState();

		//1) initial state has one less item
		oInitialState.items.pop();

		//2) initial state has one less filter
		delete oInitialState.filter.String;

		//--> oNewState has one item change and one filter change in addition, the two changes done above should be the diff
		const oNewState = this.getSampleState();

		StateUtil.diffState(this.oTable, oInitialState, oNewState)
		.then(function(oStateDiff){

			assert.equal(oStateDiff.items.length, 1, "One item diffed in state");
			assert.equal(Object.keys(oStateDiff.filter).length, 1, "One filter diffed in state");
			assert.equal(oStateDiff.sorters.length, 0, "No sorter diffed in state");
			assert.equal(oStateDiff.groupLevels.length, 0, "No grouping diffed in state");
			done();
		});

	});

	QUnit.test("Check diff in case information gets removed", function(assert) {

		const done = assert.async();

		const oInitialState = this.getSampleState();

		//--> oNewState has a filter removed
		const oNewState = this.getSampleState();
		delete oNewState.filter.String;//new state has one less filter

		//we expect the diff to only return that one filter got removed
		StateUtil.diffState(this.oTable, oInitialState, oNewState)
		.then(function(oStateDiff){
			assert.equal(oStateDiff.items.length, 0, "No item diffed in state");
			assert.equal(Object.keys(oStateDiff.filter).length, 1, "One filter diffed in state");

			//check that the removal is explcitily marked
			assert.equal(oStateDiff.filter.String[0].filtered, false, "Filter removal is explicitly provided");

			assert.equal(oStateDiff.sorters.length, 0, "No sorter diffed in state");
			assert.equal(oStateDiff.groupLevels.length, 0, "No grouping diffed in state");
			done();
		});

	});

	QUnit.test("Ceck diff for aggregate changes", function(assert) {

		const done = assert.async();

		StateUtil.diffState(this.oTable, {
			aggregations: {}
		}, {
			aggregations: {
				"String": {}
			}
		})
		.then(function(oStateDiff){

			const aAggregateDiff = Object.entries(oStateDiff.aggregations);

			assert.equal(aAggregateDiff[0][0], "String", "The state diff includes the added aggregation key");
			assert.deepEqual(aAggregateDiff[0][1], {}, "The state diff includes the correct aggregation value");
			assert.equal(aAggregateDiff.length, 1, "Correct diff created");
			done();
		});

	});

	QUnit.test("Ceck diff for aggregate changes", function(assert) {

		const done = assert.async();

		StateUtil.diffState(this.oTable, {
			aggregations: {
				"String": {}
			}
		}, {
			aggregations: {
			}
		})
		.then(function(oStateDiff){

			const aAggregateDiff = Object.entries(oStateDiff.aggregations);
			assert.equal(aAggregateDiff[0][0], "String", "The state diff includes the added aggregation key");
			assert.deepEqual(aAggregateDiff[0][1], {aggregated: false}, "The state diff includes the correct aggregation value");
			assert.equal(aAggregateDiff.length, 1, "Correct diff created");
			done();
		});

	});
});
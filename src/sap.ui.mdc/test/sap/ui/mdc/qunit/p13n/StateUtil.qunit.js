/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/TableDelegate","sap/ui/mdc/p13n/StateUtil","sap/ui/mdc/FilterBarDelegate", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/mdc/FilterField"
], function (TableDelegate, StateUtil, FilterBarDelegate, UIComponent, ComponentContainer, FilterField) {
	"use strict";

	sap.ui.getCore().loadLibrary("sap.ui.fl");
	var UIComp = UIComponent.extend("test", {
		metadata: {
			manifest: {
				"sap.app": {
					"id": "",
					"type": "application"
				}
			}
		},
		createContent: function() {
			// store it in outer scope
			var oView = sap.ui.view({
				async: false,
				type: "XML",
				id: this.createId("view"),
				viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:FilterBar id="myFilterBar" p13nMode="Item,Value"></mdc:FilterBar></mvc:View>'
			});
			return oView;
		}
	});

	var UICompTable = UIComponent.extend("test", {
		metadata: {
			manifest: {
				"sap.app": {
					"id": "",
					"type": "application"
				}
			}
		},
		createContent: function() {
			// store it in outer scope
			var oView = sap.ui.view({
				async: false,
				type: "XML",
				id: this.createId("view"),
				viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:Table id="mdcTable" p13nMode="Column,Sort,Filter"></mdc:Table></mvc:View>'
			});
			return oView;
		}
	});

	function createFilterItem(sPropertyName, oFilterBar, mPropertyBag) {
		return new Promise(function(resolve, reject){
			resolve(new FilterField({
				conditions: "{$filters>/conditions/" + sPropertyName + "}"
			}));
		});
	}

	function fetchProperties() {
		var mProperties = {
			String: {label: "String",name:"String",type:"Edm.String",filterable: true},
			Boolean: {label: "Boolean",name:"Boolean",type:"Edm.Boolean",filterable: true},
			Int16: {label: "Int16",name:"Int16",type:"Edm.Int16",filterable: true},
			Int32: {label: "Int32",name:"Int32",type:"Edm.Int32",filterable: true},
			Int64: {label: "Int64",name:"Int64",type:"Edm.Int64",filterable: true},
			SByte: {label: "SByte",name:"SByte",type:"Edm.SByte",filterable: true},
			Decimal: {label: "Decimal",name:"Decimal",type:"Edm.Decimal",filterable: true},
			Single: {label: "Single",name:"Single",type:"Edm.String",filterable: true},
			Double: {label: "Double",name:"Double",type:"Edm.Double",filterable: true},
			Date: {label: "Date",name:"Date",type:"Edm.Date",filterable: true},
			TimeOfDay: {label: "TimeOfDay",name:"TimeOfDay",type:"Edm.TimeOfDay",filterable: true},
			DateTimeOffset: {label: "DateTimeOffset",name:"DateTimeOffset",type:"Edm.DateTimeOffset",filterable: true},
			Guid: {label: "Guid",name:"Guid",type:"Edm.Guid",filterable: true}
		};

		var aProperties = [];
		for (var sProperty in mProperties) {
			aProperties.push({
				name: mProperties[sProperty].name,
				label: mProperties[sProperty].label,
				type: mProperties[sProperty].type,
				filterable: mProperties[sProperty].filterable
			});
		}
		return Promise.resolve(aProperties);
	}

	QUnit.module("API tests for FilterBar", {
		before: function(){
			FilterBarDelegate.fetchProperties = fetchProperties;
			FilterBarDelegate.beforeAddFilterFlex = createFilterItem;
			this.oUiComponent = new UIComp("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = this.oUiComponent.getRootControl();
		},
		beforeEach: function(){
			this.oFilterBar = this.oView.byId('myFilterBar');
			this.oFilterBar.removeAllFilterItems([]);
			sinon.stub(this.oFilterBar, "_toInternal").callsFake(function(oProperty, oXCondition) {
				return oXCondition;
			});
		},
		afterEach: function(){
			this.oFilterBar.setFilterConditions({});
			this.oFilterBar._toInternal.restore();
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oView = null;
			this.oFilterBar.destroy();
		}
	});

	//Removal of 'EEQ' operator
	QUnit.test("call 'applyExternalState' with 'EEQ' operator' and non existing operator", function(assert){
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EEQ", "values": [true] }],
			"Decimal":[{"operator":"ImaginaryOperator","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
			filter: mFilterConditions
		};

		//we expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
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
		var done = assert.async();

		//If there are no conditions explicitly set, the retrieved state shold return an empty 'filter' object
		StateUtil.retrieveExternalState(this.oFilterBar).then(function(oExternalizedState){
			assert.ok(oExternalizedState,"Externalized state has been retrieved");
			assert.equal(oExternalizedState.hasOwnProperty("filter"),true,"Externalized state includes 'filter' attribute");
			done();
		});

	});

	QUnit.test("applyExternalState to FilterBar without any conditions + retrieve afterwards", function(assert){
		var done = assert.async();

		var oExternalState = {
			filter: {
				"String":[{"operator":"Contains","values":["YUHUUU"]}],
				"Boolean":[{"operator":"EQ","values":[true]}],
				"Decimal":[{"operator":"EQ","values":["12.01"]}],
				"Date":[{"operator":"EQ","values":["2020-02-11"]}]
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
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [true] }],
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		this.oFilterBar.setFilterConditions(mFilterConditions);

		var oExternalState = {
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
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [true] }],
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		var mFilterConditionsNew = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [false] }],//set to false
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		this.oFilterBar.setFilterConditions(mFilterConditions);

		var oExternalState = {
			filter: mFilterConditionsNew,
			items: []
		};

		//cwe expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 2, "The correct amount of changes has been created");
			assert.equal(aDirtyChanges[0].getChangeType(), "removeCondition", "The condition change for remove has been created");
			assert.equal(aDirtyChanges[0].getContent().name, "Boolean", "The correct property is affected");
			assert.equal(aDirtyChanges[1].getChangeType(), "addCondition", "The condition change for add has been created");
			assert.equal(aDirtyChanges[1].getContent().name, "Boolean", "The correct property is affected");

			//we expect the retrieved staste to match the latest changes
			StateUtil.retrieveExternalState(this.oFilterBar).then(function(oRetrievedState){
				assert.ok(oRetrievedState, "Externalized State has been retrieved");
				assert.deepEqual(oRetrievedState, oExternalState, "The retried state matches the applied state");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' with the same conditions twice", function(assert){
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [true] }],
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
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
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));

	});

	QUnit.test("call 'applyExternalState' with an empty object to reset the state", function(assert){
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [true] }],
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
			filter: mFilterConditions
		};

			//we expect one change and the other conditions to be unaffected by the change
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){

				//an existing value has been changed --> removeCondition + addCondition
				assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");

				//the second time there should not be any changes
				var oResetState = {
					filter: {
						"String": [],
						"Boolean": [],
						"Decimal":[],
						"Date":[]
					}
				};

				StateUtil.applyExternalState(this.oFilterBar, oResetState).then(function(aDirtyChanges){
					assert.equal(aDirtyChanges.length, 4, "Every condition has been removed via 'removeCondition' change");
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
		var done = assert.async();

		var aItemState = [
			{name: "String", position: 0},
			{name: "Boolean", position: 1},
			{name: "Date", position: 2}
		];

		var oExternalState = {
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
		var done = assert.async();

		var aItemState = [
			{name: "String"},
			{name: "Boolean"},
			{name: "Date"}
		];

		var oExternalState = {
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

	QUnit.test("call 'applyExternalState' and remove existing items", function(assert){
		var done = assert.async();

		var fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}"
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Date"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Boolean"));

		var aItemState = [
			{name: "String", visible: false},
			{name: "Boolean", visible: false}
		];

		var oExternalState = {
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
		var done = assert.async();

		var fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}"
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Date"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Boolean"));

		var aItemState = [
			{name: "String", position: 1},
			{name: "Double", position: 3}
		];

		var oExternalState = {
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
		var done = assert.async();

		var fnCreateFilterItem = function(sPath) {
			return new FilterField({
				conditions: "{$filters>/conditions/" + sPath + "}"
			});
		};

		this.oFilterBar.addFilterItem(fnCreateFilterItem("String"));
		this.oFilterBar.addFilterItem(fnCreateFilterItem("Double"));

		var aItemState = [
			{name: "Date"},
			{name: "Boolean"}
		];

		var oExternalState = {
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

			assert.equal(this.oFilterBar.getFilterItems()[2].getFieldPath(), oExternalState.items[0].name, "the item has been added on the correct positiion");
			assert.equal(this.oFilterBar.getFilterItems()[3].getFieldPath(), oExternalState.items[1].name, "the item has been added on the correct positiion");

			//when applying the same state again, no changes should be created
			StateUtil.applyExternalState(this.oFilterBar, oExternalState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 0, "No changes have been created the second time");
				done();
			});

		}.bind(this));
	});

	QUnit.test("checkXStateInterface", function(assert){
		var bValid = StateUtil.checkXStateInterface(undefined);
		assert.equal(bValid, false);
	});

	QUnit.module("API tests for Table", {
		before: function(){
			TableDelegate.fetchProperties = fetchProperties;
			this.oUiComponent = new UICompTable("compTable");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = this.oUiComponent.getRootControl();
		},
		beforeEach: function(){
			this.oTable = this.oView.byId('mdcTable');
			this.oTable.removeAllColumns();

			return this.oTable.retrieveP13nFilter().then(function(){
				sinon.stub(this.oTable._oP13nFilter, "_toInternal").callsFake(function(oProperty, oXCondition) {
					return oXCondition;
				});
			}.bind(this));
		},
		afterEach: function(){
			this.oTable._oP13nFilter._toInternal.restore();
			this.oTable.setSortConditions(undefined);
		},
		after: function(){
			this.oUiComponentContainer = null;
			this.oTable.destroy();
			this.oView = null;
		}
	});

	QUnit.test("Create columns via 'applyExternalState'", function(assert){

		var done = assert.async();

		var oState = {
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

			var oRemoveState = {
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

		var done = assert.async();

		var oState = {
			items: [
				{
					name: "Decimal"
				},
				{
					name: "Double"
				}
			],
			sorters: [
				{
					name: "String",
					descending: true
				}
			],
			filter: {}
		};

		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 3, "Correct amount of changes created: " + aChanges.length);

			assert.equal(aChanges[0].getChangeType(), "addSort", "Correct change type created");
			assert.equal(aChanges[1].getChangeType(), "addColumn", "Correct change type created");
			assert.equal(aChanges[2].getChangeType(), "addColumn", "Correct change type created");

			assert.equal(this.oTable.getColumns().length, oState.items.length, "Number of created columns correct");
			assert.deepEqual(this.oTable.getSortConditions().sorters, oState.sorters, "Correct sort object created");

			StateUtil.retrieveExternalState(this.oTable).then(function(oTableState){
				assert.deepEqual(oTableState, oState, "Correct state retrieved");
				done();
			});

		}.bind(this));
	});

	QUnit.test("Create different sort changes via 'applyExternalState'", function(assert){

		var done = assert.async();

		var oState = {
			sorters: [
				{
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

	QUnit.test("call 'applyExternalState' twice to create and change some filter conditions", function(assert){
		var done = assert.async();

		var mFilterConditions = {
			"String": [{ "operator": "Contains", "values": ["Test"] }],
			"Boolean": [{ "operator": "EQ", "values": [true] }],
			"Decimal":[{"operator":"EQ","values":["12.01"]}],
			"Date":[{"operator":"EQ","values":["2020-02-11"]}]
		};

		var oExternalState = {
			filter: mFilterConditions
		};

		//we expect one change and the other conditions to be unaffected by the change
		StateUtil.applyExternalState(this.oTable, oExternalState).then(function(aDirtyChanges){

			//an existing value has been changed --> removeCondition + addCondition
			assert.equal(aDirtyChanges.length, 4, "The correct amount of changes has been created");

			//the second time there should not be any changes
			var oResetState = {
				filter: {
					"String": [],
					"Date":[{"operator":"EQ","values":["2020-02-12"]}]
				}
			};

			StateUtil.applyExternalState(this.oTable, oResetState).then(function(aDirtyChanges){
				assert.equal(aDirtyChanges.length, 3, "Every condition has been removed via 'removeCondition' change");
				assert.equal(aDirtyChanges[0].getChangeType(), "removeCondition", "The condition change for remove has been created");
				assert.equal(aDirtyChanges[0].getContent().name, "String", "The correct property is affected");
				assert.equal(aDirtyChanges[1].getChangeType(), "removeCondition", "The condition change for remove has been created");
				assert.equal(aDirtyChanges[1].getContent().name, "Date", "The correct property is affected");
				assert.equal(aDirtyChanges[2].getChangeType(), "addCondition", "The condition change for remove has been created");
				assert.equal(aDirtyChanges[2].getContent().name, "Date", "The correct property is affected");

				done();
			});
		}.bind(this));
	});

	QUnit.test("call 'applyExternalState' to create filter values but without p13nMode enabled", function(assert) {
		var done = assert.async();

		this.oTable.setP13nMode(["Column","Sort"]);

		var oState = {
			sorters: [
				{
					name: "String",
					descending: true
				}
			],
			filter: {
				"Date":[{"operator":"EQ","values":["2020-02-12"]}]
			}
		};

		//add new sorter
		StateUtil.applyExternalState(this.oTable, oState).then(function(aChanges){
			assert.equal(aChanges.length, 1, "Only one change was created");
			assert.equal(aChanges[0].getChangeType(), "addSort", "Only sort and no filter changes should be created");
			this.oTable.setP13nMode(["Column","Sort","Filter"]);
			done();
		}.bind(this));

	});

});

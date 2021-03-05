/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/util/TypeUtil", "sap/ui/mdc/FilterField", "sap/ui/mdc/p13n/FlexUtil","sap/ui/mdc/table/TableSettings","sap/ui/mdc/flexibility/Table.flexibility", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "../../delegates/TableDelegate", "sap/ui/mdc/table/Column"
], function(createAppEnvironment, TypeUtil, FilterField, FlexUtil, TableSettings, TableFlexHandler, ChangesWriteAPI, JsControlTreeModifier, UIComponent, ComponentContainer, TableDelegate, Column) {
	'use strict';

	sap.ui.getCore().loadLibrary("sap.ui.fl");
	var aPropertyInfo = [
		{
			name: "column0"
		}, {
			name: "column1"
		}, {
			name: "column2"
		}, {
			name: "SomePropertyName"
		}
	];

	function createRemoveChangeDefinition() {
		return {
			"changeType": "removeColumn",
			"selector": {
				"id": "myTableView--myTable"
			},
			"content": {
				"id": "myTableView--myTable--column1",
				"name": "column1",
				"idIsLocal": false
			}
		};
	}

	function createAddChangeDefinition(sProperty) {
		return {
			"changeType": "addColumn",
			"selector": {
				"id": "myTableView--myTable"
			},
			"content": {
				"name": sProperty
			}
		};
	}

	function fetchProperties() {
		return Promise.resolve(aPropertyInfo);
	}

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		before: function() {

			var sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table p13nMode="Column,Sort,Filter,Group" id="myTable"><columns><mdcTable:Column id="myTable--column0" header="column 0" dataProperty="column0"><m:Text text="{column0}" id="myTable--text0" /></mdcTable:Column><mdcTable:Column id="myTable--column1" header="column 1" dataProperty="column1"><m:Text text="{column1}" id="myTable--text1" /></mdcTable:Column><mdcTable:Column id="myTable--column2" header="column 2" dataProperty="column2"><m:Text text="{column2}" id="myTable--text2" /></mdcTable:Column></columns></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				this.oTable = this.oView.byId('myTable');
				this.oColumn1 = this.oView.byId('myTable--column1');
				// Implement required Delgate APIs
				this._orgFn = TableDelegate.fetchProperties;
				TableDelegate.fetchProperties = fetchProperties;
				TableDelegate.addItem = function(sName, oTable, mPropertyBag) {
					return Promise.resolve(new Column(oTable.getId() + "--" + sName, {dataProperty : sName}));
				};
				TableDelegate.getFilterDelegate = function() {
					return {
						addItem: function(sPropName, oTable){
							return Promise.resolve(new FilterField({
								conditions: "{$filters>/conditions/" + sPropName + "}"
							}));
						}
					};
				};

				//Only create changes once the Table has been initialized (similar to a 'real' scenario in state/p13n appliance)
				return this.oTable.initialized();
			}.bind(this));
		},
		after: function() {
			this.oUiComponentContainer.destroy();
			TableDelegate.fetchProperties = this._orgFn;
			delete this._orgFn;
		}
	});

	QUnit.test('RemoveColumn - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {
			var oChangeHandler = TableFlexHandler["removeColumn"].changeHandler;
			assert.strictEqual(oChange.getContent().hasOwnProperty("index"), false, "remove changes do not require the index");
			assert.strictEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has not been changed");
			assert.strictEqual(this.oTable.getColumns().length, 3);

			// Test apply
			return oChangeHandler.applyChange(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.notEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has been removed successfully");
				assert.strictEqual(this.oTable.getColumns().length, 2);

				// Test revert
				return oChangeHandler.revertChange(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has been restored successfully");
					assert.strictEqual(this.oTable.getColumns().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('AddColumn - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oTable
		}).then(function(oChange) {
			var oChangeHandler = TableFlexHandler["addColumn"].changeHandler;
			assert.strictEqual(this.oTable.getColumns().length, 3);
			// Test apply
			return oChangeHandler.applyChange(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oTable.getColumns()[3].getId(), "myTableView--myTable--" + sPropertyName, "column has been added successfully");
				assert.strictEqual(this.oTable.getColumns().length, 4);

				// Test revert
				return oChangeHandler.revertChange(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oTable.getColumns().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("addCondition (via AdaptationFilterBar)", function(assert){

		aPropertyInfo.forEach(function(oProperty){
			oProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.type.String");
		});

		var mNewConditions = {
			column0: [
				{
					operator: "EQ",
					values: [
						"Test"
					],
					validated: "NotValidated"
				}
			],
			column1: [
				{
					operator: "EQ",
					values: [
						"ABC"
					],
					validated: "NotValidated"
				}
			]
		};

		//1) Initialize inbuilt filter
		return this.oTable.retrieveInbuiltFilter()
		.then(function(oP13nFilter){

			return oP13nFilter.initialized();

		})
		.then(function(oP13nFilter){

			//Trigger change creation via Engine
			return this.oTable.getEngine().createChanges({
				control: this.oTable,
				key: "Filter",
				state: mNewConditions,
				applyAbsolute: false,
				suppressAppliance: true
			});

		}.bind(this))
		//2) Check 'raw' changes
		.then(function(aChanges){

			//check raw changes
			assert.equal(aChanges[0].selectorElement.getId(), this.oTable.getId(), "Correct Selector");
			assert.equal(aChanges[1].selectorElement.getId(), this.oTable.getId(), "Correct Selector");

			//Process changes via Flex to verify change appliance on Table level (->not on AdaptationFilterBar)
			return FlexUtil.handleChanges(aChanges);
		}.bind(this))
		//3) Check flex processed changes
		.then(function(){
			//check updates via changehandler
			assert.deepEqual(this.oTable.getFilterConditions(), mNewConditions, "conditions are present on Table");
			assert.deepEqual(this.oTable.getInbuiltFilter().getFilterConditions(), mNewConditions, "conditions are present on inner FilterBar");
		}.bind(this));
	});

});

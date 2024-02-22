/* global QUnit, sinon */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"delegates/TableDelegate",
	"sap/m/p13n/FlexUtil",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/mdc/flexibility/Table.flexibility",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/base/util/Deferred",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	createAppEnvironment,
	TestTableDelegate,
	FlexUtil,
	StateUtil,
	TableFlexHandler,
	ChangesWriteAPI,
	JsControlTreeModifier,
	ConditionValidated,
	OperatorName,
	Deferred,
	nextUIUpdate
) {
	"use strict";

	const sTableView =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table p13nMode="Column,Sort,Filter,Group" id="myTable" autoBindOnInit="false"
			delegate='\{name: "delegates/TableDelegate", payload: \{collectionName: "Products"\}\}'>
			<columns>
				<mdcTable:Column id="myTable--column0" header="column 0" propertyKey="column0">
					<m:Text text="{column0}" id="myTable--text0"/>
				</mdcTable:Column>
				<mdcTable:Column id="myTable--column1" header="column 1" propertyKey="column1">
					<m:Text text="{column1}" id="myTable--text1"/>
				</mdcTable:Column>
				<mdcTable:Column id="myTable--column2" header="column 2" propertyKey="column2">
					<m:Text text="{column2}" id="myTable--text2"/>
				</mdcTable:Column>
			</columns>
		</Table>
	</mvc:View>`;

	TestTableDelegate.fetchProperties = function() {
		return Promise.resolve([{
			name: "column0",
			label: "column0",
			dataType: "String"
		}, {
			name: "column1",
			label: "column1",
			dataType: "String"
		}, {
			name: "column2",
			label: "column2",
			dataType: "String"
		}, {
			name: "column3",
			label: "column3",
			dataType: "String"
		}]);
	};

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

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		before: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView, "Table");
			this.oView = mCreatedApp.view;
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			this.oTable = this.oView.byId('myTable');
			this.oColumn1 = this.oView.byId('myTable--column1');
			await nextUIUpdate();

			// Only create changes once the Table has been initialized (similar to a 'real' scenario in state/p13n appliance)
			await this.oTable.initialized();
		},
		after: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('RemoveColumn - applyChange & revertChange on a js control tree', function(assert) {
		const done = assert.async();
		const oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {
			const oChangeHandler = TableFlexHandler["removeColumn"].changeHandler;
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
		const done = assert.async();
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition("column3"),
			selector: this.oTable
		}).then(function(oChange) {
			const oChangeHandler = TableFlexHandler["addColumn"].changeHandler;
			assert.strictEqual(this.oTable.getColumns().length, 3);
			// Test apply
			return oChangeHandler.applyChange(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oTable.getColumns()[3].getId(), "myTableView--myTable--column3", "column has been added successfully");
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

		const mNewConditions = {
			column0: [
				{
					operator: OperatorName.EQ,
					values: [
						"Test"
					],
					validated: ConditionValidated.NotValidated
				}
			],
			column1: [
				{
					operator: OperatorName.EQ,
					values: [
						"ABC"
					],
					validated: ConditionValidated.NotValidated
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

	QUnit.module("State appliance", {
		beforeEach: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView, "Table");
			this.oTable = mCreatedApp.view.byId('myTable');
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Rerender after rebind", async function(assert) {
		const oRenderDeferred = new Deferred();
		const oRebindDeferred = new Deferred();

		await this.oTable.rebind();
		await nextUIUpdate();
		sinon.stub(await this.oTable.retrieveInbuiltFilter(), "validate").callsFake(() => {
			return new Promise((resolve) => {
				setTimeout(resolve, 250);
			});
		});
		this.oTable._oTable.addEventDelegate({
			onBeforeRendering: () => {
				assert.step("render");
				oRenderDeferred.resolve();
			}
		});
		sinon.stub(TestTableDelegate, "updateBinding").callsFake(() => {
			assert.step("rebind");
			oRebindDeferred.resolve();
		});
		StateUtil.applyExternalState(this.oTable, {
			items: [
				{name: "column3", visible: true}
			]
		});
		await Promise.all([oRenderDeferred.promise, oRebindDeferred.promise]);
		assert.verifySteps(["rebind", "render"]);
		TestTableDelegate.updateBinding.restore();
	});
});

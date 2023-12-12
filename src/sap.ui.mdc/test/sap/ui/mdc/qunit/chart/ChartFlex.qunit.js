/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"sap/ui/mdc/flexibility/Chart.flexibility",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/model/odata/type/Int32",
	'sap/ui/model/odata/type/String'
], function (createAppEnvironment, ChartFlexibility, ChangesWriteAPI, ChangeCategories, JsControlTreeModifier, FlexTestAPI, nextUIUpdate, Int32Type, StringType) {
	'use strict';

	function clearChanges() {
		FlexTestAPI.reset();
	}

	function createRemoveChangeDefinition() {
		return {
			"changeType": "removeItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": "agSalesAmount"
			}
		};
	}

	function createAddChangeDefinition(sProperty) {
		return {
			"changeType": "addItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": sProperty,
				"index": "0",
				"role": "category"
			}
		};
	}

	QUnit.module("Change handler for visibility of items", {
		beforeEach: function () {
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'test-resources/sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" type="groupable" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" type="groupable" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" type="aggregatable" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(async function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oItem1 = this.oView.byId('item1');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
			clearChanges();
		}
	});

	QUnit.test('RemoveItem - applyChange & revertChange on a js control tree', function(assert) {
		const done = assert.async();
		const oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["removeItem"].changeHandler;
			assert.strictEqual(oChange.getContent().hasOwnProperty("index"), false, "remove changes do not require the index");
			assert.strictEqual(this.oChart.getItems().length, 3, "all items existing before the remove change appliance");

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oChart.getItems().length, 2, "item has been removed after change appliance");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oChart.getItems().length, 3, "item has been added again after the change has been reverted");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('AddItem - applyChange & revertChange on a js control tree', function(assert) {
		const done = assert.async();
		const sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["addItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oChart.getItems()[0].getId(), "myChartView--IDChart--GroupableItem--" + sPropertyName, "item has been added successfully");
				assert.strictEqual(this.oChart.getItems().length, 4);

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oChart.getItems().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Simulate RTA UI Visualisation", {
		beforeEach: function () {
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'test-resources/sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" type="groupable" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" type="groupable" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" type="aggregatable" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(async function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oItem1 = this.oView.byId('item1');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
			clearChanges();
		}
	});

	QUnit.test('remove item change with change handler getChangeVisualizationInfo', function(assert) {
		const done = assert.async();
		const oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["removeItem"].changeHandler;

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				const oAppComponent = {
					byId: function(s) { return this.oChart; }.bind(this)
				};

				oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent).then(function(mMsg) {
					assert.ok(mMsg.descriptionPayload);
					assert.equal(mMsg.descriptionPayload.category, ChangeCategories.REMOVE);
					assert.equal(mMsg.descriptionPayload.description, "Item \"agSalesAmount\" removed");

					done();
				});

			}.bind(this));
		}.bind(this));
	});

	QUnit.test('add item change with change handler getChangeVisualizationInfo', function(assert) {
		const done = assert.async();
		const sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["addItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				const oAppComponent = {
					byId: function(s) { return this.oChart; }.bind(this)
				};

				oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent).then(function(mMsg) {
					assert.ok(mMsg.descriptionPayload);
					assert.equal(mMsg.descriptionPayload.category, ChangeCategories.ADD);
					assert.equal(mMsg.descriptionPayload.description, "Dimension item \"SomeProperty\" with layout option \"Category\" added at position \"0\"");

					done();
				});
			}.bind(this));
		}.bind(this));
	});
});

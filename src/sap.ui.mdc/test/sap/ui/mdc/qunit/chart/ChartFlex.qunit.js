/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/Chart.flexibility", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "test-resources/sap/ui/fl/api/FlexTestAPI"
], function (createAppEnvironment, ChartFlexibility, ChangesWriteAPI, JsControlTreeModifier, FlexTestAPI) {
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
				"name": sProperty
			}
		};
	}

	QUnit.module("Change handler for visibility of items", {
		beforeEach: function () {
			var sChartView = '<core:View' +
				'\t\t  xmlns:core="sap.ui.core"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns:state="sap.ui.mdc.base.state"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:DimensionItem id="item0" key="Name" label="Name" role="category"></chart:DimensionItem>\n' +
				'\t\t\t\t\t\t<chart:MeasureItem id="item1" key="agSalesAmount" label="Depth" role="axis1"></chart:MeasureItem>\n' +
				'\t\t\t\t\t\t<chart:MeasureItem id="item2" key="SalesNumber" label="Width" role="axis2"></chart:MeasureItem></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</core:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oItem1 = this.oView.byId('item1');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
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
		var done = assert.async();
		var oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oChart
		}).then(function(oChange) {
			var oChangeHandler = ChartFlexibility["removeItem"].changeHandler;
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
		var done = assert.async();
		var sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oChart
		}).then(function(oChange) {
			var oChangeHandler = ChartFlexibility["addItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oChart.getItems()[3].getId(), "myChartView--IDChart--" + sPropertyName, "item has been added successfully");
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
});

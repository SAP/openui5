/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/FilterBar.flexibility", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/util/reflection/XmlTreeModifier", "sap/ui/mdc/FilterBarDelegate", 'sap/ui/mdc/FilterField'
], function(createAppEnvironment, FilterBarFlexHandler, ChangesWriteAPI, JsControlTreeModifier, XMLTreeModifier, FilterBarDelegate, FilterField) {
	'use strict';

	function createAddConditionChangeDefinition(sOperator) {
		sOperator = sOperator ? sOperator : "Contains";
		return {
			"changeType": "addCondition",
			"selector": {
				"id": "myFilterBarView--myFilterBar"
			},
			"content": {
				"name":"to_nav/field1",
				"condition":{"operator":sOperator,"values":["12"]}
			}
		};
	}

	function createRemoveChangeDefinition() {
		return {
			"changeType": "removeFilter",
			"selector": {
				"id": "myFilterBarView--myFilterBar"
			},
			"content": {
			//	"id": "comp---view--myFilterBar--Category",
				"name": "Category",
				"idIsLocal": false
			}
		};
	}

	function createAddChangeDefinition(sProperty) {
		return {
			"changeType": "addFilter",
			"selector": {
				"id": "myFilterBarView--myFilterBar"
			},
			"content": {
				"name": sProperty
			}
		};
	}

	function createMoveChangeDefinition(sProperty, nIdx) {
		return {
			"changeType": "moveFilter",
			"selector": {
				"id": "myFilterBarView--myFilterBar"
			},
			"content": {
				"name": sProperty,
				"index": nIdx
			}
		};
	}

	function fetchProperties() {
		return Promise.resolve([
			{
				name: "Category"
			}, {
				name: "Name"
			}, {
				name: "ProductID"
			}, {
				name: "CurrencyCode"
			}
		]);
	}

	function addItem(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve(new FilterField("comp---view--myFilterBar--" + sPropertyName, {
			conditions:"{$filters>/conditions/" + sPropertyName + "}"
		}));
	}


	QUnit.module("Basic FilterBar.flexibility functionality with JsControlTreeModifier", {
		before: function() {
			// Implement required Delgate APIs
			this._fnFetchPropertiers = FilterBarDelegate.fetchProperties;
			this._fnAddItem = FilterBarDelegate.addItem;
			FilterBarDelegate.fetchProperties = fetchProperties;
			FilterBarDelegate.addItem = addItem;
		},
		beforeEach: function() {
			var sFilterBarView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc"><mdc:FilterBar id="myFilterBar"><mdc:filterItems><mdc:FilterField id="myFilterBar--field1" conditions="{$filters>/conditions/Category}" maxConditions="1" dataType="Edm.String"/><mdc:FilterField id="myFilterBar--field2" conditions="{$filters>/conditions/Name}" maxConditions="1" dataType="Edm.String"/><mdc:FilterField id="myFilterBar--field3" conditions="{$filters>/conditions/ProductID}"  maxConditions="1" dataType="Edm.String"/></mdc:filterItems></mdc:FilterBar></mvc:View>';
			return createAppEnvironment(sFilterBarView, "FilterBar")
			.then(function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponentContainer = mCreatedView.container;
				this.oFilterBar = this.oView.byId('myFilterBar');
				this.oFilterItem = this.oView.byId('myFilterBar--field2');
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		},
		after: function() {
			FilterBarFlexHandler.fetchProperties = this._fnFetchPropertiers;
			FilterBarFlexHandler.addItem = this._fnAddItem;
			this.fetchProperties = null;
			this._fnAddItem = null;
		}
	});

	QUnit.test('RemoveFilter - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["removeFilter"].changeHandler;
			assert.strictEqual(oChange.getContent().hasOwnProperty("index"), false, "remove changes do not require the index");
			assert.strictEqual(this.oFilterItem.getId(), this.oFilterBar.getAggregation('filterItems')[1].getId(), "filter has not been changed");
			assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);

			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.notEqual(this.oFilterItem.getId(), this.oFilterBar.getAggregation('filterItems')[1].getId(), "filter has been removed successfully");
				assert.strictEqual(this.oFilterBar.getFilterItems().length, 2);

				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oFilterItem.getId(), this.oFilterBar.getAggregation('filterItems')[1].getId(), "filter has been restored successfully");
					assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('AddFilter - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var sPropertyName = "CurrencyCode";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["addFilter"].changeHandler;
			assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oFilterBar.getFilterItems()[3].getId(), "comp---view--myFilterBar--" + sPropertyName, "filter has been added successfully");
				assert.strictEqual(this.oFilterBar.getFilterItems().length, 4);

				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('MoveFilter - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var sPropertyName = "ProductID";
		return ChangesWriteAPI.create({
			changeSpecificData: createMoveChangeDefinition(sPropertyName, 0),
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["moveFilter"].changeHandler;
			assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
			assert.strictEqual(this.oFilterBar.getFilterItems()[2].getId(), "myFilterBarView--myFilterBar--field3", "filter is on last position");
			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
				assert.strictEqual(this.oFilterBar.getFilterItems()[0].getId(), "myFilterBarView--myFilterBar--field3", "filter moved to first position");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oFilterBar.getFilterItems().length, 3);
					assert.strictEqual(this.oFilterBar.getFilterItems()[2].getId(), "myFilterBarView--myFilterBar--field3", "filter has been reverted to last position");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('addCondition - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var oContent = createAddConditionChangeDefinition();
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["addCondition"].changeHandler;

			assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], undefined, "condition initially non existing");

			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], [ oContent.content.condition ], "condition has been applied successfully");
				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], [], "condition empty");
					assert.deepEqual(this.oFilterBar._getConditionModel().getConditions(oContent.content.name), [], "Condition model does not contain conditions");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('addCondition - applyChange & revertChange on a js control tree with invalid conditions', function(assert) {
		var done = assert.async();
		var oContent = createAddConditionChangeDefinition("MyDummyOperator");
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["addCondition"].changeHandler;

			assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], undefined, "condition initially non existing");

			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.deepEqual(this.oFilterBar.getFilterConditions(), {}, "condition has been applied successfully");
				assert.deepEqual(this.oFilterBar._getConditionModel().getConditions(oContent.content.name), [], "Condition model does not contain conditions");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], undefined, "condition empty");
					assert.deepEqual(this.oFilterBar._getConditionModel().getConditions(oContent.content.name), [], "Condition model does not contain conditions");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('removeCondition - applyChange & revertChange on a js control tree', function(assert) {
		var done = assert.async();
		var oContent = createAddConditionChangeDefinition();
		oContent.changeType = "removeCondition";

		var oCondition = {};
		oCondition[oContent.content.name] = [ oContent.content.condition ];
		this.oFilterBar.setFilterConditions(oCondition);
		assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], [ oContent.content.condition ], "condition initially set");

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["removeCondition"].changeHandler;

			// Test apply
			oChangeHandler.applyChange(oChange, this.oFilterBar, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], [], "condition has been applied successfully");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oFilterBar, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.deepEqual(this.oFilterBar.getFilterConditions()[oContent.content.name], [ oContent.content.condition ], "condition reset to initial");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('addCondition - applyChange on a XML tree', function(assert) {
		var done = assert.async();

		//create a change with a non existing operator to check failures during preprocessing
		var oContent = createAddConditionChangeDefinition("EQ");

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oFilterBar
		}).then(function(oChange) {
			var oChangeHandler = FilterBarFlexHandler["addCondition"].changeHandler;

			var oXMLFilterBar = this.oView._xContent.children[0];

			// Test apply
			oChangeHandler.applyChange(oChange, oXMLFilterBar, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				var sFilterConditions = oXMLFilterBar.getAttribute("filterConditions").replace(/\\/g, '');
				var mAppliedConditions = JSON.parse(sFilterConditions);
				assert.deepEqual(mAppliedConditions[oContent.content.name], [ oContent.content.condition ], "condition has been applied on XML node");
				done();
			});
		}.bind(this));
	});

});

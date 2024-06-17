/* global QUnit*/
sap.ui.define([
	"sap/m/p13n/FilterController",
    "sap/ui/core/Control",
    "sap/ui/core/CustomData"
], function (FilterController, Control, CustomData) {
	"use strict";

	QUnit.module("Generic API tests", {
		beforeEach: function(){
            this.oControl = new Control();
			this.oController = new FilterController({
                control: this.oControl
            });
		},
		afterEach: function(){
			this.oController.destroy();
		}
	});

    QUnit.test("Check instanciation", function(assert){
        assert.ok(this.oController, "Controller is instanciable");
    });

    QUnit.test("Check #getConditionDeltaChanges (create multiple condition changes)", function(assert){
		const changedState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["ABC"]
			}],
			"test_2": [{
				"operator": "EQ",
				"values": ["DEF"]
			}]
		};

		const existingState = {};

		const conditionChanges = this.oController.getConditionDeltaChanges({control: this.oControl, existingState, changedState, propertyInfo: [
			{key: "test_1"}, {key: "test_2"}
		]});

		assert.equal(conditionChanges.length, 2, "Correct amount of changes created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.condition, changedState["test_1"][0], "Correct condition in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.key, "test_1", "Correct key in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.changeType, "addCondition", "Correct changeType created");
		assert.deepEqual(conditionChanges[1].changeSpecificData.content.condition, changedState["test_2"][0], "Correct amount of changes created");
		assert.deepEqual(conditionChanges[1].changeSpecificData.content.key, "test_2", "Correct key in change content created");
		assert.deepEqual(conditionChanges[1].changeSpecificData.changeType, "addCondition", "Correct changeType created");
	});

	QUnit.test("Check #getConditionDeltaChanges (create one new condition change)", function(assert){
		const changedState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["ABC"]
			}],
			"test_2": [{
				"operator": "EQ",
				"values": ["DEF"]
			}]
		};

		const existingState = {
			"test_2": [{
				"operator": "EQ",
				"values": ["DEF"]
			}]
		};

		const conditionChanges = this.oController.getConditionDeltaChanges({control: this.oControl, existingState, changedState, propertyInfo: [
			{key: "test_1"}, {key: "test_2"}
		]});

		assert.equal(conditionChanges.length, 1, "Correct amount of changes created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.condition, changedState["test_1"][0], "Correct condition in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.key, "test_1", "Correct key in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.changeType, "addCondition", "Correct changeType created");
	});

	QUnit.test("Check #getConditionDeltaChanges (create new conditions for existing key)", function(assert){
		const changedState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["DEF"]
			},{
				"operator": "EQ",
				"values": ["ABC"]
			}]
		};

		const existingState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["DEF"]
			}]
		};

		const conditionChanges = this.oController.getConditionDeltaChanges({control: this.oControl, existingState, changedState, propertyInfo: [
			{key: "test_1"}, {key: "test_2"}
		]});

		assert.equal(conditionChanges.length, 1, "Correct amount of changes created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.condition, changedState["test_1"][0], "Correct condition in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.key, "test_1", "Correct key in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.changeType, "addCondition", "Correct changeType created");
	});

	QUnit.test("Check #getConditionDeltaChanges (remove existing conditions for existing key)", function(assert){
		const existingState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["DEF"]
			},{
				"operator": "EQ",
				"values": ["ABC"]
			}]
		};

		const changedState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["DEF"]
			}]
		};

		const conditionChanges = this.oController.getConditionDeltaChanges({control: this.oControl, existingState, changedState, propertyInfo: [
			{key: "test_1"}, {key: "test_2"}
		]});

		assert.equal(conditionChanges.length, 1, "Correct amount of changes created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.condition, existingState["test_1"][1], "Correct condition in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.content.key, "test_1", "Correct key in change content created");
		assert.deepEqual(conditionChanges[0].changeSpecificData.changeType, "removeCondition", "Correct changeType created");
	});

	QUnit.test("Check #getCurrentState", function(assert){
		const config = JSON.stringify({
			properties: {
				filterConditions: [{
					key: "test_1",
					condition: {
						operator: "EQ",
						values: ["ABC"]
					}
				}]
			}
		});

		const xConfig = new CustomData({
			key: "xConfig",
			value: config
		});

		xConfig.setValue(config);

		this.oControl.addCustomData(xConfig);

		const currentState = this.oController.getCurrentState();

		assert.equal(Object.keys(currentState)[0], "test_1", "Correct key provided in state");
		assert.equal(currentState["test_1"][0].operator, "EQ", "Correct operator provided");
		assert.deepEqual(currentState["test_1"][0].values, ["ABC"], "Correct value provided");
	});

	QUnit.test("Check #changesToState", function(assert){
		const existingChanges = [{
			changeSpecificData: {
				content: {
					key: "test_1",
					condition: {
						operator: "EQ",
						values: ["ABC"]
					}
				}
			}
		},
		{
			changeSpecificData: {
				content: {
					key: "test_2",
					condition: {
						operator: "Contains",
						values: ["DEF"]
					}
				}
			}
		}];

		const changedState = {
			"test_1": [{
				"operator": "EQ",
				"values": ["ABC"]
			}],
			"test_2": [{
				"operator": "Contains",
				"values": ["DEF"]
			}]
		};

		const oNewState = this.oController.changesToState(existingChanges);

		assert.ok(typeof oNewState === "object", "Correct data type of filter state");
		assert.ok(Object.entries(oNewState).length === existingChanges.length, "Correct amount of entries in filter state");
		assert.deepEqual(changedState, oNewState, "Correct form of state returned");
	});

	QUnit.test("Check #initAdaptationUI", function(assert){
		return this.oController.initAdaptationUI({getProperties: function() {
			return [{}];
		}}).then((oP13nUI) => {
			assert.ok(oP13nUI.isA("sap.m.p13n.FilterPanel"));
		});
	});
});

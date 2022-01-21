/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/FlexUtil", "sap/ui/mdc/FilterBar", "sap/ui/mdc/Control"
], function (FlexUtil, FilterBar, MDCControl) {
	"use strict";

	//----------------------- Conditions ------------------------------
	QUnit.module("FlexUtil API 'getConditionDeltaChanges' tests for filtering", {
		beforeEach: function () {
			this.oFilterBar = new FilterBar("TestFB",{});
		},
		afterEach: function () {
			this.oFilterBar.destroy();
		}
	});

	QUnit.test("check 'addCondition'",function(assert){
		var aOrigConditions = [
			{
				"operator": "EQ",
				"values": [
					"Test"
				]
			}
		];

		var aChanges = FlexUtil._diffConditionPath("Test", aOrigConditions, [], this.oFilterBar, true);
		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oFilterBar.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addCondition", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Test", "Correct property has been added");
	});

	QUnit.test("check 'removeCondition'",function(assert){
		var aShadowConditions = [
			{
				"operator": "EQ",
				"values": [
					"Test"
				]
			}
		];

		var aChanges = FlexUtil._diffConditionPath("Test",[], aShadowConditions, this.oFilterBar, true);
		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oFilterBar.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeCondition", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Test", "Correct property has been added");
	});

	//----------------------- property 'set' changes ------------------------------
	QUnit.module("FlexUtil API 'getPropertySetterchanges' tests");

	QUnit.test("Check 'getPropertySetterChanges' delta determination (no changes for same value)", function(assert){
		var aSetChanges = FlexUtil.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new MDCControl(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a", someProperty: "foo"}
			],
			changedState: [
				{name: "a", someProperty: "foo"}
			]
		});

		assert.equal(aSetChanges.length, 0, "No changes created as the value is the same");
	});

	QUnit.test("Check 'getPropertySetterChanges' (changes for new values)", function(assert){
		var aSetChanges = FlexUtil.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new MDCControl(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a"}
			],
			changedState: [
				{name: "a", someProperty: "foo"}
			]
		});

		assert.equal(aSetChanges.length, 1, "One change created as the value is added");
	});

	QUnit.test("Check 'getPropertySetterChanges' (changes for different values)", function(assert){
		var aSetChanges = FlexUtil.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new MDCControl(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a", someProperty: "foo"}
			],
			changedState: [
				{name: "a", someProperty: "bar"}
			]
		});

		assert.equal(aSetChanges.length, 1, "One change created as the value is changed");
	});
});

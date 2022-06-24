/* global QUnit */
sap.ui.define([
	"sap/m/p13n/FlexUtil","sap/ui/core/Control"
], function (FlexUtil, Control) {
	"use strict";

	//----------------------- property 'set' changes ------------------------------
	QUnit.module("FlexUtil API 'getPropertySetterchanges' tests");

	QUnit.test("Check 'getPropertySetterChanges' delta determination (no changes for same value)", function(assert){
		var aSetChanges = FlexUtil.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new Control(),
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
			control: new Control(),
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
			control: new Control(),
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

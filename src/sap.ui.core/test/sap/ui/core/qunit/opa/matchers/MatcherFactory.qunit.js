/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/matchers/MatcherFactory",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Visible",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Ancestor"
], function (MatcherFactory, Interactable, Visible, PropertyStrictEquals, AggregationLengthEquals, Ancestor) {
	"use strict";

	QUnit.module("MatcherFactory");

	QUnit.test("Should create interactability sequence", function (assert) {
		var oMatcherFactory = new MatcherFactory();

		var aInteractableMatchers =  oMatcherFactory.getInteractabilityMatchers(true);
		assert.strictEqual(aInteractableMatchers.length, 1, "Only one matcher should be created");
		assert.ok(aInteractableMatchers[0] instanceof Interactable, "The Interactable matcher should be created");

		var aVisibleMatchers =  oMatcherFactory.getInteractabilityMatchers(false);
		assert.strictEqual(aVisibleMatchers.length, 1, "Only one matcher should be created");
		assert.ok(aVisibleMatchers[0] instanceof Visible, "The Visible matcher should be created");
	});

	QUnit.test("Should create filter sequence from array declaration", function (assert) {
		var oMatcherFactory = new MatcherFactory();
		var aMatchers = oMatcherFactory.getFilteringMatchers({
			matchers: [
				function myMatcher () {},
				new PropertyStrictEquals({name: "myProp", value: "myValue"}), {
					isMatching: function myMatcher () {}
				}, {
					aggregationLengthEquals: {name: "myAggregation", length: 1},
					propertyStrictEquals: {name: "myProp1", value: "myValue1"}
				}, {
					unsupportedProperty: {name: "myProp", value: "myValue"},
					propertyStrictEquals: [{name: "myProp2", value: "myValue2"}, {name: "myProp3", value: "myValue3"}]
				}
			]
		});

		assert.strictEqual(aMatchers.length, 7, "Should create sequence of matcher instances and functions");
		assert.ok(typeof aMatchers[0] === "function", "The custom function matcher should be added");
		assert.ok(aMatchers[1] instanceof PropertyStrictEquals, "The PropertyStrictEquals matcher should be added");
		assert.ok(typeof aMatchers[2].isMatching === "function", "The custom matcher should be added");

		var oPropertyMatcher = aMatchers[3] instanceof PropertyStrictEquals ? aMatchers[3] : aMatchers[4];
		var oAggregationMatcher = aMatchers[3] instanceof AggregationLengthEquals ? aMatchers[3] : aMatchers[4];

		assert.strictEqual(oAggregationMatcher.getName(), "myAggregation", "The AggregationLengthEquals matcher should have the correct name");
		assert.strictEqual(oPropertyMatcher.getName(), "myProp1", "The PropertyStrictEquals matcher should have the correct name");

		assert.ok(aMatchers[5] instanceof PropertyStrictEquals, "The PropertyStrictEquals matcher should be created");
		assert.strictEqual(aMatchers[5].getName(), "myProp2", "The PropertyStrictEquals matcher should have the correct name");
		assert.ok(aMatchers[6] instanceof PropertyStrictEquals, "The PropertyStrictEquals matcher should be created");
		assert.strictEqual(aMatchers[6].getName(), "myProp3", "The PropertyStrictEquals matcher should have the correct name");
	});

	QUnit.test("Should create filter sequence from object declaration", function (assert) {
		var oMatcherFactory = new MatcherFactory();
		var aMatchers = oMatcherFactory.getFilteringMatchers({
			unsupportedProperty: {name: "myProp", value: "myValue"},
			propertyStrictEquals: [{name: "myProp1", value: "myValue1"}, {name: "myProp2", value: "myValue2"}],
			aggregationLengthEquals: {name: "myAggregation", length: 1}
		});

		var iPropertyMatcher = aMatchers[0] instanceof PropertyStrictEquals ? 0 : 1;
		var iAggregationMatcher = aMatchers[0] instanceof AggregationLengthEquals ? 0 : 2;

		assert.strictEqual(aMatchers[iAggregationMatcher].getName(), "myAggregation", "The AggregationLengthEquals matcher should have the correct name");
		assert.strictEqual(aMatchers[iAggregationMatcher].getLength(), 1, "The AggregationLengthEquals matcher should have the correct length");
		assert.strictEqual(aMatchers[iPropertyMatcher].getName(), "myProp1", "The PropertyStrictEquals matcher should have the correct name");
		assert.strictEqual(aMatchers[iPropertyMatcher].getValue(), "myValue1", "The PropertyStrictEquals matcher should have the correct value");
		assert.strictEqual(aMatchers[iPropertyMatcher + 1].getName(), "myProp2", "The PropertyStrictEquals matcher should have the correct name");
		assert.strictEqual(aMatchers[iPropertyMatcher + 1].getValue(), "myValue2", "The PropertyStrictEquals matcher should have the correct value");
	});

	QUnit.test("Should handle matcher constructors with multiple arguments", function (assert) {
		var fnAncestorMatcher = sap.ui.test.matchers.Ancestor;
		sap.ui.test.matchers.Ancestor = sinon.spy();
		var oMatcherFactory = new MatcherFactory();
		/* var aMatchers = */ oMatcherFactory.getFilteringMatchers({
			ancestor: [["ancestorId", true]]
		});

		sinon.assert.calledWith(sap.ui.test.matchers.Ancestor, "ancestorId", true);
		sap.ui.test.matchers.Ancestor = fnAncestorMatcher;
	});

});

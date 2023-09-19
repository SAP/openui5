/*!
 * ${copyright}
 */

/*global QUnit */

sap.ui.define([
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated"
	], function(Condition, ConditionValidated) {
	"use strict";

	// TODO: Move basic tests incorporated in other modules into here?

	QUnit.test("compareConditions", function(assert) {
		let oCondition1, oCondition2;

		oCondition1 = Condition.createCondition("EQ", ["A", "A"], undefined, undefined, ConditionValidated.NotValidated, undefined);

		oCondition2 = Object.assign({}, oCondition1);
		assert.ok(Condition.compareConditions(oCondition1, oCondition2), "compareConditions recognizes identical conditions");

		oCondition2 = Object.assign({}, oCondition1, {isEmpty: "true"});
		assert.ok(Condition.compareConditions(oCondition1, oCondition2), "compareConditions does not consider isEmpty");

		oCondition2 = Object.assign({}, oCondition1, {values: ["A", "B"]});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions considers all values");

		oCondition2 = Object.assign({}, oCondition1, {inParameters: {someKey: "1"}});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions considers inParameters");

		oCondition2 = Object.assign({}, oCondition1, {outParameters: {someKey: "1"}});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions considers outParameters");

		oCondition2 = Object.assign({}, oCondition1, {payload: {someKey: "1"}});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions considers payload");

		oCondition2 = Object.assign({}, oCondition1, {validated: ConditionValidated.Validated});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions considers validation state");

		assert.notOk(Condition.compareConditions(oCondition1, undefined), "compareConditions can handle undefined conditions");
		assert.notOk(Condition.compareConditions(undefined, oCondition1), "compareConditions can handle undefined conditions");
		assert.ok(Condition.compareConditions(undefined, undefined), "compareConditions can handle undefined conditions");

		oCondition1 = Object.assign({}, oCondition1, {someKey: null});
		oCondition2 = Object.assign({}, oCondition1, {someKey: undefined});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions can discern null from undefined values");

		oCondition1 = Object.assign({}, oCondition1, {values: ['A', 'A', null]});
		oCondition2 = Object.assign({}, oCondition1, {values: ['A', 'A', undefined]});
		assert.notOk(Condition.compareConditions(oCondition1, oCondition2), "compareConditions can discern null from undefined values");

	});


});

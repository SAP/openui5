/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	UI2PersonalizationState,
	FlexState,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "sap.ui.fl.Reference";
	const sContainerKey = "container1";
	const oFlexStatePers = {};
	oFlexStatePers[sContainerKey] = [{
		itemName: "item1"
	}, {
		itemName: "item2"
	}];

	QUnit.module("getPersonalization", {
		async beforeEach() {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {ui2personalization: oFlexStatePers});
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when FlexState has no personalization with and without item name passed", function(assert) {
			sandbox.stub(FlexState, "getUI2Personalization").returns({});
			assert.deepEqual(UI2PersonalizationState.getPersonalization(sReference), [], "an empty array is returned");
			assert.equal(
				UI2PersonalizationState.getPersonalization(sReference, sContainerKey, "sItemName"),
				undefined,
				"an empty array is returned"
			);
		});

		QUnit.test("when no container was passed, with and without item name", function(assert) {
			assert.deepEqual(UI2PersonalizationState.getPersonalization(sReference), [], "an empty array is returned");
			assert.equal(UI2PersonalizationState.getPersonalization(sReference, "", "sItemName"), undefined, "an empty array is returned");
		});

		QUnit.test("with reference and container, but no itemName", function(assert) {
			assert.deepEqual(
				UI2PersonalizationState.getPersonalization(sReference, sContainerKey),
				oFlexStatePers[sContainerKey],
				"the whole pers object is returned"
			);
		});

		QUnit.test("with reference, container and itemName", function(assert) {
			assert.deepEqual(
				UI2PersonalizationState.getPersonalization(sReference, sContainerKey, "item1"),
				oFlexStatePers[sContainerKey][0],
				"the single pers object is returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

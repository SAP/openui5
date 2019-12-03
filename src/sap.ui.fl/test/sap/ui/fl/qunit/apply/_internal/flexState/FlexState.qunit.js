/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/sinon-4"
], function (
	FlexState,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReference = "sap.ui.fl.reference";

	QUnit.module("FlexState with prepareMap functions stubbed", {
		beforeEach: function () {
		},
		afterEach: function () {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when initialize is called with complete information", function (assert) {
			var oFlexState = FlexState.initForReference({
				reference: sReference,
				storageResponse: "FlexResponse",
				componentId: "componentId"
			});
			var oExpectedFlexState = {
				storageResponse: "FlexResponse",
				componentId: "componentId"
			};
			assert.deepEqual(oFlexState, oExpectedFlexState, "the FlexState was initialized correctly");
		});

		QUnit.test("when initialize is called without a reference", function(assert) {
			assert.throws(
				function() {FlexState.initForReference({storageResponse: "FlexResponse"});},
				"the init function throws an error"
			);
		});

		QUnit.test("when initialize is called twice with the same reference", function(assert) {
			FlexState.initForReference({
				reference: sReference
			});
			assert.throws(
				function() {FlexState.initForReference({reference: sReference});},
				"the init function throws an error the second time"
			);
		});

		QUnit.test("when getUIChanges is called without initialization", function(assert) {
			FlexState.initForReference({
				reference: "sap.ui.fl.other.reference"
			});

			assert.throws(
				function() {FlexState.getUIChanges(sReference);},
				"the getState function throws an error"
			);
		});

		QUnit.test("when getVariantsState is called without initialization", function(assert) {
			FlexState.initForReference({
				reference: "sap.ui.fl.other.reference"
			});

			assert.throws(
				function() {FlexState.getVariantsState(sReference);},
				"the getState function throws an error"
			);
		});

		QUnit.skip("when getState / getAppDescriptorMap / getChangesMap / getVariantsMap is called", function(assert) {
			FlexState.initForReference({
				reference: sReference,
				storageResponse: "FlexResponse"
			});
			assert.equal(FlexState.getChangesMap(sReference), "changesMap", "the correct map is returned");
		});

		QUnit.skip("when clearState is called with and without reference", function(assert) {
			var sReference2 = "second.reference";
			var sReference3 = "third.reference";
			FlexState.initForReference({
				reference: sReference,
				storageResponse: "storageResponse"
			});
			FlexState.initForReference({
				reference: sReference2,
				storageResponse: "storageResponse"
			});
			assert.ok(FlexState.getState(sReference), "before clearState state1 is returned");
			assert.ok(FlexState.getState(sReference2), "before clearState state2 is returned");
			FlexState.clearState(sReference);
			assert.throws(
				function() {FlexState.getState({reference: sReference});},
				"after clearState(1) there is no state1 anymore"
			);
			assert.ok(FlexState.getState(sReference2), "after clearState(1) state2 is still there");

			FlexState.initForReference({
				reference: sReference3,
				storageResponse: "storageResponse"
			});
			assert.ok(FlexState.getState(sReference2), "before clearState state2 is returned");
			assert.ok(FlexState.getState(sReference3), "before clearState state3 is returned");
			FlexState.clearState();
			assert.throws(
				function() {FlexState.getState({reference: sReference});},
				"after clearState() there is no state2 anymore"
			);
			assert.throws(
				function() {FlexState.getState({reference: sReference});},
				"after clearState() there is no state3 anymore"
			);
		});
	});

	QUnit.module("Given a initialized FlexState without stubs", {
		beforeEach: function() {
			FlexState.initForReference({
				reference: sReference,
				storageResponse: "storageResponse"
			});
		},
		afterEach: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.skip("when clearState is called with reference", function(assert) {
			assert.ok(FlexState.getState(sReference), "before clearState there is a state returned");
			FlexState.clearState(sReference);
			assert.throws(
				function() {FlexState.getState({reference: sReference});},
				"after clearState there is no state anymore"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});

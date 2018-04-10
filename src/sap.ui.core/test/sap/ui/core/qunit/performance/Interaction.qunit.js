/*global QUnit */
sap.ui.define(['sap/ui/performance/Interaction', 'sap/ui/performance/ResourceTimings'],
	function(Interaction, ResourceTimings) {
	"use strict";

	QUnit.module("Interaction API", {
		before: function() {
			Interaction.setActive(true);
		},
		after: function() {
			Interaction.setActive(false);
		}
	});

	QUnit.test("add BusyIndicator duration", function(assert) {

		assert.expect(4);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var iBusyDuration = oPendingInteraction.busyDuration;

		assert.strictEqual(iBusyDuration, 0, "no busy duration shoudl have been added");

		//busy indicator adds busy duration - everything is fine
		Interaction.addBusyDuration(33);
		iBusyDuration = oPendingInteraction.busyDuration;
		assert.strictEqual(iBusyDuration, 33, "busy indicator adds busy duration");


		// interaction is ended because a key was pressed (busy indicator still shows)
		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		//BusyIndicator#hide uis triggered which calls #addBusyDuration, this call should not fail
		try {
			Interaction.addBusyDuration(33);
		} catch (e) {
			assert.notOk(e, "addBusyDuration should not fail");
		}
		assert.strictEqual(iBusyDuration, oPendingInteraction.busyDuration, "no additional duration is added");

	});

	QUnit.test("set component name", function(assert) {

		assert.expect(5);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var sComponentName = oPendingInteraction.stepComponent;


		assert.strictEqual(oPendingInteraction.component, "undetermined", "component name should not be set");
		assert.strictEqual(sComponentName, undefined, "step component name should not be set");

		Interaction.setStepComponent("foo");
		sComponentName = oPendingInteraction.stepComponent;
		assert.strictEqual(sComponentName, "foo", "component name should be set");


		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		try {
			Interaction.setStepComponent("bar");
		} catch (e) {
			assert.notOk(e, "setStepComponent should not fail");
		}
		assert.strictEqual(sComponentName, "foo", "no additional duration is added");

	});

	QUnit.module("InteractionMeasurement", {
		beforeEach: function() {
			this.requests = [{
				startTime: 1,
				requestStart: 2,
				responseEnd: 3,
				transferSize: 10, // okay
				encodedBodySize: 10
			}, {
				startTime: 4,
				requestStart: 5,
				responseEnd: 6,
				transferSize: 0, // xhr from cache
				encodedBodySize: 10
			}, {
				startTime: 7,
				requestStart: 8,
				responseEnd: 9,
				transferSize: 10, // script from cache
				encodedBodySize: 0
			}, {
				startTime: 10,
				requestStart: 11,
				responseEnd: 12 // undefined properties (Edge, IE, Safari...)
			}];

			// stub the foreign API call
			this.getRequestTimings = ResourceTimings.getRequestTimings;
			ResourceTimings.getRequestTimings = function() {
				return this.requests;
			}.bind(this);

			// produce a dummy interaction
			Interaction.start();
			Interaction.end(true);
			this.interaction = Interaction.getAll().pop();
		},
		afterEach: function() {
			ResourceTimings.getRequestTimings = this.getRequestTimings;
		}
	});

	QUnit.test("retrieved requests", function(assert) {
		assert.strictEqual(this.interaction.requests, this.requests, "requests are added to interaction");
		assert.strictEqual(this.interaction.completeRoundtrips, 2, "only complete requests are counted");
	});

});
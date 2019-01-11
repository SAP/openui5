/*global QUnit, sinon*/
sap.ui.define(['sap/ui/performance/trace/FESR', 'sap/ui/performance/XHRInterceptor'], function(FESR, XHRInterceptor) {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("activation", function(assert) {
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
		FESR.setActive(true);
		assert.ok(FESR.getActive(), "FESR should must be active");
		assert.ok(XHRInterceptor.isRegistered("FESR", "open"), "FESR must be registered");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_ID", "open"), "PASSPORT_ID must be registered");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_HEADER", "open"), "PASSPORT_HEADER must be registered");
		FESR.setActive(false);
		assert.notOk(FESR.getActive(), "should must not be active");
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
	});

	QUnit.module("Interaction change");

	QUnit.test("FESR", function(assert) {
		var done = assert.async();

		sap.ui.require(["sap/ui/performance/trace/Interaction"], function(Interaction) {
			var onBeforeCreatedSpy,
			 oSpyReturnValue,
			 aAllInteractions,
			 oLastInteraction,
			 oInitialFESRHandle = {
			  stepName:"undetermined_startup",
			  appNameLong:"undetermined",
			  appNameShort:"undetermined"
			 };

			// implement hook
			FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
				assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");

				return {
					stepName: "newStepName",
					appNameLong: "newAppNameLong",
					appNameShort: "newAppNameShort"
				};
			};

			onBeforeCreatedSpy = sinon.spy(FESR, "onBeforeCreated");

			FESR.setActive(true);
			Interaction.notifyStepStart(null, true);

			assert.ok(Interaction.getActive(), "Implicit interaction activation successful");

			Interaction.end(true);

			aAllInteractions = Interaction.getAll();
			oLastInteraction = aAllInteractions[aAllInteractions.length - 1];

			assert.equal(onBeforeCreatedSpy.callCount, 1, "onBeforeCreated should be called once.");
			assert.deepEqual(onBeforeCreatedSpy.getCall(0).args[0], oInitialFESRHandle, "Passed FESRHandle should be correct.");

			assert.equal(oLastInteraction.component, "undetermined", "Component name is not modified.");
			assert.equal(oLastInteraction.event, "startup", "Event name is not modified.");
			assert.equal(oLastInteraction.trigger, "undetermined", "Trigger name is not modified.");

			oSpyReturnValue = onBeforeCreatedSpy.returnValues[0];
			assert.equal(oSpyReturnValue.stepName, "newStepName", "The correct stepName should be returned.");
			assert.equal(oSpyReturnValue.appNameLong, "newAppNameLong", "The correct appNameLong should be returned.");
			assert.equal(oSpyReturnValue.appNameShort, "newAppNameShort", "The correct appNameShort should be returned.");

			Interaction.clear();
			onBeforeCreatedSpy.restore();

			done();
		});

	});

});
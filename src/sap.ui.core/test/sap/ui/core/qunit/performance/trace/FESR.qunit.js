/*global QUnit, sinon*/
sap.ui.define(['sap/ui/performance/trace/FESR', 'sap/ui/performance/trace/Interaction', 'sap/ui/performance/XHRInterceptor'], function(FESR, Interaction, XHRInterceptor) {
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

	QUnit.test("onBeforeCreated hook", function(assert) {
		var oHandle = {
			stepName:"undetermined_undefined",
			appNameLong:"undetermined",
			appNameShort:"undetermined"
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
			assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
			assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort"
			};
		};

		assert.expect(4);

		FESR.setActive(true);
		Interaction.start();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.notifyStepStart(null, true);
		// trigger header creation
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now());
		xhr.send();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				var values = args[1].split(",");
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[19] === "newAppNameLong";
			}
		}), "Found the new FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		oHeaderSpy.restore();
	});

});
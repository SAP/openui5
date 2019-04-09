/*global QUnit, sinon*/
sap.ui.define(['sap/ui/performance/trace/FESR', 'sap/ui/performance/trace/Interaction', 'sap/ui/performance/XHRInterceptor', 'sap/ui/performance/trace/Passport'],
	function(FESR, Interaction, XHRInterceptor, Passport) {
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
			appNameShort:"undetermined",
			timeToInteractive: 0
		};

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var fnOnBeforeCreated = FESR.onBeforeCreated;

		// implement hook
		FESR.onBeforeCreated = function(oFESRHandle, oInteraction) {
			assert.deepEqual(oFESRHandle, oHandle, "Passed FESRHandle should be correct.");
			assert.throws(function() { oInteraction.component = "badComponent"; }, "Should throw an error after trying to overwrite the interaction object.");
			assert.ok(Object.isFrozen(oInteraction), "Interaction is not editable.");
			return {
				stepName: "newStepName",
				appNameLong: "newAppNameLong",
				appNameShort: "newAppNameShort",
				timeToInteractive: 1000
			};
		};

		assert.expect(5);

		FESR.setActive(true);
		Interaction.start();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.notifyStepStart(null, true);
		// trigger header creation
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now());
		xhr.send();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				var values = args[1].split(",");
				// duration - end_to_end_time
				return values[4] === "1000";
			}
		}), "Found the FESR header field values.");

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec-opt") {
				var values = args[1].split(",");
				// application_name, step_name, application_name with 70 characters
				return values[0] === "newAppNameShort" && values[1] === "newStepName" && values[19] === "newAppNameLong";
			}
		}), "Found the optional FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		FESR.onBeforeCreated = fnOnBeforeCreated;
		oHeaderSpy.restore();
	});

	QUnit.test("Client ID", function(assert) {

		var oHeaderSpy = sinon.spy(XMLHttpRequest.prototype, "setRequestHeader");
		var oPassportHeaderSpy = sinon.spy(Passport, "header");
		assert.expect(1);

		FESR.setActive(true);

		// trigger Passport header creation (which gets called with the actual "action")
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now());
		xhr.send();
		var sPassportAction = oPassportHeaderSpy.args[oPassportHeaderSpy.args.length - 1][4];


		Interaction.start();
		// first interaction ends with notifyStepStart - second interaction starts
		Interaction.notifyStepStart("click", true);
		// trigger initial FESR header creation (which should include the actual "action")
		xhr = new XMLHttpRequest();
		xhr.open("GET", "resources/sap-ui-core.js?noCache=" + Date.now());
		xhr.send();

		assert.ok(oHeaderSpy.args.some(function(args) {
			if (args[0] === "SAP-Perf-FESRec") {
				var values = args[1].split(",");
				// duration - end_to_end_time
				return values[6] === sPassportAction;
			}
		}), "Found the FESR header field values.");

		Interaction.end(true);
		Interaction.clear();
		FESR.setActive(false);
		oHeaderSpy.restore();
		oPassportHeaderSpy.restore();
	});

});
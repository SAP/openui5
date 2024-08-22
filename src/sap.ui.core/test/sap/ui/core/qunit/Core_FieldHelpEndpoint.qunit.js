/*global QUnit, sinon */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks if the FieldHelp was loaded after a SAP Companion start signal.
	 * We use a polling here to circumvent test instabilities because of timeouts.
	 *
	 * @param {int} maxTime by default we only try this for a max. of 2000ms (2s)
	 * @param {int} pollSpeed default speed is a quick 10ms polling
	 */
	function pollForCompletion(fnCallback, maxTime = 2000, pollSpeed = 10) {
		return new Promise((res, rej) => {
			const intervalId = setInterval(() => {
				if (fnCallback()) {
					clearInterval(intervalId);
					return res();
				} else {
					maxTime -= pollSpeed;
				}
				if (maxTime <= 0) {
					clearInterval(intervalId);
					return rej(`Callback not completed in ${maxTime}ms!`);
				}
			}, pollSpeed);
		});
	}

	QUnit.test("No extra class is loaded before SAP Companion is started", function(assert) {
		const FieldHelp = sap.ui.require("sap/ui/core/fieldhelp/FieldHelp");
		assert.strictEqual(FieldHelp, undefined, "sap/ui/core/fieldhelp/FieldHelp isn't loaded");
	});

	QUnit.test("Processing message 'sap.companion.services.StartCompanion/StopCompanion'", async function(assert) {
		const oStartMessage = {
			service: "sap.companion.services.StartCompanion",
			type: "request",
			body: {}
		};
		const oStopMessage = {
			service: "sap.companion.services.StopCompanion",
			type: "request",
			body: {}
		};

		window.postMessage(JSON.stringify(oStartMessage), document.location.origin);


		// loading of FieldHelp after start signal
		let FieldHelp;

		await pollForCompletion(() => {
			FieldHelp = sap.ui.require("sap/ui/core/fieldhelp/FieldHelp");
			return !!FieldHelp; // return true if FieldHelp is loaded
		});

		assert.ok(FieldHelp, "FieldHelp class is loaded");


		// Activation of FieldHelp
		const oStartSpy = sinon.spy(FieldHelp.getInstance(), "activate");
		window.postMessage(JSON.stringify(oStartMessage), document.location.origin);

		await pollForCompletion(() => {
			return oStartSpy.callCount >= 1;
		});

		assert.equal(oStartSpy.callCount, 1, "FieldHelp is activated exactly once");


		// Deactivation of FieldHelp
		const oStopSpy = sinon.spy(FieldHelp.getInstance(), "deactivate");
		window.postMessage(JSON.stringify(oStopMessage), document.location.origin);

		await pollForCompletion(() => {
			return oStopSpy.callCount >= 1;
		});

		assert.equal(oStopSpy.callCount, 1, "FieldHelp is deactivated");
	});

	QUnit.test("Sending message 'sap.companion.services.UpdateHotspots'", async function(assert) {
		const oStartMessage = {
			service: "sap.companion.services.StartCompanion",
			type: "request",
			body: {}
		};
		window.postMessage(JSON.stringify(oStartMessage), document.location.origin);


		// loading of FieldHelp after start signal
		let FieldHelp;

		await pollForCompletion(() => {
			FieldHelp = sap.ui.require("sap/ui/core/fieldhelp/FieldHelp");
			return !!FieldHelp; // return true if FieldHelp is loaded
		});

		assert.ok(FieldHelp, "FieldHelp class is loaded");


		// Update hotspots message tests
		const oFieldHelpInstance = FieldHelp.getInstance();

		const aFieldHelpInfo = [];
		sinon.stub(oFieldHelpInstance, "_getFieldHelpHotspots").returns(aFieldHelpInfo);

		oFieldHelpInstance._updateHotspots();

		return new Promise((resolve, reject) => {
			window.addEventListener("message", (oEvent) => {
				assert.equal(oEvent.origin, document.location.origin, "The origin in the event should be the same as the local origin");
				assert.equal(typeof oEvent.data, "string", "The data in oEvent has type 'string'");
				const oData = JSON.parse(oEvent.data);
				assert.equal(oData.service, "sap.companion.services.UpdateHotspots", "The 'service' property in data is set correctly");
				assert.equal(oData.type, "request", "The 'request' property in data is set correctly");
				assert.deepEqual(oData.body.hotspots, aFieldHelpInfo, "The 'body.hotspots' property in data is set correctly");
				resolve();
			});
		});
	});
});

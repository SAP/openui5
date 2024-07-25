/*global QUnit, sinon */
sap.ui.define([], function() {
	"use strict";

	function createPromiseFromTimeout(fnCallback, iTime) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				fnCallback();
				resolve();
			}, iTime);
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

		let FieldHelp;
		await createPromiseFromTimeout(() => {
			FieldHelp = sap.ui.require("sap/ui/core/fieldhelp/FieldHelp");
			assert.ok(FieldHelp, "FieldHelp class is loaded");
		}, 100);

		const oStartSpy = sinon.spy(FieldHelp.getInstance(), "activate");
		window.postMessage(JSON.stringify(oStartMessage), document.location.origin);
		await createPromiseFromTimeout(() => {
			assert.equal(oStartSpy.callCount, 1, "FieldHelp is activated");
		}, 100);

		const oStopSpy = sinon.spy(FieldHelp.getInstance(), "deactivate");
		window.postMessage(JSON.stringify(oStopMessage), document.location.origin);
		await createPromiseFromTimeout(() => {
			assert.equal(oStopSpy.callCount, 1, "FieldHelp is deactivated");
		}, 100);
	});

	QUnit.test("Sending message 'sap.companion.services.UpdateHotspots'", async function(assert) {
		const oStartMessage = {
			service: "sap.companion.services.StartCompanion",
			type: "request",
			body: {}
		};
		window.postMessage(JSON.stringify(oStartMessage), document.location.origin);

		let FieldHelp;
		await createPromiseFromTimeout(() => {
			FieldHelp = sap.ui.require("sap/ui/core/fieldhelp/FieldHelp");
			assert.ok(FieldHelp, "FieldHelp class is loaded");
		}, 100);

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

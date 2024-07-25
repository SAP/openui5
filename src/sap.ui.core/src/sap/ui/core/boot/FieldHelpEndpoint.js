/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	let pFieldHelp;

	function loadFieldHelp() {
		pFieldHelp ??= new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/core/fieldhelp/FieldHelp"], resolve, reject);
		});

		return pFieldHelp;
	}

	function sendHotSpotUpdates(aHotSpotsInfo) {
		const oMessage = {
			service: "sap.companion.services.UpdateHotspots",
			type: "request",
			body: {
				hotspots: aHotSpotsInfo
			}
		};
		window.postMessage(JSON.stringify(oMessage), document.location.origin);
	}

	const mActions = {
		"sap.companion.services.StartCompanion": async function() {
			const FieldHelp = await loadFieldHelp();
			FieldHelp.getInstance().activate(sendHotSpotUpdates);
		},
		"sap.companion.services.StopCompanion": async function() {
			const FieldHelp = await loadFieldHelp();
			FieldHelp.getInstance().deactivate();
		}
	};

	window.addEventListener("message", (oEvent) => {
		if (oEvent.origin !== document.location.origin) {
			return;
		}
		let vData = oEvent.data;
		if (typeof vData === "string") {
			try {
				vData = JSON.parse(vData);
			} catch (e) {
				// ignore
			}
		}
		const sService = vData?.service;

		if (!sService) {
			return;
		}

		const fnAction = mActions[sService];
		if (fnAction) {
			fnAction();
		}
	});

	return {
		run: function() {
			return Promise.resolve();
		}
	};
});

/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	let pShortcutInfo;

	function loadKeyboardInteractionInfo() {
		pShortcutInfo ??= new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/core/interaction/KeyboardInteractionDisplay"], resolve, reject);
		});

		return pShortcutInfo;
	}

	const mRegistry = new Map(); // Store {id -> { origin, port }}

	const mActions = {
		/**
		 * Handles the request for a message port and either returns an existing port or creates a new one.
		 *
		 * @param  {MessageEvent} oEvent The message event triggered when a message is received.
		 */
		"sap.ui.interaction.RequestMessagePort": (oEvent) => {
			const oData = oEvent.data;
			const sId = oData?.id;

			if (!sId) {
				return;
			}

			const oKnownRequestor = mRegistry.get(sId);
			if (oKnownRequestor) {
				oEvent.source.postMessage({ service: "sap.ui.interaction.MessagePortReady"}, oEvent.origin, [oKnownRequestor.port]);
			} else {
				const oChannel = new MessageChannel();

				// register id with origin and port
				mRegistry.set(sId, {
					origin: oEvent.origin,
					port: oChannel.port2
				});

				// Listen for messages on port1
				oChannel.port1.onmessage = (oEvent) => {
					const oData = oEvent.data;
					const sService = oData?.service;
					const fnAction = mActions[sService];

					if (fnAction) {
						fnAction(oEvent, oChannel.port1);
					}
				};

				// Send port2 to requestor
				oEvent.source.postMessage({ service: "sap.ui.interaction.MessagePortReady"}, oEvent.origin, [oChannel.port2]);
			}

		},

		/**
		 * Starts the display of keyboard interaction information
		 *
		 * @param  {MessageEvent} _ Unused event parameter
		 * @param  {MessagePort} oPort The message port to communicate with.
		 */
		"sap.ui.interaction.StartDisplay": async (_, oPort) => {
			const KeyboardInteractionInfo = await loadKeyboardInteractionInfo();
			await KeyboardInteractionInfo.activate(oPort);
		},
		/**
		 * Stops the display of keyboard interaction information.
		 *
		 * @param  {MessageEvent} _ Unused event parameter.
		 */
		"sap.ui.interaction.StopDisplay": async (_) => {
			const KeyboardInteractionInfo = await loadKeyboardInteractionInfo();
			KeyboardInteractionInfo.deactivate();
		}
	};

	/**
	 * Listens for incoming post messages and starts the display of keyboard interaction information
	 * based on the service name received in the message.
	 *
	 * @param {MessageEvent} oEvent the message event triggered when a message is received.
	 */
	window.addEventListener("message", (oEvent) => {
		const sBootstrapOrigin = new URL(sap.ui.require.toUrl(""), document.baseURI)?.origin;

		// TODO: This implementation currently only supports the FE scenario, see FIORITECHP1-24625
		if (oEvent.origin !== document.location.origin &&
			oEvent.origin !== sBootstrapOrigin) {

			Log.error(`Received message from an unauthorized origin: ${oEvent.origin}.`);
			return;
		}

		const sService = oEvent?.data?.service;
		const fnAction = mActions[sService];

		fnAction?.(oEvent);
	});

	/**
	 * Initializes the module that sets up the listener for incoming postmessage events.
	 * This listener handles the activation and display of keyboard interaction information.
	 *
	 * @private
	 */
	return {
		run: function() {
			return Promise.resolve();
		}
	};
});
